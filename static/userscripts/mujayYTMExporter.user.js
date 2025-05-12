// ==UserScript==
// @name        Mujay Exporter
// @namespace   Violentmonkey Scripts
// @match       https://music.youtube.com/playlist*
// @grant       none
// @version     1.0
// @author      -
// @description 12/25/2024, 11:31:53 PM
// ==/UserScript==
function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function encode_utf8(s) {
	return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
	return decodeURIComponent(escape(s));
}

let injectedCSS = document.createElement('style');

// this has to be minified because google decided to make innerHTML untrustworthy
// (trusted html is so much bullshit just write good code) and innerText converts
// shit into html in a style tag
injectedCSS.textContent = `ytmusic-guide-section-renderer { width: fit-content !important;}`;

document.body.appendChild(injectedCSS);

async function mujayExport() {
	let songs = [];
	let songCount = Number(document.querySelector('.second-subtitle span').innerText.split(' ')[0]);
	console.log(`need ${songCount} songs, doing ${Math.ceil(songCount / 100) + 1} cycles`);
	for (let x = 0; x < Math.ceil(songCount / 100) + 1; x++) {
		console.log('doing cycle');
		let songEles = document.querySelectorAll(
			'.ytmusic-playlist-shelf-renderer ytmusic-responsive-list-item-renderer'
		);
		let loopEleCount = 0;
		for (let i = 0; i < songEles.length; i++) {
			let e = songEles[i];
			let title = e.querySelector('.title').innerText;
			let parts = e.querySelectorAll('.secondary-flex-columns yt-formatted-string');
			let artist = parts[0].innerText;
			let album = parts[1].innerText;
			let id = e.querySelector('.title a').href.split('=')[1].split('&')[0];
			let exists = false;
			for (let s = 0; s < songs.length; s++) {
				if (songs[s].id == id) {
					exists = true;
					break;
				}
			}
			if (!exists) {
				songs.push({ title, artist, album, id });
			}
		}
		console.log(
			`need ${songCount} songs, have ${songEles.length}, doing ${Math.ceil(songCount / 100) + 1} cycles (already done ${x + 1} of them)`
		);
		window.scrollTo(0, document.body.scrollHeight);
		loopEleCount = songEles.length;
		let r = 0;
		while (loopEleCount <= 100 * x) {
			console.log(`have ${loopEleCount}; expected ${100 * x}`);
			await timeout(500);
			r++;
			loopEleCount = document.querySelectorAll(
				'.ytmusic-playlist-shelf-renderer ytmusic-responsive-list-item-renderer'
			).length;
			window.scrollTo(0, document.body.scrollHeight);

			if (x == Math.ceil(songCount / 100) + 1 || r > 5) {
				console.log(
					`im gonna assume this playlist has ${loopEleCount} songs (might have missed ${songCount - loopEleCount})`
				);
				x = 2 ** 16;
				break;
			}
			r++;
		}
	}
	let nsongs = [];
	let format = prompt(
		"What format do you want the export to be in?\n\nmujay: Mujay format (recommended, choose this if you're importing to Mujay)\nplain: Artist - Song format\nplainflipped: Song - Artist format\nytids: Only show YouTube ids\nraw: As-is (default)"
	);
	console.log(format);
	switch (format) {
		case 'mujay':
			for (let y = 0; y < songs.length; y++) {
				nsongs.push([
					songs[y].title.trim().replaceAll('\n', ' '),
					songs[y].artist.trim().replaceAll('\n', ' '),
					songs[y].album.trim().replaceAll('\n', ' ')
				]);
			}
			nsongs = [JSON.stringify(nsongs)]; // mujay format is [[title,artist,data]]
			break;
		case 'plain':
			for (let y = 0; y < songs.length; y++) {
				nsongs.push(
					`${songs[y].artist.trim().replaceAll('\n', ' ')} - ${songs[y].title.trim().replaceAll('\n', ' ')}`
				);
			}
			break;
		case 'plainflipped':
			for (let y = 0; y < songs.length; y++) {
				nsongs.push(
					`${songs[y].title.trim().replaceAll('\n', '')} - ${songs[y].artist.trim().replaceAll('\n', '')}`
				);
			}
			break;
		case 'ytids':
			for (let y = 0; y < songs.length; y++) {
				nsongs.push(`${songs[y].id}`);
			}
			break;
		case 'raw' | null:
			nsongs = [JSON.stringify(songs)];
			break;
		default:
			nsongs = [JSON.stringify(songs)];
			break;
	}
	let txt = `
    <html>
    <head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>YTM Playlist Export</title>
        <style>* {color-scheme: light dark;}</style>
	</head>
    <body style="margin:0;">
    <p style="background:#3f3f3f;color:white;padding:8px;font-family:system-ui,sans-serif;margin:0;">This is your export's contents, click to copy.</p>
    <pre style="font-size:small;font-family:monospace;padding:16px;" onclick="copyText(this)">${nsongs.join('\n')}</pre>
    <script>function copyText(ele) {navigator.clipboard.writeText(ele.innerText);alert("copied!");}</script>
    </body>
    </html>
    `;
	let b = new Blob([txt], {
		type: 'text/html'
	});
	alert(
		"A new tab with the exported data will open when you click OK, copy the contents (CTRL+A then CTRL+C) and paste it (CTRL+V) where you like. If a tab doesn't open, enable popups."
	);
	let e = document.querySelector('.mujay-ytm-export-btn');
	e.style.backgroundColor = 'rgba(32,32,64,0.33)';
	e.innerText = 'Export';
	e.disabled = '';
	window.open(URL.createObjectURL(b));
}

let btn = document.createElement('button');
btn.classList.add('mujay-ytm-export-btn');
btn.onmouseenter = (e) => {
	if (e.target.disabled == 'false') {
		e.target.style.backgroundColor = 'rgba(64,64,128,0.6)';
	}
};
btn.onmouseleave = (e) => {
	if (e.target.disabled == 'false') {
		e.target.style.backgroundColor = 'rgba(32,32,64,0.33)';
	}
};
btn.onclick = (e) => {
	e.target.innerText = 'Exporting...';
	e.target.style.backgroundColor = 'rgba(32,32,64,1)';
	if (!e.target.disabled || e.target.disabled == 'false') {
		mujayExport();
		e.target.disabled = 'true';
	}
};
btn.style.position = 'fixed';
btn.style.bottom = '3%';
btn.style.left = '10px';
btn.style.zIndex = '99999999';
btn.innerText = `Export`;
btn.style.transition = 'all 0.2s';
btn.style.backgroundColor = 'rgba(32,32,64,0.33)';
btn.style.color = 'white';
btn.style.borderRadius = '6px';
btn.style.border = 'none';
btn.style.padding = '11px';
document.body.append(btn);
