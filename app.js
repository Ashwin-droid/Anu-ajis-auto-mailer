//imports
const env = require("dotenv").config();
const express = require("express");
const rh = require("./right-hand.js");
const TextCleaner = require("text-cleaner");
const app = express();

//body

var longStringOfInformation;

app.get("/autotrg/ifttt/auth/" + process.env.AUTH_KEY, (req, res) => {
  res.send("Action Started");
  var websiteContent;
  var quote;
  var extraordinaryBit = false;
  var extraordinarytitles = [];

  rh.buzzsprout.read((bd) => {
    websiteContent = bd;
    rh.QuoteRequest((qt) => {
      quote = qt;
      postfech();
    });
  }, process.env.API_KEY);

  function postfech() {
    var longStringOfInformation =
      "<!DOCTYPE html><html><head></head><body> <h1>Good Morning</h1><h2>Quote</h2> <br /> <strong><h3>" +
      quote +
      "<h3></strong> <br /> <h2>Stats</h2><h4>Total entries " +
      websiteContent.length +
      "</h4> <p>";
    // sort data based on highest value
    websiteContent.sort((a, b) => {
      if (a.total_plays > b.total_plays) {
        return -1;
      }
      if (a.total_plays < b.total_plays) {
        return 1;
      }
      return 0;
    });
    const highestValue = websiteContent[1].total_plays;
    const lowestValue = websiteContent[websiteContent.length - 1].total_plays;
    const fiveUnEqualDivisions = (highestValue - lowestValue) / 5;
    const first = fiveUnEqualDivisions - 50,
      second = fiveUnEqualDivisions * 2 - 50,
      third = fiveUnEqualDivisions * 3 - 50,
      forth = fiveUnEqualDivisions * 4 - 50;
    //filter data
    var htmlString;
    var total_plays = 0;
    var perf;
    var authors = [];
    rh.CheckForAuthors(websiteContent, (authorArray, extTitles, extbit) => {
      authors = authorArray;
      extraordinarytitles = extTitles;
      extraordinaryBit = extbit;
    });
    websiteContent.forEach((item, i) => {
      if (item.total_plays <= first) {
        perf = "&#128546;&#128557; (Lowest downloads)";
      } else if (item.total_plays <= second) {
        perf = "&#128532;&#128553; (Not doing well)";
      } else if (item.total_plays <= third) {
        perf = "&#128580;&#128530; (Ok)";
      } else if (item.total_plays <= forth) {
        perf = "&#9786;&#128077; (Very Good)";
      } else {
        perf = "&#128526;&#129315; (Extraordinary)";
      }
      if (typeof htmlString == "undefined") {
        htmlString =
          "Title: " +
          item.title +
          " ;  <a href=" +
          item.audio_url.toString() +
          "> Location</a> ;  Downloads: " +
          item.total_plays +
          "; Published date: " +
          item.published_at.split("T")[0] +
          "; Performance: " +
          "&#128526;&#9786;&#129315;&#128077; (Has no defination)" +
          "<br/><br/>";
      } else {
        htmlString =
          htmlString +
          "Title: " +
          item.title +
          " ;  <a href=" +
          item.audio_url.toString() +
          "> Location</a> ;  Downloads: " +
          item.total_plays +
          "; Published date: " +
          item.published_at.split("T")[0] +
          "; Performance: " +
          perf +
          "<br/><br/>";
      }
      total_plays = total_plays + item.total_plays;
    });
    authors.sort((a, b) => {
      if (a.downloads > b.downloads) {
        return -1;
      }
      if (a.downloads < b.downloads) {
        return 1;
      }
      return 0;
    });
    var preString =
      "<table><tr><td><h3>Author</h3></td><td><h3>Views</h3></td><td style='padding:10px'><h3>Entries</h3></td></tr>";
    var ExtraOrdinaryHtml;
    if (extraordinaryBit) {
      ExtraOrdinaryHtml = "<h1>Some Code-Breaking ExtraOrdinary Titles</h1>";
      extraordinarytitles.forEach((item, i) => {
        var id = i + 1;
        ExtraOrdinaryHtml =
          ExtraOrdinaryHtml +
          "<h2>Title no " +
          id +
          ", Title " +
          item.title +
          "</h2>";
        rh.email(ExtraOrdinaryHtml);
      });
    }
    authors.forEach((item, i) => {
      preString =
        preString +
        "<tr><td style='padding:10px'>" +
        item.author +
        "</td><td>" +
        item.downloads.toString() +
        "</td><td style='padding:10px'>" +
        item.entries +
        "</td></tr>";
    });
    preString = preString + "<table>";
    longStringOfInformation =
      longStringOfInformation +
      preString +
      "</p><h3><strong>Total plays on all podcasts " +
      total_plays +
      "</strong><h3>" +
      htmlString +
      '<a href="https://anu-aji-automailer.herokuapp.com/tools/validity"><p>Administration</p></a></body></html>';
    rh.email(longStringOfInformation);
  }
});

