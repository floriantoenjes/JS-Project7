"use strict";

const config = require("./config");
const Twit = require("twit");
const Twitter = new Twit(config);

function getTwitterData(model) {
    const promises = [];

    promises.push(new Promise(function (resolve, reject) {
        getSettings(model, resolve);
    }));

    promises.push(new Promise(function (resolve, reject) {
        getStatuses(model, resolve);
    }));

    promises.push(new Promise(function (resolve, reject) {
        getFriends(model, resolve);
    }));

    promises.push(new Promise(function (resolve, reject) {
        getMessages(model, resolve);
    }));

    return promises;
}

function getSettings(model, resolve) {
    Twitter.get('account/settings', {}, function (err, data, response) {
        model.screen_name = data.screen_name;

        Twitter.get('users/show', {
            screen_name: model.screen_name
        }, function (err, data, response) {
            model.profile_image = data.profile_image_url_https;
            resolve(true);
        });

    });
}

function getStatuses(model,resolve) {
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
}

function getFriends(model, resolve) {
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
}

function getMessages(model, resolve) {
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
}

module.exports.getTwitterData = getTwitterData;
module.exports.getSettings = getSettings;
module.exports.getStatuses = getStatuses;
module.exports.getFriends = getFriends;
module.exports.getMessages = getMessages;
