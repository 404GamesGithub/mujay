import type { Playlist, Song } from '$lib';
export function initRPC() {
	if (sessionStorage.IS_ELECTRON && sessionStorage.getItem('rpc') != 'true') {
		window.desktopApi.initRpc();
		sessionStorage.rpc = 'true';
	}
}
export function updateState(
	state: 'playing' | 'paused',
	track: Song,
	playlist: Playlist | undefined
) {
	if (sessionStorage.IS_ELECTRON) {
		window.desktopApi.updRpc(state, track, playlist?.name || '');
	}
}
