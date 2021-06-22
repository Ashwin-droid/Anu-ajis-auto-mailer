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
  var bootstrap;
  var websiteContent;
  var quote;
  var onTodaysDay;
  var htmlString;
  var total_plays = 0;

  //buzzsprout
  axios.get(" https://www.buzzsprout.com/api/1173590/episodes.json", {
      params
    })
    .then(response => {
      websiteContent = response.data;
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
      const arrayLength = websiteContent.length;
      websiteContent.forEach((item, i) => {
        if (typeof htmlString == "undefined") {
          htmlString = '<table class="" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse;"> <tbody> <tr> <td style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; margin: 0;" align="left"><li class="list-group-item"> Title: ' + item.title + " ;  <a href=" + item.audio_url.toString() + "> Location</a> " + " Length (HH:MM:SS): " + new Date(item.duration * 1000).toISOString().substr(11, 8) + ";  No of plays (Worldwide): " + item.total_plays + "; Published date: " + item.published_at.split("T")[0] + ";</li></td></tr></tbody></table><br />";
        } else {
          htmlString = htmlString + '<table class="" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse;"> <tbody> <tr> <td style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; margin: 0;" align="left"><li class="list-group-item"> Title: ' + item.title + " ;  <a href=" + item.audio_url.toString() + "> Location</a> " + " Length (HH:MM:SS): " + new Date(item.duration * 1000).toISOString().substr(11, 8) + ";  No of plays (Worldwide): " + item.total_plays + "; Published date: " + item.published_at.split("T")[0] + ";</li></td></tr></tbody></table><br >";
        }
        total_plays = total_plays + item.total_plays;
      });
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
        var htmlUppercase;
        response.data.data.Events.forEach((item, i) => {
          htmlUppercase = item.html.toUpperCase();
          if (!(htmlUppercase.includes("WAR") ||
              htmlUppercase.includes("MURDER") || htmlUppercase.includes("KILL") || htmlUppercase.includes("DEATH") || htmlUppercase.includes("SUICIDE") ||
              htmlUppercase.includes("BATTLE") || htmlUppercase.includes("REVOLT") ||
              htmlUppercase.includes("ARMY") ||
              htmlUppercase.includes("CAPTURE") || htmlUppercase.includes("PRISON") ||
              htmlUppercase.includes("THRONE") ||
              htmlUppercase.includes("FIRE") || htmlUppercase.includes("BURN") || htmlUppercase.includes("BOMB") ||
              htmlUppercase.includes("STRIK"))) {
            a = a + 1;
            if (typeof onTodaysDay == "undefined") {
              onTodaysDay = '<table class="" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse;"> <tbody> <tr> <td style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; margin: 0;" align="left"> <li class="list-group-item">1) in year ' + item.html + "</li></td></tr></tbody></table><br/>";
            } else {
              onTodaysDay = onTodaysDay + '<table class="" border="0" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse;"> <tbody> <tr> <td style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; margin: 0;" align="left"> <li class="list-group-item">' + a + ') in year ' + item.html + "</li></td></tr></tbody></table><br/>";
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
    longStringOfInformation = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"> <style type="text/css"> .ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div{line-height:150%}a{text-decoration:none}body,td,input,textarea,select{margin:unset;font-family:unset}input,textarea,select{font-size:unset}@media screen and (max-width: 600px){table.row th.col-lg-1,table.row th.col-lg-2,table.row th.col-lg-3,table.row th.col-lg-4,table.row th.col-lg-5,table.row th.col-lg-6,table.row th.col-lg-7,table.row th.col-lg-8,table.row th.col-lg-9,table.row th.col-lg-10,table.row th.col-lg-11,table.row th.col-lg-12{display:block;width:100% !important}.d-mobile{display:block !important}.d-desktop{display:none !important}.w-lg-25{width:auto !important}.w-lg-25>tbody>tr>td{width:auto !important}.w-lg-50{width:auto !important}.w-lg-50>tbody>tr>td{width:auto !important}.w-lg-75{width:auto !important}.w-lg-75>tbody>tr>td{width:auto !important}.w-lg-100{width:auto !important}.w-lg-100>tbody>tr>td{width:auto !important}.w-lg-auto{width:auto !important}.w-lg-auto>tbody>tr>td{width:auto !important}.w-25{width:25% !important}.w-25>tbody>tr>td{width:25% !important}.w-50{width:50% !important}.w-50>tbody>tr>td{width:50% !important}.w-75{width:75% !important}.w-75>tbody>tr>td{width:75% !important}.w-100{width:100% !important}.w-100>tbody>tr>td{width:100% !important}.w-auto{width:auto !important}.w-auto>tbody>tr>td{width:auto !important}.p-lg-0>tbody>tr>td{padding:0 !important}.pt-lg-0>tbody>tr>td,.py-lg-0>tbody>tr>td{padding-top:0 !important}.pr-lg-0>tbody>tr>td,.px-lg-0>tbody>tr>td{padding-right:0 !important}.pb-lg-0>tbody>tr>td,.py-lg-0>tbody>tr>td{padding-bottom:0 !important}.pl-lg-0>tbody>tr>td,.px-lg-0>tbody>tr>td{padding-left:0 !important}.p-lg-1>tbody>tr>td{padding:0 !important}.pt-lg-1>tbody>tr>td,.py-lg-1>tbody>tr>td{padding-top:0 !important}.pr-lg-1>tbody>tr>td,.px-lg-1>tbody>tr>td{padding-right:0 !important}.pb-lg-1>tbody>tr>td,.py-lg-1>tbody>tr>td{padding-bottom:0 !important}.pl-lg-1>tbody>tr>td,.px-lg-1>tbody>tr>td{padding-left:0 !important}.p-lg-2>tbody>tr>td{padding:0 !important}.pt-lg-2>tbody>tr>td,.py-lg-2>tbody>tr>td{padding-top:0 !important}.pr-lg-2>tbody>tr>td,.px-lg-2>tbody>tr>td{padding-right:0 !important}.pb-lg-2>tbody>tr>td,.py-lg-2>tbody>tr>td{padding-bottom:0 !important}.pl-lg-2>tbody>tr>td,.px-lg-2>tbody>tr>td{padding-left:0 !important}.p-lg-3>tbody>tr>td{padding:0 !important}.pt-lg-3>tbody>tr>td,.py-lg-3>tbody>tr>td{padding-top:0 !important}.pr-lg-3>tbody>tr>td,.px-lg-3>tbody>tr>td{padding-right:0 !important}.pb-lg-3>tbody>tr>td,.py-lg-3>tbody>tr>td{padding-bottom:0 !important}.pl-lg-3>tbody>tr>td,.px-lg-3>tbody>tr>td{padding-left:0 !important}.p-lg-4>tbody>tr>td{padding:0 !important}.pt-lg-4>tbody>tr>td,.py-lg-4>tbody>tr>td{padding-top:0 !important}.pr-lg-4>tbody>tr>td,.px-lg-4>tbody>tr>td{padding-right:0 !important}.pb-lg-4>tbody>tr>td,.py-lg-4>tbody>tr>td{padding-bottom:0 !important}.pl-lg-4>tbody>tr>td,.px-lg-4>tbody>tr>td{padding-left:0 !important}.p-lg-5>tbody>tr>td{padding:0 !important}.pt-lg-5>tbody>tr>td,.py-lg-5>tbody>tr>td{padding-top:0 !important}.pr-lg-5>tbody>tr>td,.px-lg-5>tbody>tr>td{padding-right:0 !important}.pb-lg-5>tbody>tr>td,.py-lg-5>tbody>tr>td{padding-bottom:0 !important}.pl-lg-5>tbody>tr>td,.px-lg-5>tbody>tr>td{padding-left:0 !important}.p-0>tbody>tr>td{padding:0 !important}.pt-0>tbody>tr>td,.py-0>tbody>tr>td{padding-top:0 !important}.pr-0>tbody>tr>td,.px-0>tbody>tr>td{padding-right:0 !important}.pb-0>tbody>tr>td,.py-0>tbody>tr>td{padding-bottom:0 !important}.pl-0>tbody>tr>td,.px-0>tbody>tr>td{padding-left:0 !important}.p-1>tbody>tr>td{padding:4px !important}.pt-1>tbody>tr>td,.py-1>tbody>tr>td{padding-top:4px !important}.pr-1>tbody>tr>td,.px-1>tbody>tr>td{padding-right:4px !important}.pb-1>tbody>tr>td,.py-1>tbody>tr>td{padding-bottom:4px !important}.pl-1>tbody>tr>td,.px-1>tbody>tr>td{padding-left:4px !important}.p-2>tbody>tr>td{padding:8px !important}.pt-2>tbody>tr>td,.py-2>tbody>tr>td{padding-top:8px !important}.pr-2>tbody>tr>td,.px-2>tbody>tr>td{padding-right:8px !important}.pb-2>tbody>tr>td,.py-2>tbody>tr>td{padding-bottom:8px !important}.pl-2>tbody>tr>td,.px-2>tbody>tr>td{padding-left:8px !important}.p-3>tbody>tr>td{padding:16px !important}.pt-3>tbody>tr>td,.py-3>tbody>tr>td{padding-top:16px !important}.pr-3>tbody>tr>td,.px-3>tbody>tr>td{padding-right:16px !important}.pb-3>tbody>tr>td,.py-3>tbody>tr>td{padding-bottom:16px !important}.pl-3>tbody>tr>td,.px-3>tbody>tr>td{padding-left:16px !important}.p-4>tbody>tr>td{padding:24px !important}.pt-4>tbody>tr>td,.py-4>tbody>tr>td{padding-top:24px !important}.pr-4>tbody>tr>td,.px-4>tbody>tr>td{padding-right:24px !important}.pb-4>tbody>tr>td,.py-4>tbody>tr>td{padding-bottom:24px !important}.pl-4>tbody>tr>td,.px-4>tbody>tr>td{padding-left:24px !important}.p-5>tbody>tr>td{padding:48px !important}.pt-5>tbody>tr>td,.py-5>tbody>tr>td{padding-top:48px !important}.pr-5>tbody>tr>td,.px-5>tbody>tr>td{padding-right:48px !important}.pb-5>tbody>tr>td,.py-5>tbody>tr>td{padding-bottom:48px !important}.pl-5>tbody>tr>td,.px-5>tbody>tr>td{padding-left:48px !important}.s-lg-1>tbody>tr>td,.s-lg-2>tbody>tr>td,.s-lg-3>tbody>tr>td,.s-lg-4>tbody>tr>td,.s-lg-5>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}.s-0>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}.s-1>tbody>tr>td{font-size:4px !important;line-height:4px !important;height:4px !important}.s-2>tbody>tr>td{font-size:8px !important;line-height:8px !important;height:8px !important}.s-3>tbody>tr>td{font-size:16px !important;line-height:16px !important;height:16px !important}.s-4>tbody>tr>td{font-size:24px !important;line-height:24px !important;height:24px !important}.s-5>tbody>tr>td{font-size:48px !important;line-height:48px !important;height:48px !important}}@media yahoo{.d-mobile{display:none !important}.d-desktop{display:block !important}.w-lg-25{width:25% !important}.w-lg-25>tbody>tr>td{width:25% !important}.w-lg-50{width:50% !important}.w-lg-50>tbody>tr>td{width:50% !important}.w-lg-75{width:75% !important}.w-lg-75>tbody>tr>td{width:75% !important}.w-lg-100{width:100% !important}.w-lg-100>tbody>tr>td{width:100% !important}.w-lg-auto{width:auto !important}.w-lg-auto>tbody>tr>td{width:auto !important}.p-lg-0>tbody>tr>td{padding:0 !important}.pt-lg-0>tbody>tr>td,.py-lg-0>tbody>tr>td{padding-top:0 !important}.pr-lg-0>tbody>tr>td,.px-lg-0>tbody>tr>td{padding-right:0 !important}.pb-lg-0>tbody>tr>td,.py-lg-0>tbody>tr>td{padding-bottom:0 !important}.pl-lg-0>tbody>tr>td,.px-lg-0>tbody>tr>td{padding-left:0 !important}.p-lg-1>tbody>tr>td{padding:4px !important}.pt-lg-1>tbody>tr>td,.py-lg-1>tbody>tr>td{padding-top:4px !important}.pr-lg-1>tbody>tr>td,.px-lg-1>tbody>tr>td{padding-right:4px !important}.pb-lg-1>tbody>tr>td,.py-lg-1>tbody>tr>td{padding-bottom:4px !important}.pl-lg-1>tbody>tr>td,.px-lg-1>tbody>tr>td{padding-left:4px !important}.p-lg-2>tbody>tr>td{padding:8px !important}.pt-lg-2>tbody>tr>td,.py-lg-2>tbody>tr>td{padding-top:8px !important}.pr-lg-2>tbody>tr>td,.px-lg-2>tbody>tr>td{padding-right:8px !important}.pb-lg-2>tbody>tr>td,.py-lg-2>tbody>tr>td{padding-bottom:8px !important}.pl-lg-2>tbody>tr>td,.px-lg-2>tbody>tr>td{padding-left:8px !important}.p-lg-3>tbody>tr>td{padding:16px !important}.pt-lg-3>tbody>tr>td,.py-lg-3>tbody>tr>td{padding-top:16px !important}.pr-lg-3>tbody>tr>td,.px-lg-3>tbody>tr>td{padding-right:16px !important}.pb-lg-3>tbody>tr>td,.py-lg-3>tbody>tr>td{padding-bottom:16px !important}.pl-lg-3>tbody>tr>td,.px-lg-3>tbody>tr>td{padding-left:16px !important}.p-lg-4>tbody>tr>td{padding:24px !important}.pt-lg-4>tbody>tr>td,.py-lg-4>tbody>tr>td{padding-top:24px !important}.pr-lg-4>tbody>tr>td,.px-lg-4>tbody>tr>td{padding-right:24px !important}.pb-lg-4>tbody>tr>td,.py-lg-4>tbody>tr>td{padding-bottom:24px !important}.pl-lg-4>tbody>tr>td,.px-lg-4>tbody>tr>td{padding-left:24px !important}.p-lg-5>tbody>tr>td{padding:48px !important}.pt-lg-5>tbody>tr>td,.py-lg-5>tbody>tr>td{padding-top:48px !important}.pr-lg-5>tbody>tr>td,.px-lg-5>tbody>tr>td{padding-right:48px !important}.pb-lg-5>tbody>tr>td,.py-lg-5>tbody>tr>td{padding-bottom:48px !important}.pl-lg-5>tbody>tr>td,.px-lg-5>tbody>tr>td{padding-left:48px !important}.s-lg-0>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}.s-lg-1>tbody>tr>td{font-size:4px !important;line-height:4px !important;height:4px !important}.s-lg-2>tbody>tr>td{font-size:8px !important;line-height:8px !important;height:8px !important}.s-lg-3>tbody>tr>td{font-size:16px !important;line-height:16px !important;height:16px !important}.s-lg-4>tbody>tr>td{font-size:24px !important;line-height:24px !important;height:24px !important}.s-lg-5>tbody>tr>td{font-size:48px !important;line-height:48px !important;height:48px !important}}</style></head> <body style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border: 0;" bgcolor="#ffffff"><table valign="top" class="bg-light body" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0px; border-collapse: collapse; margin: 0; padding: 0; border: 0;" bgcolor="#f8f9fa"> <tbody> <tr> <td valign="top" style="border-spacing: 0px; border-collapse: collapse; line-height: 24px; font-size: 16px; margin: 0;" align="left" bgcolor="#f8f9fa"> <div class="bg-info text-wrap" style="background-color: #17a2b8;"> <h1 class="display-3" style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 36px; line-height: 43.2px;" align="left">On this day, <small class="text-muted" style="color: #636c72;">Quote And Stats </small></h1> </div><br><h2 style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 32px; line-height: 38.4px;" align="left">On todays day<h2 style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 32px; line-height: 38.4px;" align="left"></h2><br><strong><h5 style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 20px; line-height: 24px;" align="left"><ul class="list-group">' + onTodaysDay + '</ul></strong><h2 style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 32px; line-height: 38.4px;" align="left"></h2><br><strong><h2 style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 32px; line-height: 38.4px;" align="left">Quote</h2> <br><h3 style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 28px; line-height: 33.6px;" align="left">' + quote + '<h3 style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 28px; line-height: 33.6px;" align="left"></h3></h3></strong> <br><h2 style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 32px; line-height: 38.4px;" align="left">Stats</h2><h4 style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 24px; line-height: 28.8px;" align="left">Total entries ' + websiteContent.length + '</h4> <h3 style="margin-top: 0; margin-bottom: 0; font-weight: 500; vertical-align: baseline; font-size: 28px; line-height: 33.6px;" align="left"><strong>Total plays on all podcasts ' + total_plays + '</strong></h3><ul class="list-group">' + htmlString + '</ul></strong>';
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
