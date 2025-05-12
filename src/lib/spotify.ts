import { msStr } from '$lib';
import type { Playlist, Song } from '$lib';
function timeout(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSpot(songUrl: string, secondGoAround = false) {
	let metadata = {
		title: '',
		artist: '',
		thumb: '',
		downloadUrl: '',
		id: ''
	};
	let gres = await (
		await fetch('https://api.fabdl.com/spotify/get?url=' + encodeURIComponent(songUrl), {
			headers: {
				'user-agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
			}
		})
	).json();
	metadata.artist = gres.result.artists;
	metadata.title = gres.result.name;
	metadata.thumb = gres.result.image;
	let fres = await (
		await fetch(
			`https://api.fabdl.com/spotify/mp3-convert-task/${gres.result.gid}/${gres.result.id}`,
			{
				headers: {
					'user-agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
				}
			}
		)
	).json();
	metadata.id = gres.result.id;
	if (fres.result.status != 3) {
		let i = 0;
		while (i < 5) {
			let pres = await (
				await fetch(`https://api.fabdl.com/spotify/mp3-convert-progress/${gres.result.id}`, {
					headers: {
						'user-agent':
							'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
					}
				})
			).json();
			if (pres.result) {
				if (pres.result.status == 3) {
					metadata.downloadUrl = `https://api.fabdl.com${decodeURI(pres.result['download_url'])}`;
					return metadata;
				} else {
					console.log(`attempt ${i}; ${JSON.stringify(pres)}`);
					await timeout(1000);
					i++;
				}
			} else {
				console.log(`attempt ${i}; ${JSON.stringify(pres)}`);
				await timeout(1000);
				i++;
			}
		}
		if (!secondGoAround) {
			console.log('api got stuck, usually trying again helps');
			return await getSpot(songUrl, true);
		} else {
			console.log('api got stuck');
			return metadata;
		}
	} else {
		metadata.downloadUrl = `https://api.fabdl.com${decodeURI(fres.result['download_url'])}`;
	}
	return metadata;
}

export async function getSpotToken() {
	let url = `${sessionStorage.IS_ELECTRON ? localStorage.mujayCloud || 'https://mujay.app' : ''}/internal/api/tok`;
	try {
		if (sessionStorage.IS_ELECTRON) {
			return JSON.parse(await getSpotTokenSSR());
		}
		let res = await await fetch(url, {});
		if (!res.ok) {
			document.location = `/internal/error#getSpotToken(...),http|${res.status}|${encodeURIComponent(url)}`;
		}
		let t = await res.text();
		try {
			return JSON.parse(t);
		} catch (e) {
			document.location = `/internal/error#getSpotToken(...),panic|${btoa(`${e} Response: ${t}`)}`;
		}
	} catch (e) {
		document.location = `/internal/error#getSpotToken(...),panic|${btoa(`${e}`)}`;
	}
}

export async function getSpotCliToken() {
	if (sessionStorage.IS_ELECTRON) {
		return await getSpotCliTokenSSR();
	}
	let url = `${sessionStorage.IS_ELECTRON ? localStorage.mujayCloud || 'https://mujay.app' : ''}/internal/api/cliTok`;
	try {
		let res = await await fetch(url, {});
		if (!res.ok) {
			document.location = `/internal/error#getSpotCliToken(...),http|${res.status}|${encodeURIComponent(url)}`;
		}
		let t = await res.text();
		try {
			return JSON.parse(t);
		} catch (e) {
			document.location = `/internal/error#getSpotCliToken(...),panic|${btoa(`${e} Response: ${t}`)}`;
		}
	} catch (e) {
		document.location = `/internal/error#getSpotCliToken(...),panic|${btoa(`${e}`)}`;
	}
}

export async function getSpotTokenSSR() {
	return await (
		await fetch(
			`https://open.spotify.com/get_access_token?reason=transport&productType=web-player`,
			{}
		)
	).text();
}

export async function getSpotCliTokenSSR() {
	return (
		await (
			await fetch(`https://clienttoken.spotify.com/v1/clienttoken`, {
				credentials: 'omit',
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
					Accept: 'application/json',
					'Accept-Language': 'en-US,en;q=0.5',
					'Content-Type': 'application/json',
					'x-cors-headers': JSON.stringify({
						'Sec-GPC': '1',
						'Sec-Fetch-Dest': 'empty',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Site': 'same-site',
						Priority: 'u=4'
					})
				},

				body: '{"client_data":{"client_version":"1.2.54.41.g1f5829c8","client_id":"d8a5ed958d274c2e8ee717e6a4b0971d","js_sdk_data":{"device_brand":"unknown","device_model":"unknown","os":"windows","os_version":"NT 10.0","device_id":"b9bb62ea10d764e25f7dccbe7b6f3116","device_type":"computer"}}}',
				method: 'POST',
				mode: 'cors'
			})
		).json()
	).granted_token;
}
// await getSpotCliToken().token,await getSpotToken().accessToken
export async function spotSearchSongs(cliTok: string, spotTok: string, query: string) {
	if (sessionStorage.IS_ELECTRON) {
		return await spotSearchSongsNoCORS(cliTok, spotTok, query);
	}
	let url = `${sessionStorage.IS_ELECTRON ? localStorage.mujayCloud || 'https://mujay.app' : ''}/internal/api/search?q=${query}`;
	try {
		let res = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				cliTok: cliTok,
				tok: spotTok
			})
		});
		if (!res.ok) {
			document.location = `/internal/error#spotSearchSongs(...),http|${res.status}|${encodeURIComponent(url)}`;
		}
		return res;
	} catch (e) {
		document.location = `/internal/error#spotSearchSongs(...),panic|${btoa(`${e}`)}`;
	}
}

