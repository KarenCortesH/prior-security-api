module.exports = {
  extends: ['standard'],
  rules: {
    indent: ['error', 2],
    semi: ['error', 'always'],
    'no-var': 'error',
    'func-names': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    quotes: ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
    'node/exports-style': [
      'error',
      'module.exports',
      {
        allowBatchAssign: false
      }
    ]
  }
};
