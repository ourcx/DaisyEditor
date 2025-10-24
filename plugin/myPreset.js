// utils/fedPrimePreset.js
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

export default definePreset(Aura, {
    semantic: {
        colorScheme: {
            light: {
                // ========== 主要颜色 ==========
                primary: {
                    50: 'var(--fei-color-primary-light-13)',
                    100: 'var(--fei-color-primary-light-11)',
                    200: 'var(--fei-color-primary-light-9)',
                    300: 'var(--fei-color-primary-light-7)',
                    400: 'var(--fei-color-primary-light-5)',
                    500: 'var(--fei-color-primary)',
                    600: 'var(--fei-color-primary-dark-2)',
                    700: 'var(--fei-color-primary-dark-3)',
                    800: 'var(--fei-color-primary-dark-4)',
                    900: '#1a0d0d'
                },

                // ========== 功能颜色 ==========
                success: {
                    50: 'var(--fei-color-success-light-13)',
                    100: 'var(--fei-color-success-light-11)',
                    200: 'var(--fei-color-success-light-9)',
                    300: 'var(--fei-color-success-light-7)',
                    400: 'var(--fei-color-success-light-5)',
                    500: 'var(--fei-color-success)',
                    600: 'var(--fei-color-success-dark-2)',
                    700: 'var(--fei-color-success-dark-3)',
                    800: 'var(--fei-color-success-dark-4)',
                    900: '#2a3314'
                },

                warning: {
                    50: 'var(--fei-color-warning-light-13)',
                    100: 'var(--fei-color-warning-light-11)',
                    200: 'var(--fei-color-warning-light-9)',
                    300: 'var(--fei-color-warning-light-7)',
                    400: 'var(--fei-color-warning-light-5)',
                    500: 'var(--fei-color-warning)',
                    600: 'var(--fei-color-warning-dark-2)',
                    700: 'var(--fei-color-warning-dark-3)',
                    800: 'var(--fei-color-warning-dark-4)',
                    900: '#332508'
                },

                danger: {
                    50: 'var(--fei-color-danger-light-13)',
                    100: 'var(--fei-color-danger-light-11)',
                    200: 'var(--fei-color-danger-light-9)',
                    300: 'var(--fei-color-danger-light-7)',
                    400: 'var(--fei-color-danger-light-5)',
                    500: 'var(--fei-color-danger)',
                    600: 'var(--fei-color-danger-dark-2)',
                    700: 'var(--fei-color-danger-dark-3)',
                    800: 'var(--fei-color-danger-dark-4)',
                    900: '#2c1515'
                },

                info: {
                    50: 'var(--fei-color-info-light-13)',
                    100: 'var(--fei-color-info-light-11)',
                    200: 'var(--fei-color-info-light-9)',
                    300: 'var(--fei-color-info-light-7)',
                    400: 'var(--fei-color-info-light-5)',
                    500: 'var(--fei-color-info)',
                    600: 'var(--fei-color-info-dark-2)',
                    700: 'var(--fei-color-info-dark-3)',
                    800: 'var(--fei-color-info-dark-4)',
                    900: '#2a2623'
                },

                // ========== 表面颜色 ==========
                surface: {
                    0: 'var(--fei-bg-color)',
                    50: 'var(--fei-fill-color-lighter)',
                    100: 'var(--fei-fill-color-light)',
                    200: 'var(--fei-fill-color)',
                    300: 'var(--fei-fill-color-dark)',
                    400: 'var(--fei-fill-color-darker)',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827'
                },

                // ========== 文本颜色 ==========
                color: {
                    primary: 'var(--fei-text-color-primary)',
                    secondary: 'var(--fei-text-color-regular)',
                    muted: 'var(--fei-text-color-secondary)',
                    placeholder: 'var(--fei-text-color-placeholder)',
                    disabled: 'var(--fei-text-color-disabled)',
                    on: {
                        primary: 'var(--fei-color-white)',
                        success: 'var(--fei-color-white)',
                        warning: 'var(--fei-color-black)',
                        danger: 'var(--fei-color-white)',
                        info: 'var(--fei-color-white)'
                    }
                },

                // ========== 边框颜色 ==========
                border: {
                    color: 'var(--fei-border-color)',
                    hover: 'var(--fei-border-color-hover)',
                    focus: 'var(--fei-color-primary)',
                    disabled: 'var(--fei-disabled-border-color)'
                },

                // ========== 表单字段 ==========
                formField: {
                    background: 'var(--fei-bg-color)',
                    disabledBackground: 'var(--fei-disabled-bg-color)',
                    filledBackground: 'var(--fei-fill-color-light)',
                    borderColor: 'var(--fei-border-color)',
                    hoverBorderColor: 'var(--fei-color-primary)',
                    focusBorderColor: 'var(--fei-color-primary)',
                    invalidBorderColor: 'var(--fei-color-danger)',
                    color: 'var(--fei-text-color-primary)',
                    disabledColor: 'var(--fei-disabled-text-color)',
                    placeholderColor: 'var(--fei-text-color-placeholder)',
                    floatLabelColor: 'var(--fei-text-color-secondary)',
                    floatLabelFocusColor: 'var(--fei-color-primary)',
                    paddingX: '0.75rem',
                    paddingY: '0.5rem',
                    borderRadius: 'var(--fei-border-radius-base)',
                    focusRing: {
                        width: '2px',
                        style: 'solid',
                        color: 'var(--fei-color-primary)',
                        offset: '1px'
                    }
                }
            },

            dark: {
                // ========== 深色模式主要颜色 ==========
                primary: {
                    50: 'var(--fei-color-primary-light-13)',
                    100: 'var(--fei-color-primary-light-11)',
                    200: 'var(--fei-color-primary-light-9)',
                    300: 'var(--fei-color-primary-light-7)',
                    400: 'var(--fei-color-primary-light-5)',
                    500: 'var(--fei-color-primary)',
                    600: 'var(--fei-color-primary-dark-2)',
                    700: 'var(--fei-color-primary-dark-3)',
                    800: 'var(--fei-color-primary-dark-4)',
                    900: '#1a0d0d'
                },

                success: {
                    50: 'var(--fei-color-success-light-13)',
                    100: 'var(--fei-color-success-light-11)',
                    200: 'var(--fei-color-success-light-9)',
                    300: 'var(--fei-color-success-light-7)',
                    400: 'var(--fei-color-success-light-5)',
                    500: 'var(--fei-color-success)',
                    600: 'var(--fei-color-success-dark-2)',
                    700: 'var(--fei-color-success-dark-3)',
                    800: 'var(--fei-color-success-dark-4)',
                    900: '#2a3314'
                },

                warning: {
                    50: 'var(--fei-color-warning-light-13)',
                    100: 'var(--fei-color-warning-light-11)',
                    200: 'var(--fei-color-warning-light-9)',
                    300: 'var(--fei-color-warning-light-7)',
                    400: 'var(--fei-color-warning-light-5)',
                    500: 'var(--fei-color-warning)',
                    600: 'var(--fei-color-warning-dark-2)',
                    700: 'var(--fei-color-warning-dark-3)',
                    800: 'var(--fei-color-warning-dark-4)',
                    900: '#332508'
                },

                danger: {
                    50: 'var(--fei-color-danger-light-13)',
                    100: 'var(--fei-color-danger-light-11)',
                    200: 'var(--fei-color-danger-light-9)',
                    300: 'var(--fei-color-danger-light-7)',
                    400: 'var(--fei-color-danger-light-5)',
                    500: 'var(--fei-color-danger)',
                    600: 'var(--fei-color-danger-dark-2)',
                    700: 'var(--fei-color-danger-dark-3)',
                    800: 'var(--fei-color-danger-dark-4)',
                    900: '#2c1515'
                },

                info: {
                    50: 'var(--fei-color-info-light-13)',
                    100: 'var(--fei-color-info-light-11)',
                    200: 'var(--fei-color-info-light-9)',
                    300: 'var(--fei-color-info-light-7)',
                    400: 'var(--fei-color-info-light-5)',
                    500: 'var(--fei-color-info)',
                    600: 'var(--fei-color-info-dark-2)',
                    700: 'var(--fei-color-info-dark-3)',
                    800: 'var(--fei-color-info-dark-4)',
                    900: '#2a2623'
                },

                // ========== 深色模式表面颜色 ==========
                surface: {
                    0: '#0f172a',
                    50: '#1e293b',
                    100: '#334155',
                    200: '#475569',
                    300: '#64748b',
                    400: '#94a3b8',
                    500: '#cbd5e1',
                    600: '#e2e8f0',
                    700: '#f1f5f9',
                    800: '#f8fafc',
                    900: '#ffffff'
                },

                // ========== 深色模式文本颜色 ==========
                color: {
                    primary: '#f8fafc',
                    secondary: '#cbd5e1',
                    muted: '#94a3b8',
                    placeholder: '#64748b',
                    disabled: '#475569',
                    on: {
                        primary: 'var(--fei-color-white)',
                        success: 'var(--fei-color-white)',
                        warning: 'var(--fei-color-black)',
                        danger: 'var(--fei-color-white)',
                        info: 'var(--fei-color-white)'
                    }
                },

                // ========== 深色模式边框颜色 ==========
                // border: {
                //     color: '#334155',
                //     hover: '#475569',
                //     focus: 'var(--fei-color-primary)',
                //     disabled: '#1e293b'
                // },

                // ========== 深色模式表单字段 ==========
                formField: {
                    background: '#1e293b',
                    disabledBackground: '#0f172a',
                    filledBackground: '#334155',
                    borderColor: '#334155',
                    hoverBorderColor: 'var(--fei-color-primary)',
                    focusBorderColor: 'var(--fei-color-primary)',
                    invalidBorderColor: 'var(--fei-color-danger)',
                    color: '#f8fafc',
                    disabledColor: '#64748b',
                    placeholderColor: '#94a3b8',
                    floatLabelColor: '#cbd5e1',
                    floatLabelFocusColor: 'var(--fei-color-primary)',
                    paddingX: '0.75rem',
                    paddingY: '0.5rem',
                    borderRadius: 'var(--fei-border-radius-base)',
                    focusRing: {
                        width: '2px',
                        style: 'solid',
                        color: 'var(--fei-color-primary)',
                        offset: '1px'
                    }
                }
            }
        }
    },

    // ========== 通用设计令牌 ==========
    common: {
        // 边框
        border: {
            width: 'var(--fei-border-width)',
            style: 'var(--fei-border-style)',
            radius: {
                none: '0',
                xs: 'var(--fei-border-radius-small)',
                sm: 'var(--fei-border-radius-small)',
                md: 'var(--fei-border-radius-base)',
                lg: 'var(--fei-border-radius-base)',
                xl: 'var(--fei-border-radius-round)',
                '2xl': 'var(--fei-border-radius-circle)'
            }
        },

        // 字体
        font: {
            family: 'var(--fei-font-family)',
            size: {
                '2xs': 'var(--fei-font-size-tiny)',
                xs: 'var(--fei-font-size-extra-small)',
                sm: 'var(--fei-font-size-small)',
                md: 'var(--fei-font-size-base)',
                lg: 'var(--fei-font-size-medium)',
                xl: 'var(--fei-font-size-large)',
                '2xl': 'var(--fei-font-size-extra-large)'
            },
            weight: {
                light: '300',
                normal: '400',
                medium: 'var(--fei-font-weight-primary)',
                bold: '600'
            }
        },

        // 过渡动画
        transition: {
            duration: 'var(--fei-transition-duration)',
            timing: {
                DEFAULT: 'var(--fei-transition-timing-function)',
                in: 'var(--fei-transition-timing-function)',
                out: 'var(--fei-transition-timing-function)'
            }
        },

        // 层级
        zindex: {
            overlay: 'var(--fei-z-index-dialog)',
            sticky: 'var(--fei-z-index-bar)'
        },

        // 间距
        space: {
            1: '0.25rem',
            2: '0.5rem',
            3: '0.75rem',
            4: '1rem',
            5: '1.25rem',
            6: '1.5rem',
            7: '1.75rem',
            8: '2rem'
        },

        // 焦点环
        focusRing: {
            width: '2px',
            style: 'solid',
            color: 'var(--fei-color-primary)',
            offset: '1px',
        }
    }
});