export async function spotGetTrack(cliTok: string, spotTok: string, id: string) {
	if (sessionStorage.IS_ELECTRON) {
		return await spotGetTrackNoCORS(cliTok, spotTok, id);
	}
	let url = `${sessionStorage.IS_ELECTRON ? localStorage.mujayCloud || 'https://mujay.app' : ''}/internal/api/getTrack?id=${id}`;
	try {
		let res = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				cliTok: cliTok,
				tok: spotTok
			})
		});
		if (!res.ok) {
			document.location = `/internal/error#spotGetTrack(...),http|${res.status}|${encodeURIComponent(url)}`;
		}
		return res;
	} catch (e) {
		document.location = `/internal/error#spotGetTrack(...),panic|${btoa(`${e}`)}`;
	}
}

export async function spotGetPlaylist(cliTok: string, spotTok: string, id: string) {
	if (sessionStorage.IS_ELECTRON) {
		return await spotGetPlaylistNoCORS(cliTok, spotTok, id);
	}
	let url = `${sessionStorage.IS_ELECTRON ? localStorage.mujayCloud || 'https://mujay.app' : ''}/internal/api/getPlaylist?id=${id}`;
	try {
		let res = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				cliTok: cliTok,
				tok: spotTok
			})
		});
		if (!res.ok) {
			document.location = `/internal/error#spotGetPlaylist(...),http|${res.status}|${encodeURIComponent(url)}`;
		}
		return res;
	} catch (e) {
		document.location = `/internal/error#spotGetPlaylist(...),panic|${btoa(`${e}`)}`;
	}
}

export async function spotGetPlaylistNoCORS(
	cliTok: string,
	spotTok: string,
	id: string,
	offset: number = 0
) {
	return await fetch(
		`https://api-partner.spotify.com/pathfinder/v1/query?operationName=fetchPlaylist&variables=${encodeURIComponent(`{"uri":"spotify:playlist:${id}","offset":${offset},"limit":50}`)}&extensions=${encodeURIComponent(`{"persistedQuery":{"version":1,"sha256Hash":"19ff1327c29e99c208c86d7a9d8f1929cfdf3d3202a0ff4253c821f1901aa94d"}}`)}`,
		{
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
				Accept: 'application/json',
				'Accept-Language': 'en',
				'app-platform': 'WebPlayer',
				'spotify-app-version': '1.2.54.41.g1f5829c8',
				'content-type': 'application/json;charset=UTF-8',
				'client-token': cliTok,
				authorization: `Bearer ${spotTok}`,
				Priority: 'u=4',
				'x-cors-headers': JSON.stringify({
					'Sec-GPC': '1',
					'Sec-Fetch-Dest': 'empty',
					'Sec-Fetch-Mode': 'cors',
					'Sec-Fetch-Site': 'same-site',
					Priority: 'u=4'
				})
			},

			method: 'GET',
			mode: 'cors'
		}
	);
}

