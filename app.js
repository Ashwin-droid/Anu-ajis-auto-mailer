//imports
const env = require("dotenv").config();
const express = require("express");
const rh = require("./right-hand.js");
const TextCleaner = require('text-cleaner');
const app = express();

//body

var longStringOfInformation;

app.get("/autotrg/ifttt/auth/" + process.env.AUTH_KEY, (req, res) => {
  res.send("Action Started");
  var websiteContent;
  var quote;

  rh.buzzsprout.read((bd) => {
    websiteContent = bd;
    rh.QuoteRequest((qt) => {
      quote = qt;
      postfech()
    });
  }, process.env.API_KEY);

  function postfech() {
    var longStringOfInformation = "<!DOCTYPE html><html><head></head><body> <h1>Good Morning</h1><h2>Quote</h2> <br /> <strong><h3>" + quote + "<h3></strong> <br /> <h2>Stats</h2><h4>Total entries " + websiteContent.length + "</h4> <p>";
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
    const lowestValue = websiteContent[(websiteContent.length - 1)].total_plays;
    const fiveUnEqualDivisions = ((highestValue - lowestValue) / 5);
    const first = (fiveUnEqualDivisions - 50),
      second = (fiveUnEqualDivisions * 2 - 50),
      third = (fiveUnEqualDivisions * 3 - 50),
      forth = (fiveUnEqualDivisions * 4 - 50);
    //filter data
    var htmlString;
    var total_plays = 0;
    const arrayLength = websiteContent.length;
    var perf;
    var authors = [];
    websiteContent.forEach((item, i) => {
      if (typeof item.title.split("(")[1] == 'undefined') {
        authors.push({
          "title": item.title,
          "extraordinaryBit": true,
          "downloads": item.total_plays
        });
      } else {
        var author1 = TextCleaner(item.title.split("(")[1]).remove(')').trim().valueOf();
        if (author1 == "") {
          authors.push({
            "title": item.title,
            "extraordinaryBit": true,
            "downloads": item.total_plays
          });
        } else if (typeof authors.find(({
            author
          }) => author == author1) == 'undefined') {
          authors.push({
            "author": author1,
            "extraordinaryBit": false,
            "downloads": item.total_plays,
            "entries": 1
          });
        } else {
          rh.GetArrayindexs(authors, "author", author1, (array, indexes) => {
            indexes.forEach((Index) => {
              array[Index].downloads = authors[Index].downloads + item.total_plays;
              array[Index].entries = authors[Index].entries + 1;
            });
          });
        }
      }
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
        htmlString = "Title: " + item.title + " ;  <a href=" + item.audio_url.toString() + "> Location</a> ;  Downloads: " + item.total_plays + "; Published date: " + item.published_at.split("T")[0] + "; Performance: " + "&#128526;&#9786;&#129315;&#128077; (Has no defination)" + "<br/><br/>";
      } else {
        htmlString = htmlString + "Title: " + item.title + " ;  <a href=" + item.audio_url.toString() + "> Location</a> ;  Downloads: " + item.total_plays + "; Published date: " + item.published_at.split("T")[0] + "; Performance: " + perf + "<br/><br/>";
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
    var preString = "<table><tr><td><h3>Author</h3></td><td><h3>Views</h3></td><td style='padding:10px'><h3>Entries</h3></td></tr>";
    authors.forEach((item, i) => {
      preString = preString + "<tr><td style='padding:10px'>" + item.author + "</td><td>" + item.downloads.toString() + "</td><td style='padding:10px'>" + item.entries + "</td></tr>";
    });
    preString = preString + "<table>";
    longStringOfInformation = longStringOfInformation + preString + "</p><h3><strong>Total plays on all podcasts " + total_plays + "</strong><h3>" + htmlString + '<a href="https://anu-aji-automailer.herokuapp.com/tools/validity"><p>Administration</p></a></body></html>';
    rh.email(longStringOfInformation);
  }
});
app.use(express.urlencoded( {extended: true} ));
app.get("/tools/validity", (req, res) => {
  res.send('<!DOCTYPE html><html lang="en" dir="ltr"> <head> <meta charset="utf-8"> <style>.btn{background: #0099ff; background-image: -webkit-linear-gradient(top, #0099ff, #00ff26); background-image: -moz-linear-gradient(top, #0099ff, #00ff26); background-image: -ms-linear-gradient(top, #0099ff, #00ff26); background-image: -o-linear-gradient(top, #0099ff, #00ff26); background-image: linear-gradient(to bottom, #0099ff, #00ff26); -webkit-border-radius: 11; -moz-border-radius: 11; border-radius: 11px; text-shadow: 1px 1px 3px #666666; font-family: Arial; color: #ffffff; font-size: 20px; padding: 10px 20px 10px 20px; text-decoration: none;}.btn:hover{background: #60acdb; background-image: -webkit-linear-gradient(top, #60acdb, #88d971); background-image: -moz-linear-gradient(top, #60acdb, #88d971); background-image: -ms-linear-gradient(top, #60acdb, #88d971); background-image: -o-linear-gradient(top, #60acdb, #88d971); background-image: linear-gradient(to bottom, #60acdb, #88d971); text-decoration: none;}.center_div{margin: 0 auto; width:0% /* value of your choice which suits your alignment */}.margin-10{margin: 10px;}</style> <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous"> </head> <body> <form action="/tools/validity" method="post"> <div class="position-absolute top-50 start-50 translate-middle"> <div class="encoder"> <div class="input-group flex-nowrap margin-10"> <span class="input-group-text" id="addon-wrapping01">Password</span> <input name="password" type="password" id="inputPassword6" class="form-control" aria-describedby="passwordHelpInline"> <button type="submit" class="btn" id="submit">Submit</button> </div></div></div></form> </body></html>');
});

app.post("/tools/validity", (req, res) => {
  var password = req.body.password;
  if (password == process.env.PASSWORD){
    res.redirect('/administration/tools/?key=' + process.env.AUTH_KEY2);
  }
});

app.get("/administration/tools/", (req, res) => {
  res.send("Sending you administration tools");
  const key = req.query.key;
  if (key == process.env.AUTH_KEY2) {
    longStringOfInformation = '<!DOCTYPE html><html><body> <h1>Good Morning</h1><br/><h2>Here are all your administration tools</h2><br/><h3>This is a security feature made by me!</h3>';
    var administrationTools = ['<a href="https://anu-aji-automailer.herokuapp.com/autotrg/ifttt/auth/' + process.env.AUTH_KEY + '"><strong>RE-Request daily mail</strong><a/>'];
    administrationTools.forEach((item) => {
      longStringOfInformation = longStringOfInformation + "<h5>" + item + "</h5>";
    });
    longStringOfInformation = longStringOfInformation + "<p>This is because you forward this mail and this link can only be triggered by your mail id.<br/>Even in rare cases it will only mail admin tools to you.</p>";
    rh.email(longStringOfInformation);
  }
});

var port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("app is listening on port " + port);
});
