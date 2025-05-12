<script>
	import * as spot from '$lib/spotify';
	import { onMount } from 'svelte';
	onMount(async () => {
		let tok = (await spot.getSpotToken()).accessToken;
		let cliTok = (await spot.getSpotCliToken()).token;
		let dat = (await (await spot.spotSearchSongs(cliTok, tok, 'got the life')).json()).data.searchV2
			.tracksV2.items;
		console.log(dat);
		for (let i = 0; i < dat.length; i++) {
			let sDat = dat[i].item.data;
			let artists = [];
			for (let g = 0; g < sDat.artists.items.length; g++) {
				artists.push(sDat.artists.items[g].profile.name);
			}
			console.log([
				sDat.name,
				artists,
				sDat.duration.totalMilliseconds,
				sDat.id,
				sDat.albumOfTrack.coverArt.sources
			]);
		}
	});
</script>

<p class="res"></p>
