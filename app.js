//imports
const env = require("dotenv").config()
const axios = require("axios");
const nodemailer = require("nodemailer");

//fech data
const params = {
  api_token: process.env.API_KEY
}
var websiteContent;

axios.get(" https://www.buzzsprout.com/api/1173590/episodes.json", {params})
  .then(response => {
    websiteContent = response.data;
    postfetch()
  }).catch(error => {
    console.log(error);
  });


function postfetch(){

// sort data based on highest value
websiteContent.sort((a,b) => {
  if ( a.total_plays < b.total_plays ){
    return -1;
  }
  if ( a.total_plays > b.total_plays ){
    return 1;
  }
  return 0;
});

//filter data
var longStringOfInformation = "<h1>Total entries " + websiteContent.length + "</h1>";
const arrayLength = websiteContent.length;
websiteContent.forEach((item, i) => {
  longStringOfInformation = longStringOfInformation + "Title: " + item.title + " ;  <a href=" + item.audio_url.toString() + "> Location</a> " + " Length (in seconds): " + item.duration + ";  No of plays (Worldwide): " + item.total_plays + ";<br/><br/>";
});

console.log(longStringOfInformation);

// var mail = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "demotestoauth@gmail.com",
//     pass: "Auth@76Demo"
//   }
// });
//
// var mailOptions = {
//   from: "demotestoauth@gmail.com",
//   to: "myfriend@yahoo.com",
//   subject: "Automatic Podcast Progress Update From Ashwin's Code",
//   text: longStringOfInformation
// };
//
// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });
}
