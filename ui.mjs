/**
 * Модуль UI для взаємодії з користувачем
 */

import * as readline from 'readline';

// Кольори для консолі
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

/**
 * Логування повідомлення з кольором
 */
export function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Логування помилки
 */
export function logError(message) {
  log(message, colors.red);
}

/**
 * Логування попередження
 */
export function logWarning(message) {
  log(message, colors.yellow);
}

/**
 * Логування інформації
 */
export function logInfo(message) {
  log(message, colors.cyan);
}

/**
 * Логування успіху
 */
export function logSuccess(message) {
  log(message, colors.green);
}

/**
 * Логування заголовку
 */
export function logTitle(message) {
  log(message, colors.bright);
}

/**
 * Запит підтвердження від користувача
 */
export function askConfirmation(commitMessage, t) {
  return new Promise((resolve) => {
    log(`\n${colors.bright}${t('generatedMessage')}${colors.reset}`, colors.green);
    log(`${colors.cyan}${commitMessage}${colors.reset}\n`);
    log(t('confirmPrompt'));
    log(`${colors.green}${t('confirmYes')}${colors.reset}`);
    log(`${colors.cyan}${t('confirmEdit')}${colors.reset}`);
    log(`${colors.yellow}${t('confirmNo')}${colors.reset}\n`);

    const stdin = process.stdin;
    const isRaw = stdin.isRaw;

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onData = (key) => {
      // Escape key
      if (key === '\u001b') {
        cleanup();
        resolve('n');
        return;
      }

      // Ctrl+C
      if (key === '\u0003') {
        cleanup();
        log(`\n${t('cancelledCtrlC')}`, colors.yellow);
        process.exit(0);
      }

      // Enter
      if (key === '\r' || key === '\n') {
        cleanup();
        resolve('y');
        return;
      }

      // Інші клавіші
      const char = key.toLowerCase();
      if (char === 'y' || char === 'т') {
        cleanup();
        resolve('y');
      } else if (char === 'n' || char === 'н') {
        cleanup();
        resolve('n');
      } else if (char === 'e' || char === 'е') {
        cleanup();
        resolve('e');
      }
    };

    const cleanup = () => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(isRaw);
      stdin.pause();
    };

    stdin.on('data', onData);
  });
}

/**
 * Запит feedback для редагування
 */
export function askEditFeedback(originalMessage, t) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    log(`\n${colors.yellow}${t('currentMessage')}: ${originalMessage}${colors.reset}`, colors.yellow);
    rl.question(t('editFeedback'), (feedback) => {
      rl.close();
      resolve(feedback.trim());
    });
  });
}

/**
 * Запит manual input
 */
export function askManualInput(t) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(t('newMessage'), (message) => {
      rl.close();
      resolve(message.trim());
    });
  });
}

export { colors };
