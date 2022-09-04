//imports
const env = require(`dotenv`).config();
const rh = require(`./right-hand.js`);
const TextCleaner = require(`text-cleaner`);

//body
var longStringOfInformation;

async function main(){
  var BuzzsproutResponse = [];
  var quote = "";
  var extraordinaryBit = false;
  var extraordinarytitles = [];
  var injection = "";
  var bingurl = "";
  var bingtitle = "";

  //load all data
  rh.buzzsprout.read((bd) => {
    BuzzsproutResponse = bd;
    rh.QuoteRequest((qt) => {
      quote = qt;
      rh.bingImageOfTheDay((btd) => {
        bingurl = btd.url;
        bingtitle = btd.title;
        
        postfech();
      });
    });
  });

  async function postfech() {
    longStringOfInformation = `<!DOCTYPE html><html><head> <meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body> <h1>Good Morning</h1><h2>Image of the day</h2><h3>${bingtitle}</h3><img src="${bingurl}" alt="${bingtitle}" /><br />${injection}<h2>Quote</h2> <br /> <strong><h3>${quote}<h3></strong> <br /> <h2>Stats</h2><h4>Total entries ${BuzzsproutResponse.length} </h4> <p>`;
    // sort data based on highest value
    BuzzsproutResponse.sort((a, b) => {
      if (a.total_plays > b.total_plays) {
        return -1;
      }
      if (a.total_plays < b.total_plays) {
        return 1;
      }
      return 0;
    });
    //filter data
    var Top3AndLatest5 = "";
    var total_plays = 0;
    var duration = 0;
    var totalPlayTime = 0;
    var artists = [];
    // beating heart of the code,the compound illitrator
    rh.CheckForArtist(BuzzsproutResponse, (authorArray, extTitles, extbit) => {
      console.log(JSON.stringify(authorArray))
      artists = authorArray;
      extraordinarytitles = extTitles;
      extraordinaryBit = extbit;
    });
    //genral illitrator (vague)
    BuzzsproutResponse.forEach((item, _i) => {
      total_plays = total_plays + item.total_plays;
      duration = duration + item.duration;
      totalPlayTime = totalPlayTime + item.duration * item.total_plays;
      if (!extraordinaryBit) {
        var cleanArtist = TextCleaner(item.title.split(`(`)[1].split(`)`)[0])
          .trim()
          .valueOf();
        if (item.artist != cleanArtist) {
          rh.buzzsprout.write(item.id, { artist: cleanArtist });
        }
      }
    });

    //first 3 highest episodes
    Top3AndLatest5 = `<h2>🥇🏆🎉First, <a href="https://www.buzzsprout.com/1173590/${BuzzsproutResponse[0].id}">${BuzzsproutResponse[0].title}</a> which has ${BuzzsproutResponse[0].total_plays} downloads </h2>`;
    Top3AndLatest5 += `<h3>🥈🏆🎉Second, <a href="https://www.buzzsprout.com/1173590/${BuzzsproutResponse[1].id}">${BuzzsproutResponse[1].title}</a> which has ${BuzzsproutResponse[1].total_plays} downloads </h3>`;
    Top3AndLatest5 += `<h4>🥉🏆🎉Third, <a href="https://www.buzzsprout.com/1173590/${BuzzsproutResponse[2].id}">${BuzzsproutResponse[2].title}</a> which has ${BuzzsproutResponse[2].total_plays} downloads </h4>`;
    Top3AndLatest5 += `<br/> <h4>Runner ups</h4>`;

    //Runner ups
    Top3AndLatest5 += `<h5><a href="https://www.buzzsprout.com/1173590/${BuzzsproutResponse[3].id}">${BuzzsproutResponse[3].title}</a> which has ${BuzzsproutResponse[3].total_plays} downloads </h5>`;
    Top3AndLatest5 += `<h5><a href="https://www.buzzsprout.com/1173590/${BuzzsproutResponse[4].id}">${BuzzsproutResponse[4].title}</a> which has ${BuzzsproutResponse[4].total_plays} downloads </h5>`;
    Top3AndLatest5 += `<h5><a href="https://www.buzzsprout.com/1173590/${BuzzsproutResponse[5].id}">${BuzzsproutResponse[5].title}</a> which has ${BuzzsproutResponse[5].total_plays} downloads </h5>`;

    //sort authors according to highest value
    artists.sort((a, b) => {
      if (a.downloads > b.downloads) {
        return -1;
      }
      if (a.downloads < b.downloads) {
        return 1;
      }
      return 0;
    });

    Top3AndLatest5 += `<h1>Featured 5</h1>`;

    // featured 5
    var tply = 0;
    // total plays for latest 5 & tabulate the data
    for (var i = 0; i < 5; i++) {
      var Rn = Math.round(Math.random() * BuzzsproutResponse.length);
      tply += BuzzsproutResponse[Rn].total_plays;
      Top3AndLatest5 += `<h6>${
        i + 1
      }) Title:  <a href="https://www.buzzsprout.com/1173590/${
        BuzzsproutResponse[Rn].id
      }">${BuzzsproutResponse[Rn].title} </a>which has  ${
        BuzzsproutResponse[Rn].total_plays
      } downloads</h6><hr>`;
    }
    Top3AndLatest5 += `<hr><h5><strong> Total : ${tply} <br /> Avrage : ${Math.round(
      tply / 5
    )}</strong></h5>`;
    // garbage for the table
    var TableOfAuthors = `<table><tr><td><h3>Artist</h3></td><td><h3>Views</h3></td><td style='padding:10px'><h3>Entries</h3></td><td><h3>Avrage</h3></td><td style='padding:10px;' ><h3>Time</h3></td><td><h3>Play Time</h3></td></tr>`;
    var ExtraOrdinaryHtml;
    if (extraordinaryBit) {
      ExtraOrdinaryHtml = `<h1>Some Code-Breaking ExtraOrdinary Titles</h1>`;
      extraordinarytitles.forEach((item, i) => {
        var id = i + 1;
        ExtraOrdinaryHtml = `${ExtraOrdinaryHtml} <h2>Title no ${id}, Title ${item.title} </h2>`;
      });
      longStringOfInformation += ExtraOrdinaryHtml;
    }
    artists.forEach((item, _i) => {
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
      )}</td></tr>`;
    });
    var avgdown = Math.round(total_plays / BuzzsproutResponse.length);
    TableOfAuthors = TableOfAuthors + `<table>`;
    longStringOfInformation = `${longStringOfInformation} ${TableOfAuthors} </p><h3><strong>Total plays on all episodes ${total_plays} <br />Avrage downloads per episode : ${avgdown}<br />Total time on all episodes : ${rh.getFormattedTime(
      duration
    )}<br />Total play time on all episodes : ${rh.getFormattedTime(
      totalPlayTime
    )} </strong></h3>${Top3AndLatest5} ${rh.award(
      BuzzsproutResponse,
      artists
    )}</body></html>`;
    rh.email(longStringOfInformation);
  }
}
main();