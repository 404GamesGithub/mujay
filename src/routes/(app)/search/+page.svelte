<script lang="ts">
	import MusicCard from '$lib/MusicCard.svelte';
	import { Button, Card, TextField } from 'm3-svelte';
	let searchVal = '';
	import { ytSearch } from '$lib/libytm';
	import { onMount } from 'svelte';
</script>

<h1 class="font-bold text-5xl p-6">Search for music</h1>
<div class="flex gap-6" style="padding-left:1.5rem">
	<TextField
		bind:value={searchVal}
		minLength={1}
		maxLength={32}
		name="What do you want to play?"
		error={false}
		extraWrapperOptions={{ class: 'relative w-full max-w-[400px] m3-container query-input' }}
	/>
	<Button
		type="filled"
		extraOptions={{
			class: '!text-xl m3-container m3-font-label-large filled icon-none w-[120px] !h-[unset] my-1'
		}}
		on:click={() => {
			ytSearch((document.querySelector('.query-input input') as HTMLInputElement).value);
		}}>Search</Button
	>
</div>
<div class="searchResults hidden">
	<h2 class="text-4xl p-6">Top Result</h2>
	<Card
		type="filled"
		extraOptions={{ class: 'm3-container type-filled mx-6 max-w-full top-result-card' }}
	>
		<div class="flex flex-row gap-12">
			<img class="w-[128px] h-[128px] song-cover" alt="Song Cover" />
			<div class="flex-col justify-evenly hidden xs:flex">
				<!-- svelte-ignore a11y_missing_content -->
				<h2 class="font-bold text-3xl !max-h-[200px] overflow-hidden text-ellipsis song-title"></h2>
				<div class="flex flex-row gap-12 items-center">
					<!-- svelte-ignore a11y_missing_content -->
					<h3 class="text-xl song-data"></h3>
					<!-- svelte-ignore a11y_invalid_attribute -->
					<a href="#" class="play-url">
						<Button
							type="filled"
							extraOptions={{
								class:
									'!text-lg m3-container m3-font-label-large filled icon-none w-[120px] my-1 play-button'
							}}>Play</Button
						>
					</a>
				</div>
			</div>
			<div class="w-full flex-col justify-center items-center flex xs:hidden">
				<!-- svelte-ignore a11y_missing_content -->
				<h2
					class="font-bold text-2xl !max-h-[200px] overflow-hidden text-ellipsis song-title-smol"
				></h2>
				<!-- svelte-ignore a11y_missing_content -->
				<h3 class="text-xl song-data-smol"></h3>
				<!-- svelte-ignore a11y_invalid_attribute -->
				<a href="#" class="play-url-smol mt-2">
					<Button
						type="filled"
						extraOptions={{
							class:
								'!text-lg m3-container m3-font-label-large filled icon-none w-[120px] play-button'
						}}>Play</Button
					>
				</a>
			</div>
		</div>
	</Card>
	<br />
	<div class="resultsArray ml-6 mr-3">
		<MusicCard
			title="Placeholder"
			author="Placeholder"
			playlist={false}
			className="placeholder mr-3 mb-6"
		></MusicCard>
	</div>
</div>
