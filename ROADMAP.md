in no order at all...

- [x] move to ytm due to deezer api update
- [x] ambient background
- - [x] ambient mode switch in settings
- [x] improve ux by using URL search params instead of `$page` as `$page.url.searchParams` does not change on `goto()`
- [x] add share functionality with Open Graph metadata
- [x] synced lyrics (via lrclib, already fetch static lyrics)
- - [x] "light up" lyric lines on it's timestamp
- [x] tv and/or landscape mode that:
- - [x] rearranges the UI to use more horizontal screen space
- - [ ] maybe automatically enables ambient mode
- - - [ ] setting to force ambient mode to be off if implemented
- [x] mobile app using capacitor
- [ ] cut down on loading times by buffering some songs ahead of time (eg. buffer 2-3 songs into indexeddb)
- [ ] improve ux by persisting playback outside of the listen page (hardest one)
- [ ] add a loading thingy when changing search results as the yt api is slow
- [ ] show queue
- [ ] speed up fetching metadata (idk how i will be able to do this because the youtube music api is just slow)
- [ ] fix the import functionality (needs to be ported over to libytm, then we can finally remove the `spotify.ts` file and remove the pootify url field in the settings)
- [ ] add importers or importer userscripts like tidal and ytm so i can actually use this goddamn app
- [ ] export data to file along with import
- [ ] add songs to playlists besides liked
- [ ] manage downloads (desktop/mobile app only)
- [ ] refactor some parts of the ui
- [ ] prettier readme
- [ ] importing albums, songs, and/or playlists from local file would be nice
- [ ] artist pages, album pages
- [ ] proper homepage
- [x] lost my sanity