app.get("/split/mailer/" + process.env.AUTH_KEY, (req, res) => {
  rh.buzzsprout.read(postdone, process.env.API_KEY);
  function postdone(data) {
    var authors = [];
    var extraordinaryBit = false;
    rh.CheckForAuthors(data, (authorArray, _extTitles, extbit) => {
      authors = authorArray;
      extraordinaryBit = extbit;
    });
    data.sort((a, b) => {
      if (a.total_plays > b.total_plays) {
        return -1;
      }
      if (a.total_plays < b.total_plays) {
        return 1;
      }
      return 0;
    });
    authors.sort((a, b) => {
      if (a.downloads > b.downloads) {
        return -1;
      }
      if (a.downloads < b.downloads) {
        return 1;
      }
      return 0;
    });
    if (extraordinaryBit) {
      res.send(
        "<h1>You have extraordinary titles, please re-request the daily mail and fix the extraordinary titles to proceed</h1>"
      );
    } else {
      res.send("Action Started");
      var author;
      var total_plays;
      var htmlString = "";
      authors.forEach((item, i) => {
        total_plays = 0;
        htmlString = "";
        longStringOfInformation = "";
        author = item.author;
        longStringOfInformation = "<!DOCTYPE html><html><head></head><body><h1>Good morning, " + author + "</h1><br/><br/>";
        data.forEach((uslessInfo, i) => {
          if (author == TextCleaner(uslessInfo.title.split("(")[1]).remove(")").trim().valueOf()) {
            total_plays = total_plays + uslessInfo.total_plays;
            htmlString = htmlString + "<h3>Title : " + uslessInfo.title + "<a href=" + uslessInfo.audio_url.toString() + "> Location</a> ;  Downloads: " + uslessInfo.total_plays + "; Published date: " + uslessInfo.published_at.split("T")[0] + "<br/></h3>";
          }
        });
        var preString = "<table><tr><td><h3>Author</h3></td><td><h3>Views</h3></td><td style='padding:10px'><h3>Entries</h3></td></tr>";
        authors.forEach((item, i) => {
          preString =
            preString +
            "<tr><td style='padding:10px'>" +
            item.author +
            "</td><td>" +
            item.downloads.toString() +
            "</td><td style='padding:10px'>" +
            item.entries +
            "</td></tr>";
        });
        preString = preString + "<table>";
        longStringOfInformation = longStringOfInformation + "<h2>Total plays on all your podcasts " + total_plays + "</h2>" + htmlString + preString;
        rh.email(longStringOfInformation);
      });
    }
  }

});

app.use(express.urlencoded({ extended: true }));
app.get("/tools/validity", (req, res) => {
  res.send(
    '<!DOCTYPE html><html lang="en" dir="ltr"> <head> <meta charset="utf-8"><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous"> </head> <body> <form action="/tools/validity" method="post"> <div class="position-absolute top-50 start-50 translate-middle"> <div class="encoder"> <div class="input-group flex-nowrap margin-10"> <span class="input-group-text" id="addon-wrapping01">Password</span> <input name="password" type="password" id="inputPassword6" class="form-control" aria-describedby="passwordHelpInline"> <button type="submit" class="btn btn-outline-success" id="submit">Submit</button> </div></div></div></form> </body></html>'
  );
});

app.post("/tools/validity", (req, res) => {
  var password = req.body.password;
  if (password == process.env.PASSWORD) {
    res.redirect("/administration/tools/?key=" + process.env.AUTH_KEY2);
  } else {
    res.send("<h1>Incorrect Password</h1>");
  }
});

app.get("/administration/tools/", (req, res) => {
  const key = req.query.key;
  if (key == process.env.AUTH_KEY2) {
    longStringOfInformation =
      '<!DOCTYPE html><html><head><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-F3w7mX95PdgyTmZZMECAngseQB83DfGTowi0iMjiWaeVhAn4FJkqJByhZMI3AhiU" crossorigin="anonymous"></head><body><div class="d-flex align-items-center justify-content-center"><h1 class="display-1">Admin tools</h1></div><form action="/admin/handler" method="post"><div style="padding: 100px" class="list-group">';
    var administrationTools = [
      {
        url: "/admin/handler?param=dmail&auth=" + process.env.AUTH_KEY2 + "&",
        text: "Re-Request Daily Mail",
      },{
        url: "/admin/handler?param=smail&auth=" + process.env.AUTH_KEY2 + "&",
        text: "Request A split mail"
      }
    ];
    administrationTools.forEach((item) => {
      longStringOfInformation =
        longStringOfInformation +
        '<button formaction="' +
        item.url +
        'type="submit" class="list-group-item list-group-item-action">' +
        item.text +
        "</button>";
    });
    res.send(longStringOfInformation);
  } else {
    res.send("<h1>Incorrect key value</h1>");
  }
});

app.post("/admin/handler", (req, res) => {
  const auth = req.query.auth;
  if (auth == process.env.AUTH_KEY2) {
    const target = req.query.param;
    if (target == "dmail") {
      res.redirect("/autotrg/ifttt/auth/" + process.env.AUTH_KEY);
    } else if (target == "smail") {
      res.redirect("/split/mailer/" + process.env.AUTH_KEY);
    } else {
      res.send("<h1>Failure</h1>");
    }
  } else {
    res.send("<h1>Incorrect key</h1>");
  }
});

var port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("app is listening on port " + port);
});
