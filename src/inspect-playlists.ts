import SpotifyWebApi from 'spotify-web-api-node';


export const runInspectPlaylists = (token: string, refresh_token: string) => {

}

export const generatePlaylists = (token: string, refresh_token: string): Promise<{name: string, id: string}[]> => {
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri:  process.env.REDIRECT_URI
      });
      spotifyApi.setAccessToken(token);
      spotifyApi.setRefreshToken(refresh_token);
      //WE HAVE ENTERED THE PROMISED LAND
     return spotifyApi.getUserPlaylists()
        .then(response => {
            //console.log(response.body.items)
            let playlistNames = response.body.items.map(item => ({name: item.name, id: item.id + " " + item.snapshot_id}));
            console.log(playlistNames);
            return playlistNames;
        });
}


// HTML/CSS/JS FOR USER SELECTION OF PLAYLIST/ HOW TO PRESENT FINDINGS.