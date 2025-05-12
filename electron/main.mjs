import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { cwd } from 'process';
import serve from 'electron-serve';
const serveURL = serve({ directory: './build' });
import { dirname } from './dir.cjs';
const createWindow = async () => {
	const win = new BrowserWindow({
		width: 500,
		height: 768,
		webPreferences: {
			preload: path.join(dirname, 'preload.cjs'),
			webSecurity: false,
			nodeIntegration: true,
			contextIsolation: true,
			icon: path.join(dirname, '../build/no-bg-mujay.png')
		},
		backgroundColor: '#000000'
	});
	await serveURL(win);
};

app.whenReady().then(async () => {
	const { initRpc, updRpc } = await import('./rpc.mjs');
	ipcMain.on('initRpc', () => {
		initRpc();
	});
	ipcMain.on('updRpc', (e, args) => {
		updRpc(args[0], JSON.stringify(args[1]), args[2]);
	});
	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
