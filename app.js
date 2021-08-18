//imports
const env = require("dotenv").config();
const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");
const app = express();

//body

var longStringOfInformation;

app.get("/autotrg/ifttt/auth/" + process.env.AUTH_KEY2, (req, res) => {
  res.send("Action Started");
  const params = {
    api_token: process.env.API_KEY
  }
  var websiteContent;
  var quote;
  var onTodaysDay = "";

  //buzzsprout
  axios.get(" https://www.buzzsprout.com/api/1173590/episodes.json", {
      params
    })
    .then(response => {
      websiteContent = response.data;
      postfech02();
    }).catch(error => {
      console.log(error);
    });


  //on todays days
  // function postfech01() {
  //   var today = new Date();
  //   // using date offset as heroku is hosted in usa
  //   var dd = String(parseInt(String(today.getDate() + parseInt(process.env.DATE_OFFSET))));
  //   var mm = String(parseInt(String(today.getMonth() + 1)));
  //   axios.get("https://history.muffinlabs.com/date/" + mm + "/" + dd, )
  //     .then(response => {
  //       var a = 1;
  //       response.data.data.Events.forEach((item, i) => {
  //         if (!(item.html.toUpperCase().includes("WAR") ||
  //             item.html.toUpperCase().includes("MURDER") ||
  //             item.html.toUpperCase().includes("BATTLE") ||
  //             item.html.toUpperCase().includes("ARMY") ||
  //             item.html.toUpperCase().includes("REVOLT") ||
  //             item.html.toUpperCase().includes("CAPTURE") ||
  //             item.html.toUpperCase().includes("PRISON"))) {
  //           a = a + 1;
  //           if (typeof onTodaysDay == "undefined") {
  //             onTodaysDay = "1) in year " + item.html + "<br/><br/>";
  //           } else {
  //             onTodaysDay = onTodaysDay + a + ") in year " + item.html + "<br/><br/>";
  //           }
  //         }
  //       });
  //       postfech02();
  //     }).catch(error => {
  //       console.log(error);
  //     });
  // }


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
    longStringOfInformation = "<!DOCTYPE html><html><head></head><body> <h1>Good Morning</h1><h2>Quote</h2> <br /> <strong><h3>" + quote + "<h3></strong> <br /> <h2>Stats</h2><h4>Total entries " + websiteContent.length + "</h4> <p>";
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
    const highestValue = websiteContent[0].total_plays;
    const lowestValue = websiteContent[(websiteContent.length - 1)].total_plays;
    const fiveEqualDivisions = (highestValue - lowestValue)/5;
    const first = fiveEqualDivisions, second = fiveEqualDivisions * 2, third = fiveEqualDivisions * 3, forth = fiveEqualDivisions * 4, fifth = fiveEqualDivisions * 5;
    //filter data
    var htmlString;
    var total_plays = 0;
    const arrayLength = websiteContent.length;
    var perf;
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
        htmlString = "Title: " + item.title + " ;  <a href=" + item.audio_url.toString() + "> Location</a> ;  Downloads: " + item.total_plays + "; Published date: " + item.published_at.split("T")[0] + "; Performance: " + perf + "<br/><br/>";
      } else {
        htmlString = htmlString + "Title: " + item.title + " ;  <a href=" + item.audio_url.toString() + "> Location</a> ;  Downloads: " + item.total_plays + "; Published date: " + item.published_at.split("T")[0] + "; Performance: " + perf + "<br/><br/>";
      }
      total_plays = total_plays + item.total_plays;
    });

    longStringOfInformation = longStringOfInformation + "</p><h3><strong>Total plays on all podcasts " + total_plays + "</strong><h3>" + htmlString +"</body></html>";

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
      subject: "Automatic Podcast Progress Update And A Quote From Ashwin's Code",
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