export async function spotGetTrackNoCORS(cliTok: string, spotTok: string, id: string) {
	return await fetch(
		`https://api-partner.spotify.com/pathfinder/v1/query?operationName=getTrack&variables=${encodeURIComponent(`{"uri":"spotify:track:${id}"}`)}&extensions=${encodeURIComponent(`{"persistedQuery":{"version":1,"sha256Hash":"5c5ec8c973a0ac2d5b38d7064056c45103c5a062ee12b62ce683ab397b5fbe7d"}}`)}`,
		{
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
				Accept: 'application/json',
				'Accept-Language': 'en',
				'app-platform': 'WebPlayer',
				'spotify-app-version': '1.2.54.41.g1f5829c8',
				'content-type': 'application/json;charset=UTF-8',
				'client-token': cliTok,
				authorization: `Bearer ${spotTok}`,
				Priority: 'u=4',
				'x-cors-headers': JSON.stringify({
					'Sec-GPC': '1',
					'Sec-Fetch-Dest': 'empty',
					'Sec-Fetch-Mode': 'cors',
					'Sec-Fetch-Site': 'same-site',
					Priority: 'u=4'
				})
			},

			method: 'GET',
			mode: 'cors'
		}
	);
}

export async function spotSearchSongsNoCORS(cliTok: string, spotTok: string, query: string) {
	return await fetch(
		`https://api-partner.spotify.com/pathfinder/v1/query?operationName=searchTracks&variables=${encodeURIComponent(`{"searchTerm":"${query}","offset":0,"limit":20,"numberOfTopResults":20,"includeAudiobooks":true,"includePreReleases":false}`)}&extensions=${encodeURIComponent(`{"persistedQuery":{"version":1,"sha256Hash":"220d098228a4eaf216b39e8c147865244959c4cc6fd82d394d88afda0b710929"}}`)}`,
		{
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
				Accept: 'application/json',
				'Accept-Language': 'en',
				'app-platform': 'WebPlayer',
				'spotify-app-version': '1.2.54.41.g1f5829c8',
				'content-type': 'application/json;charset=UTF-8',
				'client-token': cliTok,
				authorization: `Bearer ${spotTok}`,
				Priority: 'u=4',
				'x-cors-headers': JSON.stringify({
					'Sec-GPC': '1',
					'Sec-Fetch-Dest': 'empty',
					'Sec-Fetch-Mode': 'cors',
					'Sec-Fetch-Site': 'same-site',
					Priority: 'u=4'
				})
			},

			method: 'GET',
			mode: 'cors'
		}
	);
}

export async function parseSpotTrack(spotRes: Response): Promise<Song | undefined> {
	try {
		let song: Song = {
			name: '',
			cover: [],
			artist: '',
			album: '',
			id: '',
			length: 0
		};
		let dat = (await spotRes.json()).data.trackUnion;
		song.name = dat.name;
		song.id = dat.id;
		song.cover = dat.albumOfTrack.coverArt.sources;
		song.album = dat.albumOfTrack.name;
		song.length = dat.duration.totalMilliseconds;
		song.artist = dat.firstArtist.items[0].profile.name;
		return song;
	} catch (e) {
		document.location = `/internal/error#parseSpotTrack(...),panic|${btoa(`${e}`)}`;
	}
}

export async function parseSpotPlaylist(spotRes: Response): Promise<Playlist> {
	let playlist = {
		name: '',
		id: '',
		songs: [],
		temp: false
	};
	let dat = (await spotRes.json()).data.playlistV2;
	playlist.name = dat.name;
	playlist.id = 'fromSpotify-' + dat.uri.replace('spotify:playlist:', '');
	for (let i = 0; i < dat.content.items.length; i++) {
		let song = dat.content.items[i].itemV2.data;
		// @ts-expect-error
		playlist.songs.push({
			name: song.name,
			artist: song.artists.items[0].profile.name,
			album: song.albumOfTrack.name,
			cover: song.albumOfTrack.coverArt,
			id: song.uri.replace('spotify:track:', ''),
			length: song.trackDuration.totalMilliseconds
		});
	}
	return playlist;
}

