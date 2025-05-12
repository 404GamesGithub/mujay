<script>
	let recommendations = true;
	import { Chip, Switch, TextField } from 'm3-svelte';
	import { onMount } from 'svelte';
	if (!localStorage.cors) {
		localStorage.cors = 'https://cors.rare1k.dev?';
	}
	if (!localStorage.yank) {
		localStorage.yank = `https://pootify.rare1k.dev`;
	}
	if (!localStorage.libytm) {
		localStorage.libytm = `https://libytm.mujay.app`;
	}
	if (!localStorage.recommendations) {
		localStorage.recommendations = 'true';
		recommendations = true;
	}
	recommendations = localStorage.recommendations == 'true';
	let ambient = localStorage.ambientMode == 'true';
	let tvMode = localStorage.tvMode == "true";
	onMount(() => {
		document.body.setAttribute('hacker', localStorage.hackerMode || 'false');
		document.body.setAttribute('theme', localStorage.theme);
		if (localStorage.theme == 'highseas') {
			document.body.style.color = 'black';
		}
		console.log(document.querySelector('.recTxt input'));
		// @ts-ignore
		document.querySelector('.recTxt input').checked = recommendations;
	});

	function updateTheme() {
		document.body.setAttribute('theme', localStorage.theme || 'default');
		window.parent.document.body.setAttribute('theme', localStorage.theme || 'default');
	}
</script>

<div style="background: rgb(var(--m3-scheme-surface-container-low))">
	<h1 class="font-bold text-5xl">Settings</h1>
	<br />
	<TextField
		bind:value={localStorage.libytm}
		name="LibYTM Instance"
		error={false}
		extraWrapperOptions={{ class: 'relative w-[90%] m3-container' }}
	/><br />
	<!--
	<TextField
		bind:value={localStorage.yank}
		name="Pootify Instance"
		error={false}
		extraWrapperOptions={{ class: 'relative w-[90%] m3-container' }}
	/><br />
	-->
	<b class="flex items-center gap-2">
		Theme:
		<select bind:value={localStorage.theme} on:change={updateTheme} class="font-normal">
			<option value="default">Default</option>
			<option value="catppuccin">Catppuccin Mocha</option>
			<option value="oled">OLED</option>
			<option value="highseas">High Seas</option>
		</select>
	</b>

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<b
		on:click={() => {
			recommendations = !recommendations;
			localStorage.recommendations = String(recommendations);
		}}
		class="flex items-center gap-2 recTxt"
		>Recommendations: <Switch bind:checked={recommendations}></Switch></b
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->

	<b
	on:click={() => {
		tvMode = !tvMode;
		localStorage.tvMode = String(tvMode);
	}}
	class="flex items-center gap-2 recTxt"
	>Landscape Mode: <Switch bind:checked={tvMode}></Switch></b
>
<span class="opacity-50 mt-2">Landscape mode rearranges parts of the Mujay UI to fit better on larger screens. Do not enable on a mobile device. Landscape mode is a work a progress.</span>
<br>

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<b
		on:click={() => {
			ambient = !ambient;
			localStorage.ambientMode = String(ambient);
		}}
		class="flex items-center gap-2 recTxt">Ambient Mode: <Switch bind:checked={ambient}></Switch></b
	>
	<span class="opacity-50 mt-2">Ambient Mode creates an ambient blur in the background.</span>
	<br />
	<br />

	<b>Hacker Mode:</b>
	Enable it yourself, open up the browser console and set it.
	<pre class="errPre">localStorage.hackerMode = "true";window.location.reload();</pre>
	<br />
	<br />
	<a href="https://gitlab.com/mujay" class="text-primary underline hue-rotate-180"
		>View the source code on GitLab</a
	>
	<br /><br /><br /><br /><br /><br />
</div>
