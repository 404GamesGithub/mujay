export default function actionHandler() {
	setInterval(() => {
		if (document.location.hash.startsWith('#action,')) {
			let [source, action] = document.location.hash.split(',').splice(1);
			if (!action) {
				action = source;
				source = 'unknown';
			}
			console.log(source, action);
			switch (action) {
				case 'action:open_settings': {
					// @ts-expect-error this should be a button defined in +layout
					document.querySelector('.press_settings')!.click();
				}
			}
			document.location.hash = '';
		}
	}, 120); /* addEventListener is buggy; use setInterval as a workaround */
	setInterval(() => {
		document.location.hash = '';
	}, 3000);
}
