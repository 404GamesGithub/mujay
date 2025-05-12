<script lang="ts">
import { CapacitorMusicControls } from "capacitor-music-controls-plugin";
	import Hls from 'hls.js';
	import {
		downloadSong,
		dynFontSize,
		isLiked,
		likeSong,
		msStr,
		shufflePlaylist,
		type Playlist,
		type Song
	} from '$lib';
	import { shareSong } from '$lib/share';
	import { Button, LinearProgressIndeterminate, Slider } from 'm3-svelte';
	import Icon from '@iconify/svelte';
	import { onMount, onDestroy } from 'svelte';
	import { initRPC, updateState } from '$lib/discord-rpc';
	let started = Date.now();
	let currentTime = 0;
	let duration = 1;
	let fDur = msStr(duration * 1000).toString();
	let fTime = msStr(currentTime * 1000).toString();
	let paused = true;
	let liked = false;
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		ytGetTrack,
		ytParseTrack,
		ytParsePlaylist,
		ytGetPlaylist,
		ytGetRadio
	} from '$lib/libytm';
	let mediaMeta;
	let track: Song = {
		name: '',
		cover: [],
		artist: '',
		album: '',
		id: '',
		length: 0
	};
	let upNext: Song | undefined = undefined;
	let updIv = 0;
	let updRpcIv = 0;
	let plList: any = undefined;
	let alreadyTriedFallback = false;
	let iStarted = false;
	let sp = new URL(document.location.toString()).searchParams;
	let buddyHolly = false;
	let schlattGotPissedOff = false;
	let hls: Hls | null = null;
	let lyricsHighlightInterval: ReturnType<typeof setInterval> | undefined;

	async function handleAndroidInteraction(info: any) {
		const message = info.message;

console.log("message: " + message)
try {
switch(message) {
	case 'music-controls-next':
		skipSong()
		break;
	case 'music-controls-previous':
		prevSong()
		break;
	case 'music-controls-pause':
		document.querySelector('audio')!.pause()
		break;
	case 'music-controls-play':
		document.querySelector('audio')!.play()
		break;
	case 'music-controls-destroy':
		document.querySelector('audio')!.pause()
		break;

	case 'music-controls-media-button' :
		break;
	case 'music-controls-headset-unplugged':
		document.querySelector('audio')!.pause()
		break;
	case 'music-controls-headset-plugged':
		document.querySelector('audio')!.play()
		break;
	default:
		break;
}
} catch (e) {
	alert(e)
	}	
}

	async function listenMount() {
		// damn you svelte
		let needToDelete = document.querySelectorAll(".plzdeletethx")
		needToDelete.forEach(e => e.remove())
		sp = new URL(document.location.toString()).searchParams;
		initRPC();
		if (track.length == 0 || track.name == '') {
		// @ts-expect-error
		track = await ytParseTrack(await ytGetTrack(sp.get('id') ?? ''));
		}

		const audio = document.querySelector('audio');
		if (audio && Hls.isSupported()) {
			hls = new Hls();
			hls.loadSource(`${localStorage.libytm || 'https://libytm.mujay.app'}/song/${sp.get('id') ?? ''}/streamHLS.m3u8`);
			hls.attachMedia(audio);
			hls.on(Hls.Events.MANIFEST_PARSED, function() {
				audio.play();
			});
		} else if (audio) {
			// fallback for browsers that do not support hls.js
			audio.src = `${localStorage.libytm || 'https://libytm.mujay.app'}/song/${sp.get('id') ?? ''}/stream`;
			audio.addEventListener('loadedmetadata', function() {
				audio.play();
			});
		}

		// weezer easter egg

		if (["My Name Is Jonas","No One Else","The World Has Turned and Left Me Here","Buddy Holly","Undone – The Sweater Song","Undone - The Sweater Song","Surf Wax America","Say It Ain't So","In the Garage","Holiday","Only in Dreams"].includes(track.name) && track.artist == "Weezer" /* make sure weezer songs turn this on not some stupid miku cover */) {
			window.parent.document.body.setAttribute('theme','weezer');
			buddyHolly = true
		}

		if (localStorage.onlySchlattRiff == "true" && track.name == "Buddy Holly") {
			schlattGotPissedOff = false
			if (document.querySelector("audio")!.currentTime *1000 < 129319 && schlattGotPissedOff == false) {document.querySelector("audio")!.currentTime = 129.319}
			if (document.querySelector("audio")!.currentTime *1000 > 131032) {document.querySelector("audio")!.currentTime = 0; schlattGotPissedOff = true; setTimeout(()=>{skipSong();},10); /* make sure we dont accidentally skip to the riff when it's nonexistent */}
		} else {document.querySelector("audio")!.currentTime = 0; // fix
		}

		liked = isLiked(track);
		duration = track.length;
		document.querySelector('.name')!.innerHTML = track.name;
		let size = dynFontSize((document.querySelector('h1.name') as HTMLHeadingElement)!.innerText);
		(document.querySelector('h1.name') as HTMLHeadingElement)!.style.fontSize = `${size}px`;
		document.querySelector('.artist-data')!.innerHTML = `by ${track.artist}`;
		if (window.Capacitor && window.Capacitor.isNativePlatform() && window.Capacitor.isNativePlatform()) {
			try {
			await CapacitorMusicControls.create({
  track: track.name, // optional, default : ''
  artist: track.artist, // optional, default : ''
  album: '', // optional, default: ''
   cover: track.cover.url || "",
  isPlaying: true, // default : true
  dismissable: false, // default : false
  // text displayed in the status bar when the notification (and the ticker) are updated
  ticker: 'Playing song on Mujay',
  hasPrev:true,
  hasNext:true,
  hasClose: false,
	duration: duration, // default: 0
  elapsed: 0, // default: 0
  hasSkipForward: true, // default: false. true value overrides hasNext.
  hasSkipBackward: true, // default: false. true value overrides hasPrev.
  skipForwardInterval: 15, // default: 15.
  skipBackwardInterval: 15, // default: 15.
  hasScrubbing: true, // default: false. Enable scrubbing from control center progress bar
  // All icons default to their built-in android equivalents
  // The supplied drawable name, e.g. 'media_play', is the name of a drawable found under android/res/drawable* folders
  playIcon: "media_play",
  pauseIcon: "media_pause",
  prevIcon: "media_prev",
  nextIcon: "media_next",
  closeIcon: "media_close",
  notificationIcon: "notification",
})
document.addEventListener("controlsNotification", (event) => {
  console.log("controlsNotification was fired");
  console.log(event);
  const info = { message: event.message, position: 0 };
  handleAndroidInteraction(info);
});
			} catch  (e) {alert(e)}
		}
		 else if ('mediaSession' in navigator && 'MediaMetadata' in window) {
			mediaMeta = new MediaMetadata({
				title: track.name,
				artist: track.artist,
				album: track.album,
				artwork: [
					{
						src: track.cover.url,
						sizes: '300x300',
						type: 'image/png'
					}
				]
			});

			navigator.mediaSession.setActionHandler('play', () => {
				document.querySelector('audio')!.play();
				navigator.mediaSession.playbackState = 'playing';
			});
			navigator.mediaSession.setActionHandler('pause', () => {
				document.querySelector('audio')!.pause();
				navigator.mediaSession.playbackState = 'paused';
			});
			navigator.mediaSession.setActionHandler('previoustrack', () => {
				prevSong();
			});
			navigator.mediaSession.setActionHandler('nexttrack', () => {
				skipSong();
			});
			navigator.mediaSession.setActionHandler('seekto', (e) => {
				currentTime = e.seekTime ?? 0;
				navigator.mediaSession.setPositionState({
					duration: duration,
					playbackRate: 1,
					position: currentTime
				});
			});
			navigator.mediaSession.setActionHandler('seekforward', (e) => {
				currentTime = currentTime + (e.seekOffset || 1);
				navigator.mediaSession.setPositionState({
					duration: duration,
					playbackRate: 1,
					position: currentTime
				});
			});
			navigator.mediaSession.setActionHandler('seekbackward', (e) => {
				currentTime = currentTime - (e.seekOffset || 1);
				navigator.mediaSession.setPositionState({
					duration: duration,
					playbackRate: 1,
					position: currentTime
				});
			});
			navigator.mediaSession.metadata = mediaMeta;
		}
		setTimeout(async () => {
			const lyricsContainer = document.querySelector('.lyrics-container') as HTMLDivElement;
			let ytmUrl = `${localStorage.libytm || 'https://libytm.mujay.app'}/song/${sp.get('id')}/ytmLyrics`;
			try {
				const ytmLyricsResponse = await fetch(ytmUrl, { method: 'GET' });
				const ytmLyricsData = await ytmLyricsResponse.json();
				if (ytmLyricsData.hasTimestamps && ytmLyricsData.lyrics && ytmLyricsData.lyrics.length > 0) {
					const syncedLyrics = ytmLyricsData.lyrics;
					lyricsContainer.innerHTML = '';
					syncedLyrics.forEach((line: { start_time: number, text: string }) => {
						const lyricLine = document.createElement('div');
						lyricLine.classList.add('lyric-line');
						lyricLine.setAttribute('data-time', line.start_time.toString());
						lyricLine.innerText = line.text || '♪';
						lyricsContainer.appendChild(lyricLine);
					});

					if (lyricsHighlightInterval) clearInterval(lyricsHighlightInterval);
					const audioElement = document.querySelector('audio') as HTMLAudioElement;
					audioElement.addEventListener('timeupdate', () => {
						const currentTimeMs = audioElement.currentTime * 1000;

						const lyricLines = document.querySelectorAll('.lyric-line');
						let activeIndex = -1;

						for (let i = 0; i < lyricLines.length; i++) {
							const lineTime = parseInt(lyricLines[i].getAttribute('data-time') || '0');
							const nextLineTime = i < lyricLines.length - 1
								? parseInt(lyricLines[i + 1].getAttribute('data-time') || '0')
								: Infinity;

							if (currentTimeMs >= lineTime && currentTimeMs < nextLineTime) {
								activeIndex = i;
								break;
							}
						}

						lyricLines.forEach((line, index) => {
							if (index === activeIndex) {
								line.classList.add('active');
								const activeLine = lyricLines[activeIndex] as HTMLElement;
								const containerHeight = lyricsContainer.clientHeight;
								const lineTop = activeLine.offsetTop + (localStorage.tvMode == "true" ? -100 : 0);
								const lineHeight = activeLine.clientHeight;

								lyricsContainer.scrollTop = lineTop - (containerHeight / 2) + (lineHeight / 2);
							} else {
								line.classList.remove('active');
							}
						});
					});
					return;
				}
			} catch (error) {
				console.log('Error fetching YTM lyrics, falling back to static lyrics', error);
			}
			try {
				let lrcUrl = `${localStorage.libytm || 'https://libytm.mujay.app'}/song/${sp.get('id')}/lyrics`;
				const lyricsResponse = await fetch(lrcUrl, { method: 'GET' });
				const lyricsData = await lyricsResponse.json();

				// Display static lyrics
				lyricsContainer.innerHTML = `<div class="static-lyrics">${lyricsData.plainLyrics || 'No lyrics'}</div>`;
			} catch (error) {
				console.log('Error fetching static lyrics', error);
				lyricsContainer.innerHTML = '<div class="static-lyrics">No lyrics available</div>';
			}
		}, 100);
		// @ts-expect-error
		updIv = setInterval(async () => {
			let e = (document.querySelector('audio') as HTMLAudioElement)!;
			// @ts-ignore
			document.querySelector("input[type='range']")!.parentElement!.attributes[
				'style'
			].textContent = `--percent: ${(e.currentTime / track.length) * 100}%`;
			fDur = msStr(duration * 1000);
			fTime = msStr(currentTime * 1000);
			// @ts-ignore
			document.querySelector('.duration')!.innerText = fDur;
			// @ts-ignore
			document.querySelector('.currentTime')!.innerText = fTime + ` ${localStorage.preciseTime == "true" ? `(${Math.floor(currentTime*1000)}ms)` : ""}`;
			if ('mediaSession' in navigator && 'MediaMetadata' in window) {
				navigator.mediaSession.setPositionState({
					duration: duration,
					playbackRate: 1,
					position: currentTime
				});
			}
			else if (window.Capacitor && window.Capacitor.isNativePlatform() && window.Capacitor.isNativePlatform()) {
				CapacitorMusicControls.updateIsPlaying({
  					isPlaying: !paused,
				});
			}
		}, localStorage.preciseTime == "true" ? 1 : 500);

		if (sp.get('plId')) {
			let plIdx = -1;
			let plId = sp.get('plId');
			if (plId!.endsWith('-shuffled')) {
				// @ts-expect-error
				document.querySelector('.shuf').classList.add('!ring-2');
				// @ts-expect-error
				document.querySelector('.shuf').classList.add('!ring-primary');
				// @ts-expect-error
				document.querySelector('.shuf').classList.add('!bg-primary/50');
			}
			let pl = JSON.parse(localStorage.playlists);
			let playlist = { id: '', name: '', songs: [] };
			for (let i = 0; i < pl.length; i++) {
				if (pl[i].id == sp.get('plId')) {
					playlist = pl[i];
					plList = playlist;
				}
			}
			if (playlist.id != '') {
				for (let i = 0; i < playlist.songs.length; i++) {
					console.log(playlist.songs[i]);
					// @ts-ignore
					if (playlist.songs[i].id == track.id) {
						plIdx = i;
					}
				} // if plIdx is still negative then the provided id is not in the playlist, so just ignore
				if (plIdx != -1) {
					console.log(plIdx);
					if (plIdx + 1 != playlist.songs.length) {
						// @ts-expect-error
						console.log(`up next: ${playlist.songs[plIdx + 1].name}`);
						upNext = playlist.songs[plIdx + 1];
					} // no song up next so just do nothing when its over
					else {
						console.log('nothing up next');
						if (playlist.temp == true) {
							for (let i = 0; i < pl.length; i++) {
								if (pl[i].id == playlist.id) {
									pl.splice(i, 1);
									break;
								}
							}
							localStorage.playlists = JSON.stringify(pl);
						}
					}
				} else {
					console.log('provided id is not in the playlist');
				}
			} else {
				// if this is blank then the user didnt give us a proper plId, so just ignore it.
				console.log('bad plid');
			}
		} else {
			if ((localStorage.recommendations || 'true') == 'true') {
				let pl = JSON.parse(localStorage.playlists);
				let recPl: Playlist | undefined;
				recPl = await ytParsePlaylist(
					// @ts-expect-error
					await ytGetRadio(track.id)
				);
				recPl.id = `${recPl.id}-recommend`;
				recPl.temp = true;
				pl.push(recPl);
				localStorage.playlists = JSON.stringify(pl);
				goto(`/listen?id=${track.id}&plId=${recPl.id}`);
				setTimeout(() => {
					clearInterval(updIv);
					listenMount();
				}, 100);
			}
		}
		// @ts-ignore
		document.querySelector('img.c')!.src =
			`${localStorage.libytm || 'https://libytm.mujay.app'}/lh3Proxy/${encodeURIComponent(track.cover.url)}`;
		document.querySelector('img.cv2')!.src =
			`${localStorage.libytm || 'https://libytm.mujay.app'}/lh3Proxy/${encodeURIComponent(track.cover.url)}`;
		//if (sessionStorage.IS_ELECTRON) {
		//    let mp = await fetch(`${localStorage.libytm || "https://libytm.mujay.app"}track/${sp.get("id") ?? ""}`, { method: "GET" });
		//    let b = await mp.blob();
		//    let u = URL.createObjectURL(b);
		//    document.querySelector("audio")!.src = u;
		// }

		if (localStorage.fnfMode == "true") {
			const audioContext = new AudioContext();
			const analyser = audioContext.createAnalyser();
			const source = audioContext.createMediaElementSource(document.querySelector("audio")!);
			analyser.fftSize = localStorage.tvMode == "true" ? 64 : 32;
			source.connect(analyser);
			analyser.connect(audioContext.destination);

			const bufferLength = analyser.frequencyBinCount;
			const dataArray = new Uint8Array(bufferLength);
			function step() {
				try {
			    analyser.getByteFrequencyData(dataArray);
			    let sum = 0;
			    for (let i = 0; i < bufferLength; i++) {
			        sum += dataArray[i];
			    }
			    let avg = sum / bufferLength;
			    requestAnimationFrame(step);
				let base = localStorage.tvMode == "true" ? 0.95 : 1
				let scale = base + ((avg-145))/100;
				if (scale == 0 || scale < 0.01) {scale = 1;}
				document.querySelector("img.c").style.transform = `scale(${scale})`;
				if ((localStorage.ambientMode || "false") == "false") {
					document.querySelector("img.cv2").style.transform = `scale(${scale})`;
				}
			} catch {
				// if anything wrong happened here, assume we're not on the listen page; which is the most likely cause
				return
			}
			}

			step();
		}
	}
	onDestroy(() => {
		clearInterval(updIv);
		track.length = 0;
		if (lyricsHighlightInterval) clearInterval(lyricsHighlightInterval);
		if (hls) {
			hls.destroy();
		}

		/* make sure theme does not persist */
		if (buddyHolly) {window.parent.document.body.setAttribute('theme',localStorage.theme || "default");}

		console.log(plList);
		if (plList) {
			let pl = JSON.parse(localStorage.playlists);
			if (plList.temp == true) {
				for (let i = 0; i < pl.length; i++) {
					if (pl[i].id == plList.id) {
						pl.splice(i, 1);
						break;
					}
				}
				localStorage.playlists = JSON.stringify(pl);
			}
		}
	});
	onMount(listenMount);
	function skipSong() {
		track.length = 0;
		/* make sure theme does not persist */
		if (localStorage.onlySchlattRiff == "true") {document.querySelector("audio")!.currentTime = 0.1;}
		if (buddyHolly) {window.parent.document.body.setAttribute('theme',localStorage.theme || "default");}

		let plId = sp.get('plId');
		if (upNext && plId) {
			goto(`/listen?id=${upNext!.id}&plId=${plId}`);
			setTimeout(() => {
				clearInterval(updIv);

				listenMount();
			}, 50); // small delay to make sure url has changed
		}
	}
	function prevSong() {
		track.length = 0;
		/* make sure theme does not persist */
		if (localStorage.onlySchlattRiff == "true") {document.querySelector("audio")!.currentTime = 0.1;}
		if (buddyHolly) {window.parent.document.body.setAttribute('theme',localStorage.theme || "default")}

		let plId = sp.get('plId');
		let id = sp.get('id');
		let prevSong: Song | undefined;
		let playlist = plList;
		let plIdx = -1;
		if (plId && playlist) {
			for (let i = 0; i < playlist.songs.length; i++) {
				// @ts-ignore
				if (playlist.songs[i].id == track.id) {
					plIdx = i;
				}
			}
			if (plIdx != 0) {
				prevSong = playlist.songs[plIdx - 1];
				goto(`/listen?id=${prevSong!.id}&plId=${plId}`);
				setTimeout(() => {
					clearInterval(updIv);
					listenMount();
				}, 100);
			}
		}
	}</script>



