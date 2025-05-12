import desktopAdapter from '@sveltejs/adapter-static';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	define: {
		'process.env.DESKTOP': JSON.stringify(process.env.DESKTOP || '0') // Default to '0' if undefined
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
		csrf: false
	}
};

export default config;
