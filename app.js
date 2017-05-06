"use strict";

const express = require("express"),
    bodyParser = require("body-parser"),
    Twitter = require("./twitter");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/static', express.static(__dirname + '/public'));

app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');


app.get("/", function (req, res, next) {
    const model = {};

    Twitter.collectTwitterData(model, next, function () {
        res.render("index", model);
    });

});

app.post("/", function (req, res, next) {
    Twitter.sendTweet(req.body.text, next, function () {
        res.redirect("/");
    });
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render("error", {
        message: err.message,
        stack: err.stack
    });
});

app.listen(3000, function () {
    console.log("The frontend server is running on port 3000!");
});
