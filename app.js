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


app.get("/autotrg/ifttt/auth/" + process.env.AUTH_KEY2, (req, res) => {
  res.send("Action Started");
  const params = {
    api_token: process.env.API_KEY
  }
  var websiteContent;
  var quote;
  var onTodaysDay;

  //buzzsprout
  axios.get(" https://www.buzzsprout.com/api/1173590/episodes.json", {
      params
    })
    .then(response => {
      websiteContent = response.data;
      postfech01();
    }).catch(error => {
      console.log(error);
    });


  //on todays days
  function postfech01() {
    var today = new Date();
    // using date offset as heroku is hosted in usa
    var dd = String(parseInt(String(today.getDate() + parseInt(process.env.DATE_OFFSET))));
    var mm = String(parseInt(String(today.getMonth() + 1)));
    axios.get("https://history.muffinlabs.com/date/" + mm + "/" + dd, )
      .then(response => {
        var a = 1;
        response.data.data.Events.forEach((item, i) => {
          if (!(item.html.toUpperCase().includes("WAR") || item.html.toUpperCase().includes("MURDER") || item.html.toUpperCase().includes("BATTLE") || item.html.toUpperCase().includes("ARMY"))) {
            a = a + 1;
            if (typeof onTodaysDay == "undefined") {
              onTodaysDay = "1) in year " + item.html + "<br/><br/>";
            } else {
              onTodaysDay = onTodaysDay + a + ") in year " + item.html + "<br/><br/>";
            }
          }
        });
        postfech02();
      }).catch(error => {
        console.log(error);
      });
  }


  function postfech02() {
    axios.get("https://zenquotes.io/api/random", )
      .then(response => {
        quote = response.data[0].h;
        postfech03();

      }).catch(error => {
        console.log(error);
      });
  }

  function postfech03() {
    longStringOfInformation = "<!DOCTYPE html><html><head></head><body> <h1>On this day, Quote And Stats</h1> <h2>On todays day<h2/><br/><strong><h6>" + onTodaysDay + "</h6></strong> <h2>Quote</h2> <br /> <strong><h3>" + quote + "<h3></strong> <br /> <h2>Stats</h2><h4>Total entries " + websiteContent.length + "</h4> <p>";
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
      longStringOfInformation = longStringOfInformation + "Title: " + item.title + " ;  <a href=" + item.audio_url.toString() + "> Location</a> " + " Length (HH:MM:SS): " + new Date(item.duration * 1000).toISOString().substr(11, 8) + ";  No of plays (Worldwide): " + item.total_plays + "; Published date: " + item.published_at.split("T")[0] + ";<br/><br/>";
    });

    longStringOfInformation = longStringOfInformation + "</p><h3><strong>Total plays on all podcasts " + total_plays + "</strong><h3></body></html>";

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
      subject: "Automatic Podcast Progress Update, On This Day And A Quote From Ashwin's Code",
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
