const env = require("dotenv").config();
const axios = require("axios");
const moduleInstanceOfAxios = axios.create({
  baseURL: "https://www.buzzsprout.com/api"
});
const request = axios.create({});

module.exports = {
  email: function(nodemailer, html) {
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
      html: html
    };

    mail.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      }
    });
  },
  buzzsprout: {
    read: function(after, apikey) {
      moduleInstanceOfAxios.get("/1173590/episodes.json", {
          headers: {
            "Authorization": "Token token=" + apikey,
            "Content-Type": "application/json"
          }
        })
        .then(response => {
          after(response.data);
        }).catch(error => {
          console.log(error);
        });
    },
    write: function(id, object, apikey) {
      moduleInstanceOfAxios.put("/1173590/episodes/" + id.toString() + ".json", {
        object
      }, {
        headers: {
          "Authorization": "Token token=" + apikey,
          "Content-Type": "application/json"
        }
      });
    }
  },
  QuoteRequest: function(after) {
    request.get("https://zenquotes.io/api/random", )
      .then(response => {
        after(response.data[0].h);
      }).catch(error => {
        console.log(error);
      });
  }
}