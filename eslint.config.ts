import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import layerDependencyPlugin from './eslint-rules/layer-dependency.js'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'mojian': layerDependencyPlugin,
    },
    rules: {
      'mojian/layer-dependency': 'error',
    },
  },
)
