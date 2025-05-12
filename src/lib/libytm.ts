import { msStr } from '$lib';
import type { Playlist, Song } from '$lib';
function timeout(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function ytSearch(query: string) {
	//try {
		document.querySelector('.searchResults')?.classList.remove('hidden');
		let eles = document.querySelectorAll('.resultsArray .song-card:not(.placeholder)');
		for (let i = 0; i < eles.length; i++) {
			eles[i].remove();
		}
		// @ts-expect-error
		let searchRes = await ytParseSearch(await ytSearchSongs(query));
		for (let i = 0; i < searchRes!.length; i++) {
			let song = searchRes![i];
			if (i == 0) {
				let card = document.querySelector('.top-result-card')!;
				card.querySelector('.song-title')!.innerHTML = song.name;
				card.querySelector('.song-data')!.innerHTML =
					`${song.artists.join(', ')} <span class="opacity-50">• ${song.album} • ${msStr(song.length * 1000)}</span>`;
				// @ts-expect-error
				card.querySelector('.play-url')!.href = `/listen?id=${song.id}`;
				// @ts-expect-error
				card.querySelector('.song-cover')!.src =
					`${localStorage.libytm || 'https://libytm.mujay.app'}/lh3Proxy/${encodeURIComponent(song.cover.url)}` ||
					'/unknown.png';

				card.querySelector('.song-title-smol')!.innerHTML = song.name;
				card.querySelector('.song-data-smol')!.innerHTML =
					`${song.artists.join(', ')} <span class="opacity-50">• ${song.album} • ${msStr(song.length * 1000)}</span>`;
				// @ts-expect-error
				card.querySelector('.play-url-smol')!.href = `/listen?id=${song.id}`;
			} else {
				let placeholder = document.querySelector('.resultsArray .placeholder')!.cloneNode(true);
				// @ts-expect-error
				placeholder.querySelector('a.title')!.innerHTML = song.name;
				// @ts-expect-error
				placeholder.querySelector('img')!.src =
					`${localStorage.libytm || 'https://libytm.mujay.app'}/lh3Proxy/${encodeURIComponent(song.cover.url)}` ||
					'/unknown.png';
				// @ts-expect-error
				placeholder.querySelector('.data-string')!.innerHTML = `by ${song.artists.join(', ')}`;
				// @ts-expect-error
				placeholder.querySelector('.play-url')!.href = `/listen?id=${song.id}`;
				// @ts-expect-error
				placeholder.classList.remove('placeholder');
				document.querySelector('.resultsArray')?.appendChild(placeholder);
			}
		}
	//} catch (e) {
	//	console.error(e)
	//	document.location = `/internal/error#ytSearch(...),panic|${btoa(`${e}`)}`;
	//}
}

export async function ytParseSearch(Res: Response) {
	try {
		let songs = [];
		let dat = await Res.json();
		for (let i = 0; i < dat.length; i++) {
			let sDat = dat[i];
			let artists = [];
			for (let g = 0; g < sDat.artists.length; g++) {
				artists.push(sDat.artists[g].name);
			}
			songs.push({
				name: sDat.title,
				artists: artists,
				length: sDat.duration_seconds,
				id: sDat.videoId,
				cover: sDat.thumbnails.slice(-1)[0] || '/unknown.png', // dont crash for now
				album: sDat.album.name
			});
		}
		return songs;
	} catch (e) {
		document.location = `/internal/error#ytParseSearch(...),panic|${btoa(`${e}`)}`;
	}
}

export async function ytSearchSongs(query: string) {
	let url = `${localStorage.libytm || 'https://libytm.mujay.app'}/search/${query}`;
	try {
		let res = await fetch(url);
		if (!res.ok) {
			document.location = `/internal/error#ytSearchSongs(...),http|${res.status}|${encodeURIComponent(url)}`;
		}
		return res;
	} catch (e) {
		document.location = `/internal/error#ytSearchSongs(...),panic|${btoa(`${e}`)}`;
	}
}

export async function ytGetTrack(id: string) {
	let url = `${localStorage.libytm || 'https://libytm.mujay.app'}/song/${id}`;
	let tries = 0; 
	let lastError: any = undefined;
		while (tries < 10) {
			try {
				let res = await fetch(url);
				if (!res.ok) {
					throw new Error(`http error ${res.status} when fetching ${url}`)
				}
				return res;
			} catch (e) {
				lastError = e;
				await timeout(1500);
				tries++;
			}
		}
		document.location = `/internal/error#ytGetTrack(...),panic|${btoa(`${lastError}`)}`;
}

export async function ytParseTrack(Res: Response): Promise<Song | undefined> {
	try {
		let song: Song = {
			name: '',
			cover: [],
			artist: '',
			album: '',
			id: '',
			length: 0
		};
		let dat = await Res.json();
		song.name = dat.title;
		song.id = dat.videoId;
		try {
			song.cover = dat.thumbnail.thumbnails.slice(-1)[0] || '/unknown.png'; // dont crash for now
		} catch {
			song.cover = { url: '/unknown.png', width: 320, height: 320 }; // this should not happen
		}
		song.album = '';
		song.length = dat.lengthSeconds;
		song.artist = dat.author;
		return song;
	} catch (e) {
		document.location = `/internal/error#ytParseTrack(...),panic|${btoa(`${e}`)}`;
	}
}

export async function ytParsePlaylist(Res: Response): Promise<Playlist> {
	let playlist = {
		name: '',
		id: '',
		songs: [],
		temp: false
	};
	let dat = await Res.json();
	playlist.name = dat.title;
	playlist.id = 'fromYTM-' + (dat.id || dat.playlistId);
	for (let i = 0; i < dat.tracks.length; i++) {
		let song = dat.tracks[i];
		// @ts-expect-error
		playlist.songs.push({
			name: song.title,
			id: song.videoId,
			cover: song.thumbnails
				? song.thumbnails.slice(-1)[0]
				: song.thumbnail.slice(-1)[0] || '/unknown.png', // dont crash for now
			album: '',
			length: song.lengthSeconds,
			artist: song.author
		});
	}
	return playlist;
}

export async function ytGetPlaylist(id: string) {
	let url = `${localStorage.libytm || 'https://libytm.mujay.app'}/playlist/${id}`;
	try {
		let res = await fetch(url);
		if (!res.ok) {
			document.location = `/internal/error#ytGetPlaylist(...),http|${res.status}|${encodeURIComponent(url)}`;
		}
		return res;
	} catch (e) {
		document.location = `/internal/error#ytGetPlaylist(...),panic|${btoa(`${e}`)}`;
	}
}

export async function lrcGetLyrics(id: string) {
	let url = `${localStorage.libytm || 'https://libytm.mujay.app'}/song/${id}/lyrics`;
	try {
		let res = await fetch(url);
		if (!res.ok) {
			return '';
		}
		return res;
	} catch (e) {
		return '';
	}
}

export async function ytGetLyrics(id: string) {
	let url = `${localStorage.libytm || 'https://libytm.mujay.app'}/song/${id}/ytmLyrics`;
	try {
		let res = await fetch(url);
		if (!res.ok) {
			return '';
		}
		return res;
	} catch (e) {
		return '';
	}
}

export async function ytGetRadio(id: string) {
	let url = `${localStorage.libytm || 'https://libytm.mujay.app'}/song/${id}/radio`;
	try {
		let res = await fetch(url);
		if (!res.ok) {
			document.location = `/internal/error#ytGetRadio(...),http|${res.status}|${encodeURIComponent(url)}`;
		}
		return res;
	} catch (e) {
		document.location = `/internal/error#ytGetRadio(...),panic|${btoa(`${e}`)}`;
	}
}
