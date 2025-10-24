// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
  devtools: { enabled: true },
  pages: true,
  modules: ["@vueuse/nuxt", "@pinia/nuxt",'@primevue/nuxt-module'],
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
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
    },
  },
  primevue: {
        options: {
            ripple: true,
            inputVariant: 'filled',
            theme: {
                preset: Aura,
                options: {
                    prefix: 'p',
                    darkModeSelector: 'system',
                    cssLayer: false
                }
            }
        },
    autoImport: true,
    components: {
        prefix: 'org'
    },
    directives: {
        prefix: 'org'
    }
    }
  // imports: {
  //   dirs: [
  //     'composables',
  //     'composables/*/index.{ts,js,mjs,mts}',
  //     'composables/**'
  //   ]
  // },

  // 移除 alias 配置，让 Nuxt 使用默认别名
});
