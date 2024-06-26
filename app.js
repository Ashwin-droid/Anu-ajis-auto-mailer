//imports
require(`dotenv`).config();
const rh = require(`./right-hand.js`);
const TextCleaner = require(`text-cleaner`);
const topics = require(`./topics.js`);

//body
var longStringOfInformation;

async function main() {
  var BuzzsproutResponse = [];
  var quote = "";
  var extraordinaryBit = false;
  var extraordinarytitles = [];
  var injection = "";
  var bingurl = "";
  var bingtitle = "";

  //load all data
  async function fetchData() {
    BuzzsproutResponse = await rh.buzzsprout.read();
    quote = await rh.QuoteRequest();
    const btd = await rh.bingImageOfTheDay();

    bingurl = btd.url;
    bingtitle = btd.title;
  }

  fetchData().then(postfech);

  async function postfech() {
    longStringOfInformation = `<!DOCTYPE html><html><head> <meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body> <h1>Good Morning</h1><h2>Image of the day</h2><h3>${bingtitle}</h3><img src="${bingurl}" alt="${bingtitle}" /><br />${injection}<h2>Quote</h2> <br /> <strong><h3>${quote}<h3></strong> <br /> <h2>✨Stats</h2><h4>Total entries ${BuzzsproutResponse.length} </h4> <p>`;
    // sort data based on highest value
    BuzzsproutResponse.sort((a, b) => b.total_plays - a.total_plays);
    //filter data
    var Top3AndLatest5 = "";
    var total_plays = 0;
    var duration = 0;
    var totalPlayTime = 0;
    var artists = [];
    var stringifiedTitles = "";
    const today = new Date();
    // beating heart of the code,the compound iterator
    // Call the function and store the results in a variable
    var results = await rh.CheckForArtist(BuzzsproutResponse);

    // Extract the required data from the results

    // Iterate through each item in the titlesFinalArray array
    results.titlesFinalArray.forEach((item, i) => {
      // Get the date of the episode
      const episodeDate = new Date(item.published_at);
      // Check if the episode was published in the current year
      if (episodeDate.getFullYear() == today.getFullYear()) {
        year = "";
      } else {
        year = `/${episodeDate.getFullYear()}`;
      }
      // Add the episode title and total plays to the stringifiedTitles variable
      stringifiedTitles = `${stringifiedTitles}${episodeDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${(episodeDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${year}> ${item.title} >> ${item.total_plays}<br />`;
    });

    // Set the artists variable to the authors array from the CheckForArtist function
    artists = results.authors;
    // Set the extraordinarytitles variable to the extraordinaryTitles array from the CheckForArtist function
    extraordinarytitles = results.extraordinaryTitles;
    // Set the extraordinaryBit variable to the extraordinaryBit value from the CheckForArtist function
    extraordinaryBit = results.extraordinaryBit;

    // Process topics
    const precheck = (await topics.checkTags()).containsUnlabelledEpisodes;
    var topicsTableHTML =
      "<h2>✨Topics</h2><table><tr><td><h3>Topic</h3></td><td><h3>Entries</h3></td><td><h3>Time</h3></td><td><h3>Plays</h3></td><td><h3>Most popular artist</h3></td><td><h3>Average</h3></td></tr>";
    if (precheck) {
      await topics.topicLabeller(5);
    }
    const stats = await topics.statsAnalyser(extraordinarytitles);
    const tags = Object.entries(stats.topics.tags)
      .map(([key, value]) => ({
        key: key,
        value: value
      }))
      .sort((a, b) => b.value.plays - a.value.plays); // Sorting tags by number of plays in descending order

    const artistss = stats.artists;

    // Create a map to store most popular artist by plays for each topic
    let mostPopularArtists = {};

    // Iterate over artists to fill the mostPopularArtists map
    artistss.forEach((artist) => {
      let artistTags = artist.tags.tags;
      for (let tag in artistTags) {
        if (
          !mostPopularArtists[tag] ||
          artistTags[tag].plays > mostPopularArtists[tag].plays
        ) {
          mostPopularArtists[tag] = {
            artist: artist.name,
            plays: artistTags[tag].plays
          };
        }
      }
    });

    // Use mostPopularArtists in table rows
    tags.forEach((tag) => {
      let popularArtist = mostPopularArtists[tag.key]
        ? mostPopularArtists[tag.key].artist
        : "N/A";
      topicsTableHTML += `<tr><td style='padding:10px;'>${tag.key}</td><td>${
        tag.value.entries
      }</td><td style='padding:10px;'>${rh.getFormattedTime(
        tag.value.time
      )}</td><td>${
        tag.value.plays
      }</td><td style='padding:10px;'>${popularArtist}</td><td style='padding:10px;'>${Math.round(
        tag.value.plays / tag.value.entries
      )}</td></tr>`;
    });
    topicsTableHTML += "</table>";

    let artistTableHTML = "<h2>✨Artists</h2><table><tr><td><h3>Artist</h3></td><td><h3>Tag</h3></td><td><h3>Entries</h3></td><td><h3>Time</h3></td><td><h3>Plays</h3></td></tr>";
    let artistInfo = {};

    artistss.sort((a, b) => {
      // Sum total plays for artist b
      const bTotalPlays = Object.values(b.tags.tags).reduce((total, tag) => total + tag.plays, 0);
      // Sum total plays for artist a
      const aTotalPlays = Object.values(a.tags.tags).reduce((total, tag) => total + tag.plays, 0);
      return bTotalPlays - aTotalPlays; // Sorting in descending order
    });    

    artistss.forEach((artist) => {
      // Ensure that artist.tags and artist.tags.tags exist and are objects
      if (artist.tags && typeof artist.tags.tags === "object") {
        let artistTags = Object.entries(artist.tags.tags).sort(
          (a, b) => b[1].plays - a[1].plays
        ); // Sorting each artist's tags by plays in descending order

        // Iterate over each tag
        artistTags.forEach(([key, tag]) => {
          if (!artistInfo[artist.name]) {
            artistInfo[artist.name] = {
              tags: [],
              entries: [],
              time: [],
              plays: [],
              totalPlays: 0,
              totalTime: 0
            };
          }
          artistInfo[artist.name].tags.push(key);
          artistInfo[artist.name].entries.push(tag.entries);
          artistInfo[artist.name].time.push(tag.time);
          artistInfo[artist.name].plays.push(tag.plays);
          artistInfo[artist.name].totalPlays += tag.plays;
          artistInfo[artist.name].totalTime += tag.time;
        });
      }
    });

    Object.entries(artistInfo).forEach(([name, info]) => {
      if (info.tags.length > 0) {
        artistTableHTML += `<tr><td rowspan="${info.tags.length}" style='padding:10px;'>${name}</td>`;
        info.tags.forEach((tag, index) => {
          if (index > 0) {
            artistTableHTML += "<tr>";
          }
          artistTableHTML += `<td style='padding:10px;'>${tag}</td><td>${
            info.entries[index]
          }</td><td>${rh.getFormattedTime(info.time[index])}</td><td>${
            info.plays[index]
          }</td></tr>`;
        });
        artistTableHTML += `<tr><td colspan="2" style='text-align:right;'>Total</td><td>${info.entries.reduce(
          (a, b) => a + b,
          0
        )}</td><td>${rh.getFormattedTime(info.totalTime)}</td><td>${
          info.totalPlays
        }</td></tr><hr/>`;
      }
    });

    artistTableHTML += "</table>";
    topicsTableHTML += artistTableHTML;

    //general iterator (vague)

    // Initialize variables for calculating stats
    total_plays = 0;
    duration = 0;
    totalPlayTime = 0;

    // Loop through each episode in BuzzsproutResponse
    BuzzsproutResponse.forEach((item, _i) => {
      // Add to total plays and duration
      total_plays += item.total_plays;
      duration += item.duration;

      // Calculate total play time
      totalPlayTime += item.duration * item.total_plays;

      // Check if episode title contains artist name in parentheses
      if (!extraordinaryBit) {
        const cleanArtist = TextCleaner(item.title.split(`(`)[1].split(`)`)[0])
          .trim()
          .valueOf();

        // If artist name in episode title is different from artist name in metadata, update metadata
        if (item.artist != cleanArtist) {
          rh.buzzsprout.write(item.id, { artist: cleanArtist });
        }
      }
    });

    //first 3 highest episodes
    let topEpisodes = "";
    const emojis = ["🥇", "🥈", "🥉"];
    for (let i = 0; i < 3; i++) {
      topEpisodes += `<h${i + 2}>${emojis[i]} ${
        i + 1
      }. <a href="https://www.buzzsprout.com/1173590/${
        BuzzsproutResponse[i].id
      }">${BuzzsproutResponse[i].title}</a> which has ${
        BuzzsproutResponse[i].total_plays
      } downloads </h${i + 2}>`;
    }
    Top3AndLatest5 = topEpisodes + `<br/> <h4>Runner ups</h4>`;

    //Runner ups
    for (let i = 3; i <= 5; i++) {
      Top3AndLatest5 += `<h5><a href="https://www.buzzsprout.com/1173590/${BuzzsproutResponse[i].id}">${BuzzsproutResponse[i].title}</a> which has ${BuzzsproutResponse[i].total_plays} downloads </h5>`;
    }

    //sort authors according to highest value
    artists.sort((a, b) => b.downloads - a.downloads);

    Top3AndLatest5 += `<h1>Featured 5</h1>`;

    // featured 5
    // total plays for latest 5 & tabulate the data
    // Initialize total play count
    let tply = 0;

    // Loop through 5 random episodes from BuzzsproutResponse
    for (let i = 0; i < 5; i++) {
      // Generate a random index within the length of BuzzsproutResponse
      const randomIndex = Math.floor(Math.random() * BuzzsproutResponse.length);

      // Get the episode at the random index
      const episode = BuzzsproutResponse[randomIndex];

      // Add the total plays of the episode to the total play count
      tply += episode.total_plays;

      // Create a string with the episode title, total plays, and a link to the episode
      const episodeString = `<h6>${
        i + 1
      }) Title: <a href="https://www.buzzsprout.com/1173590/${episode.id}">${
        episode.title
      }</a> which has ${episode.total_plays} downloads</h6><hr>`;

      // Add the episode string to the Top3AndLatest5 variable
      Top3AndLatest5 += episodeString;
    }
    Top3AndLatest5 += `<hr><h5><strong> Total : ${tply} <br /> Average : ${Math.round(
      tply / 5
    )}</strong></h5>`;
    // garbage for the table
    // Initialize variables for calculating stats
    total_plays = 0;
    duration = 0;
    totalPlayTime = 0;

    // Loop through each episode in BuzzsproutResponse
    BuzzsproutResponse.forEach((item, _i) => {
      // Add to total plays and duration
      total_plays += item.total_plays;
      duration += item.duration;

      // Calculate total play time
      totalPlayTime += item.duration * item.total_plays;
    });

    // Sort authors according to highest value
    artists.sort((a, b) => b.downloads - a.downloads);

    // Initialize HTML table for authors
    let TableOfAuthors = `<table><tr><td><h3>Artist</h3></td><td><h3>Views</h3></td><td style='padding:10px'><h3>Entries</h3></td><td><h3>Average</h3></td><td style='padding:10px;' ><h3>Time</h3></td><td><h3>Play Time</h3></td></td><td><h3>Activity</h3></td></tr>`;

    // Initialize HTML for extraordinary titles
    let ExtraOrdinaryHtml;
    if (extraordinaryBit) {
      ExtraOrdinaryHtml = `<h1>✨Some Code-Breaking ExtraOrdinary Titles</h1>`;
      extraordinarytitles.forEach((item, i) => {
        var id = i + 1;
        ExtraOrdinaryHtml = `${ExtraOrdinaryHtml} <h2>Title no ${id}, Title <a href="https://www.buzzsprout.com/1173590/episodes/${item.id}">${item.title}</a> </h2>`;
      });
      longStringOfInformation += ExtraOrdinaryHtml;
    }

    // Loop through each author and add to HTML table
    artists.forEach((item, _i) => {
      // Determine activity status
      let activityInString = "";
      if (item.inactive) {
        activityInString = `<p style="color:red">Inactive</p>`;
      } else {
        activityInString = `<p style="color:green">Active</p>`;
      }

      // Add author information to HTML table
      TableOfAuthors = `${TableOfAuthors} <tr><td style='padding:10px'>${
        item.author
      }</td><td>${item.downloads.toString()}</td><td style='padding:10px;'>${
        item.entries
      }</td><td>${Math.round(
        item.downloads / item.entries
      )}</td><td>${rh.getFormattedTime(
        item.duration
      )}</td><td style='padding:10px;'>${rh.getFormattedTime(
        item.TPlayTime
      )}</td><td style='padding:10px;'>${activityInString}</td></tr>`;
    });

    // Calculate average downloads per episode
    const avgdown = Math.round(total_plays / BuzzsproutResponse.length);

    // Add total stats to HTML
    TableOfAuthors = TableOfAuthors + `<table>`;
    longStringOfInformation = `${longStringOfInformation} ${TableOfAuthors} </p><h3><strong>Total plays on all episodes ${total_plays} <br />Average downloads per episode : ${avgdown}<br />Total time on all episodes : ${rh.getFormattedTime(
      duration
    )}<br />Total play time on all episodes : ${rh.getFormattedTime(
      totalPlayTime
    )} </strong></h3>${Top3AndLatest5} ${rh.award(
      BuzzsproutResponse,
      artists
    )}<br/><br/>${topicsTableHTML}<br/><br/><p><strong>${stringifiedTitles}</strong></p></body></html>`;

    // Send email with longStringOfInformation
    rh.email(longStringOfInformation);
  }
}
main();
