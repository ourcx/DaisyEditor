import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import stylistic from '@stylistic/eslint-plugin' // 用于替代 Prettier 的代码风格规则

// 使用 defineConfig 可以获得类型提示 :cite[2]
export default tseslint.config(
  // 1. 基础 JS 和 TS 配置
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    extends: [
      js.configs.recommended, // 使用 ESLint 推荐规则
      ...tseslint.configs.recommended, // 使用 TypeScript ESLint 推荐规则
    ],
    languageOptions: {
      globals: {
        ...globals.browser, // 浏览器全局变量
        ...globals.node, // Node.js 全局变量，如果你的项目是全栈的
      },
    },
    rules: {
      // 可以在这里覆盖或添加通用规则
    },
  },

  // 2. 配置 Vue 文件 :cite[3]
  {
    files: ['**/*.vue'],
    plugins: {
      vue: pluginVue,
    },
    extends: [
      // 使用 pluginVue 的推荐配置，可根据需要选择 'flat/essential', 'flat/recommended', 'flat/strongly-recommended'
      ...pluginVue.configs['flat/recommended'],
    ],
    languageOptions: {
      parser: tseslint.parser, // 为 .vue 文件指定 TypeScript 解析器 :cite[3]
    },
    rules: {
      // Vue 特定规则覆盖
      'vue/multi-word-component-names': 'warn', // 允许单文件组件名，但对潜在问题告警
    },
  },

  // 3. 使用 ESLint Stylistic 统一代码格式 (可替代 Prettier) :cite[4]:cite[10]
  {
    plugins: {
      stylistic,
    },
    rules: {
      // 选择你喜欢的代码风格规则
      'stylistic/semi': ['error', 'never'], // 无分号
      'stylistic/quotes': ['error', 'single'], // 单引号
      'stylistic/indent': ['error', 2], // 2空格缩进
      'stylistic/comma-dangle': ['error', 'always-multiline'], // 尾随逗号
      // 更多规则请参考: https://eslint.style/
    },
  },

  // 4. 针对特定文件或目录的覆盖规则
  {
    // 忽略不需要校验的文件
    ignores: ['dist/**', 'node_modules/**', '*.min.js'],
  },
  {
    // 对测试文件使用宽松的规则
    files: ['tests/**', '**/*.test.{js,ts}'],
    rules: {
      'no-console': 'off',
    },
  }
)