import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
export const csr = true;
export const ssr = true;
export const prerender = false; // vercel fix
export const load: PageServerLoad = async ({ url, fetch, setHeaders }) => {
	const songId = url.searchParams.get('id');
	if (!songId) {
		throw error(400, 'Missing song ID');
	}
	try {
		const response = await fetch(`https://libytm.mujay.app/song/${songId}`);
		if (!response.ok) {
			throw error(404, 'Song not found');
		}
		const songData = await response.json();
		setHeaders({
			'Cache-Control': 'max-age=3600, s-maxage=3600'
		});
		return {
			songData,
			meta: {
				title: `${songData.title} - ${songData.author}`,
				description: `Listen to ${songData.title} by ${songData.author} on Mujay`,
				image: songData.thumbnail.thumbnails.slice(-1)[0].url,
				url: url.href,
				type: 'music.song',
				songId
			}
		};
	} catch (err) {
		console.error('Error fetching song data:', err);
		throw error(500, 'Failed to fetch song data');
	}
};
