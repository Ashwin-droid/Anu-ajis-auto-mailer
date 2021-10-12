const env = require(`dotenv`).config();
const axios = require(`axios`);
const nodemailer = require(`nodemailer`);
const TextCleaner = require(`text-cleaner`);
const moduleInstanceOfAxios = axios.create({
  baseURL: `https://www.buzzsprout.com/api`
});
const request = axios.create({});

module.exports = {
  email: (html) => {
    var mail = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "demotestoauth@gmail.com",
        pass: process.env.DEMO_ACCOUNT_PASSWORD,
      },
    });

    var mailOptions = {
      from: `demotestoauth@gmail.com`,
      to: process.env.TARGET_MAIL_ID,
      subject:
        `Automatic Podcast Progress Update And A Quote From Ashwin's Code`,
      html: html
    };

    mail.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
    });
  },
  buzzsprout: {
    read: (after, apikey) => {
      moduleInstanceOfAxios
        .get(`/1173590/episodes.json`, {
          headers: {
            "Authorization": `Token token=${apikey}`,
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
      moduleInstanceOfAxios.put(
        `/1173590/episodes/` + id.toString() + `.json`,
        object,
        {
          headers: {
            "Authorization": `Token token=${apikey}`,
            "Content-Type": `application/json`
          }
        }
      );
    }
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
  GetArrayindexs: (array, key, value, after) => {
    var indexes = [];
    array.forEach((item, i) => {
      if (item[key] == value) {
        indexes.push(i);
      }
    });
    after(array, indexes);
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
            entries: 1
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
              array[Index].downloads =
                authors[Index].downloads + item.total_plays;
              array[Index].entries = authors[Index].entries + 1;
            });
          });
        }
      }
    });
    after(authors, extraordinarytitles, extraordinaryBit);
  }
};
