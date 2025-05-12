<script lang="ts">
	import { Button } from 'm3-svelte';
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;
	const { songData, meta } = data;
</script>

<svelte:head>
	<title>{meta.title} | Mujay</title>
	<meta name="description" content={meta.description} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:image" content={meta.image} />
	<meta property="og:url" content={meta.url} />
	<meta property="og:type" content={meta.type} />
	<meta property="og:site_name" content="Mujay" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
	<meta name="twitter:image" content={meta.image} />
	<meta property="music:musician" content={songData.author} />
	<meta property="music:duration" content={songData.lengthSeconds} />
</svelte:head>

<div class="flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
	<div class="bg-surface-container-high rounded-xl p-6 w-full shadow-lg">
		<div class="flex flex-col md:flex-row gap-6 items-center">
			<img
				src="https://libytm.mujay.app/lh3Proxy/{encodeURIComponent(
					songData.thumbnail.thumbnails.slice(-1)[0].url
				)}"
				alt="{songData.title} cover"
				class="w-64 h-64 object-cover rounded-lg shadow-md"
			/>
			<div class="flex flex-col flex-1">
				<h1 class="text-3xl font-bold mb-2">{songData.title}</h1>
				<h2 class="text-xl text-on-surface/70 mb-4">{songData.author}</h2>
				<p class="mb-6">
					Duration: {Math.floor(songData.lengthSeconds / 60)}:{(songData.lengthSeconds % 60)
						.toString()
						.padStart(2, '0')}
				</p>

				<div class="flex flex-col justify-center items-center gap-3 mt-4">
					<Button type="filled" on:click={() => goto(`/listen?id=${meta.songId}`)}>
						<Icon icon="mdi:play" width={24} height={24} class="mr-2" />
						Play on Mujay
					</Button>
					<Button
						type="filled"
						on:click={() => (document.location = `https://youtube.com/watch?v=${meta.songId}`)}
					>
						<Icon icon="mdi:play" width={24} height={24} class="mr-2" />
						Play on YouTube Music
					</Button>
					<br />
					<Button
						type="tonal"
						on:click={() => {
							navigator.clipboard.writeText(meta.url);
							alert('Link copied to clipboard!');
						}}
					>
						<Icon icon="mdi:share" width={24} height={24} class="mr-2" />
						Copy Link
					</Button>
				</div>
			</div>
		</div>
	</div>

	<div class="mt-8 text-center text-on-surface/60 max-w-[700px]">
		<p>This song is shared via Mujay, a YouTube Music client.<br><b>By listening to this song on Mujay, you may experience instability and errors because Mujay is in a prototype status.</b></p>
		<p class="mt-2">
			<a href="/" class="text-primary underline">Go to Home</a>
		</p>
	</div>
</div>
