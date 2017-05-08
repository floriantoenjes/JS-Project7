"use strict";

const config = require("./config"),
      Twit = require("twit");

const Twitter = new Twit(config);

function collectTwitterData(object, next, callback) {
    const promises = [];

    promises.push(new Promise(addSettings));
    promises.push(new Promise(addStatuses));
    promises.push(new Promise(addFriends));
    promises.push(new Promise(addMessages));

    Promise.all(promises).then(
        function (results) {
            mergeResults(object, results);
            callback();
        }).catch(next);
}

function mergeResults(object, results) {
    for (let result of results) {
        for (let key in result) {
            object[key] = result[key];
        }
    }
}

function addSettings(resolve, reject) {
    Twitter.get('account/settings', {}, function (err, data, response) {
        if (err) {
            reject(err);
        }

        const object = {screen_name: data.screen_name};

        Twitter.get('users/show', {
            screen_name: object.screen_name
        }, function (err, data, response) {
            object.profile_image = data.profile_image_url_https;
            resolve(object);
        });
    });
}

function addStatuses(resolve, reject) {
    Twitter.get('statuses/user_timeline', {count: 5}, function (err, data, response) {
        if (err) {
            reject(err);
        }

        const object = {};
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

        object.statuses = statuses;

        resolve(object);
    });
}

function addFriends(resolve, reject) {
    Twitter.get('friends/list', {count: 5}, function (err, data, response) {
        if (err) {
            reject(err);
        }

        const object = {};
        const friends = []

        for (let friend of(data.users || [])) {
            const friendObject = {
                name: friend.name,
                profile_image: friend.profile_image_url_https,
                screen_name: friend.screen_name
            };
            friends.push(friendObject);
        }

        object.friends = friends;

        resolve(object);
    });
}

function addMessages(resolve, reject) {
    Twitter.get('direct_messages', {count: 5}, function (err, data, response) {
        if (err) {
            reject(err);
        }

        const object = {};
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

        object.messages = messages;

        resolve(object);
    });
}

function sendTweet(text, next, callback) {
    if (text.trim().length > 0) {
        Twitter.post('statuses/update', {status: text}, function (err, data, response) {
            if (err) {
                next(err);
                return;
            }

            callback();
        });
    } else {
        callback();
    }
}

module.exports.collectTwitterData = collectTwitterData;
module.exports.sendTweet = sendTweet;
