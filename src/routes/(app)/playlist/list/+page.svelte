<script lang="ts">
	import { goto } from '$app/navigation';
	export let data;
	import MusicCard from '$lib/MusicCard.svelte';
	import { Button } from 'm3-svelte';
</script>

<div class="flex gap-6 items-center">
	<h1 class="text-5xl p-6">Your Playlists</h1>
	<Button
		type="filled"
		on:click={() => {
			goto('/playlist/create');
		}}
	>
		Create
	</Button>

	<Button
		type="tonal"
		on:click={() => {
			goto('/playlist/import');
		}}
	>
		Import
	</Button>
</div>

<div class="playlistsArray ml-6 mr-3">
	{#each data.plArr as pl}
		<MusicCard
			title={pl.name}
			author="you"
			length={pl.songLength}
			playlist={true}
			className="mr-3 mb-6"
			href={pl.playUrl}
			img={pl.cover}
		></MusicCard>
	{/each}

</div>

