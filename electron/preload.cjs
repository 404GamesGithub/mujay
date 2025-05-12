const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApi', {
	initRpc: () => ipcRenderer.send('initRpc'),
	updRpc: (state, track, playlist) => ipcRenderer.send('updRpc', [state, track, playlist])
});

window.addEventListener('DOMContentLoaded', () => {
	window.IS_ELECTRON = true;
	sessionStorage['IS_ELECTRON'] = true;
	console.log('in electron client');
});
