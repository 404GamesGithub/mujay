<script lang="ts">
	import '../../app.css';
	import { App } from '@capacitor/app';
	import * as ln from "@capacitor/local-notifications"
	import { BackgroundTask } from '@capawesome/capacitor-background-task';
	import { BatteryOptimization } from '@capawesome-team/capacitor-android-battery-optimization';	
	import { ScreenOrientation } from '@capacitor/screen-orientation';
	import { BottomSheet, Button, ButtonLink, Dialog, FAB, StyleFromScheme } from 'm3-svelte';
	import { TabsLink } from 'm3-svelte';
	import { icons } from '@iconify-json/mdi';
	import { getIconData } from '@iconify/utils';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	let { children } = $props();
	let settingsOpen = $state(false);
	import event from '$lib/action';
	import { onDestroy, onMount } from 'svelte';
	let oldUrl = '\0';
	function OpenDUC() {
		// @ts-expect-error
		document.querySelector('#DialogUnableConnectWrap')?.parentElement?.open();
	}
	onMount(async () => {
		document.body.setAttribute('hacker', localStorage.hackerMode || 'false');
		document.body.setAttribute('theme', localStorage.theme);
		event();
		if (!localStorage.playlists) {
			localStorage.playlists = JSON.stringify([
				{ id: 'LM', name: 'Liked Music', songs: [] },
				{ id: 'DL', name: 'Downloads', songs: [] }
			]);
		}
		// @ts-ignore
		window.CheckDUC();
	});
	setInterval(() => {
		if (oldUrl == '\0') {
			oldUrl = document.location.pathname;
		}
		if (document.location.pathname != oldUrl) {
			// @ts-ignore
			window.CheckDUC();
		}
		oldUrl = document.location.pathname;
	}, 1000);
	let settingsHid = true;
	let DUCOpen = $state(false);
	// @ts-ignore
	window.CheckDUC = async () => {
		setTimeout(async () => {
			try {
				try {
					let u = new URL(localStorage.libytm);
				} catch {
					return; // user is likely still typing a url
				}
				let res = await fetch(localStorage.libytm || 'https://libytm.mujay.app');
				if (!res.ok) {
					alert("request failed; " + res.status);
					DUCOpen = true;
					return;
				}
				if ((await res.json()).hello != 'this is a libytm instance') {
					alert("not a libytm instance");
					DUCOpen = true;
					return;
				}
			} catch (e) {
				DUCOpen = true;
				alert(`${e.name}: ${e.message}\n${e.stack}\n${e.cause}`);
				throw e;
			}
		}, 300);
	};
	if (window.Capacitor && window.Capacitor.isNativePlatform()) {
		(async() => {
			await ScreenOrientation.lock({ orientation: 'portrait' });
			if ((await ln.LocalNotifications.checkPermissions()).display != "granted") {
				await ln.LocalNotifications.requestPermissions();
			}
		})();
		const isBatteryOptimizationEnabled = async () => {
		  const { enabled } = await BatteryOptimization.isBatteryOptimizationEnabled();
		  return enabled;
		};

		const openBatteryOptimizationSettings = async () => {
		  await BatteryOptimization.openBatteryOptimizationSettings();
		};

		const requestIgnoreBatteryOptimization = async () => {
		  await BatteryOptimization.requestIgnoreBatteryOptimization();
		};

		App.addListener('appStateChange', async ({ isActive }) => {
  			if (isActive) {
    			return;
  			}
  			const taskId = await BackgroundTask.beforeExit(async () => {
				if (await isBatteryOptimizationEnabled()) { 
					await ln.LocalNotifications.registerActionTypes({
						types: [{id: "disableOptimization", actions: [{
							id:"disableOptimizationAction",
							title: "Disable optimization"
						}
						]}]
					})
					await ln.LocalNotifications.schedule({notifications:[{
						title: "Mujay seems to have battery optimization enabled.",
						body: "Battery optimization must be disabled in order for background play to work properly after a few minutes.",
						id: 32,
						actionTypeId: "disableOptimization"
					}]})
					await ln.LocalNotifications.addListener('localNotificationActionPerformed', async (notification) => {
						if (notification.actionId == "disableOptimizationAction") {
							await requestIgnoreBatteryOptimization();
						}
					})
				}
    			BackgroundTask.finish({ taskId });
  			});
});

	}
