<script>
	import { goto } from '$app/navigation';
	import { icons } from '@iconify-json/mdi';
	import { getIconData } from '@iconify/utils';

	import { Card, FAB } from 'm3-svelte';
	export let playlist = true;
	export let img = playlist ? '/playlist.png' : '/unknown.png';
	export let title;
	export let length = 0;
	export let author;
	export let className = '';
	export let href = '#';
	export let id = "LM";
</script>

<Card
	type="filled"
	extraOptions={{
		class: `song-card !inline-block  shadow m3-container type-filled !text-balance max-w-[150px] max-h-[250px] !p-0 ${className}`
	}}
>
	<div class="relative">
		<a {href} class="play-url">
			<FAB
				size="small"
				icon={getIconData(icons, 'play') ?? undefined}
				color="primary"
				extraOptions={{
					class:
						'm3-container m3-font-label-large color-primary size-small  [box-shadow:var(--m3-util-elevation-1)] !bg-primary-container/60 backdrop-blur hover:[box-shadow:var(--m3-util-elevation-3)] duration-300 !absolute bottom-2 right-2'
				}}
			/>
		</a>
		<img
			src={img}
			class="!w-[150px] min-w-[150px] h-[150px] rounded-t-[var(--m3-card-shape)] select-none"
			alt=""
			draggable="false"
		/>
	</div>
	<div class="p-3 pb-4 flex flex-col justify-evenly">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_missing_attribute -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<a class="text-lg !leading-[20px] title max-h-[70px] overflow-hidden text-ellipsis font-bold" on:click={()=>{goto(`/playlist?l=${id}`)}}>{title}</a>
		<div
			class="text-sm !leading-[14px] opacity-50 max-h-[28px] overflow-hidden data-string text-ellipsis"
		>
			{playlist ? `${length} songs | ` : ''}by {author}
		</div>
	</div>
</Card>
