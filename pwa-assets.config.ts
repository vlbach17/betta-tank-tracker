import {
  defineConfig,
  minimal2023Preset as preset,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...preset,
    maskable: {
      ...preset.maskable,
      padding: 0.2,
      resizeOptions: { background: '#14b8c4' },
    },
  },
  images: ['public/favicon.svg'],
})
