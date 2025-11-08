/**
 * Модуль для роботи з Git
 */

import { execSync } from 'child_process';

/**
 * Перевірка наявності staged changes
 */
export function getStagedChanges() {
  const status = execSync('git diff --cached --stat', { encoding: 'utf-8' });
  return status.trim() || null;
}

/**
 * Отримання diff для staged changes
 */
export function getDiff(maxLength = 6000) {
  const diff = execSync('git diff --cached --unified=1', { encoding: 'utf-8' });
  return diff.slice(0, maxLength);
}

/**
 * Виконання git commit
 */
export function executeCommit(message) {
  const escapedMessage = message.replace(/"/g, '\\"');
  execSync(`git commit -m "${escapedMessage}"`, { stdio: 'inherit' });
}

/**
 * Перевірка наявності Claude Code CLI
 */
export function hasClaudeCodeCLI() {
  try {
    execSync('which claude', { encoding: 'utf-8', stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}
