<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button, Card } from 'm3-svelte';
	import Icon from '@iconify/svelte';
	import WideMusicCard from '$lib/WideMusicCard.svelte';
	import { msStr, shufflePlaylist } from '$lib';

	onMount(() => {
		if (!$page.url.searchParams.get('l')) {
			goto('/playlist/list');
		}

		let playlist = {
			id: '',
			name: '',
			songs: [
				{
					name: 'Song 2',
					artist: 'Blur',
					length: 120000,
					cover: [{ url: 'https://i.scdn.co/image/ab67616d00001e0234cbf7013afccc7df67fa43f' }],
					album: 'Blur: The Best Of',
					id: '3GfOAdcoc3X5GPiiXmpBjK'
				}
			]
		};

		let pl = JSON.parse(localStorage.playlists);

		for (let i = 0; i < pl.length; i++) {
			if (pl[i].id == $page.url.searchParams.get('l')) {
				playlist = pl[i];
			}
		}

		if (playlist.id == 'LM') {
			// @ts-expect-error
			document.querySelector('img.playlist-cover').src = '/liked.png';
		}

		if (playlist.id == 'DL') {
			// @ts-expect-error
			document.querySelector('img.playlist-cover').src = '/downloads.png';
		}

		(document.querySelector('h1.playlist-name') as HTMLHeadingElement)!.innerText = playlist.name;
		(document.querySelector('span.pl-data') as HTMLSpanElement)!.innerText =
			`${playlist.songs.length} songs`;

		for (let i = 0; i < playlist.songs.length; i++) {
			let s = playlist.songs[i];
			let wmc = document.querySelector('.wmc.placeholder');
			let nwmc = wmc!.cloneNode(true);
			// @ts-expect-error
			nwmc.querySelector('.song-title')!.innerHTML = s.name;
			// @ts-expect-error
			nwmc.querySelector('.artist-data')!.innerHTML = `by ${s.artist}`;
			// @ts-expect-error
			nwmc.querySelector('a').href = `/listen?id=${s.id}&plId=${playlist.id}`;
			// @ts-expect-error
			nwmc.querySelector('.duration')!.innerHTML = `${msStr(s.length)}`;
			// @ts-expect-error
			nwmc.querySelector('img').src =
				`${localStorage.libytm || 'https://libytm.mujay.app'}/lh3Proxy/${encodeURIComponent(s.cover.url)}`;
			// @ts-expect-error
			nwmc.classList.remove('placeholder');
			// @ts-expect-error
			nwmc.onmouseenter = (e) => {
				e.target.querySelector('.m3-container').classList.add('type-elevated');
			};
			// @ts-expect-error
			nwmc.onmouseleave = (e) => {
				e.target.querySelector('.m3-container').classList.remove('type-elevated');
			};
			// @ts-expect-error
			document.querySelector('.songList').appendChild(nwmc);
		}

		document.querySelector('.playBtn button')?.addEventListener('click', () => {
			if (playlist.songs.length > 0) {
				goto(`/listen?id=${playlist.songs[0].id}&plId=${playlist.id}`);
			}
		});
		document.querySelector('.shufBtn button')?.addEventListener('click', () => {
			if (playlist.songs.length > 0) {
				// @ts-expect-error
				shufflePlaylist(playlist);
				goto(`/listen?id=${playlist.songs[0].id}&plId=${playlist.id}`);
			}
		});
	});
</script>

<div class="playlist-header mx-auto w-full bg-surface-container rounded-3xl rounded-t-none">
	<div class="p-4">
		<div class="flex flex-row gap-10">
			<div class="flex flex-col justify-center mb-8 w-full">
				<h1 class="text-3xl font-bold playlist-name">My Playlist</h1>
				<span class="text-xl pl-data">69 songs</span>
				<div class="flex gap-6">
					<div class="flex flex-col max-w-[120px] gap-1 mt-2">
						<div class="playBtn">
							<Button type="filled" iconType="left"><Icon icon="mdi:play" /> Play</Button>
						</div>
						<div class="shufBtn">
							<Button type="tonal" iconType="left"><Icon icon="mdi:shuffle" />Shuffle</Button>
						</div>
					</div>
					<div class="flex flex-col max-w-[60px] gap-1 mt-2">
						<Button type="outlined" iconType="full"><Icon icon="mdi:menu" /></Button>
						<Button type="outlined" iconType="full"><Icon icon="mdi:download" /></Button>
					</div>
				</div>
			</div>
			<img src="/playlist.png" class="w-[128px] h-[128px] playlist-cover" alt="Cover" />
		</div>
	</div>
</div>
<br />
<div class="p-4">
	<div class="songList">
		<WideMusicCard
			title="placeholder"
			author="placeholder"
			img="/unknown.png"
			length="0:01"
			className="wmc placeholder"
		></WideMusicCard>
	</div>
</div>
