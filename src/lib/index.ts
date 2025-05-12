import { Filesystem, Directory } from "@capacitor/filesystem";

const { writeFile, checkPermissions, requestPermissions } = Filesystem;

function _arrayBufferToBase64( buffer:ArrayBufferLike ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return btoa( binary );
}

export type Song = {
	name: string;
	artist: string;
	length: number;
	cover: { url: string; width: number; height: number }[];
	album: string;
	id: string;
};
export type Playlist = {
	id: string;
	name: string;
	songs: Song[];
	temp: true | false | null | undefined;
};
export function msStr(ms: number) {
	const totalsec = Math.floor(ms / 1000);
	const minutes = Math.floor(totalsec / 60);
	const sec = totalsec % 60;
	return `${minutes}:${sec.toString().padStart(2, '0')}`;
}

export function dynFontSize(str: string) {
	const maxSize = localStorage.tvMode == 'true' ? 80 : 70;
	const minSize = localStorage.tvMode == 'true' ? 25 : 30;
	const maxLen = localStorage.tvMode == 'true' ? 35 : 25;

	let size = maxSize - (str.length / maxLen) * (maxSize - minSize);
	return Math.max(minSize, Math.min(maxSize, size));
}

export function isLiked(song: Song): boolean {
	let pl = JSON.parse(localStorage.playlists);
	let liked = pl[0];
	return liked.songs.includes(song);
}

export function likeSong(song: Song): Song[] {
	let pl = JSON.parse(localStorage.playlists);
	let liked = pl[0];
	let removed = false;
	for (let i = 0; i < liked.songs.length; i++) {
		if (song.id == liked.songs[i].id) {
			console.log('song is already liked, unliking');
			removed = true;
			liked.songs.splice(i, 1);
		}
	}
	if (!removed) {
		liked.songs.unshift(song);
	}
	pl[0] = liked;
	localStorage.playlists = JSON.stringify(pl);
	return liked.songs;
}

export function downloadSong(track: Song) {
	if (window.Capacitor && window.Capacitor.isNativePlatform()) {
		(async() => {
			let au = document.querySelector('audio') as HTMLAudioElement;
			let allowed = await checkPermissions();
			let res = await fetch(`${localStorage.libytm || "https://libytm.mujay.app"}/song/${track.id}/stream`);
			let blob = await res.blob();
			if (allowed.publicStorage != "granted") {
				let allowed = await requestPermissions();
				if (allowed.publicStorage != "granted") {
					alert("You must allow storage permissions to download songs");
					return;
				}
			}
			await writeFile({
				path: `Mujay/Downloads/Uncategorized/${track.artist} - ${track.name}.mp3`,
				data: _arrayBufferToBase64(await blob.arrayBuffer()),
				progress:false,
				directory: Directory.Documents,
				recursive: true
			});
			alert(`Downloaded \"${track.artist} - ${track.name}.mp3\" to /Documents/Mujay/Downloads`);
		})();
	} else {
	_downloadSongWeb(track); 
	}
}

async function _downloadSongWeb(track: Song) {
	let au = document.querySelector('audio') as HTMLAudioElement;
	let a = document.createElement('a');
	let res = await fetch(`${localStorage.libytm || "https://libytm.mujay.app"}/song/${track.id}/stream`);
	let blob = await res.blob();
	a.href = window.URL.createObjectURL(blob);
	a.download = `${track.artist} - ${track.name}.mp3`;
	a.target = '_blank';
	a.click();
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffle(array: any[]) {
	for (var i = array.length - 1; i >= 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

export function shufflePlaylist(playlist: Playlist, firstSong: Song | undefined = undefined) {
	let playlists = JSON.parse(localStorage.playlists);
	for (let i = 0; i < playlists.length; i++) {
		if (playlists[i].id == `${playlist.id}-shuffled`) {
			playlists.splice(i, 1);
		}
	}
	playlist.id = `${playlist.id}-shuffled`;
	playlist.name = 'Shuffled Playlist';
	playlist.temp = true;
	if (firstSong) {
		for (let i = 0; i < playlist.songs.length; i++) {
			if (playlist.songs[i].id == firstSong.id) {
				playlist.songs.splice(i, 1);
			}
		}
	}
	shuffle(playlist.songs);
	if (firstSong) {
		playlist.songs.unshift(firstSong);
	}
	playlists.push(playlist);
	localStorage.playlists = JSON.stringify(playlists);
}

export function createPlaylist(name: string, id: string): Playlist {
	let pl = JSON.parse(localStorage.playlists);
	let npl: Playlist = {
		name: name,
		id: id,
		temp: false,
		songs: []
	};
	pl.push(npl);
	localStorage.playlists = JSON.stringify(pl);
	return npl;
}
