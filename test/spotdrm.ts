import * as spot from '../src/lib/spotify';
const Z = '0123456789abcdef';
const Q = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const ee: string[] = [];
ee.length = 256;
for (let ke = 0; ke < 256; ke++) {
	ee[ke] = Z[ke >> 4] + Z[15 & ke];
}

const te: number[] = [];
te.length = 128;
for (let ke = 0; ke < Q.length; ++ke) {
	te[Q.charCodeAt(ke)] = ke;
}

function getGid(songId: string): string | null {
	if (songId.length !== 22) {
		return null;
	}

	const t = 2.3283064365386963e-10;
	const n = 4294967296;
	const i = 238328;

	let o = 0,
		r = 0,
		a = 0,
		s = 0,
		c = 0;

	o =
		56800235584 * te[songId.charCodeAt(0)] +
		916132832 * te[songId.charCodeAt(1)] +
		14776336 * te[songId.charCodeAt(2)] +
		238328 * te[songId.charCodeAt(3)] +
		3844 * te[songId.charCodeAt(4)] +
		62 * te[songId.charCodeAt(5)] +
		te[songId.charCodeAt(6)];
	r = (o * t) | 0;
	o -= r * n;

	c = 3844 * te[songId.charCodeAt(7)] + 62 * te[songId.charCodeAt(8)] + te[songId.charCodeAt(9)];
	o = o * i + c;
	o -= (c = (o * t) | 0) * n;
	r = r * i + c;

	c = 3844 * te[songId.charCodeAt(10)] + 62 * te[songId.charCodeAt(11)] + te[songId.charCodeAt(12)];
	o = o * i + c;
	o -= (c = (o * t) | 0) * n;
	r = r * i + c;
	r -= (c = (r * t) | 0) * n;

	a = c;
	c = 3844 * te[songId.charCodeAt(13)] + 62 * te[songId.charCodeAt(14)] + te[songId.charCodeAt(15)];
	o = o * i + c;
	o -= (c = (o * t) | 0) * n;
	r = r * i + c;
	r -= (c = (r * t) | 0) * n;

	a = a * i + c;
	c = 3844 * te[songId.charCodeAt(16)] + 62 * te[songId.charCodeAt(17)] + te[songId.charCodeAt(18)];
	o = o * i + c;
	o -= (c = (o * t) | 0) * n;
	r = r * i + c;
	r -= (c = (r * t) | 0) * n;

	a = a * i + c;
	a -= (c = (a * t) | 0) * n;
	s = c;

	c = 3844 * te[songId.charCodeAt(19)] + 62 * te[songId.charCodeAt(20)] + te[songId.charCodeAt(21)];
	o = o * i + c;
	o -= (c = (o * t) | 0) * n;
	r = r * i + c;
	r -= (c = (r * t) | 0) * n;

	a = a * i + c;
	a -= (c = (a * t) | 0) * n;
	s = s * i + c;
	s -= (c = (s * t) | 0) * n;

	if (c) return null;

	return (
		ee[s >>> 24] +
		ee[(s >>> 16) & 255] +
		ee[(s >>> 8) & 255] +
		ee[255 & s] +
		ee[a >>> 24] +
		ee[(a >>> 16) & 255] +
		ee[(a >>> 8) & 255] +
		ee[255 & a] +
		ee[r >>> 24] +
		ee[(r >>> 16) & 255] +
		ee[(r >>> 8) & 255] +
		ee[255 & r] +
		ee[o >>> 24] +
		ee[(o >>> 16) & 255] +
		ee[(o >>> 8) & 255] +
		ee[255 & o]
	);
}
let tok = JSON.parse(await spot.getSpotTokenSSR()).accessToken; // anonymous tok
let cliTok = (await spot.getSpotCliTokenSSR()).token; // anonymous tok
let gid = getGid('7FjRNlmPtWb1ra46t14rUN');
let meta = (
	await (
		await fetch(`https://spclient.wg.spotify.com/metadata/4/track/${gid}?market=from_token`, {
			headers: {
				accept: 'application/json',
				'app-platform': 'WebPlayer',
				authorization: `Bearer ${tok}`,
				'client-token': cliTok,
				'spotify-app-version': '1.2.54.219.g19a93a5d',
				Referer: 'https://open.spotify.com/',
				'Referrer-Policy': 'strict-origin-when-cross-origin'
			},
			body: null,
			method: 'GET'
		})
	).json()
).file;
console.log(meta);
let streamUrls = await await fetch(
	`https://gue1-spclient.spotify.com/storage-resolve/v2/files/audio/interactive/10/${meta[3].file_id}?version=10000000&product=9&platform=39&alt=json`,
	{
		headers: {
			accept: '*/*',
			authorization: `Bearer ${tok}`,
			'cache-control': 'no-cache',
			'client-token': cliTok,
			Referer: 'https://open.spotify.com/',
			'Referrer-Policy': 'strict-origin-when-cross-origin'
		},
		body: null,
		method: 'GET'
	}
);
console.log(await streamUrls.json());
