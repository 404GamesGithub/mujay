<script lang="ts">
	import { dynFontSize } from '$lib';
	import { page } from '$app/stores';
	import { Button, Slider } from 'm3-svelte';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	let paused = 1;
	let downloadUrl = '';
	let shout = true;
	onMount(async () => {
		let meta = await fetch(
			`https://us.api.iheart.com/api/v2/content/liveStations/${$page.url.searchParams.get('id')}`
		);
		if (meta.ok) {
			let mdat = await meta.json();
			document.querySelector('img.stationImg').src = mdat.hits[0].logo;
			document.querySelector('.title').innerText = mdat.hits[0].name;
			document.querySelector('.subtitle').innerText = mdat.hits[0].description;
			if (mdat.hits[0].streams.secure_shoutcast_stream) {
				downloadUrl = mdat.hits[0].streams.secure_shoutcast_stream;
				document.querySelector('audio').src = mdat.hits[0].streams.secure_shoutcast_stream;
				document.querySelector('.tag').innerText = `RADIO STATION (VIA SHOUTCAST)`;
			} else if (mdat.hits[0].streams.pls_stream) {
				downloadUrl = mdat.hits[0].streams.pls_stream;
				shout = false;
				let plsMeta = await (await fetch(mdat.hits[0].streams.pls_stream)).text();
				document.querySelector('audio').src = plsMeta
					.split('\n')[1]
					.split('=')[1]
					.replace('http://', 'https://')
					.replace(':80', '');
				document.querySelector('.tag').innerText = `RADIO STATION (VIA PLS)`;
			}
		} else {
			document.location = `/internal/error#fetch,http|${meta.status}|${encodeURIComponent(url)}`;
		}

		async function fetchPlaying() {
			let playing = await fetch(
				`https://us.api.iheart.com/api/v3/live-meta/stream/${$page.url.searchParams.get('id')}/currentTrackMeta?defaultMetadata=true`
			);
			if (playing.status == 204) {
				document.querySelector('.currentlyPlaying').style.display = 'none';
			} else {
				let plDat = await playing.json();
				document.querySelector('.currentlyPlaying').style.display = 'flex';
				document.querySelector('.currentlyPlaying img').src = plDat.imagePath;
				document.querySelector('.currentlyPlaying .playingTitle').innerText = plDat.title;
				document.querySelector('.currentlyPlaying .playingAuthor').innerText = plDat.artist;
			}
		}
		fetchPlaying();
		document.querySelector('audio').play();
		setInterval(() => {
			fetchPlaying();
		}, 15000);
	});
</script>

<div class="hidden !ring-2 !ring-primary !bg-primary/50"></div>
<audio class="fixed top-0 left-0" src="" bind:volume={paused}></audio>
<div class="w-full h-full flex flex-col justify-center items-center">
	<div class="flex flex-row gap-8">
		<img
			src="/unknown.png"
			class="w-[128px] h-[128px] stationImg"
			width="128"
			height="128"
			alt="Cover"
		/>
		<div class="flex flex-col justify-center items-center">
			<!-- svelte-ignore a11y_missing_content -->
			<h1 class="text-[40px] duration-300 font-bold title"></h1>
			<!-- svelte-ignore a11y_missing_content -->
			<h2 class="text-2xl opacity-50 subtitle"></h2>
		</div>
	</div>
	<div class="flex flex-row gap-8 my-4 currentlyPlaying">
		<img
			src="/unknown.png"
			class="w-[128px] h-[128px] currentlyPlayingImg"
			width="128"
			height="128"
			alt="Cover"
		/>
		<div class="flex flex-col justify-center items-center">
			<span>Now playing:</span>
			<!-- svelte-ignore a11y_missing_content -->
			<h1 class="text-[40px] duration-300 font-bold playingTitle"></h1>
			<!-- svelte-ignore a11y_missing_content -->
			<h2 class="text-2xl opacity-50 playingAuthor"></h2>
		</div>
	</div>
	<br />
	<div class="controls-slider max-w-[500px] flex flex-col relative gap-4 mb-4 mt-4">
		<span class="tag absolute left-0 bottom-12" style="font-family: 'MonaspaceKrypton', monospace"
			>LIVE STATION</span
		>
		<Slider
			showValue={false}
			step={1}
			disabled={true}
			max={1}
			value={1}
			extraWrapperOptions={{ class: 'm3-container w-[320px]' }}
		/>
	</div>
	<div class="controls min-w-[500px] flex flex-row gap-6 justify-center items-center">
		<Button
			on:click={() => {
				let p = document.querySelector('audio');
				// @ts-expect-error
				if (p.volume == 1) {
					p.volume = 0;
					p.play();
				} else {
					p.volume = 1;
					p.play();
				}
			}}
			type="filled"
			extraOptions={{
				class: 'm3-container m3-font-label-large filled icon-none !px-[1rem] !h-[3rem]'
			}}
		>
			{#if paused == 1}
				<Icon icon="mdi:pause" width={32} height={32}></Icon>
			{/if}
			{#if paused == 0}
				<Icon icon="mdi:play" width={32} height={32}></Icon>
			{/if}
		</Button>

		<Button
			on:click={() => {
				document.querySelector('audio').load();
				document.querySelector('audio').play();
			}}
			type="tonal"
			extraOptions={{
				class: 'm3-container m3-font-label-large tonal icon-none !px-[1rem] !h-[3rem]'
			}}
		>
			Skip Ads
		</Button>
		<Button
			on:click={async () => {
				if (!shout) {
					let a = document.createElement('a');
					a.href = downloadUrl;
					a.target = '_blank';
					a.click();
				} else {
					await navigator.clipboard.writeText(downloadUrl);
					alert('Copied Shoutcast stream URL to clipboard');
				}
			}}
			type="tonal"
			extraOptions={{
				class: 'm3-container m3-font-label-large tonal icon-none !px-[1rem] !h-[3rem]'
			}}
		>
			Get Stream File
		</Button>
	</div>
</div>
