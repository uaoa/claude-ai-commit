/**
 * Модуль для генерації commit messages через AI (API або CLI)
 */

import { execSync } from 'child_process';

/**
 * Створення промпту для генерації commit message
 */
function createGenerationPrompt(status, diff, lang) {
  if (lang === 'EN') {
    return `Analyze git changes and generate commit message in conventional commits format.

Status:
${status}

Diff (first 6000 characters):
${diff}

STRICT RULES:
- Format: <type>(<scope>): <subject>
- Type: feat/fix/refactor/docs/style/test/chore/perf
- Subject in PAST TENSE (what WAS DONE), max 50 characters, no period
- Use verbs like: added, fixed, updated, removed, refactored
- WRONG: "add feature", "fix bug", "update styles"
- CORRECT: "added feature", "fixed bug", "updated styles"

Examples:
feat(auth): added Google OAuth provider
fix(api): fixed validation error in user endpoint
refactor(store): optimized cart state management
docs(readme): updated installation instructions

Return ONLY the commit message (one line), no explanations.`;
  } else {
    return `Проаналізуй git зміни та згенеруй commit message у форматі conventional commits.

Status:
${status}

Diff (перші 6000 символів):
${diff}

СУВОРІ ПРАВИЛА:
- Формат: <type>(<scope>): <subject>
- Type: feat/fix/refactor/docs/style/test/chore/perf
- Subject ТІЛЬКИ у МИНУЛОМУ ЧАСІ (що ЗРОБЛЕНО), макс 50 символів, без крапки
- Використовуй дієслова: додано, виправлено, оновлено, видалено, рефакторено
- НЕПРАВИЛЬНО: "додати функцію", "виправити баг", "оновити стилі"
- ПРАВИЛЬНО: "додано функцію", "виправлено баг", "оновлено стилі"

Приклади:
feat(auth): додано Google OAuth провайдер
fix(api): виправлено помилку валідації в user endpoint
refactor(store): оптимізовано управління станом корзини
docs(readme): оновлено інструкції встановлення

Поверни ТІЛЬКИ commit message (один рядок), без пояснень.`;
  }
}

/**
 * Створення промпту для редагування commit message
 */
function createRefinementPrompt(originalMessage, feedback, lang) {
  const instruction = lang === 'UA'
    ? 'Виправ commit message згідно з цим feedback. Збережи формат conventional commits.'
    : 'Fix commit message according to this feedback. Keep conventional commits format.';

  return `${instruction}

Original message: ${originalMessage}

Feedback: ${feedback}

Return ONLY the updated commit message, no explanations.`;
}

/**
 * Парсинг відповіді від Claude CLI
 */
function parseCliResponse(response) {
  const lines = response.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Шукаємо рядок, що схожий на conventional commit
  const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|test|chore|perf)(\(.+?\))?:.+/;

  for (let i = lines.length - 1; i >= 0; i--) {
    if (conventionalCommitPattern.test(lines[i])) {
      return lines[i];
    }
  }

  // Якщо не знайшли conventional commit, беремо останній рядок
  return lines[lines.length - 1] || 'chore: update code';
}

/**
 * Виконання команди через Claude CLI
 */
function executeCLICommand(prompt) {
  const command = `cat << 'CLAUDEPROMPT' | claude
${prompt}
CLAUDEPROMPT`;

  return execSync(command, {
    encoding: 'utf-8',
    shell: '/bin/bash',
    maxBuffer: 10 * 1024 * 1024
  });
}

/**
 * Генерація через Claude Code CLI
 */
export function generateWithCLI(status, diff, lang = 'EN') {
  const prompt = createGenerationPrompt(status, diff, lang);
  const result = executeCLICommand(prompt);
  return parseCliResponse(result);
}

/**
 * Редагування через Claude Code CLI
 */
export function refineWithCLI(originalMessage, feedback, lang = 'EN') {
  const prompt = createRefinementPrompt(originalMessage, feedback, lang);
  const result = executeCLICommand(prompt);
  return parseCliResponse(result);
}

/**
 * Генерація через Anthropic API
 */
export async function generateWithAPI(status, diff, lang = 'EN') {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(lang === 'UA' ? 'ANTHROPIC_API_KEY не знайдено' : 'ANTHROPIC_API_KEY not found');
  }

  // Динамічний імпорт SDK
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey });

  const prompt = createGenerationPrompt(status, diff, lang);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text.trim();
}

/**
 * Редагування через Anthropic API
 */
export async function refineWithAPI(originalMessage, feedback, lang = 'EN') {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(lang === 'UA' ? 'ANTHROPIC_API_KEY не знайдено' : 'ANTHROPIC_API_KEY not found');
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey });

  const prompt = createRefinementPrompt(originalMessage, feedback, lang);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 300,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text.trim();
}
