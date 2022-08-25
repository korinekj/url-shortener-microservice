require("dotenv").config();
const express = require("express");
const cors = require("cors");

const dns = require("node:dns");

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

app.post(
  "/api/shorturl/",
  function (req, res, next) {
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

    let oldSend = res.send;
    res.send = function (data) {
      console.log(data);
      oldSend.apply(res, arguments);
    };

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
    next();
  },
  function (req, res) {
    console.log(req.data);
  }
);

// app.get("/api/shorturl/:shorturlid", function (req, res) {
//   console.log(req.json);
//   res.json({
//     NEVIMPICE: "Test",
//   });
// });

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
