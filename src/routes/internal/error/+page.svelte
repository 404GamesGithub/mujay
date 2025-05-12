<script>
	import { Button, ButtonLink, Dialog } from 'm3-svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	let hash = $page.url.hash.slice(1).split(',');
	let reason = 'of an unspecified reason.';
	let cause = hash[1];
	if (cause.startsWith('http|')) {
		let dat = cause.split('|');
		reason = `it encountered HTTP error ${dat[1]} when trying to access <code class="errCode">${decodeURIComponent(dat[2])}</code>`;
	}
	if (cause.startsWith('panic|')) {
		let dat = cause.split('|')[1];
		reason = `it had to panic:\n<pre class="errPre">${atob(dat)}</pre>`;
	}
	if (cause.startsWith('generic|')) {
		let dat = cause.split('|')[1];
		reason = `:\n<pre class="errPre">${atob(dat)}</pre>`;
	}
	let msg = `Mujay failed <code class="errCode">${decodeURIComponent(hash[0])}</code> because ${reason}`;
	onMount(() => {
		// @ts-expect-error
		document.querySelector('.message').innerHTML = msg;
	});
</script>

<Dialog headline="Error" open closeOnClick={false} closeOnEsc={false}>
	<p class="message text-xl mb-4"></p>
	<Button on:click={() => window.history.back()} type="filled">Try again</Button>
	<ButtonLink href="/" type="tonal">Go home</ButtonLink>
</Dialog>
