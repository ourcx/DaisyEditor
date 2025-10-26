/** @type {import('tailwindcss').Config} */
export default {
  // 配置 Tailwind CSS 在哪些路径下的文件中生效
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  // 配置 Tailwind CSS 主题
  theme: {
    extend: {},
  },
  // 配置 Tailwind CSS 插件
  plugins: [],
}
