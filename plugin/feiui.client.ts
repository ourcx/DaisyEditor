// plugins/feiui.client.ts
import { defineNuxtPlugin } from '#app'
// @ts-ignore
import FeiUI from 'feiui-vue'
import 'feiui-vue/dist/style.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(FeiUI)
})