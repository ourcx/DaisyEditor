<template>
  <div
    :style="{
      height: typeof height === 'number' ? height + 'px' : height,
      background,
      color,
      border,
      padding: typeof padding === 'number' ? padding + 'px' : padding,
      textAlign,
    }"
    class="fei-footer"
  >
    <slot name="main">
      <div class="fei-footer-main__out">
        <div class="fei-footer-main">
          <div class="main-top">
            <div
              class="fei-footer-main__content"
              v-for="value in main"
              :key="value"
              :class="`fei-footer_type-${type}`"
            >
              {{ value }}
            </div>
          </div>
          <div class="main-bottom">
            <div
              class="fei-footer-main__social"
              v-for="value in social"
              :key="value"
              :class="`fei-footer_type-${type}`"
            >
              {{ value }}
            </div>
          </div>
        </div>
        <div class="fei-footer-main__right">{{ right }}</div>
      </div>
    </slot>

    <slot name="bottom">
      <div class="fei-footer-bottom">
        <div class="fei-footer-bottom__content">
          {{ bottom }}
        </div>
        <div class="fei-footer-bottom__copyright" v-for="value in copyright" :key="value">
          {{ value }}
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
interface FooterProps {
  height?: string | number;
  width?: string | number;
  background?: string;
  color?: string;
  border?: string;
  padding?: string | number;
  textAlign?: "left" | "center" | "right";
  bottom?: string;
  main?: string[];
  copyright?: string[];
  social?: string[];
  right?: string;
  type?: "primary" | "info" | "success" | "warning" | "danger";
}
const props = withDefaults(defineProps<FooterProps>(), {
  height: "auto",
  color: "#333",
  border: "1px solid #e8e8e8",
  padding: "0 20px",
  textAlign: "center",
  main: () => ["技术支持", "备案信息", "联系方式", "免责声明", "隐私政策"],
  bottom: "Copyright © 2024 FeiUI. All Rights Reserved.",
  copyright: () => [
    "备案号：粤ICP备2024012345号-1",
    "技术支持：FeiUI",
    "联系邮箱：3277975910@qq.com",
  ],
  social: () => ["微信", "微博", "QQ", "GitHub", "知乎", "抖音", "小红书", "B站", "头条"],
  right: "欢迎使用",
  type: "primary",
});
</script>

<style scoped lang="scss">
.fei-footer {
  width: 100%;
  box-sizing: border-box;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--fei-color-info-dark-2, #60534a);
  border-top: 1px solid var(--fei-color-info-light-11, #eceae7);
  background-color: var(--fei-bg-color);
}

.fei-footer-main__out {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed var(--fei-color-info-light-9, #e2dfdb);
}

.fei-footer-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.main-top {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px 20px;
}

.fei-footer-main__content {
  font-size: 16px;
  font-weight: 700;
  transition: color 0.3s;
  cursor: pointer;
  text-align: left;
  color: var(--fei-text-color-primary);
}

.fei-footer_type-primary:hover {
  color: var(--fei-color-primary, #b51e1e);
}
.fei-footer_type-success:hover {
  color: var(--fei-color-success, #28a745);
}
.fei-footer_type-warning:hover {
  color: var(--fei-color-warning, #ffc107);
}
.fei-footer_type-danger:hover {
  color: var(--fei-color-danger, #dc3545);
}
.fei-footer_type-info:hover {
  color: var(--fei-color-info, #17a2b8);
}

.main-bottom {
  display: grid;
  gap: 15px;
  box-sizing: border-box;
  /* 一行五个，多出换行 */
  grid-template-columns: repeat(5, 1fr);
  place-items: center;
  place-content: center;
  width: 100%;
}

.fei-footer-main__social {
  font-size: 16px;
  color: var(--fei-color-info-dark-2, #60534a);
  cursor: pointer;
  transition: color 0.3s;
  place-items: center;
}

.fei-footer-main__right {
  font-size: 12px;
  color: var(--fei-color-info, #bbb5ac);
  line-height: 2;
}

.fei-footer-bottom {
  width: 100%;
  max-width: 1200px;
  margin: 0 20px;
  padding: 10px 0 15px;
  text-align: center;
}

.fei-footer-bottom__content {
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--fei-color-info-dark-2, #60534a);
}

.fei-footer-bottom__copyright {
  display: inline-block;
  margin: 0 10px;
  font-size: 12px;
  color: var(--fei-color-info-dark-3, #806f62);
}
</style>
