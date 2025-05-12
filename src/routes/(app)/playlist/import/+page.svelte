<script lang="ts">
	import './+page.css';
	import {
		Button,
		LinearProgress,
		LinearProgressIndeterminate,
		TextField,
		TextFieldMultiline
	} from 'm3-svelte';
	import { goto } from '$app/navigation';
	let start = 0;
	let format = '';
	let importData = '';
	let loading = false;
	let pasted = false;
	let badCount = 0;
	let imperfectCount = 0;
	let betterMatchCount = [0, 0];
	let importTo = 'new playlist named: Imported Playlist';
	function remChars(str: string) {
		return str.replace(/[^a-zA-Z0-9\s]/g, '');
	}
	function setPercent(percent: number) {
		let p = Math.floor(percent);
		document.querySelector('#prog .percent')!.style.width = `${p}%`;
	}
	function updFormat(fname: string) {
		format = fname;
		let formats = document.querySelectorAll('*[datatype="typeFormat"]');
		for (let i = 0; i < formats.length; i++) {
			let e = formats[i];
			if (e.id != format) {
				e.classList.remove('filled');
				e.classList.add('tonal');
			} else {
				e.classList.remove('tonal');
				e.classList.add('filled');
			}
		}
	}
	import {
		spotGetTrack,
		getSpotCliToken,
		getSpotToken,
		spotSearchSongs,
		parseSpotSearch
	} from '$lib/spotify';
	import { createPlaylist, type Playlist } from '$lib';
	function newId() {
		return Math.floor(Date.now() * Math.random())
			.toString(16)
			.slice(0, 6);
	}
	function startImport() {
		loading = true;
		setTimeout(() => {
			_startImport();
		}, 100);
	}
	async function _startImport() {
		start = Date.now();
		let playlist: Playlist | undefined;
		setPercent(0);
		if (importTo.startsWith('new playlist named:')) {
			document.querySelector('.status')!.innerHTML = 'Creating playlist...';
			playlist = createPlaylist(importTo.replaceAll('new playlist named:', '').trim(), newId());
		} else {
			document.querySelector('.status')!.innerHTML = 'Fetching playlist...';
			let playlists = JSON.parse(localStorage.playlists);
			for (let i = 0; i < playlists.length; i++) {
				if (playlists[i].id == importTo.trim()) {
					playlist = playlists[i];
				}
			}
			if (playlist == undefined) {
				document.querySelector('.status')!.parentElement!.innerHTML = 'Bad playlist ID.';
			}
			playlist!.songs = [];
		}
		setPercent(50);
		document.querySelector('.status')!.innerHTML = 'Parsing songs...';
		let playlistDat;
		if (format != 'mujay') {
			playlistDat = [];
			let songs = [];
			switch (format) {
				case 'plain':
					songs = importData.split('\n');
					for (let i = 0; i < songs.length; i++) {
						let [author, song] = songs[i].replaceAll('\r', '').split(' - ');
						playlistDat.push([song, author, '']);
					}
					break;
				case 'plainflipped':
					songs = importData.split('\n');
					for (let i = 0; i < songs.length; i++) {
						let [song, author] = songs[i].replaceAll('\r', '').split(' - ');
						playlistDat.push([song, author, '']);
					}
					break;
				default:
					// what the fuck
					document.querySelector('.status')!.parentElement!.innerHTML = 'Bad format';
					break;
			}
		} else {
			playlistDat = JSON.parse(importData);
		}
		setPercent(100);
		console.log(playlistDat);
		document.querySelector('.status')!.innerHTML = `Getting spotify tokens...`;
		setPercent(0);
		let tok = (await getSpotToken()).accessToken;
		setPercent(50);
		let cliTok = (await getSpotCliToken()).token;
		setPercent(100);
		document.querySelector('.status')!.innerHTML = `Converting songs... (0/${playlistDat.length})`;
		for (let i = 0; i < playlistDat.length; i++) {
			let songDat = playlistDat[i];
			let query = remChars(`${songDat[0]} ${songDat[1].split('&')[0].split(',')[0].trim()}`);
			// @ts-expect-error
			let res = await parseSpotSearch(await spotSearchSongs(cliTok, tok, query));
			let song: any;
			if (res![0].name == songDat[0]) {
				song = res![0];
			} else if (!songDat[1].trim().includes(res![0].artists[0])) {
				badCount++;
				console.log('bad match, trying to find a better one');
				console.log(`expected a song by ${songDat[1].trim()}`);
				for (let i = 0; i < 5; i++) {
					if (songDat[1].trim().includes(res![i].artists[0])) {
						console.log('found better match!');
						betterMatchCount[0] = betterMatchCount[0] + 1;
						song = res![i];
						console.log(song);
						break;
					}
				}
				if (song == undefined) {
					console.log("couldn't find a better match, trying harder...");
					let authors = songDat[1].split(',');
					if (authors.length == 1) {
						console.log("couldn't find a better match, giving up!");
						continue;
					}
					for (let i = 0; i < authors.length; i++) {
						let query = remChars(`${songDat[0]} ${authors[i]}`);
						// @ts-expect-error
						let res = await parseSpotSearch(await spotSearchSongs(cliTok, tok, query));
						for (let i = 0; i < 5; i++) {
							if (songDat[1].trim().includes(res![i].artists[0])) {
								console.log('found better match!');
								betterMatchCount[0] = betterMatchCount[0] + 1;
								song = res![i];
								console.log(song);
								break;
							}
						}
					}
					if (song == undefined) {
						console.log("couldn't find a better match, giving up!");
						continue;
					}
				}
			} else {
				console.log('likely imperfect match, trying to find a better one');
				imperfectCount++;
				for (let i = 0; i < 5; i++) {
					if (res![i].name == songDat[0]) {
						console.log('found better match!');
						betterMatchCount[1] = betterMatchCount[1] + 1;
						song = res![i];
						console.log(song);
						break;
					}
				}
				if (song == undefined) {
					console.log('could not find better match');
					song = res![0];
					console.log(song);
				}
			}

			song.artist = song.artists[0];
			playlist!.songs.push(song);
			document.querySelector('.status')!.innerHTML =
				`Converting songs... (${i}/${playlistDat.length}, ${(i / (Date.now() - start)).toFixed(3)} songs/sec)`;
			setPercent(Math.max(0, (i / playlistDat.length) * 100));
		}
		setPercent(0);
		document.querySelector('.status')!.innerHTML = `Saving...`;
		let playlists = JSON.parse(localStorage.playlists);
		for (let i = 0; i < playlists.length; i++) {
			setPercent(i / playlists.length);
			if (playlist!.id == playlists[i].id) {
				playlists[i] = playlist;
				setPercent(90);
				break;
			}
		}

		localStorage.playlists = JSON.stringify(playlists);
		setPercent(100);
		document.querySelector('.status')!.parentElement!.innerHTML = `Done! Redirecting in 15 seconds.
        <br>
        <div style="font-size:16px !important;">
        <b>Out of ${playlistDat.length} songs...</b>
        <li> ${badCount} (${Math.floor((badCount / playlistDat.length) * 100)}%) were bad matches (although ${betterMatchCount[0]} (${Math.floor((betterMatchCount[0] / badCount) * 100)}%) better matches were found, so only ${badCount - betterMatchCount[0]} songs were not added) </li>
        <li> ${imperfectCount} (${Math.floor((imperfectCount / playlistDat.length) * 100)}%) were likely imperfect matches (although ${betterMatchCount[1]} (${Math.floor((betterMatchCount[1] / imperfectCount) * 100)}%) better matches were found) </li>
        <li>Average rate: ${(playlistDat.length / (Date.now() - start)).toFixed(3)} songs/sec</li>
        <br><br>
        If you are impatient, you can go to the <a class="a" href="/playlist?l=${playlist!.id}">new playlist now</a>
        </div>
        `;

		setTimeout(() => {
			document.location = `/playlist?l=${playlist!.id}`;
		}, 15000);
	}
