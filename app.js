"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const Twitter = require("./twitter");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(__dirname + '/public'));

app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');


app.get("/", function (req, res) {
    const model = {};
    const promises = Twitter.getTwitterData(model);
    Promise.all(promises).then(function () {
        res.render("index", model);
    });

});

app.post("/", function (req, res) {
    if (req.body.text.trim().length > 0) {
        Twitter.post('statuses/update', {
            status: req.body.text
        }, function (err, data, response) {
            res.redirect("/");
        });
    }
    res.redirect("/");

});

app.listen(3000, function () {
    console.log("The frontend server is running on port 3000!");
});


