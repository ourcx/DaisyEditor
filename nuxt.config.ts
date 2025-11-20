// nuxt.config.ts
import Aura from "@primevue/themes/aura";
import mypreset from "./plugin/myPreset";
export default defineNuxtConfig({
  devtools: { enabled: false },
  pages: true,
  modules: ["@vueuse/nuxt", "@pinia/nuxt", "@primevue/nuxt-module"],
  app: {
    head: {
      title: "Daisy Editor",
      meta: [
        { name: "description", content: "Daisy Editor" },
        { name: "keywords", content: "Daisy Editor" },
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
    },
  },
  
  css: ["~/assets/css/main.css"],
  primevue: {
    //这样的导入方式才是正确的
    options: {
      ripple: true,
      inputVariant: "filled",
      theme: {
        // 这里不需要 preset 选项，因为通过 importTheme 导入了
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
