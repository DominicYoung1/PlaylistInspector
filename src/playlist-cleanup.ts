import SpotifyWebApi from 'spotify-web-api-node';
import { tokenToString } from 'typescript';



export const playlistCleanup = (aToken: string, playlistId: string, snapshotId: string): void => {
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI
    });
    spotifyApi.setAccessToken(aToken);
    let request1 = spotifyApi.getPlaylistTracks(playlistId);
    request1.then(trackList => {
        if (trackList.statusCode !== 200) {
            console.log("Naw that ain't it cheif");
        }
        let tracksInfo = trackList.body.items.map(track => {
            return track.track.name + ' : ' + track.track.artists[0].name
        });
        let ghostArray: string[] = [];
        let indHolder: number[] = [];
        for (let i = 0; i < tracksInfo.length; i++) {
            if (!ghostArray.includes(tracksInfo[i])) {
                ghostArray.push(tracksInfo[i]);
            } else indHolder.push(i);
        }
        spotifyApi.removeTracksFromPlaylistByPosition(playlistId, indHolder, snapshotId);
        console.log(tracksInfo);
        console.log(indHolder);
    });
}