#!/usr/bin/env node

/**
 * AI-powered Git Commit Message Generator
 * Генерує conventional commit messages через Claude AI
 */

import { createTranslator } from './i18n.mjs';
import { getStagedChanges, getDiff, executeCommit, hasClaudeCodeCLI } from './git-utils.mjs';
import { generateWithAPI, generateWithCLI, refineWithAPI, refineWithCLI } from './ai-generator.mjs';
import { log, logError, logInfo, logSuccess, logWarning, logTitle, askConfirmation, askEditFeedback, askManualInput } from './ui.mjs';

/**
 * Вибір мови для commit message
 */
function selectLanguage() {
  // Перевіряємо ENV змінну
  const envLang = process.env.COMMIT_LANG?.toUpperCase();
  if (envLang === 'EN' || envLang === 'UA') {
    return envLang;
  }

  // Перевіряємо CLI аргумент
  const args = process.argv.slice(2);
  const langArg = args.find(arg => arg.startsWith('--lang='));
  if (langArg) {
    const lang = langArg.split('=')[1].toUpperCase();
    if (lang === 'EN' || lang === 'UA') {
      return lang;
    }
  }

  // За замовчуванням EN
  return 'EN';
}

/**
 * Валідація наявності staged changes
 */
function validateStagedChanges(t) {
  const status = getStagedChanges();
  if (!status) {
    logError(t('noStagedChanges'));
    process.exit(1);
  }
  return status;
}

/**
 * Головна функція генерації commit message
 */
async function generateCommitMessage(status, diff, lang, t) {
  const hasAPIKey = !!process.env.ANTHROPIC_API_KEY;
  const hasCLI = hasClaudeCodeCLI();

  // Пріоритет: API > CLI
  if (hasAPIKey) {
    try {
      logInfo(t('generatingAPI'));
      return await generateWithAPI(status, diff, lang);
    } catch (error) {
      logWarning(`${t('apiUnavailable')}: ${error.message}`);

      // Fallback на CLI
      if (hasCLI) {
        logWarning(t('switchingToCLI'));
        return generateWithCLI(status, diff, lang);
      } else {
        logError(t('noGenerationMethod'));
        process.exit(1);
      }
    }
  } else if (hasCLI) {
    logInfo(t('generatingCLI'));
    return generateWithCLI(status, diff, lang);
  } else {
    logError(t('noGenerationMethod'));
    log(`\n${t('chooseOption')}`);
    logInfo(t('addApiKey'));
    logInfo(t('installCLI'));
    process.exit(1);
  }
}

/**
 * Редагування commit message з AI
 */
async function editMessageWithAI(originalMessage, lang, t) {
  const feedback = await askEditFeedback(originalMessage, t);

  // Якщо порожній ввід - залишаємо як є
  if (!feedback) {
    return originalMessage;
  }

  logInfo(t('editingMessage'));

  try {
    const hasAPIKey = !!process.env.ANTHROPIC_API_KEY;
    const hasCLI = hasClaudeCodeCLI();

    if (hasAPIKey) {
      return await refineWithAPI(originalMessage, feedback, lang);
    } else if (hasCLI) {
      return refineWithCLI(originalMessage, feedback, lang);
    } else {
      logWarning(t('aiUnavailable'));
      return await askManualInput(t);
    }
  } catch (error) {
    logError(`${t('editError')}: ${error.message}`);
    return originalMessage;
  }
}

/**
 * Обробка підтвердження користувача
 */
async function handleUserConfirmation(commitMessage, lang, t) {
  const answer = await askConfirmation(commitMessage, t);

  if (answer === 'y') {
    return { action: 'commit', message: commitMessage };
  } else if (answer === 'e') {
    const editedMessage = await editMessageWithAI(commitMessage, lang, t);
    return { action: 'retry', message: editedMessage };
  } else {
    return { action: 'cancel' };
  }
}

/**
 * Головна функція
 */
async function main() {
  try {
    const lang = selectLanguage();
    const t = createTranslator(lang);

    // Відображення заголовку
    logTitle(t('title'));
    logInfo(t('language'));

    // Валідація та отримання даних
    const status = validateStagedChanges(t);
    const diff = getDiff();

    // Генерація commit message
    let commitMessage = await generateCommitMessage(status, diff, lang, t);

    // Цикл підтвердження
    while (true) {
      const { action, message } = await handleUserConfirmation(commitMessage, lang, t);

      if (action === 'commit') {
        executeCommit(message);
        logSuccess(t('commitSuccess'));
        break;
      } else if (action === 'retry') {
        commitMessage = message;
      } else {
        logWarning(t('commitCancelled'));
        process.exit(0);
      }
    }
  } catch (error) {
    if (error.message.includes('git')) {
      logError(error.message.includes('status')
        ? createTranslator(selectLanguage())('gitStatusError')
        : createTranslator(selectLanguage())('gitDiffError'));
    } else if (error.message.includes('commit')) {
      logError(createTranslator(selectLanguage())('commitError'));
    } else {
      logError(`${createTranslator(selectLanguage())('criticalError')}: ${error.message}`);
    }
    process.exit(1);
  }
}

main();
