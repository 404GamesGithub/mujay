<script>
	import { goto } from '$app/navigation';
	import { createPlaylist } from '$lib';
	import { getSpotTokenSSR } from '$lib/spotify';
	function newId() {
		return Math.floor(Date.now() * Math.random())
			.toString(16)
			.slice(0, 6);
	}
	let name = 'My Playlist';
	let id = newId();
	import { Button, TextField } from 'm3-svelte';
</script>

<h1 class="text-5xl p-6">Create a Playlist</h1>
<div class="px-6">
	<TextField
		bind:value={name}
		minLength={1}
		name="Name"
		error={false}
		extraWrapperOptions={{ class: 'relative w-full max-w-[400px] m3-container query-input' }}
	/>
</div>
<div class="px-6">
	<TextField
		bind:value={id}
		name="Playlist ID"
		error={false}
		disabled={true}
		extraWrapperOptions={{
			class: 'relative w-full max-w-[120px] font-mono text-xl m3-container query-input'
		}}
		extraOptions={{ class: 'font-mono text-xl' }}
	/>
</div>
<br />
<div class="flex gap-6 px-6">
	<Button
		type="outlined"
		extraOptions={{
			class: '!text-xl m3-container m3-font-label-large outlined icon-none w-[80px] !h-[unset] my-1'
		}}
		on:click={() => {
			goto('/playlists');
		}}
	>
		Back
	</Button>
	<Button
		type="tonal"
		extraOptions={{
			class: '!text-xl m3-container m3-font-label-large tonal icon-none w-[150px] !h-[unset] my-1'
		}}
		on:click={() => {
			id = newId();
		}}
	>
		Reroll ID
	</Button>
	<Button
		type="filled"
		extraOptions={{
			class: '!text-xl m3-container m3-font-label-large filled icon-none w-[150px] my-1'
		}}
		on:click={() => {
			let pl = createPlaylist(name, id);
			goto(`/playlist/?l=${pl.id}`);
		}}
	>
		Create
	</Button>
</div>
