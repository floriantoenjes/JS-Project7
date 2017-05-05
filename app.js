"use strict";

var express = require("express");
var Twit = require("twit");

var twitterConfig = require("./config");

var Twitter = new Twit(twitterConfig);

var app = express();

app.use('/static', express.static(__dirname + '/public'));

app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');

app.get("/", function(req, res) {

    const promises = [];
    const model = {
        screen_name: "Florian_Tnjes"
    };

    promises.push(new Promise(function (resolve, reject) {
        Twitter.get('statuses/user_timeline', {count: 5}, function(err, data, response) {
            const statuses = [];

            for (let status of data) {
                const statusObject = {
                    text: status.text,
                    retweet_count: status.retweet_count,
                    favorite_count: status.favorite_count,
                    created_at: status.created_at,
                    username: status.user.name,
                    screen_name: status.user.screen_name,
                    profile_image: status.user.profile_image_url_https
                };

                statuses.push(statusObject);
            }

            model.statuses = statuses;

            resolve(true);
        });
    }));

    promises.push(new Promise(function (resolve, reject) {
        Twitter.get('friends/list', {count: 5}, function(err, data, response) {
            const friends = []

            if (data.users === undefined) {
                console.log("Friends undefined");

                model.friends = {};
                resolve(true);
                return;
            }

            for (let friend of data.users) {
                const friendObject = {
                    name: friend.name,
                    screen_name: friend.screen_name,
                    profile_image: friend.profile_image_url_https
                };

                friends.push(friendObject);
            }

            model.friends = friends;

            resolve(true);
        });
    }));

    promises.push(new Promise(function (resolve, reject) {
        Twitter.get('direct_messages', {count: 5}, function(err, data, response) {
            const messages = [];

            for (let message of data) {
                const messageObject = {
                    text: message.text,
                    created_at: message.created_at,
                    sender: message.sender.name,
                    profile_image: message.sender.profile_image_url_https
                };

                messages.push(messageObject);
            }

            model.messages = messages;

            resolve(true);
        });
    }));

    Promise.all(promises).then(function () {
        res.render("index", model);
    });

});

app.listen(3000, function() {
	console.log("The frontend server is running on port 3000!");
});
