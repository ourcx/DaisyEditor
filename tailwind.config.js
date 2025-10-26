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
    extend: {
      colors: {
        // 主色调
        primary: {
          DEFAULT: '#b51e1e',
          50: '#fdf4f3',
          100: '#f4dfdf',
          200: '#eabfbf',
          300: '#df9f9f',
          400: '#d57e7e',
          500: '#ca5e5e',
          600: '#c03e3e',
          700: '#b51e1e',
          800: '#9c3c3c',
          900: '#7a3030',
          950: '#5d2525',
        },

        // 成功色
        success: {
          DEFAULT: '#96c24e',
          50: '#f0f6e6',
          100: '#e1eecc',
          200: '#d2e5b3',
          300: '#c3dc9a',
          400: '#b4d381',
          500: '#a5cb67',
          600: '#96c24e',
          700: '#8c9e4a',
          800: '#6d7c3a',
          900: '#4f5a29',
        },

        // 警告色
        warning: {
          DEFAULT: '#fed71a',
          50: '#fff9de',
          100: '#fff4be',
          200: '#ffee9d',
          300: '#fee87c',
          400: '#fee25b',
          500: '#fedd3b',
          600: '#fed71a',
          700: '#d5a01a',
          800: '#a87d15',
          900: '#7c5a10',
        },

        // 危险色
        danger: {
          DEFAULT: '#efafad',
          50: '#fdf4f3',
          100: '#fae8e8',
          200: '#f8dddc',
          300: '#f6d1d0',
          400: '#f4c6c4',
          500: '#f1bab9',
          600: '#efafad',
          700: '#d05a5a',
          800: '#a64848',
          900: '#7d3636',
        },

        // 信息色
        info: {
          DEFAULT: '#bbb5ac',
          50: '#f5f4f3',
          100: '#eceae7',
          200: '#e2dfdb',
          300: '#d8d5d0',
          400: '#cecac4',
          500: '#c5c0b8',
          600: '#bbb5ac',
          700: '#a08b7b',
          800: '#806f62',
          900: '#60534a',
        },

        // 中性色
        neutral: {
          white: '#ffffff',
          black: '#000000',
          bg: {
            DEFAULT: '#ffffff',
            page: '#f2f3f5',
            overlay: '#ffffff',
          },
          text: {
            primary: '#303133',
            regular: '#606266',
            secondary: '#909399',
            placeholder: '#aaabb2',
            disabled: '#c0c4cc',
          },
          border: {
            DEFAULT: '#dddfe6',
            light: '#e4e7ed',
            lighter: '#ebeef5',
            'extra-light': '#f2f6fc',
            dark: '#d4d7de',
            darker: '#cdd0d6',
            hover: '#c0c4cc',
          },
          fill: {
            DEFAULT: '#f6f2f5',
            light: '#f5f7fa',
            lighter: '#fafafa',
            'extra-light': '#fafcff',
            dark: '#ebedf0',
            darker: '#e6e8eb',
            blank: '#ffffff',
          },
          disabled: {
            bg: '#f5f7fa',
            text: '#aaabb2',
            border: '#e4e7ed',
          },
        },

        // 特殊背景色
        fei: {
          bg: '#ffe6c8',
        }
      },

      // 字体配置
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },

      fontSize: {
        'tiny': '11px',
        'xs': '12px',
        'sm': '13px',
        'base': '14px',
        'lg': '16px',
        'xl': '18px',
        '2xl': '14px', // extra-large
      },

      fontWeight: {
        primary: '500',
      },

      // 边框圆角
      borderRadius: {
        'small': '2px',
        'DEFAULT': '4px',
        'round': '20px',
        'full': '100%', // circle
      },

      // 边框宽度
      borderWidth: {
        DEFAULT: '1px',
      },

      // 过渡动画
      transitionDuration: {
        'fast': '200ms',
        'DEFAULT': '300ms',
      },

      transitionTimingFunction: {
        'DEFAULT': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      },

      // z-index
      zIndex: {
        'bar': 1000,
        'dialog': 10001,
      },

      // 扩展其他配置
      spacing: {
        // 可以根据需要添加自定义间距
      },

      boxShadow: {
        // 可以根据需要添加阴影
      },
      fontFamily: {
        'sans': ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont'],
        'serif': ['ui-serif', 'Georgia'],
        'mono': ['ui-monospace', 'SFMono-Regular'],
        // 自定义字体
        'display': ['Oswald'],
        'body': ['Open Sans'],
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'scale-up': {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' }
        }
      },
      animation: {
        'slide-in': 'slide-in 0.5s ease-out',
        'scale-up': 'scale-up 0.3s ease-out'
      }
    },
  },
  plugins: [
    // 可以添加需要的插件
  ],
}