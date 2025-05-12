kit: {
	adapter: Number(process.env.DESKTOP) == 1
	  ? desktopAdapter({
		  pages: 'build',
		  assets: 'build',
		  fallback: 'index.html',
		  precompress: false,
		  strict: true
		})
	  : adapter({
		  runtime: 'edge'
		}),
	paths: {
	  base: process.env.NODE_ENV === 'production' ? '/mujay' : '' // e.g., '/mujay'
	},
	csrf: false
  }