import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	return {
		url: url.href
	};
};
export const csr = true;
export const ssr = false;
export const prerender = false;