</script>

{#if localStorage.nightMode == 'true'}
	<style>
		.light {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			z-index: 32767;
			display: block;
			background: rgba(0, 0, 0, 0.98);
			user-select: none;
			pointer-events: none;
		}
	</style>
	<div class="light">&nbsp;</div>
	<script lang="js">
		// @ts-nocheck
		document.onmousemove = (e) => {
			if (Math.floor(Math.random() * 200) != 1) {
				document.querySelector('.light').style.background =
					`radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(0,0,0,0.2) 96px, rgba(0,0,0,0.98) 128px)`;
			} else {
				document.querySelector('.light').style.background = 'black';
			}
		};
	</script>
{/if}

{#if DUCOpen == true}
	<Dialog headline="Error" open closeOnClick={false} closeOnEsc={false}>
		<span id="DialogUnableConnectWrap"></span>
		<p class="message text-lg mb-4">
			Mujay cannot connect to the LibYTM instance. Check the developer console for more details
			about the error.
		</p>
		<Button
			type="filled"
			on:click={() => {
				// @ts-expect-error
				document.querySelector('a[href*="source:bottom-nav"]')!.click();
				DUCOpen = false;
			}}>Open settings</Button
		>
		<Button
			type="tonal"
			on:click={() => {
				window.location.reload();
			}}>Reconnect</Button
		>
	</Dialog>
{/if}

<p
	class="fixed bottom-[calc(48px+var(--bottom-nav-padding))] left-2 z-[32767] opacity-50 text-xl font-bold {localStorage.iWantToThinkThatMujayIsAlreadyReleasedEvenThoughItIsNot ==
	'true'
		? 'hidden'
		: ''}"
>
	Prototype version 0.7.0
</p>
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

<div class="root flex flex-col w-full min-h-screen h-screen justify-center mx-auto bg-background">
	<main class="h-full w-full overflow-auto overflow-x-hidden pb-2">
		{@render children()}
	</main>
	<div class="flex justify-center w-full pb-[var(--bottom-nav-padding)]">
		<TabsLink
			extraOptions={{
				class:
					'absolute !w-full bottom-0 nav bg-on-primary/50 border-r border-primary-container border-t hover:bg-primary-container duration-300'
			}}
			extraWrapperOptions={{ class: 'max-w-[768px] m3-container !w-full' }}
			secondary={true}
			items={[
				{ name: 'Home', value: 'home', href: '/', icon: getIconData(icons, 'home') ?? undefined },
				{
					name: 'Search',
					value: 'search',
					href: '/search',
					icon: getIconData(icons, 'magnify') ?? undefined
				},
				{
					name: 'Playlists',
					value: 'library',
					href: '/playlists',
					icon: getIconData(icons, 'library-music') ?? undefined
				},
				{
					name: '',
					value: 'menu',
					href: '#action,source:bottom-nav-settings,action:open_settings',
					icon: getIconData(icons, 'gear') ?? undefined
				}
			]}
		/>
	</div>
</div>
<button class="hidden press_settings" onclick={() => (settingsOpen = !settingsOpen)}>_</button>
{#if settingsOpen}
	<BottomSheet
		on:close={() => {
			settingsOpen = false;
		}}
	>
		<iframe
			src="/internal/settings"
			class="!w-full h-[500px] hidden settingsIfr"
			title="settings"
			onload={() => {
				setTimeout(() => {
					document.querySelector('.settingsIfr')?.classList.remove('hidden');
					document.querySelector('.lp')?.remove();
				}, 150);
			}}
		></iframe>
		<div class="!min-h-[500px] lp"></div>
	</BottomSheet>
{/if}

<style>
	:global(body) {
		background: black;
	}
</style>