export async function parseSpotSearch(spotRes: Response) {
	try {
		let songs = [];
		let dat = (await spotRes.json()).data.searchV2.tracksV2.items;
		for (let i = 0; i < dat.length; i++) {
			let sDat = dat[i].item.data;
			let artists = [];
			for (let g = 0; g < sDat.artists.items.length; g++) {
				artists.push(sDat.artists.items[g].profile.name);
			}
			songs.push({
				name: sDat.name,
				artists: artists,
				length: sDat.duration.totalMilliseconds || 1000,
				id: sDat.id,
				cover: sDat.albumOfTrack.coverArt.sources,
				album: sDat.albumOfTrack.name
			});
		}
		return songs;
	} catch (e) {
		document.location = `/internal/error#parseSpotSearch(...),panic|${btoa(`${e}`)}`;
	}
}

export async function spotSearch(query: string, cliTok: string, tok: string) {
	try {
		document.querySelector('.searchResults')?.classList.remove('hidden');
		let eles = document.querySelectorAll('.resultsArray .song-card:not(.placeholder)');
		for (let i = 0; i < eles.length; i++) {
			eles[i].remove();
		}
		// @ts-expect-error
		let searchRes = await parseSpotSearch(await spotSearchSongs(cliTok, tok, query));
		for (let i = 0; i < searchRes!.length; i++) {
			let song = searchRes![i];
			if (i == 0) {
				let card = document.querySelector('.top-result-card')!;
				card.querySelector('.song-title')!.innerHTML = song.name;
				card.querySelector('.song-data')!.innerHTML =
					`${song.artists.join(', ')} <span class="opacity-50">• ${song.album} • ${msStr(song.length)}</span>`;
				// @ts-expect-error
				card.querySelector('.play-url')!.href = `/listen?id=${song.id}`;
				// @ts-expect-error
				card.querySelector('.song-cover')!.src = song.cover[0].url || '/unknown.png';

				card.querySelector('.song-title-smol')!.innerHTML = song.name;
				card.querySelector('.song-data-smol')!.innerHTML =
					`${song.artists.join(', ')} <span class="opacity-50">• ${song.album} • ${msStr(song.length)}</span>`;
				// @ts-expect-error
				card.querySelector('.play-url-smol')!.href = `/listen?id=${song.id}`;
			} else {
				let placeholder = document.querySelector('.resultsArray .placeholder')!.cloneNode(true);
				// @ts-expect-error
				placeholder.querySelector('b')!.innerHTML = song.name;
				// @ts-expect-error
				placeholder.querySelector('img')!.src = song.cover[0].url || '/unknown.png';
				// @ts-expect-error
				placeholder.querySelector('.data-string')!.innerHTML = `by ${song.artists.join(', ')}`;
				// @ts-expect-error
				placeholder.querySelector('.play-url')!.href = `/listen?id=${song.id}`;
				// @ts-expect-error
				placeholder.classList.remove('placeholder');
				document.querySelector('.resultsArray')?.appendChild(placeholder);
			}
		}
	} catch (e) {
		document.location = `/internal/error#spotSearch(...),panic|${btoa(`${e}`)}`;
	}
}

export async function spotGetRecommendation(id: string, cliTok: string, tok: string) {
	if (!sessionStorage.IS_ELECTRON) {
		let url = `${sessionStorage.IS_ELECTRON ? localStorage.mujayCloud || 'https://mujay.app' : ''}/internal/api/radioFrom/${id}`;
		try {
			let res = await fetch(url, {
				method: 'POST',
				body: JSON.stringify({
					cliTok: cliTok,
					tok: tok
				})
			});
			if (!res.ok) {
				document.location = `/internal/error#spotGetTrack(...),http|${res.status}|${encodeURIComponent(url)}`;
			}
			return res;
		} catch (e) {
			document.location = `/internal/error#spotGetTrack(...),panic|${btoa(`${e}`)}`;
		}
	} else {
		let res = await fetch(
			`https://spclient.wg.spotify.com/inspiredby-mix/v2/seed_to_playlist/spotify:track:${id}?response-format=json`,
			{
				headers: {
					accept: 'application/json',
					'accept-language': 'en',
					'app-platform': 'WebPlayer',
					authorization: `Bearer ${tok}`,
					'client-token': `${cliTok}`,
					'spotify-app-version': '1.2.54.219.g19a93a5d'
				},
				body: null,
				method: 'GET'
			}
		);
		return (await res.json()).mediaItems[0].uri;
	}
}
