export function generateShareUrl(songId: string, baseUrl?: string): string {
	let base =
		baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://mujay.app');
	if (base.includes('localhost')) {base = "https://mujay.app"};
	return `${base}/share?id=${songId}`;
}

export async function shareSong(songId: string, title: string, artist: string): Promise<void> {
	const shareUrl = generateShareUrl(songId);
	const shareText = `Listen to ${title} by ${artist} on Mujay`;

	if (navigator.share) {
		try {
			await navigator.share({
				title: `${title} - ${artist}`,
				text: shareText,
				url: shareUrl
			});
			return;
		} catch (error) {
			console.log('Error sharing:', error);
		}
	}

	// Fallback to clipboard
	try {
		await navigator.clipboard.writeText(shareUrl);
		alert('Link copied to clipboard!');
	} catch (error) {
		console.error('Failed to copy link:', error);
		prompt('Copy this link to share:', shareUrl);
	}
}
