export async function load({ url }) {
    let playlists = JSON.parse(localStorage.playlists || "[]");
    let plArr = []
    for (let i = 0; i < playlists.length; i++) {
        if (playlists[i].id.endsWith('-shuffled') || playlists[i].id.endsWith('-recommend')) {
            continue;
        }
        let cover = "/playlist.png";
        switch (playlists[i].id) {
            case "DL":
                cover = "/downloads.png";
                break;
            case "LM":
                cover = "/liked.png";
                break;
            default:
                break // default already defined
        }
    try {
        plArr.push({
            name: playlists[i].name,
            songLength: playlists[i].songs.length,
            cover,
            playUrl: `/listen?id=${playlists[i].songs[0].id}&plId=${playlists[i].id}`
        })
    } catch {
        // there's no songs
        plArr.push({
            name: playlists[i].name,
            songLength: playlists[i].songs.length,
            playUrl: `/playlist?l=${playlists[i].id}`,
            cover
        })
    }
    }
    return {plArr}
}
