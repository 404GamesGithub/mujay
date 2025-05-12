<script>
	// @ts-nocheck

	import Icon from '@iconify/svelte';
	import { Button, Card } from 'm3-svelte';
	export let img = 'unknown.png';
	export let title;
	export let length = '0:00';
	export let author;
	export let href = '#';
	export let className = '';
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onmouseenter={(e) => {
		e.target.querySelector('.m3-container').classList.add('type-elevated');
	}}
	onmouseleave={(e) => {
		e.target.querySelector('.m3-container').classList.remove('type-elevated');
	}}
	class={className}
>
	<a {href}>
		<Card
			type="outlined"
			extraOptions={{ class: 'm3-container !border-0 duration-300 !p-2 flex !flex-row gap-8' }}
		>
			<img src={img} class="w-[70px] h-[70px]" alt="Cover" />
			<div class="flex flex-col w-full">
				<h3 class="song-title text-2xl font-bold w-fit">{title}</h3>
				<h4 class="artist-data text-lg w-fit">by {author}</h4>
			</div>
			<div class="flex justify-center items-center pr-6 duration text-xl">
				{length}
			</div>
		</Card>
	</a>
</div>
