require(`dotenv`).config(); // Load environment variables from .env file
const axios = require(`axios`);
const nodemailer = require(`nodemailer`);
const { google } = require(`googleapis`);
const OAuth2 = google.auth.OAuth2;
const TextCleaner = require(`text-cleaner`);
const similarityEngine = require("string-similarity");
const moduleInstanceOfAxios = axios.create({
  baseURL: `https://www.buzzsprout.com/api`
});
const request = axios.create({});
const InactivityTimer = 3888000000; // 45 days

/**
 * Module that exports various functions and utilities
 */
module.exports = {
  /**
   * Replaces the author name in each title of the given array of author titles with the provided author name.
   * @param {function} writer - The function used to write the updated titles.
   * @param {Array} AuthorTitles - The array of author titles to update.
   * @param {string} Author - The name of the author to replace in each title.
   */
  authorSwitcheroo: (writer, AuthorTitles, Author) => {
    AuthorTitles.forEach((element) => {
      const title = `${element.title.split(`(`)[0].trim()} (${Author})`;
      writer(element.id, { title: title, artist: Author });
    });
  },
  /**
   * Sends an email using Gmail SMTP server
   * @param {string} html - The HTML content of the email
   */
  email: (html) => {
    /**
     * Creates a transporter for sending emails
     * @returns {Promise<object>} - Nodemailer transporter object
     */
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

    /**
     * Sends an email with the specified options
     * @param {object} emailOptions - Email options (from, to, subject, html)
     */
    const sendEmail = async (emailOptions) => {
      let emailTransporter = await createTransporter();
      await emailTransporter.sendMail(emailOptions);
    };

    // Send the email
    sendEmail({
      from: process.env.EMAIL,
      to: process.env.TARGET_MAIL_ID,
      subject: `Automatic Daily Mail From Ashwin's Code`,
      html: html
    });
  },
  /**
   * Checks if two strings are roughly the same based on similarity percentage
   * @param {string} string1 - The first string
   * @param {string} string2 - The second string
   * @param {number} accuracy - The minimum similarity percentage required for a match
   * @returns {object} - Object containing the truth value and similarity index
   */
  isRoughlySame: (string1, string2, accuracy) => {
    // Compare the similarity of the two strings using the string-similarity package
    var similarity = similarityEngine.compareTwoStrings(string1, string2);
    // Calculate the similarity percentage and round it to the nearest integer
    var similarityPercent = Math.round(similarity * 100);
    // Check if the similarity percentage is greater than or equal to the required accuracy
    if (similarityPercent >= accuracy) {
      // If the strings are similar enough, return an object with isSimilar set to true and the similarity index
      return { isSimilar: true, similarityIndex: similarityPercent };
    } else {
      // If the strings are not similar enough, return an object with isSimilar set to false and the similarity index
      return { isSimilar: false, similarityIndex: similarityPercent };
    }
  },

  /**
   * Reads data from the Buzzsprout API
   * @param {function} after - Callback function to handle the response data
   */
  buzzsprout: {
    read: async () => {
      try {
        const response = await moduleInstanceOfAxios.get(
          `/1173590/episodes.json`,
          {
            headers: {
              Authorization: `Token token=${process.env.API_KEY}`,
              "Content-Type": `application/json`
            }
          }
        );
        return response.data;
      } catch (error) {
        console.log(error);
      }
    },

    /**
     * Writes data to the Buzzsprout API
     * @param {string} id - Episode ID
     * @param {object} object - Data to be written
     */
    write: (id, object) => {
      if (process.env.WRITE_ACC == 1) {
        moduleInstanceOfAxios.put(
          `/1173590/episodes/` + id.toString() + `.json`,
          object,
          {
            headers: {
              Authorization: `Token token=${process.env.API_KEY}`,
              "Content-Type": `application/json`
            }
          }
        );
      } else {
        console.log(`Sadly write access is denied`);
        console.log(
          `But if I was granted write access, I would have written:\n${JSON.stringify(
            object
          )}`
        );
      }
    }
  },

  /**
   * Fetches the Bing Image of the Day
   * @returns {object} - Object containing the URL and title of the image
   */
  bingImageOfTheDay: async () => {
    try {
      const response = await request.get(
        `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US`
      );
      return {
        url: `https://www.bing.com${response.data.images[0].url}`,
        title: response.data.images[0].title
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  /**
   * Sends a request to ZenQuotes API to fetch a random quote
   * @param {function} after - Callback function to handle the quote
   */
  QuoteRequest: async () => {
    try {
      const response = await request.get(`https://zenquotes.io/api/random`);
      return response.data[0].h;
    } catch (error) {
      console.log(error);
    }
  },

  /**
   * Checks for artists in an array of episodes and performs various calculations
   * @param {array} array - Array of episodes
   * @returns {object} - Object containing the results of the calculations
   */
  CheckForArtist: (array) => {
    // Initialize variables to store the results of the calculations
    var authors = [];
    var extraordinaryTitles = [];
    var extraordinaryBit = false;

    // Iterate through each item in the array
    array.forEach((item, i) => {
      // Check if the item's title does not contain parentheses
      if (typeof item.title.split(`(`)[1] == `undefined`) {
        // Add the item to the extraordinaryTitles array if it does not contain parentheses
        extraordinaryTitles.push({
          title: item.title,
          downloads: item.total_plays,
          id: item.id
        });
        extraordinaryBit = true;
      } else {
        // Extract the author from the parentheses in the title
        var author1 = TextCleaner(item.title.split(`(`)[1].split(`)`)[0])
          .trim()
          .valueOf();

        if (author1 == ``) {
          // Add the item to the extraordinaryTitles array if the author is empty
          extraordinaryTitles.push({
            title: item.title,
            downloads: item.total_plays
          });
          extraordinaryBit = true;
        } else {
          // Check if the author already exists in the authors array
          var existingAuthor = authors.find(({ author }) => author == author1);

          if (typeof existingAuthor == `undefined`) {
            // Create a new author entry in the authors array if the author does not exist
            var inactive = true;
            if (
              Math.abs(new Date() - new Date(item.published_at)) <
              InactivityTimer
            ) {
              inactive = false;
            }

            authors.push({
              author: author1,
              downloads: item.total_plays,
              entries: 1,
              duration: item.duration,
              TPlayTime: item.duration * item.total_plays,
              titles: [item],
              sus: true, // for detecting single episode players
              mostRecentEpisode: { pubAT: item.published_at, id: item.id },
              inactive
            });
          } else {
            // Update the existing author's entry in the authors array
            module.exports.FindAKeyInAnArrayOfObjects(
              authors,
              `author`,
              author1,
              (array, indexes) => {
                indexes.forEach((Index) => {
                  array[Index].downloads += item.total_plays;
                  array[Index].entries++;
                  array[Index].duration += item.duration;
                  array[Index].TPlayTime += item.duration * item.total_plays;
                  array[Index].sus = false; // not a single episode
                  array[Index].titles.push(item);

                  var d1 = new Date(authors[Index].mostRecentEpisode.pubAT);
                  var d2 = new Date(item.published_at);

                  if (d1 < d2) {
                    array[Index].mostRecentEpisode.pubAT = item.published_at;
                    array[Index].mostRecentEpisode.id = item.id;
                  }

                  if (authors[Index].inactive) {
                    if (
                      Math.abs(new Date() - new Date(item.published_at)) <
                      InactivityTimer
                    ) {
                      array[Index].inactive = false;
                    }
                  }
                });
              }
            );
          }
        }
      }
    });

    var titlesFinalArray = [];

    // Filter out inactive authors and collect their titles
    authors.forEach((item, i) => {
      if (item.inactive) {
        item.titles = [];
      } else {
        titlesFinalArray = titlesFinalArray.concat(item.titles);
      }
    });

    // Sort titles by published_at date in descending order
    titlesFinalArray.sort((a, b) => {
      var d1 = new Date(a.published_at);
      var d2 = new Date(b.published_at);

      if (d1 > d2) {
        return -1;
      } else if (d1 < d2) {
        return 1;
      } else {
        return 0;
      }
    });

    // Return the results
    return {
      authors,
      extraordinaryTitles,
      extraordinaryBit,
      titlesFinalArray
    };
  },
  /**
   * Formats time duration in seconds to a human-readable format
   * @param {number} seconds - Time duration in seconds
   * @returns {string} - Formatted time string (e.g., 3mo:05d:02h:15m:30s)
   */
  getFormattedTime: (seconds) => {
    if (seconds === 0) {
      return "00s"; // Return '00s' if the given value is 0
    }
    const durations = [
      { label: "mo", duration: 2592000 }, // Duration of a month in seconds
      { label: "d", duration: 86400 }, // Duration of a day in seconds
      { label: "h", duration: 3600 }, // Duration of an hour in seconds
      { label: "m", duration: 60 }, // Duration of a minute in seconds
      { label: "s", duration: 1 } // Duration of a second in seconds
    ];

    let formattedTime = ""; // Variable to store the formatted time
    let includeTime = false; // Flag to determine whether to include time components

    for (const { label, duration } of durations) {
      const value = Math.floor(seconds / duration); // Calculate the value for the current duration
      seconds %= duration; // Update the remaining seconds

      if (includeTime || value > 0) {
        includeTime = true; // Set the flag to true if a non-zero value is encountered
        formattedTime += value.toString().padStart(2, "0") + label + ":"; // Append the formatted value
      }
    }

    formattedTime = formattedTime.slice(0, -1); // Remove the last colon from the formatted time
    return formattedTime; // Return the formatted time
  },

  /**
   * Generates awards based on Buzzsprout data and author statistics
   * @param {array} sortedBuzzsproutData - Array of Buzzsprout data (episodes)
   * @param {array} authorsArrayOutput - Array of author statistics
   * @returns {string} - String containing the awards and winners
   */
  award: (sortedBuzzsproutData, authorsArrayOutput) => {
    var awardsString = "";
    var awards = [
      {
        [`<a href="https://www.buzzsprout.com/1173590/${
          sortedBuzzsproutData.reduce((a, b) => {
            return a.title.length > b.title.length ? a : b;
          }).id
        }">Longest Title</a>`]: TextCleaner(
          sortedBuzzsproutData
            .reduce((a, b) => {
              return a.title.length > b.title.length ? a : b;
            })
            .title.split(`(`)[1]
            .split(`)`)[0]
        )
          .trim()
          .valueOf()
      }, // longest title artist
      {
        [`<a href="https://www.buzzsprout.com/1173590/${
          sortedBuzzsproutData.reduce((a, b) => {
            return a.duration > b.duration ? a : b;
          }).id
        }">Longest Episode</a>`]: TextCleaner(
          sortedBuzzsproutData
            .reduce((a, b) => {
              return a.duration > b.duration ? a : b;
            })
            .title.split(`(`)[1]
            .split(`)`)[0]
        )
          .trim()
          .valueOf()
      }, // longest episode artist
      {
        "Highest Performing Artist": authorsArrayOutput.reduce((a, b) => {
          return a.downloads > b.downloads ? a : b;
        }).author
      }, // highest performing artist
      {
        "Longest Playtime": authorsArrayOutput.reduce((a, b) => {
          return a.TPlayTime > b.TPlayTime ? a : b;
        }).author
      }, // longest playtime artist
      {
        [`<a href="https://www.buzzsprout.com/1173590/${
          sortedBuzzsproutData.reduce((a, b) => {
            return a.total_plays > b.total_plays ? a : b;
          }).id
        }">Highest Performing Episode's Artist</a>`]: TextCleaner(
          sortedBuzzsproutData
            .reduce((a, b) => {
              return a.total_plays > b.total_plays ? a : b;
            })
            .title.split(`(`)[1]
            .split(`)`)[0]
        )
          .trim()
          .valueOf()
      }, // highest performing episode artist
      {
        "Highest No. Of Episodes": authorsArrayOutput.reduce((a, b) => {
          return a.entries > b.entries ? a : b;
        }).author
      }, // highest number of episodes artist
      {
        "Longest Total Story Time": authorsArrayOutput.reduce((a, b) => {
          return a.duration > b.duration ? a : b;
        }).author
      }, // longest story time artist (in seconds)
      {
        "Highest Average Download Count": authorsArrayOutput.reduce((a, b) => {
          return a.downloads / a.entries > b.downloads / b.entries ? a : b;
        }).author
      }, // highest average download count by artist
      {
        "Highest number of scientific stories": "डॅा. सौ. आरती जुवेकर."
      }
    ];
    // an array for artists
    var artistArray = [];
    // loop over awards
    awards.forEach((award) => {
      var key = Object.entries(award)[0][0];
      var value = Object.entries(award)[0][1];
      if (
        typeof artistArray.find(({ artist: artist }) => artist == value) ==
        `undefined`
      ) {
        artistArray.push({ artist: value, awards: [key], NoOfAwards: 1 });
      } else {
        module.exports.FindAKeyInAnArrayOfObjects(
          artistArray,
          `artist`,
          value,
          (_array, indexes) => {
            indexes.forEach((Index) => {
              artistArray[Index].awards.push(key);
              artistArray[Index].NoOfAwards = artistArray[Index].NoOfAwards + 1;
            });
          }
        );
      }
    });
    var highestAwards = 0;
    var highestAwardsArtist = ``;
    var tempAwardString = ``;
    // loop over artists
    artistArray.forEach((artist) => {
      var artistName = artist.artist;
      var artistAwards = artist.awards;
      var artistNoOfAwards = artist.NoOfAwards;
      if (artistNoOfAwards > highestAwards) {
        highestAwards = artistNoOfAwards;
        highestAwardsArtist = artistName;
      }
      // loop over awards
      artistAwards.forEach((award) => {
        tempAwardString += `<h4>🏅 The ${award} Award is Earned By ${artistName}</h4>`;
      });
    });
    // check if two or more artists have the same number of awards
    artistArray.forEach((artist) => {
      if (
        artist.NoOfAwards == highestAwards &&
        highestAwardsArtist != artist.artist
      ) {
        awardsString = `<h3>🏅It Is A Tie Between ${highestAwardsArtist} And ${artist.artist} Each Getting a Total of ${highestAwards}/9 Awards Congratulations!</h3>${tempAwardString}`;
      } else {
        awardsString = `<h3>🏅${highestAwards}/9 Awards are Earned By ${highestAwardsArtist} Congratulations!</h3>${tempAwardString}`;
      }
    });
    return awardsString;
  },

  /**
   * Finds indexes of objects in an array that have a specific key-value pair
   * @param {array} array - Array of objects
   * @param {string} key - Key to search for
   * @param {any} value - Value to match
   * @param {function} after - Callback function to handle the results
   */
  // Function to find objects in an array based on a specific key-value pair and execute a callback function on the found objects
  FindAKeyInAnArrayOfObjects: (array, key, value, after) => {
    var indexes = []; // Array to store the indexes of the found objects

    // Iterate over each item in the array
    array.forEach((item, i) => {
      // Check if the current item has a key-value pair matching the provided key and value
      if (item[key] == value) {
        indexes.push(i); // Add the index of the found object to the indexes array
      }
    });

    after(array, indexes); // Execute the provided callback function with the original array and the indexes of the found objects
  },
  /**
   * Removes objects from an array based on a specific attribute and value
   * @param {array} arr - Array of objects
   * @param {string} attr - Attribute to compare
   * @param {any} value - Value to match
   * @returns {array} - Updated array with objects removed
   */
  removeByAttr: (arr, attr, value) => {
    var i = arr.length;
    while (i--) {
      if (
        arr[i] &&
        arr[i].hasOwnProperty(attr) &&
        arguments.length > 2 &&
        arr[i][attr] === value
      ) {
        arr.splice(i, 1);
      }
    }
    return arr;
  }
};
