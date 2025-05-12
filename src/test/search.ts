import { spotSearchSongsNoCORS, getSpot, getSpotCliToken, getSpotToken } from '../lib/spotify';
console.log(
	await (
		await spotSearchSongsNoCORS(
			(await getSpotCliToken()).token,
			(await getSpotToken()).accessToken,
			'got the life'
		)
	).json()
);
