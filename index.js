require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("node:dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//zajistí že můžu využít payload (form data), respektive req.body níže...nevím nerozumím tomu pořádně zatímpičo
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
});
let Url = mongoose.model("Url", urlSchema);

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/", function (req, res) {
  const saveUrlToDatabase = () => {
    let url = new Url({
      originalUrl: req.body.url,
      shortUrl: shortUrl,
    });

    url.save((error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log(data);
      }
    });
  };

  const hostnameRegex = /(^https:\/\/|\/$)/g;
  const hostname = req.body.url.replace(hostnameRegex, "");

  const validUrlRegex =
    /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  const isValidUrl = validUrlRegex.test(req.body.url);

  const shortUrl = Math.floor(Math.random() * 1000);

  dns.lookup(hostname, function (err, adress, family) {
    if (err) console.log(err.code);
    console.log(adress, family);
  });

  if (isValidUrl) {
    saveUrlToDatabase();

    res.json({
      original_url: req.body.url,
      short_url: shortUrl,
    });
  } else {
    res.json({
      error: "invalid url",
    });
  }
});

app.get("/api/shorturl/:shorturlid", function (req, res) {
  Url.find(
    {
      shortUrl: req.params.shorturlid,
    },
    (err, doc) => {
      if (err) {
        console.log(err);
        res.send("NENENENE");
      } else {
        if (doc.length == 0) {
          res.send("CHYBNÁ SHORT URL");
        } else {
          res.json(doc);
        }
      }
    }
  );
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
