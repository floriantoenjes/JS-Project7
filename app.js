"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var config = require("./config");

var Twit = require("twit");
var Twitter = new Twit(config);

var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/static', express.static(__dirname + '/public'));

app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');

app.get("/", function (req, res) {

    const promises = [];
    const model = {};

    promises.push(new Promise(function (resolve, reject) {
        Twitter.get('account/settings', {}, function (err, data, response) {
            model.screen_name = data.screen_name;

            Twitter.get('users/show', {screen_name: model.screen_name}, function (err, data, response) {
                model.profile_image = data.profile_image_url_https;
                resolve(true);
            });
        });
    }));

    promises.push(new Promise(function (resolve, reject) {
        Twitter.get('statuses/user_timeline', {
            count: 5
        }, function (err, data, response) {
            const statuses = [];
            for (let status of data) {

                const statusObject = {
                    created_at: status.created_at,
                    favorite_count: status.favorite_count,
                    profile_image: status.user.profile_image_url_https,
                    retweet_count: status.retweet_count,
                    screen_name: status.user.screen_name,
                    text: status.text,
                    username: status.user.name
                };

                statuses.push(statusObject);
            }

            model.statuses = statuses;

            resolve(true);
        });
    }));

    promises.push(new Promise(function (resolve, reject) {
        Twitter.get('friends/list', {
            count: 5
        }, function (err, data, response) {
            const friends = []
            for (let friend of(data.users || [])) {

                const friendObject = {
                    name: friend.name,
                    profile_image: friend.profile_image_url_https,
                    screen_name: friend.screen_name
                };

                friends.push(friendObject);
            }

            model.friends = friends;

            resolve(true);
        });
    }));

    promises.push(new Promise(function (resolve, reject) {
        Twitter.get('direct_messages', {
            count: 5
        }, function (err, data, response) {
            const messages = [];
            for (let message of data) {

                const messageObject = {
                    created_at: message.created_at,
                    profile_image: message.sender.profile_image_url_https,
                    sender: message.sender.name,
                    text: message.text
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

app.post("/", function (req, res) {
    Twitter.post('statuses/update', {
        status: req.body.text
    }, function (err, data, response) {
        res.redirect("/");
    });

});

app.listen(3000, function () {
    console.log("The frontend server is running on port 3000!");
});
