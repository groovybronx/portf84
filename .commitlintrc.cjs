module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New features
        'fix', // Bug fixes
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'chore', // Maintenance tasks
        'build', // Build system changes
        'ci', // CI configuration changes
        'revert', // Reverting previous commits
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'ui', // User interface changes
        'api', // API changes
        'library', // Library/photo management
        'tags', // Tag system
        'collections', // Collections feature
        'search', // Search functionality
        'settings', // Settings and configuration
        'auth', // Authentication
        'performance', // Performance optimizations
        'security', // Security changes
        'deps', // Dependencies
        'tauri', // Tauri/Rust backend
        'release', // Release-related changes
        'docs', // Documentation
        'tests', // Test infrastructure
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
};
