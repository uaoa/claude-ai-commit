/**
 * Модуль локалізації для всіх текстових повідомлень
 */

export const messages = {
  EN: {
    // Заголовок
    title: '🚀 Git Commit Generator',
    language: 'Language: English',

    // Помилки Git
    noStagedChanges: '❌ No staged changes. Add files first with git add',
    gitStatusError: '❌ Error reading git status',
    gitDiffError: '❌ Error reading git diff',
    commitError: '❌ Error creating commit',

    // Генерація
    generatingCLI: '\n🤖 Generating commit message via Claude Code CLI...',
    generatingAPI: '\n🤖 Generating commit message via API...',
    editingMessage: '\n🤖 Editing commit message...',

    // API/CLI помилки
    apiUnavailable: '⚠️  API unavailable',
    switchingToCLI: 'Switching to Claude Code CLI...',
    cliError: '❌ Claude CLI error',
    cliCheckVersion: 'Ensure Claude Code is installed and working: claude --version',
    noGenerationMethod: '❌ No method available for generating commit message',

    // Інструкції налаштування
    chooseOption: '\nChoose one of the options:',
    addApiKey: '1. Add ANTHROPIC_API_KEY to .env file',
    installCLI: '2. Install Claude Code CLI: https://docs.claude.com/claude-code',

    // Підтвердження
    generatedMessage: '\nGenerated commit message:',
    confirmPrompt: 'Confirm and commit?',
    confirmYes: '  Enter/y - yes',
    confirmEdit: '  e - edit',
    confirmNo: '  n/Esc - cancel',

    // Редагування
    currentMessage: '\nCurrent message',
    editFeedback: 'What to fix? (Enter - keep as is): ',
    aiUnavailable: '⚠️  AI unavailable, enter message manually:',
    newMessage: 'New message: ',
    editError: '❌ Edit error',

    // Результат
    commitSuccess: '\n✅ Commit created successfully!',
    commitCancelled: '❌ Commit cancelled',
    cancelledCtrlC: '\n❌ Cancelled (Ctrl+C)',
    criticalError: '❌ Critical error',

    // API ключ
    apiKeyNotFound: 'ANTHROPIC_API_KEY not found',
    sdkLoadError: 'Could not load @anthropic-ai/sdk. Install: npm install @anthropic-ai/sdk',
  },

  UA: {
    // Заголовок
    title: '🚀 Git Commit Generator',
    language: 'Мова: Українська',

    // Помилки Git
    noStagedChanges: '❌ Немає staged changes. Спочатку додайте файли через git add',
    gitStatusError: '❌ Помилка при читанні git status',
    gitDiffError: '❌ Помилка при читанні git diff',
    commitError: '❌ Помилка при створенні commit',

    // Генерація
    generatingCLI: '\n🤖 Генерую commit message через Claude Code CLI...',
    generatingAPI: '\n🤖 Генерую commit message через API...',
    editingMessage: '\n🤖 Редагую commit message...',

    // API/CLI помилки
    apiUnavailable: '⚠️  API недоступний',
    switchingToCLI: 'Переключаюсь на Claude Code CLI...',
    cliError: '❌ Помилка Claude CLI',
    cliCheckVersion: 'Переконайтесь, що Claude Code встановлено та працює: claude --version',
    noGenerationMethod: '❌ Немає доступних методів для генерації commit message',

    // Інструкції налаштування
    chooseOption: '\nОберіть один з варіантів:',
    addApiKey: '1. Додайте ANTHROPIC_API_KEY в .env файл',
    installCLI: '2. Встановіть Claude Code CLI: https://docs.claude.com/claude-code',

    // Підтвердження
    generatedMessage: '\nЗгенерований commit message:',
    confirmPrompt: 'Підтвердити та виконати commit?',
    confirmYes: '  Enter/y - так',
    confirmEdit: '  e - редагувати',
    confirmNo: '  n/Esc - скасувати',

    // Редагування
    currentMessage: '\nПоточний message',
    editFeedback: 'Що треба виправити? (Enter - залишити як є): ',
    aiUnavailable: '⚠️  AI недоступний, введіть message вручну:',
    newMessage: 'Новий message: ',
    editError: '❌ Помилка редагування',

    // Результат
    commitSuccess: '\n✅ Commit успішно створено!',
    commitCancelled: '❌ Commit скасовано',
    cancelledCtrlC: '\n❌ Скасовано (Ctrl+C)',
    criticalError: '❌ Критична помилка',

    // API ключ
    apiKeyNotFound: 'ANTHROPIC_API_KEY не знайдено',
    sdkLoadError: 'Не вдалося завантажити @anthropic-ai/sdk. Встановіть: npm install @anthropic-ai/sdk',
  }
};

/**
 * Отримати повідомлення для вказаної мови
 */
export function getMessages(lang = 'EN') {
  return messages[lang] || messages.EN;
}

/**
 * Створити функцію для отримання повідомлень з автоматичним вибором мови
 */
export function createTranslator(lang = 'EN') {
  const msgs = getMessages(lang);
  return (key) => msgs[key] || key;
}
