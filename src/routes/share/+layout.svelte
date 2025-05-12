<script lang="ts">
	import '../../app.css';
	import { StyleFromScheme } from 'm3-svelte';

	let { children } = $props();
</script>

<div class="share-page-container">
	{@render children()}
</div>

<StyleFromScheme
	lightScheme={{
		primary: 4287646528,
		onPrimary: 4294967295,
		primaryContainer: 4294957780,
		onPrimaryContainer: 4285740074,
		inversePrimary: 4294948008,
		secondary: 4286010961,
		onSecondary: 4294967295,
		secondaryContainer: 4294957780,
		onSecondaryContainer: 4284301115,
		tertiary: 4285553710,
		onTertiary: 4294967295,
		tertiaryContainer: 4294696870,
		onTertiaryContainer: 4283843609,
		error: 4290386458,
		onError: 4294967295,
		errorContainer: 4294957782,
		onErrorContainer: 4287823882,
		background: 4294965494,
		onBackground: 4280490264,
		surface: 4294965494,
		onSurface: 4280490264,
		surfaceVariant: 4294303194,
		onSurfaceVariant: 4283646785,
		inverseSurface: 4281937452,
		inverseOnSurface: 4294962666,
		outline: 4286935920,
		outlineVariant: 4292395710,
		shadow: 4278190080,
		scrim: 4278190080,
		surfaceDim: 4293449427,
		surfaceBright: 4294965494,
		surfaceContainerLowest: 4294967295,
		surfaceContainerLow: 4294963438,
		surfaceContainer: 4294765287,
		surfaceContainerHigh: 4294436065,
		surfaceContainerHighest: 4294041564,
		surfaceTint: 4287646528
	}}
	darkScheme={{
		primary: 4294948008,
		onPrimary: 4283833878,
		primaryContainer: 4285740074,
		onPrimaryContainer: 4294957780,
		inversePrimary: 4287646528,
		secondary: 4293377462,
		onSecondary: 4282657061,
		secondaryContainer: 4284301115,
		onSecondaryContainer: 4294957780,
		tertiary: 4292789388,
		onTertiary: 4282265092,
		tertiaryContainer: 4283843609,
		onTertiaryContainer: 4294696870,
		error: 4294948011,
		onError: 4285071365,
		errorContainer: 4287823882,
		onErrorContainer: 4294957782,
		background: 4279898384,
		onBackground: 4294041564,
		surface: 4279898384,
		onSurface: 4294041564,
		surfaceVariant: 4283646785,
		onSurfaceVariant: 4292395710,
		inverseSurface: 4294041564,
		inverseOnSurface: 4281937452,
		outline: 4288711817,
		outlineVariant: 4283646785,
		shadow: 4278190080,
		scrim: 4278190080,
		surfaceDim: 4279898384,
		surfaceBright: 4282529589,
		surfaceContainerLowest: 4279503883,
		surfaceContainerLow: 4280490264,
		surfaceContainer: 4280753436,
		surfaceContainerHigh: 4281477158,
		surfaceContainerHighest: 4282200624,
		surfaceTint: 4294948008
	}}
/>

<style>
	.share-page-container {
		padding-top: 1rem;
		padding-bottom: 5rem;
		min-height: 100vh;
	}
</style>
