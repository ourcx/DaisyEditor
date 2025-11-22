import mypreset from "./plugin/myPreset";
export default defineNuxtConfig({
  devtools: { enabled: false },
  pages: true,
  modules: ["@vueuse/nuxt", "@pinia/nuxt", "@primevue/nuxt-module"],
  pinia: {
    autoImports: ['defineStore'], // 自动引入 defineStore
  },
  app: {
    head: {
      title: "Daisy Editor",
      meta: [
        { name: "description", content: "Daisy Editor" },
        { name: "keywords", content: "Daisy Editor" },
        //禁止缩放
        { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
      '@fullhuman/postcss-purgecss': {
        content: [
          './pages/**/*.vue',
          './components/**/*.vue',
          './layouts/**/*.vue'
        ],
        whitelist: ['html', 'body']
      }
    },
  },

  css: ["~/assets/css/main.css"],
  primevue: {
    //这样的导入方式才是正确的
    options: {
      ripple: true,
      inputVariant: "filled",
      theme: {
        preset: mypreset,
        options: {
          prefix: "p",
          darkModeSelector: "system",
          cssLayer: false,
        },
      },
    },

    // 如果使用 autoImport，就不需要手动指定 components 和 directives
    autoImport: true,

    // 移除这些配置，让 autoImport 自动处理
    // components: {
    //   prefix: 'org'
    // },
    // directives: {
    //   prefix: 'org'
    // }
  },
});
