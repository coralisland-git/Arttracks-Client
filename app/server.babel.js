import path from 'path';
import sslRedirect from 'heroku-ssl-redirect';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import request from 'request';
import crypto from 'crypto';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';
import { stringify } from 'querystring';

import passport from 'passport';
import {Strategy as FacebookStrategy} from 'passport-facebook';
import {Strategy as YoutubeV3Strategy} from 'passport-youtube-v3';
import {Strategy as SoundCloudStrategy} from 'passport-soundcloud';

import { SERVER_URL, FACEBOOK_APPID, FACEBOOK_API_SECRET, YOUTUBE_APP_ID, YOUTUBE_APP_SECRET, SC_CLIENT_ID, SC_CLIENT_SECRET, CRYPTO_DOWNLOAD_SECRET, CRYPTO_DOWNLOAD_ALGO } from './src/constants';
import * as StripeCtrl from './src/server/stripe-control';

import routes from './src/routes';
import {
  setupReducers,
  renderHTMLString,
} from '@sketchpixy/rubix/lib/node/redux-router';
import RubixAssetMiddleware from '@sketchpixy/rubix/lib/node/RubixAssetMiddleware';

import reducers from './src/redux/reducers';
setupReducers(reducers);

const port = process.env.PORT || 8080;

let app = express();

// enable ssl redirect
//app.use(sslRedirect());

app.use(compression());
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/stripe/customer/:customerId', StripeCtrl.getCustomer);
app.post('/stripe/customer', StripeCtrl.createCustomer);
app.post('/stripe/subscribe', StripeCtrl.updateSubscribe);
app.post('/stripe/payment', StripeCtrl.createPayment);
app.post('/stripe/card', StripeCtrl.createCard);
app.patch('/stripe/card', StripeCtrl.makeDefaultCard);
app.delete('/stripe/card/:customerId/:cardId', StripeCtrl.deleteCard);
app.get('/stripe/invoices/:customerId', StripeCtrl.getInvoices);
app.get('/stripe/payments/:customerId', StripeCtrl.getPayments);

// Force download of files via browser downloads
app.get('/download/:file/:filename', (req, res) => {
  const { file, filename } = req.params;
  
  // Set secret key and algorithm
  var algorithm = CRYPTO_DOWNLOAD_ALGO;
  var secret = CRYPTO_DOWNLOAD_SECRET;
  
  // Create decipher
  var decipher = crypto.createDecipher(algorithm, secret);

  // Finalize encrypted url
  var decrypted_url = decipher.update(file, 'hex', 'utf8');
  decrypted_url += decipher.final('utf8');
  
  // Get file extension
  var file_ext = decrypted_url.substring(decrypted_url.lastIndexOf('.') + 1)

  // Build final filename
  var final_filename = filename + "." + file_ext;

  // Set header
  res.set(
    'Content-Disposition',
    'attachment; filename=' + final_filename
  );

  request(decrypted_url).pipe(res);

});


function renderHTML(req, res) {
  renderHTMLString(routes, req, (error, redirectLocation, data) => {
    if (error) {
      if (error.message === 'Not found') {
        res.status(404).send(error.message);
      } else {
        res.status(500).send(error.message);
      }
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else {
      if(req.user) {
        data.data.provider.connectedUser = req.user;
      }
      res.render('index', {
        content: data.content,
        data: JSON.stringify(data.data).replace(/\//g, '\\/')
      });
    }
  });
}

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APPID,
    clientSecret: FACEBOOK_API_SECRET,
    callbackURL: SERVER_URL + 'settings/connected-accounts/facebook/return',
    profileFields: ['id', 'displayName', 'photos']
  },
  function (accessToken, refreshToken, profile, done) {
    let user = {
      'provider': 'facebook',
      'id': profile.id,
      'username': profile.username,
      'displayName': profile.displayName,
      'photo': profile.photos && profile.photos.length? profile.photos[0].value: null
    };
    if(refreshToken) {
      user.accessToken = refreshToken.access_token;
      user.expires = refreshToken.expires;
    }
    else if(accessToken) {
      user.accessToken = accessToken;
    }

    done(null, user);
  }
));

passport.use(new YoutubeV3Strategy({
    clientID: YOUTUBE_APP_ID,
    clientSecret: YOUTUBE_APP_SECRET,
    callbackURL: SERVER_URL + 'settings/connected-accounts/youtube/return',
    accessType: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube.upload'],
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(accessToken);
    console.log(refreshToken);
    let user = {
      'provider': 'youtube',
      'id': profile.id,
      'displayName': profile.displayName,
      'accessToken': accessToken,
      'refreshToken': refreshToken,
      'photo': profile._json.items[0].snippet.thumbnails.default.url
    };
    done(null, user);
  }
));

app.get('/refreshToken/youtube', (req, res) => {
  const { token } = req.query;
  const data = {
    client_id: YOUTUBE_APP_ID,
    client_secret: YOUTUBE_APP_SECRET,
    refresh_token: token,
    grant_type: 'refresh_token',
  };

  if(token) {
    axios.post('https://www.googleapis.com/oauth2/v4/token', stringify(data))
    .then((response) => {
      res.status(200).send(response.data);
    })
    .catch((error) => {
      console.log(error.response.data);
      res.status(500).json('Internal server error!');
    })
  }
  else {
    res.status(400).json("You must provide token");
  }
});

passport.use(new SoundCloudStrategy({
    clientID: SC_CLIENT_ID,
    clientSecret: SC_CLIENT_SECRET,
    callbackURL: SERVER_URL + 'settings/connected-accounts/soundcloud/return'
  },
  function(accessToken, refreshToken, profile, done) {
    let user = Object.assign({}, profile, {'accessToken': accessToken, 'provider': 'soundcloud'});
    done(null, user);
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/connect/facebook', passport.authenticate('facebook'));
app.get('/settings/connected-accounts/facebook/return',
  passport.authenticate('facebook', {failureRedirect: SERVER_URL + 'settings/connected-accounts/facebook/failed'}),
  RubixAssetMiddleware('ltr'),
  function(req, res) {
    renderHTML(req, res);
  }
);

app.get('/connect/soundcloud', passport.authenticate('soundcloud'));
app.get('/settings/connected-accounts/soundcloud/return',
  passport.authenticate('soundcloud', {failureRedirect: SERVER_URL + 'settings/connected-accounts/soundcloud/failed'}),
  RubixAssetMiddleware('ltr'),
  function(req, res) {
    renderHTML(req, res);
  }
);

app.get('/connect/youtube', passport.authenticate('youtube'));
app.get('/settings/connected-accounts/youtube/return',
  passport.authenticate('youtube', {failureRedirect: SERVER_URL + 'settings/connected-accounts/youtube/failed'}),
  RubixAssetMiddleware('ltr'),
  function (req, res) {
    renderHTML(req, res);
  }
);

app.get('*', RubixAssetMiddleware('ltr'), (req, res, next) => {
  renderHTML(req, res);
});

app.listen(port, () => {
  console.log(`Node.js app is running at http://localhost:${port}/`);
});
