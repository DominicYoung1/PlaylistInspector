/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

import express from 'express';
import cors from 'cors';
import * as querystring from 'querystring';
import cookieParser from 'cookie-parser';
import request from 'request';
import {generatePlaylists} from './inspect-playlists';
import mustache from 'mustache-express';
import { playlistCleanup } from './playlist-cleanup';
 
 
 var client_id = process.env.CLIENT_ID; // Your client id
 var client_secret = process.env.CLIENT_SECRET; // Your secret
 var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri
 
//  console.log("ID of ", process.env)
 
 /**
  * Generates a random string containing numbers and letters
  * @param  {number} length The length of the string
  * @return {string} The generated string
  */
 const generateRandomString = (length: number): string => {
   var text = '';
   var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
   for (var i = 0; i < length; i++) {
     text += possible.charAt(Math.floor(Math.random() * possible.length));
   }
   return text;
 };
 
 var stateKey = 'spotify_auth_state';
 
 var app = express();
 app.engine('html', mustache());
 app.set('view engine', 'html');
 app.set('views', __dirname + '/../templates');
 
 app.use(express.static(__dirname + '/../public'))
    .use(cors())
    .use(cookieParser())
    .use(express.urlencoded({extended: true}));
 
 app.get('/login', (req: any, res: any) => {
 
   var state = generateRandomString(16);
   res.cookie(stateKey, state);
 
   // your application requests authorization
   var scope = 'user-read-private user-read-email playlist-modify-public';
   res.redirect('https://accounts.spotify.com/authorize?' +
     querystring.stringify({
       response_type: 'code',
       client_id: client_id,
       scope: scope,
       redirect_uri: redirect_uri,
       state: state
     }));
 });
 
 app.get('/callback', (req: any, res: any)  => {
 
   // your application requests refresh and access tokens
   // after checking the state parameter
 
   var code = req.query.code || null;
   var state = req.query.state || null;
   var storedState = req.cookies ? req.cookies[stateKey] : null;
 
   if (state === null || state !== storedState) {
     res.redirect('/#' +
       querystring.stringify({
         error: 'state_mismatch'
       }));
   } else {
     res.clearCookie(stateKey);
     var authOptions = {
       url: 'https://accounts.spotify.com/api/token',
       form: {
         code: code,
         redirect_uri: redirect_uri,
         grant_type: 'authorization_code'
       },
       headers: {
         'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
       },
       json: true
     };
 
     request.post(authOptions, (error: any, response: any, body: any) => {
       if (!error && response.statusCode === 200) {
 
         var access_token = body.access_token,
             refresh_token = body.refresh_token;
             const myPlaylists = generatePlaylists(access_token, refresh_token);
             myPlaylists.then(playlists=> {
              res.render('select-playlist', {Example: 'Highway to the danger zone', playlists: playlists, access_token: access_token});
             });
         // we can also pass the token to the browser to make requests from there
       } else {
         res.redirect('/#' +
           querystring.stringify({
             error: 'invalid_token'
           }));
       }
     });
   }
 });
 app.post('/clean-playlist', (req: any, res: any)  => {
  const auth = req.body.auth;
  const playlist = req.body.playlist;
  console.log(auth, playlist);
  let cells = playlist.split(' ');
  playlistCleanup(auth, cells[0], cells[1]);
 })
 
 
 console.log('Listening on 8888');
 app.listen(8888);
 