</script>

<div class="bg-background/50 pb-16">
	<div class="flex gap-6 items-center">
		<h1 class="text-5xl p-6">Import a Playlist</h1>

		<Button
			type="filled"
			on:click={() => {
				goto('/playlists');
			}}
			disabled={loading}
		>
			Back
		</Button>
	</div>
	{#if loading == false}
		<p class="px-6 max-w-[650px]">
			&nbsp;•&nbsp;&nbsp; If you want to import from YouTube Music (YTM), you should <a
				class="a"
				href="/userscripts/mujayYTMExporter.user.js">install the userscript</a
			>, go to your desired YTM playlist and an Export button should appear (refresh if it does
			not), click it and wait for further instruction. If you do not have a userscript manager like
			<a class="a" href="https://www.tampermonkey.net/">Tampermonkey</a>
			or <a class="a" href="https://violentmonkey.github.io/">Violentmonkey</a>, you need to install
			one for this to work. <br />
			&nbsp;•&nbsp;&nbsp; If you want to import from Spotify, just click the Import from Spotify button.
		</p>
		<br />
		<h2 class="text-2xl px-6 pb-3">Pick a supported format</h2>
		<div class="grid grid-cols-2 gap-6 px-6 max-w-[450px]">
			<Button
				type="tonal"
				extraOptions={{ id: 'mujay', datatype: 'typeFormat' }}
				on:click={() => {
					updFormat('mujay');
				}}
			>
				Mujay (pick this if you used the userscript)
			</Button>
			<Button
				type="tonal"
				extraOptions={{ id: 'plain', datatype: 'typeFormat' }}
				on:click={() => {
					updFormat('plain');
				}}
			>
				Plain (Artist - Song)
			</Button>
			<Button
				type="tonal"
				extraOptions={{ id: 'plainflipped', datatype: 'typeFormat' }}
				on:click={() => {
					updFormat('plainflipped');
				}}
			>
				Plain (Song - Artist)
			</Button>
			<Button type="tonal" extraOptions={{ id: 'spotify', datatype: 'typeFormat', disabled: true }}>
				Import from Spotify (soon)
			</Button>
		</div>
		{#if format != ''}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="px-6"
				on:mousemove={async () => {
					if (!pasted) {
						try {
							const text = await navigator.clipboard.readText();
							let e = document.querySelector('textarea')!;
							e.value = text;
							e.parentElement!.style.height = '200px';
							importData = text;
							pasted = true;
						} catch {
							pasted = false;
						}
					}
				}}
			>
				<h3 class="text-xl pb-1 pt-6">Paste your exported data here</h3>
				<TextFieldMultiline
					bind:value={importData}
					extraWrapperOptions={{
						style: 'max-width:400px !important; max-height: 200px !important;'
					}}
					extraOptions={{
						spellcheck: 'false',
						style: 'font-family: MonaspaceKrypton, monospace !important; font-size:small;'
					}}
					name="Data"
				/>
			</div>
			{#if importData != ''}
				<h3 class="text-xl pb-1 pt-6 px-6">Import to</h3>
				<div class="flex items-center gap-6 px-6 max-w-[450px]">
					{#if importTo == 'LM'}
						<Button
							type="filled"
							on:click={() => {
								importTo = '';
							}}
						>
							Liked Songs
						</Button>
					{:else}
						<Button
							type="tonal"
							on:click={() => {
								importTo = 'LM';
							}}
						>
							Liked Music
						</Button>
					{/if}
					{#if importTo.startsWith('new playlist named: ')}
						<Button
							type="filled"
							on:click={() => {
								importTo = '';
							}}
						>
							New Playlist
						</Button>
					{:else}
						<Button
							type="tonal"
							on:click={() => {
								importTo = 'new playlist named: ';
							}}
						>
							New Playlist
						</Button>
					{/if}
					<span>or:</span>
				</div>

				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					class="px-6 py-3 !w-fit"
					on:click={() => {
						if (['LM'].includes(importTo)) {
							importTo = '';
						}
					}}
				>
					<TextField
						extraOptions={{ spellcheck: 'false' }}
						extraWrapperOptions={{ style: 'width:400px !important;' }}
						name="Import where?"
						bind:value={importTo}
					></TextField>
					<span class="text-error mt-2"
						>Playlist contents will be <u>OVERWRITTEN</u> on conversion!</span
					>
				</div>
				<div class="px-6">
					<Button
						type="filled"
						disabled={importTo == '' || importTo == 'new playlist named: '}
						extraOptions={{ style: 'font-size:24px;height:3.5rem !important;' }}
						on:click={startImport}
					>
						IMPORT!
					</Button>
				</div>
			{/if}
		{/if}
	{:else}
		<div class="w-full flex flex-col justify-center items-center">
			<div class="flex flex-col text-3xl gap-6 p-6">
				<span class="status"></span>
				<LinearProgress percent={0} extraOptions={{ id: 'prog' }} />
			</div>
		</div>
	{/if}
</div>
