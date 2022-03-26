const env = require(`dotenv`).config();
const axios = require(`axios`);
const nodemailer = require(`nodemailer`);
const { google } = require(`googleapis`);
const OAuth2 = google.auth.OAuth2;
const TextCleaner = require(`text-cleaner`);
const moduleInstanceOfAxios = axios.create({
  baseURL: `https://www.buzzsprout.com/api`
});
const request = axios.create({});

module.exports = {
  email: (html) => {
    const createTransporter = async () => {
      const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        `https://developers.google.com/oauthplayground`
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
      });

      const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            reject(`Failed to create access token :(`);
          }
          resolve(token);
        });
      });

      const transporter = nodemailer.createTransport({
        service: `gmail`,
        auth: {
          type: `OAuth2`,
          user: process.env.EMAIL,
          accessToken,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN
        }
      });

      return transporter;
    };

    const sendEmail = async (emailOptions) => {
      let emailTransporter = await createTransporter();
      await emailTransporter.sendMail(emailOptions);
    };

    sendEmail({
      from: process.env.EMAIL,
      to: process.env.TARGET_MAIL_ID,
      subject: `Automatic Podcast Progress Update And A Quote From Ashwin's Code`,
      html: html
    });
  },
  buzzsprout: {
    read: (after, apikey) => {
      moduleInstanceOfAxios
        .get(`/1173590/episodes.json`, {
          headers: {
            Authorization: `Token token=${apikey}`,
            "Content-Type": `application/json`
          }
        })
        .then((response) => {
          after(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    write: (id, object, apikey) => {
      if (process.env.WRITE_ACC === 1) {
        moduleInstanceOfAxios.put(
          `/1173590/episodes/` + id.toString() + `.json`,
          object,
          {
            headers: {
              Authorization: `Token token=${apikey}`,
              "Content-Type": `application/json`
            }
          }
        );
      } else {
        console.log(`Sadly write is access denied`);
        console.log(`But if i was granted write access, i would have written:\n${object.toString()}`);
      }
    }
  },
  NASAAPODRequest : (after, api_key) => {
    request.get(`https://api.nasa.gov/planetary/apod?api_key=${api_key}&thumbs=true`)
    .then((response) => {
      after(response.data);
      })
    },
  QuoteRequest: (after) => {
    request
      .get(`https://zenquotes.io/api/random`)
      .then((response) => {
        after(response.data[0].h);
      })
      .catch((error) => {
        console.log(error);
      });
  },
  CheckForAuthors: (array, after) => {
    var authors = [];
    var extraordinarytitles = [];
    var extraordinaryBit = false;
    array.forEach((item, i) => {
      if (typeof item.title.split(`(`)[1] == `undefined`) {
        extraordinarytitles.push({
          title: item.title,
          downloads: item.total_plays
        });
        extraordinaryBit = true;
      } else {
        var author1 = TextCleaner(item.title.split(`(`)[1])
          .remove(`)`)
          .trim()
          .valueOf();
        if (author1 == ``) {
          extraordinarytitles.push({
            title: item.title,
            downloads: item.total_plays
          });
          extraordinaryBit = true;
        } else if (
          typeof authors.find(({ author }) => author == author1) == `undefined`
        ) {
          authors.push({
            author: author1,
            downloads: item.total_plays,
            entries: 1,
            duration: item.duration,
            TPlayTime: item.duration * item.total_plays
          });
        } else {
          function bodge(array, key, value, after) {
            var indexes = [];
            array.forEach((item, i) => {
              if (item[key] == value) {
                indexes.push(i);
              }
            });
            after(array, indexes);
          }
          bodge(authors, `author`, author1, (array, indexes) => {
            indexes.forEach((Index) => {
              array[Index].downloads = authors[Index].downloads + item.total_plays;
              array[Index].entries = authors[Index].entries + 1;
              array[Index].duration = authors[Index].duration + item.duration;
              array[Index].TPlayTime = authors[Index].TPlayTime + (item.duration * item.total_plays);
            });
          });
        }
      }
    });
    after(authors, extraordinarytitles, extraordinaryBit);
  },
  getFormattedTime: (seconds) => {
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var months = 0;
    var formattedTime = ``;
    for (var i = 1; seconds >= 2592000; i++) {
      months = i;
      seconds = seconds - 2592000;
    }
    for (var i = 1; seconds >= 86400; i++) {
      days = i;
      seconds = seconds - 86400;
    }
    for (var i = 1; seconds >= 3600; i++) {
      hours = i;
      seconds = seconds - 3600;
    }
    for (var i = 1; seconds >= 60; i++) {
      minutes = i;
      seconds = seconds - 60;
    }
    if (months >= 10) {
      formattedTime += `${months}mo:`;
    } else {
      formattedTime += `0${months}mo:`;
    }
    if (days >= 10) {
      formattedTime += `${days}d:`;
    } else {
      formattedTime += `0${days}d:`;
    }
    if (hours >= 10){
      formattedTime += `${hours}h:`;
    } else {
      formattedTime += `0${hours}h:`;
    }
    if (minutes >= 10) {
      formattedTime += `${minutes}m:`;
    } else {
      formattedTime += `0${minutes}m:`;
    }
    if (seconds >= 10){
      formattedTime += `${seconds}s`;
    } else {
      formattedTime += `0${seconds}s`;
    }
    var fta = formattedTime.split(`:`);
    var fta2 = formattedTime.split(`:`);
    for(const item of fta) {
      if (item == `00mo` || item == `00d` || item == `00h` || item == `00m`){
        fta2.splice(fta2.indexOf(item), 1);
      } else {
        formattedTime = ``;
        fta2.forEach((item) => {
          formattedTime = formattedTime + `${item} :`;
        });
        formattedTime = formattedTime.slice(0, -1);
        return formattedTime;
      }
    }
  }
};