<div class="hidden !ring-2 !ring-primary !bg-primary/50"></div>
<audio
	class="fixed top-0 left-0"
	on:loadeddata={() => {
		document.querySelector('.loadingDiv')!.remove();
		document.querySelector('.duration')!.innerText = msStr(track.length * 1000);
		// @ts-ignore
		document.querySelector('.currentTime')!.innerText = fTime;
		schlattGotPissedOff = false;
	}}
	volume={1}
	autoplay={true}
	bind:paused
	on:error={async () => {
		if (sessionStorage.IS_ELECTRON) {
			if (
				document.querySelector('audio')!.error!.message.includes('Empty src attribute') ||
				document.querySelector('audio')!.error!.message == ''
			) {
				return;
			}
		}

		// @ts-expect-error
		document.location = `/internal/error#${encodeURIComponent('to play audio')},generic|${btoa(document.querySelector('audio').error.message ?? 'unknown error')}`;
	}}
	bind:currentTime
	on:timeupdate={()=>{
		if (localStorage.onlySchlattRiff == "true" && track.name == "Buddy Holly") {
			if (document.querySelector("audio")!.currentTime *1000 < 129319 && schlattGotPissedOff == false) {document.querySelector("audio")!.currentTime = 129.319}
			if (document.querySelector("audio")!.currentTime *1000 > 131032) {document.querySelector("audio")!.currentTime = 0; schlattGotPissedOff = true; setTimeout(()=>{skipSong();},10); /* make sure we dont accidentally skip to the riff when it's nonexistent */}
		}
	}}
	on:ended={skipSong}
	on:play={() => {
		if (window.Capacitor && window.Capacitor.isNativePlatform()) {
			CapacitorMusicControls.updateIsPlaying({
        			isPlaying: true
    			});
		}
		updateState('playing', track, plList, Math.floor(currentTime * 1000), started);
	}}
	on:pause={() => {
		if (window.Capacitor && window.Capacitor.isNativePlatform()) {
			CapacitorMusicControls.updateIsPlaying({
        			isPlaying: false
    			});
		}
		updateState('paused', track, plList, Math.floor(currentTime * 1000), started);
	}}
	crossorigin="anonymous"
