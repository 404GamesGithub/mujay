# Mujay

A FOSS user-centric YouTube Music frontend for Web/Windows/Linux/Android (wip) that wraps around [LibYTM](https://gitlab.com/mujay/libytm).

**Demo**: https://mujay.app

As iheartradio stations aren't searchable yet:

- https://mujay.app/station?id=5747 - PLS example (ads are not skippable)
- https://mujay.app/station?id=593 - Shoutcast example (ads are sometimes skippable)
- https://mujay.app/station?id=8478 - Shoutcast w/ now playing example

### Downloads

- Download binaries here: https://github.com/xpbl/mujay-releases/releases

## Features:

- mobile-first ui using m3-svelte
- youtube music streaming via libytm
- ytm search & metadata fetching via libytm
- iheartradio streams via shoutcast/pls with ad skipper (ad skipper only works when iheart injects ads pre/mid stream)
- playlists
- downloads (downloads playlist is not implemented, but you can still download the song)
- customizable instances
- robust error handling
- shuffle playlists using Durstenfeld algorithm
- lyrics via lrclib
- spotify recommendations
- 4 themes (light/dark, catppuccin mocha, oled, high seas)
- ~~importing playlists from other sources (there's a userscript for youtube music)~~ (still working on migrating this to ytm)

## Privacy "Policy":

No data ever leaves your browser (all data is stored in your browser's `localStorage`), Mujay nor LibYTM have a database and you can verify this by looking at the code. Therefore, this is not a formal privacy policy.

You are not agreeing to YouTube's TOS nor YouTube's API TOS as you are never directly connecting to YouTube's servers. However, you do anonymously agree to YouTube's TOS if you decide to host a LibYTM instance as LibYTM proxies requests to YouTube's servers.

If you do not trust Mujay's official servers, you can selfhost Mujay on Cloudflare Pages (feel free to fork and change this in `svelte.config.js` if you do not want to use Cloudflare's infrastructure). You can also selfhost LibYTM on any server you choose provided that it has Python >3.10 and at least 1GB free. Change the URLs to point to your own servers by going into Mujay's settings.
