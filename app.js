//imports
const env = require("dotenv").config();
const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");
const app = express();

//body

var longStringOfInformation;

//fech data
app.get("/manualtrg/auth/" + process.env.AUTH_KEY, (req, res) => {
  res.send("Action Started");
  const params = {
    api_token: process.env.API_KEY
  }
  var websiteContent;

  axios.get(" https://www.buzzsprout.com/api/1173590/episodes.json", {
      params
    })
    .then(response => {
      websiteContent = response.data;
      postfetch()
    }).catch(error => {
      console.log(error);
    });


  function postfetch() {
    longStringOfInformation = "<!DOCTYPE html><html><head></head><body> <h1>Total entries " + websiteContent.length + "</h1> <p>";
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

    //filter data
    var total_plays = 0;
    const arrayLength = websiteContent.length;
    websiteContent.forEach((item, i) => {
      total_plays = total_plays + item.total_plays;
      longStringOfInformation = longStringOfInformation + "Title: " + item.title + " ;  <a href=" + item.audio_url.toString() + "> Location</a> " + " Length (in seconds): " + item.duration + ";  No of plays (Worldwide): " + item.total_plays + ";<br/><br/>";
    });

    longStringOfInformation = longStringOfInformation + "</p><h4><strong>Total plays on all podcasts " + total_plays + "</strong><h4></body></html>"

    var mail = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "demotestoauth@gmail.com",
        pass: process.env.DEMO_ACCOUNT_PASSWORD
      }
    });

    var mailOptions = {
      from: "demotestoauth@gmail.com",
      to: process.env.TARGET_MAIL_ID,
      subject: "Manual Podcast Progress Update From Ashwin's Code",
      html: longStringOfInformation
    };

    mail.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      }
    });
  }

});


app.get("/autotrg/ifttt/auth/" + process.env.AUTH_KEY, (req, res) => {
  res.send("Action Started");
  const params = {
    api_token: process.env.API_KEY
  }
  var websiteContent;
  var fiftyQuotes;
  var todaysQuote;

  axios.get(" https://www.buzzsprout.com/api/1173590/episodes.json", {
      params
    })
    .then(response => {
      websiteContent = response.data;
      postfech01();
    }).catch(error => {
      console.log(error);
    });

  function postfech01() {
    axios.get("https://zenquotes.io/api/today/", )
      .then(response => {
        todaysQuote = response.data[0].h;
        postfech02();
      }).catch(error => {
        console.log(error);
      });
  }


  function postfech02() {
    axios.get("https://zenquotes.io/api/quotes/", )
      .then(response => {
        const websiteContent = response.data;
        websiteContent.forEach((item, i) => {
          if (typeof fiftyQuotes == "undefined") {
            fiftyQuotes = 1 + item.h + "<br />";
          } else {
            fiftyQuotes = fiftyQuotes + (i + 1) + item.h + "<br />";
          }
        })
        postfech03();
      }).catch(error => {
        console.log(error);
      });
  }

  function postfech03() {
    longStringOfInformation = "<!DOCTYPE html><html><head></head><body> <h1>Quotes And Stats</h1> <h2>On todays day<h2/><br/><h3>" + todaysQuote + "</h3> <h2>Quotes / ideas for your stories</h2> <br /> <p>" + fiftyQuotes + "</p> <br /> <h2>Stats</h2><h4>Total entries " + websiteContent.length + "</h4> <p>";
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

    //filter data
    var total_plays = 0;
    const arrayLength = websiteContent.length;
    websiteContent.forEach((item, i) => {
      total_plays = total_plays + item.total_plays;
      longStringOfInformation = longStringOfInformation + "Title: " + item.title + " ;  <a href=" + item.audio_url.toString() + "> Location</a> " + " Length (in seconds): " + item.duration + ";  No of plays (Worldwide): " + item.total_plays + "; Published date: " + item.published_at + ";<br/><br/>";
    });

    longStringOfInformation = longStringOfInformation + "</p><h3><strong>Total plays on all podcasts " + total_plays + "</strong><h3></body></html>"

    var mail = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "demotestoauth@gmail.com",
        pass: process.env.DEMO_ACCOUNT_PASSWORD
      }
    });

    var mailOptions = {
      from: "demotestoauth@gmail.com",
      to: process.env.TARGET_MAIL_ID,
      subject: "Automatic Podcast Progress Update From Ashwin's Code",
      html: longStringOfInformation
    };

    mail.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      }
    });

  }
});

var port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("app is listening on port " + port);
});
