require("dotenv").config();
const express = require("express");
const cors = require("cors");

const dns = require("node:dns");
const session = require("express-session");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

//zajistí že můžu využít payload (form data), respektive req.body níže...nevím nerozumím tomu pořádně zatímpičo
app.use(express.urlencoded({ extended: true }));

// Populates req.session
app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "keyboard cat",
  })
);

app
  .post("/api/shorturl/", function (req, res, next) {
    req.session.test = req.body;

    let oldSend = res.send;
    res.send = function (data) {
      req.session.response = data;
      console.log(req.session.response);
      oldSend.apply(res, arguments);
    };

    const hostnameRegex = /(^https:\/\/|\/$)/g;
    const hostname = req.body.url.replace(hostnameRegex, "");

    const validUrlRegex =
      /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    const isValidUrl = validUrlRegex.test(req.body.url);

    const shortUrl = Math.floor(Math.random() * 1000);

    dns.lookup(hostname, function (err, adress, family) {
      if (err) console.log(err.code);
      console.log(adress, family);
    });

    if (isValidUrl) {
      res.json({
        original_url: req.body.url,
        short_url: shortUrl,
      });
    } else {
      res.json({
        error: "invalid url",
      });
    }
  })
  .get("/api/shorturl/:shorturlid", function (req, res, next) {
    const resSessiontoJSON = JSON.parse(req.session.response);
    console.log(resSessiontoJSON.short_url);
    console.log(req.params);
    if (parseInt(req.params.shorturlid) === resSessiontoJSON.short_url) {
      res.redirect(resSessiontoJSON.original_url);
    } else {
      res.send("NEPLATNÝ SHORT URL");
    }

    next();
  });

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
