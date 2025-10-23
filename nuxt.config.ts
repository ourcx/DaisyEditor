

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  pages: true, 
  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/ui',
  ],
  app: {
    head: {
      title: 'Daisy Editor',
      meta: [
        { name: 'description', content: 'Daisy Editor' },
        { name: 'keywords', content: 'Daisy Editor' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  fonts: {
    providers: {
      google: {
        mode: 'cdn', // 通过 link 标签加载，绕过构建时的下载
      },
    },
  },
  css: [
    '~/assets/css/main.css'
  ],
  // imports: {
  //   dirs: [
  //     'composables',
  //     'composables/*/index.{ts,js,mjs,mts}',
  //     'composables/**'
  //   ]
  // },
  
  // 移除 alias 配置，让 Nuxt 使用默认别名
})