>
</audio>
<div class="w-full h-[96.1vh] flex flex-col justify-center items-center z-[3] relative">
	{#if localStorage.ambientMode == 'true'}
		<img
			src="/unknown.png"
			class="!max-w-screen !h-[100%] !w-screen !max-h-screen cv2 z-[0] blur-[50px] opacity-20 !absolute top-0"
			draggable="false"
			style="user-select: none"
			alt="Cover"
		/>
	{/if}

	<div
		class="flex {localStorage.tvMode == "true" ? "flex-row gap-[128px] w-full" : "flex-col"} justify-center items-center p-8 {localStorage.tvMode == "true" ? "" : "bg-background/70 rounded-xl backdrop-blur"}"
	>
	
		<div class="mb-5 relative">
			{#if localStorage.ambientMode != 'true'}
				<img
					src="/unknown.png"
					class="{localStorage.tvMode == "true" ? "w-[500px] h-[500px]" : "w-[300px] h-[300px]"}   rounded absolute z-[1] c"
					width="350"
					height="350"
					style="user-select: none"
					alt="Cover"
				/>
				<img
					src="/unknown.png"
					class="{localStorage.tvMode == "true" ? "w-[500px] h-[500px]" : "w-[300px] h-[300px]"} cv2 blur-[120px] scale-[1] z-[-5]"
					style="user-select: none"
					width="350"
					height="350"
					alt="Cover"
				/>
			{:else}
				<img
					src="/unknown.png"
					class="{localStorage.tvMode == "true" ? "w-[500px] h-[500px]" : "w-[300px] h-[300px]"} rounded z-[1] c"
					width="350"
					height="350"
					style="user-select: none"
					alt="Cover"
				/>
			{/if}
		</div>
		<div class="flex flex-col">
			<!-- svelte-ignore a11y_missing_content -->
			<h1 class="{localStorage.tvMode == "true" ? "text-[55px]" : "text-[20px]"} duration-300 font-bold name z-10"></h1>
			<!-- svelte-ignore a11y_missing_content -->
			<h2 class="{localStorage.tvMode == "true" ? "text-[35px]" : "text-4xl"} opacity-50 artist-data z-10"></h2>
		<br>
		{#if localStorage.tvMode == "true"}
			<div class="lyrics-container text-2xl max-h-[45vh]  overflow-y-auto p-4 overflow-x-none"></div>
			<style>
				.lyric-line.active {font-size: 34px !important;}
			</style>
		{/if}
		<br />
	<div class="{localStorage.tvMode == "true" ? "plzdeletethx" : ""}">
		<div class="flex flex-col w-full justify-center items-center">
			<div class="flex flex-col {localStorage.tvMode == "true" ? "w-[720px]" : ""}">
			<div class="controls-slider w-full max-w-[720px] flex relative gap-4 mb-4 mt-4">
				<div
					class="w-[120%] h-[150%] z-[1000] absolute bottom-0 left-[-10%] bg-background grid place-items-center loadingDiv"
				>
					<LinearProgressIndeterminate
						extraOptions={{ class: 'm3-container !h-[0.6rem] !w-[75%]' }}
					/>
				</div>
				<span
					class="currentTime absolute left-0 bottom-12"
					style="font-family: 'MonaspaceKrypton', monospace">{fTime} {localStorage.preciseTime == "true" ? `(${currentTime}ms)` : ""}</span
				>
				<span
					class="duration absolute right-0 bottom-12"
					style="font-family: 'MonaspaceKrypton', monospace">{fDur} {localStorage.preciseTime == "true" ? `(${duration}ms)` : ""}</span
				>
				<Slider
					showValue={false}
					step={1}
					disabled={false}
					max={track.length}
					bind:value={currentTime}
					extraWrapperOptions={{ class: 'm3-container min-w-[100px] w-full' }}
				/>
			</div>
			<div class="controls max-w-[720px] flex flex-row gap-6 justify-center items-center">
				<Button
					type="tonal"
					extraOptions={{
						class: `m3-container m3-font-label-large tonal icon-none !px-[1rem] ${localStorage.tvMode == "true" ? '!h-[4rem]' : '!h-[3rem]'} shuf`
					}}
					on:click={() => {
						if (sp.get('plId')!.endsWith('-shuffled')) {
							// @ts-expect-error
							document.querySelector('.shuf').classList.remove('!ring-2');
							// @ts-expect-error
							document.querySelector('.shuf').classList.remove('!ring-primary');
							// @ts-expect-error
							document.querySelector('.shuf').classList.remove('!bg-primary/50');
							goto(`/listen?id=${sp.get('id')}&plId=${sp.get('plId')!.replace('-shuffled', '')}`);
							setTimeout(() => {
								clearInterval(updIv);
								listenMount();
							}, 100);
						} else {
							// @ts-expect-error
							document.querySelector('.shuf').classList.add('!ring-2');
							// @ts-expect-error
							document.querySelector('.shuf').classList.add('!ring-primary');
							// @ts-expect-error
							document.querySelector('.shuf').classList.add('!bg-primary/50');
							shufflePlaylist(plList, track);
							goto(`/listen?id=${sp.get('id')}&plId=${sp.get('plId')!}-shuffled`);
							setTimeout(() => {
								clearInterval(updIv);
								listenMount();
							}, 100);
						}
					}}
				>
					<Icon icon="mdi:shuffle" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
				</Button>
				<Button
					type="filled"
					on:click={prevSong}
					extraOptions={{
						class: `m3-container m3-font-label-large filled icon-none !px-[1rem] ${localStorage.tvMode == "true" ? '!h-[4rem]' : '!h-[3rem]'}`
					}}
				>
					<Icon icon="mdi:skip-previous" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
				</Button>
				<Button
					on:click={() => {
						let p = document.querySelector('audio');
						// @ts-expect-error
						if (p.paused) {
							p.play();
						} else {
							p.pause();
						}
					}}
					type="filled"
					extraOptions={{
						class: `m3-container m3-font-label-large filled icon-none !px-[1rem] ${localStorage.tvMode == "true" ? '!h-[4rem]' : '!h-[3rem]'}`
					}}
				>
				{#if paused == false}
				<Icon icon="mdi:pause" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
			{/if}
			{#if paused == true}
				<Icon icon="mdi:play" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
			{/if}
				</Button>
				<Button
					type="filled"
					on:click={skipSong}
					extraOptions={{
						class: `m3-container m3-font-label-large filled icon-none !px-[1rem] ${localStorage.tvMode == "true" ? '!h-[4rem]' : '!h-[3rem]'}`
					}}
				>
					<Icon icon="mdi:skip-next" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
				</Button>
	
				<Button
					type="tonal"
					extraOptions={{
						class: `m3-container m3-font-label-large tonal icon-none !px-[1rem] ${localStorage.tvMode == "true" ? '!h-[4rem]' : '!h-[3rem]'} !ring-primary !ring-0 rep`
					}}
					on:click={() => {
						// @ts-expect-error
						let loop = document.querySelector('audio').loop;
						// @ts-expect-error
						document.querySelector('audio').loop = !loop;
						// @ts-expect-error
						document.querySelector('.rep').classList.toggle('!ring-2');
						// @ts-expect-error
						document.querySelector('.rep').classList.toggle('!ring-0');
						// @ts-expect-error
						document.querySelector('.rep').classList.toggle('!bg-primary/50');
					}}
				>
					<Icon icon="mdi:repeat" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
				</Button>
			</div>
			<div
				class="controls-extended max-w-[500px] flex flex-row gap-[7.3rem] mt-2 justify-center items-center"
			>
				<Button
					type="tonal"
					extraOptions={{
						class: 'm3-container m3-font-label-large tonal icon-none !px-[1rem] !h-[3rem] shufSmol'
					}}
					on:click={() => {
						if (sp.get('plId')!.endsWith('-shuffled')) {
							// @ts-expect-error
							document.querySelector('.shufSmol').classList.remove('!ring-2');
							// @ts-expect-error
							document.querySelector('.shufSmol').classList.remove('!ring-primary');
							// @ts-expect-error
							document.querySelector('.shufSmol').classList.remove('!bg-primary/50');
							goto(`/listen?id=${sp.get('id')}&plId=${sp.get('plId')!.replace('-shuffled', '')}`);
							setTimeout(() => {
								clearInterval(updIv);
								listenMount();
							}, 100);
						} else {
							// @ts-expect-error
							document.querySelector('.shufSmol').classList.add('!ring-2');
							// @ts-expect-error
							document.querySelector('.shufSmol').classList.add('!ring-primary');
							// @ts-expect-error
							document.querySelector('.shufSmol').classList.add('!bg-primary/50');
							shufflePlaylist(plList, track);
							goto(`/listen?id=${sp.get('id')}&plId=${sp.get('plId')!}-shuffled`);
							setTimeout(() => {
								clearInterval(updIv);
								listenMount();
							}, 100);
						}
					}}
				>
					<Icon icon="mdi:shuffle" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
				</Button>
				<Button
					type="tonal"
					extraOptions={{
						class:
							'm3-container m3-font-label-large tonal icon-none !px-[1rem] !h-[3rem] !ring-primary !ring-0 repSmol'
					}}
					on:click={() => {
						// @ts-expect-error
						let loop = document.querySelector('audio').loop;
						// @ts-expect-error
						document.querySelector('audio').loop = !loop;
						// @ts-expect-error
						document.querySelector('.repSmol').classList.toggle('!ring-2');
						// @ts-expect-error
						document.querySelector('.repSmol').classList.toggle('!ring-0');
						// @ts-expect-error
						document.querySelector('.repSmol').classList.toggle('!bg-primary/50');
					}}
				>
					<Icon icon="mdi:repeat" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
				</Button>
			</div>
		</div>
		</div>
		</div>
	<div class="{localStorage.tvMode != "true" ? "plzdeletethx" : ""}">
	<div class="flex flex-col w-full justify-center items-center">
	
		<div class="flex flex-col {localStorage.tvMode == "true" ? "w-[720px]" : ""}">
		<div class="controls-slider w-full max-w-[720px] flex relative gap-4 mb-4 mt-4">
			<div
				class="w-[120%] h-[150%] z-[1000] absolute bottom-0 left-[-10%] bg-background grid place-items-center loadingDiv"
			>
				<LinearProgressIndeterminate
					extraOptions={{ class: 'm3-container !h-[0.6rem] !w-[75%]' }}
				/>
			</div>
			<span
				class="currentTime absolute left-0 bottom-12"
				style="font-family: 'MonaspaceKrypton', monospace">{fTime} {localStorage.preciseTime == "true" ? `(${currentTime}ms)` : ""}</span
			>
			<span
				class="duration absolute right-0 bottom-12"
				style="font-family: 'MonaspaceKrypton', monospace">{fDur} {localStorage.preciseTime == "true" ? `(${duration}ms)` : ""}</span
			>
			<Slider
				showValue={false}
				step={1}
				disabled={false}
				max={track.length}
				bind:value={currentTime}
				extraWrapperOptions={{ class: 'm3-container min-w-[100px] w-full' }}
			/>
		</div>
		<div class="controls max-w-[720px] flex flex-row gap-6 justify-center items-center">
			<Button
				type="tonal"
				extraOptions={{
					class: `m3-container m3-font-label-large tonal icon-none !px-[1rem] ${localStorage.tvMode == "true" ? '!h-[4rem]' : '!h-[3rem]'} shuf`
				}}
				on:click={() => {
					if (sp.get('plId')!.endsWith('-shuffled')) {
						// @ts-expect-error
						document.querySelector('.shuf').classList.remove('!ring-2');
						// @ts-expect-error
						document.querySelector('.shuf').classList.remove('!ring-primary');
						// @ts-expect-error
						document.querySelector('.shuf').classList.remove('!bg-primary/50');
						goto(`/listen?id=${sp.get('id')}&plId=${sp.get('plId')!.replace('-shuffled', '')}`);
						setTimeout(() => {
							clearInterval(updIv);
							listenMount();
						}, 100);
					} else {
						// @ts-expect-error
						document.querySelector('.shuf').classList.add('!ring-2');
						// @ts-expect-error
						document.querySelector('.shuf').classList.add('!ring-primary');
						// @ts-expect-error
						document.querySelector('.shuf').classList.add('!bg-primary/50');
						shufflePlaylist(plList, track);
						goto(`/listen?id=${sp.get('id')}&plId=${sp.get('plId')!}-shuffled`);
						setTimeout(() => {
							clearInterval(updIv);
							listenMount();
						}, 100);
					}
				}}
			>
				<Icon icon="mdi:shuffle" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
			</Button>
			<Button
				type="filled"
				on:click={prevSong}
				extraOptions={{
					class: `m3-container m3-font-label-large filled icon-none !px-[1rem] ${localStorage.tvMode == "true" ? '!h-[4rem]' : '!h-[3rem]'}`
				}}
			>
				<Icon icon="mdi:skip-previous" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
			</Button>
			<Button
				on:click={() => {
					let p = document.querySelector('audio');
					// @ts-expect-error
					if (p.paused) {
						p.play();
					} else {
						p.pause();
					}
				}}
				type="filled"
				extraOptions={{
					class: `m3-container m3-font-label-large filled icon-none !px-[1rem] ${localStorage.tvMode == "true" ? '!h-[4rem]' : '!h-[3rem]'}`
				}}
			>
				{#if paused == false}
					<Icon icon="mdi:pause" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
				{/if}
				{#if paused == true}
					<Icon icon="mdi:play" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
				{/if}
			</Button>
			<Button
				type="filled"
				on:click={skipSong}
				extraOptions={{
					class: `m3-container m3-font-label-large filled icon-none !px-[1rem] ${localStorage.tvMode == "true" ? '!h-[4rem]' : '!h-[3rem]'}`
				}}
			>
				<Icon icon="mdi:skip-next" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
			</Button>

			<Button
				type="tonal"
				extraOptions={{
					class: `m3-container m3-font-label-large tonal icon-none !px-[1rem] ${localStorage.tvMode == "true" ? '!h-[4rem]' : '!h-[3rem]'} !ring-primary !ring-0 rep`
				}}
				on:click={() => {
					// @ts-expect-error
					let loop = document.querySelector('audio').loop;
					// @ts-expect-error
					document.querySelector('audio').loop = !loop;
					// @ts-expect-error
					document.querySelector('.rep').classList.toggle('!ring-2');
					// @ts-expect-error
					document.querySelector('.rep').classList.toggle('!ring-0');
					// @ts-expect-error
					document.querySelector('.rep').classList.toggle('!bg-primary/50');
				}}
			>
				<Icon icon="mdi:repeat" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
			</Button>
		</div>
		<div
			class="controls-extended max-w-[500px] flex flex-row gap-[7.3rem] mt-2 justify-center items-center"
		>
			<Button
				type="tonal"
				extraOptions={{
					class: 'm3-container m3-font-label-large tonal icon-none !px-[1rem] !h-[3rem] shufSmol'
				}}
				on:click={() => {
					if (sp.get('plId')!.endsWith('-shuffled')) {
						// @ts-expect-error
						document.querySelector('.shufSmol').classList.remove('!ring-2');
						// @ts-expect-error
						document.querySelector('.shufSmol').classList.remove('!ring-primary');
						// @ts-expect-error
						document.querySelector('.shufSmol').classList.remove('!bg-primary/50');
						goto(`/listen?id=${sp.get('id')}&plId=${sp.get('plId')!.replace('-shuffled', '')}`);
						setTimeout(() => {
							clearInterval(updIv);
							listenMount();
						}, 100);
					} else {
						// @ts-expect-error
						document.querySelector('.shufSmol').classList.add('!ring-2');
						// @ts-expect-error
						document.querySelector('.shufSmol').classList.add('!ring-primary');
						// @ts-expect-error
						document.querySelector('.shufSmol').classList.add('!bg-primary/50');
						shufflePlaylist(plList, track);
						goto(`/listen?id=${sp.get('id')}&plId=${sp.get('plId')!}-shuffled`);
						setTimeout(() => {
							clearInterval(updIv);
							listenMount();
						}, 100);
					}
				}}
			>
				<Icon icon="mdi:shuffle" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
			</Button>
			<Button
				type="tonal"
				extraOptions={{
					class:
						'm3-container m3-font-label-large tonal icon-none !px-[1rem] !h-[3rem] !ring-primary !ring-0 repSmol'
				}}
				on:click={() => {
					// @ts-expect-error
					let loop = document.querySelector('audio').loop;
					// @ts-expect-error
					document.querySelector('audio').loop = !loop;
					// @ts-expect-error
					document.querySelector('.repSmol').classList.toggle('!ring-2');
					// @ts-expect-error
					document.querySelector('.repSmol').classList.toggle('!ring-0');
					// @ts-expect-error
					document.querySelector('.repSmol').classList.toggle('!bg-primary/50');
				}}
			>
				<Icon icon="mdi:repeat" width={localStorage.tvMode == "true" ? 56 : 32} height={localStorage.tvMode == "true" ? 56 : 32}></Icon>
			</Button>
		</div>
	</div>
	</div>
	</div></div>
</div>
</div>

<div class="min-h-[90vh] h-fit text-secondary bg-on-secondary relative z-[3] text-lg p-6">
	<Button
		type="elevated"
		on:click={(e) => {
			likeSong(track);
			liked = isLiked(track);
			e.target!.innerText = liked == true ? 'Unlike' : 'Like';
		}}
	>
		Like
	</Button>
	<Button
		type="elevated"
		on:click={() => {
			downloadSong(track);
		}}>Download</Button
	>
	<Button
		type="elevated"
		on:click={() => {
			shareSong(track.id, track.name, track.artist);
		}}
	>
		<Icon icon="mdi:share" width={16} height={16} class="mr-2" />
		Share
	</Button>
	<br /><br />
	{#if localStorage.tvMode != "true"}
		<h2 class="text-4xl font-bold mb-8">Lyrics</h2>
		<div class="lyrics-container text-lg max-h-[75vh] overflow-y-auto p-4 overflow-x-none"></div>
	{/if}
	<style>
		.lyric-line {
			padding: 0.5rem 0;
			transition: all 0.3s ease;
			opacity:0.8;
			font-size: normal;
			margin-top:0px; margin-bottom:0px;

		}
		.lyric-line.active {
			color: var(--m3-scheme-primary);
			font-weight: 800;
			text-shadow: 0px 2px 10px rgb(var(--m3-scheme-primary) / 0.5);
			font-size: 24px;
			margin-top:10px; margin-bottom:10px;
			transition: all 0.3s ease;
		}
		.static-lyrics {
			white-space: pre-line;
		}
		.lyrics-container {
			scroll-behavior: smooth;
		}
	</style>
</div>
