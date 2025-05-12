import desktopAdapter from '@sveltejs/adapter-static';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  define: {
    'process.env.DESKTOP': JSON.stringify(process.env.DESKTOP || '0')
  },
  kit: {
    adapter:
      Number(process.env.DESKTOP) == 1
        ? desktopAdapter({
            pages: 'build',
            assets: 'build',
            fallback: 'index.html',
            precompress: false,
            strict: true
          })
        : adapter({
            runtime: 'edge'
          }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/mujay' : ''
    },
    csrf: false
  }
};

export default config;