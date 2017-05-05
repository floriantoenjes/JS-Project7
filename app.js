"use strict";

var express = require("express");
var Twit = require('twit');

var T = new Twit({
  consumer_key:         '8UUeuzOs7mpca2Bg00z5w4J1g',
  consumer_secret:      'QRXjPkSkAMfIcnYxeOKz3mEz90UjDYWlT8WeNUaCCpKl5hl14B',
  access_token:         '860160567713157120-oIYFBRFLD6SfgSQnHeB42LHiIrgz4xg',
  access_token_secret:  'fMiaBA7cSTSnHVwBdcf0KntcNt6izyyi7co9zRyHQTgYx',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

var app = express();

app.use('/static', express.static(__dirname + '/public'));

app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');

app.get("/", function(req, res) {

    const promises = [];
    const model = {};

    promises.push(new Promise(function (resolve, reject) {
        T.get('statuses/user_timeline', {count: 5}, function(err, data, response) {
            const statuses = [];

            for (let status of data) {
                const statusObject = {
                    text: status.text,
                    retweet_count: status.retweet_count,
                    favorite_count: status.favorite_count,
                    created_at: status.created_at
                };

                statuses.push(statusObject);

//                console.log(status.text);
//                console.log(status.retweet_count);
//                console.log(status.favorite_count);
//                console.log(status.created_at);
            }

            model.statuses = statuses;

            resolve(true);
        });
    }));

    promises.push(new Promise(function (resolve, reject) {
        T.get('friends/list', {count: 5}, function(err, data, response) {
            const friends = []

            if (data.users === undefined) {
                console.log("Friends undefined");

                model.friends = {};
                resolve(true);
                return;
            }

            for (let friend of data.users) {
                const friendsObject = {
                    name: friend.name,
                    profile_image: friend.profile_image_url_https
                };

                friends.push(friendsObject);

                console.log(friend.name);
                console.log(friend.profile_image_url_https);
            }

            model.friends = friends;

            resolve(true);
        });
    }));

    promises.push(new Promise(function (resolve, reject) {
        T.get('direct_messages', {count: 5}, function(err, data, response) {

            for (let message of data) {
                console.log(message.text);
                console.log(message.created_at);
            }

            model.messages = data;

            resolve(true);
        });
    }));

    Promise.all(promises).then(function () {
//        console.log(model);
        res.render("index", model);
    });

});

app.listen(3000, function() {
	console.log("The frontend server is running on port 3000!");
});
