import SpotifyWebApi from 'spotify-web-api-node';
import { tokenToString } from 'typescript';



export const playlistCleanup = (aToken: string, playlistId: string, snapshotId: string): Promise<{ind: number, tName: string}[]> => {
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI
    });
    spotifyApi.setAccessToken(aToken);
    let request1 = spotifyApi.getPlaylistTracks(playlistId);
   return request1.then(trackList => {
        if (trackList.statusCode !== 200) {
            console.log("Naw that ain't it cheif");
        }
        let tracksInfo = trackList.body.items.map(track => {
            return track.track.name + ' : ' + track.track.artists[0].name
        });
        let ghostArray: string[] = [];
        let indHolder: number[] = [];
        let retArray: {ind: number, tName: string}[] = [];
        for (let i = 0; i < tracksInfo.length; i++) {
            if (!ghostArray.includes(tracksInfo[i])) {
                ghostArray.push(tracksInfo[i]);
            } else {
                indHolder.push(i);
                retArray.push({ind: i, tName: tracksInfo[i]});
            }
        }
        if (indHolder.length > 0) {
            spotifyApi.removeTracksFromPlaylistByPosition(playlistId, indHolder, snapshotId);
        console.log(tracksInfo);
        console.log(indHolder);
        return retArray;
        }
        else return [];
    });
}