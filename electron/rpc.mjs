let client = undefined;
import rpc from 'discord-rich-presence';
export function initRpc() {
	client = rpc('1321170291392516176');
	return;
}
export function updRpc(state, track, playlist) {
	console.log(track);
	track = JSON.parse(track);
	console.log(track);
	let plTxt = 'No playlist';
	if (playlist != '') {
		plTxt = `On playlist ${playlist}`;
	}
	let details = `${state == 'playing' ? 'Listening to' : 'Paused on'} ${track.name} by ${track.artist}`;

	client.updatePresence({
		state: plTxt,
		details,
		largeImageKey: track.cover[0].url,
		smallImageKey: 'mujay-logo',
		instance: true
	});
}
