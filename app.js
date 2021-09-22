//imports
const env = require("dotenv").config();
const express = require("express");
const rh = require("./right-hand.js");
const TextCleaner = require("text-cleaner");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());

//body

var port = process.env.PORT || 3000;
var longStringOfInformation;
var temp;
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.redirect("/tools/validity");
});

app.get("/autotrg/ifttt/auth/" + process.env.AUTH_KEY, (_req, res) => {
  res.send("Action Started");
  var websiteContent;
  var quote;
  var extraordinaryBit = false;
  var extraordinarytitles = [];

  rh.buzzsprout.read((bd) => {
    websiteContent = bd;
    rh.QuoteRequest((qt) => {
      quote = qt;
      postfech();
    });
  }, process.env.API_KEY);

  function postfech() {
    var longStringOfInformation =
      "<!DOCTYPE html><html><head></head><body> <h1>Good Morning</h1><h2>Quote</h2> <br /> <strong><h3>" +
      quote +
      "<h3></strong> <br /> <h2>Stats</h2><h4>Total entries " +
      websiteContent.length +
      "</h4> <p>";
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
    const highestValue = websiteContent[1].total_plays;
    const lowestValue = websiteContent[websiteContent.length - 1].total_plays;
    const fiveUnEqualDivisions = (highestValue - lowestValue) / 5;
    const first = fiveUnEqualDivisions - 50,
      second = fiveUnEqualDivisions * 2 - 50,
      third = fiveUnEqualDivisions * 3 - 50,
      forth = fiveUnEqualDivisions * 4 - 50;
    //filter data
    var htmlString;
    var total_plays = 0;
    var perf;
    var authors = [];
    rh.CheckForAuthors(websiteContent, (authorArray, extTitles, extbit) => {
      authors = authorArray;
      extraordinarytitles = extTitles;
      extraordinaryBit = extbit;
    });
    websiteContent.forEach((item, _i) => {
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
        htmlString =
          "Title: " +
          item.title +
          " ;  <a href=" +
          item.audio_url.toString() +
          "> Location</a> ;  Downloads: " +
          item.total_plays +
          "; Published date: " +
          item.published_at.split("T")[0] +
          "; Performance: " +
          "&#128526;&#9786;&#129315;&#128077; (Has no defination)" +
          "<br/><br/>";
      } else {
        htmlString =
          htmlString +
          "Title: " +
          item.title +
          " ;  <a href=" +
          item.audio_url.toString() +
          "> Location</a> ;  Downloads: " +
          item.total_plays +
          "; Published date: " +
          item.published_at.split("T")[0] +
          "; Performance: " +
          perf +
          "<br/><br/>";
      }
      total_plays = total_plays + item.total_plays;
    });
    authors.sort((a, b) => {
      if (a.downloads > b.downloads) {
        return -1;
      }
      if (a.downloads < b.downloads) {
        return 1;
      }
      return 0;
    });
    var preString =
      "<table><tr><td><h3>Author</h3></td><td><h3>Views</h3></td><td style='padding:10px'><h3>Entries</h3></td></tr>";
    var ExtraOrdinaryHtml;
    if (extraordinaryBit) {
      ExtraOrdinaryHtml = "<h1>Some Code-Breaking ExtraOrdinary Titles</h1>";
      extraordinarytitles.forEach((item, i) => {
        var id = i + 1;
        ExtraOrdinaryHtml =
          ExtraOrdinaryHtml +
          "<h2>Title no " +
          id +
          ", Title " +
          item.title +
          "</h2>";
        rh.email(ExtraOrdinaryHtml);
      });
    }
    authors.forEach((item, _i) => {
      preString =
        preString +
        "<tr><td style='padding:10px'>" +
        item.author +
        "</td><td>" +
        item.downloads.toString() +
        "</td><td style='padding:10px'>" +
        item.entries +
        "</td></tr>";
    });
    preString = preString + "<table>";
    longStringOfInformation =
      longStringOfInformation +
      preString +
      "</p><h3><strong>Total plays on all podcasts " +
      total_plays +
      "</strong><h3>" +
      htmlString +
      '<a href="https://anu-aji-automailer.herokuapp.com/tools/validity"><p>Administration</p></a></body></html>';
    rh.email(longStringOfInformation);
  }
});

app.get("/split/mailer/" + process.env.AUTH_KEY, (_req, res) => {
  rh.buzzsprout.read(postdone, process.env.API_KEY);
  function postdone(data) {
    var authors = [];
    var extraordinaryBit = false;
    rh.CheckForAuthors(data, (authorArray, _extTitles, extbit) => {
      authors = authorArray;
      extraordinaryBit = extbit;
    });
    data.sort((a, b) => {
      if (a.total_plays > b.total_plays) {
        return -1;
      }
      if (a.total_plays < b.total_plays) {
        return 1;
      }
      return 0;
    });
    authors.sort((a, b) => {
      if (a.downloads > b.downloads) {
        return -1;
      }
      if (a.downloads < b.downloads) {
        return 1;
      }
      return 0;
    });
    if (extraordinaryBit) {
      res.send(
        "<h1>You have extraordinary titles, please re-request the daily mail and fix the extraordinary titles to proceed</h1>"
      );
    } else {
      res.send("Action Started");
      var author;
      var total_plays;
      var htmlString = "";
      authors.forEach((item, _i) => {
        total_plays = 0;
        htmlString = "";
        longStringOfInformation = "";
        author = item.author;
        longStringOfInformation =
          "<!DOCTYPE html><html><head></head><body><h1>Good morning, " +
          author +
          "</h1><br/><br/>";
        data.forEach((uslessInfo, _i) => {
          if (
            author ==
            TextCleaner(uslessInfo.title.split("(")[1])
              .remove(")")
              .trim()
              .valueOf()
          ) {
            total_plays = total_plays + uslessInfo.total_plays;
            htmlString =
              htmlString +
              "<h3>Title : " +
              uslessInfo.title +
              "<a href=" +
              uslessInfo.audio_url.toString() +
              "> Location</a> ;  Downloads: " +
              uslessInfo.total_plays +
              "; Published date: " +
              uslessInfo.published_at.split("T")[0] +
              "<br/></h3>";
          }
        });
        var preString =
          "<table><tr><td><h3>Author</h3></td><td><h3>Views</h3></td><td style='padding:10px'><h3>Entries</h3></td></tr>";
        authors.forEach((item, _i) => {
          preString =
            preString +
            "<tr><td style='padding:10px'>" +
            item.author +
            "</td><td>" +
            item.downloads.toString() +
            "</td><td style='padding:10px'>" +
            item.entries +
            "</td></tr>";
        });
        preString = preString + "<table>";
        longStringOfInformation =
          longStringOfInformation +
          "<h2>Total plays on all your podcasts " +
          total_plays +
          "</h2>" +
          htmlString +
          preString;
        rh.email(longStringOfInformation);
      });
    }
  }
});

app.get("/find/and/replace", (req, res) => {
  if (req.query.key == process.env.AUTH_KEY2) {
    var HTML = `<!DOCTYPE html><html> <head><script>var hrefTracker;var hrefTracker2; console.log(hrefTracker);console.log(hrefTracker2);</script> <meta charset="utf-8"/> <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-F3w7mX95PdgyTmZZMECAngseQB83DfGTowi0iMjiWaeVhAn4FJkqJByhZMI3AhiU" crossorigin="anonymous"/> </head> <body> <div style="margin: 10px" class="position-absolute top-50 start-50 translate-middle" > <div class="encoder"> <div class="input-group flex-nowrap margin-10"> <span class="input-group-text" id="addon-wrapping02">Find</span> <div class="dropdown form-control" aria-describedby="addon-wrapping01" > <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false" > Author </button> <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">`;
    var author = "";
    rh.buzzsprout.read((data) => {
      rh.CheckForAuthors(data, (authors, _ul, extbit) => {
        if (!extbit) {
          authors.forEach((item, i) => {
            author = item.author;
            HTML = HTML + `<li><a class="dropdown-item" href="#" onclick="javascript:hrefTracker = '?find=' + '${author}' + '&'; document.getElementById('dropdownMenuButton1').innerHTML = '${author}';" id="${author}">${author}</a></li>`;
          });
          HTML = HTML + `</ul> </div><button type="button" class="btn btn-outline-success" id="submit" onclick="disabler()"> Next </button> </div></div><div id="magisk" style="margin-top: 10px" class="encoder d-none"> <div class="input-group flex-nowrap margin-10"> <span class="input-group-text" id="addon-wrapping02">Replace</span> <div class="dropdown form-control" aria-describedby="addon-wrapping01" > <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false" > Author </button> <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton2">`;
          authors.forEach((item, i) => {
            author = item.author;
            HTML = HTML + `<li><a class="dropdown-item" href="#" onclick="javascript:hrefTracker2 = 'replace=' + '${author}'; document.getElementById('dropdownMenuButton2').innerHTML = '${author}';" id="${author}1">${author}</a></li>`;
          });
          HTML = HTML + ` </ul> </div><button type="button" class="btn btn-outline-success" id="post">Go</button> </div></div><a id="blanklink"></a> <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-gtEjrD/SeCtmISkJkNUaaKMoLD0//ElJ19smozuHV6z3Iehds+3Ulb9Bn9Plx0x4" crossorigin="anonymous" ></script> <script>var submit=document.querySelector("#submit"); var element=document.querySelector("#magisk"); submit.addEventListener("click", ()=>{element.classList.remove("d-none");}); function disabler(){document.getElementById("submit").disabled = true; document.getElementById("dropdownMenuButton1").disabled = true; } post.addEventListener("click", ()=>{var params = hrefTracker + hrefTracker2; document.getElementById("blanklink").href = "/find/and/replace/handler" + params; document.getElementById("blanklink").click(); });</script> </div></body></html>`;
          res.send(HTML);
        } else {
          res.send("<h1>Extraordinary titles detected</h1>");
        }
      });
    }, process.env.API_KEY);
  } else {
    res.send("<h1>Incorrect Key</h1>")
  }
});

app.post("/find/and/replace/confirm", (req, res) => {
  if (req.cookies.auth == process.env.AUTH_KEY3) {
    res.send(`<script>setTimeout(() => {window.location.href = "/find/and/replace?key=${process.env.AUTH_KEY2}";}, 20000)</script><h1>Please wait.......Redirecting</h1>`);
    var find = req.body.find;
    var replace = req.body.replace;
    var id;
    var title;
    var modtitle;
    rh.buzzsprout.read((data) => {
      data.forEach((item, i) => {
        if (item.title.search(find) !== -1) {
          id = item.id;
          title = item.title;
          modtitle = `${item.title.split("(")[0]} ( ${replace} )`;
          rh.buzzsprout.write(id, {"title" : modtitle}, process.env.API_KEY);
        }
      });
    }, process.env.API_KEY);
  }
});

app.get("/find/and/replace/handler", (req, res) =>{
  if (req.cookies.auth == process.env.AUTH_KEY3) {
    var authorName1 = req.query.find;
    var authorName2 = req.query.replace;
    res.send(`<!DOCTYPE html><html> <head> <meta charset="utf-8"/> <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-F3w7mX95PdgyTmZZMECAngseQB83DfGTowi0iMjiWaeVhAn4FJkqJByhZMI3AhiU" crossorigin="anonymous"/> </head> <body style="background-color: red;"><div style="margin: 10px;" class="position-absolute top-50 start-50 translate-middle"><h1 class="display-1" style="color: white;">WARNING</h1><h1 class="display-5" style="color: white;">This will permanantly overwrite ${authorName1} <br/> with ${authorName2}; This is the last warning</h1><br/><p style="color: white;">The only to go back is to rename all authors manually.<br/>You have been warned.</p><form action="/find/and/replace/confirm" method="post"><div class="d-grid gap-2" style="background-color: white;"><input type='hidden' name='find' value='${authorName1}' /><input type='hidden' name='replace' value='${authorName2}' /><button type="submit" class="btn btn-outline-danger btn-lg" >I Confirm, Proceed</button></div></form></div>`);
  } else {
    res.send("<h1>Incorrect cookies</h1>")
  }
});

app.get("/tools/validity/", (_req, res) => {
  res.send(
    '<!DOCTYPE html><html lang="en" dir="ltr"> <head> <meta charset="utf-8"><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous"> </head> <body> <form action="/tools/validity" method="post"> <div class="position-absolute top-50 start-50 translate-middle"> <div class="encoder"> <div class="input-group flex-nowrap margin-10"> <span class="input-group-text" id="addon-wrapping01">Password</span> <input name="password" type="password" id="inputPassword6" class="form-control" aria-describedby="passwordHelpInline"> <button type="submit" class="btn btn-outline-success" id="submit">Submit</button> </div></div></div></form> </body></html>'
  );
});

app.post("/tools/validity/", (req, res) => {
  var password = req.body.password;
  if (password == process.env.PASSWORD) {
    res.cookie("auth", process.env.AUTH_KEY3, {
      maxAge: 5000000,
      secure: true,
      httpOnly: true,
      sameSite: "Strict"
    });
    res.redirect("/administration/tools/?key=" + process.env.AUTH_KEY2);
  } else {
    res.send("<h1>Incorrect Password</h1>");
  }
});

app.get("/administration/tools/", (req, res) => {
  const key = req.query.key;
  if (key == process.env.AUTH_KEY2) {
    longStringOfInformation =
      '<!DOCTYPE html><html><head><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-F3w7mX95PdgyTmZZMECAngseQB83DfGTowi0iMjiWaeVhAn4FJkqJByhZMI3AhiU" crossorigin="anonymous"></head><body><div class="d-flex align-items-center justify-content-center"><h1 class="display-1">Admin tools</h1></div><form action="/admin/handler" method="post"><div style="padding: 100px" class="list-group">';
    var administrationTools = [
      {
        url: "/admin/handler?param=dmail&auth=" + process.env.AUTH_KEY2 + "&",
        text: "Re-Request Daily Mail"
      },
      {
        url: "/admin/handler?param=smail&auth=" + process.env.AUTH_KEY2 + "&",
        text: "Request A split mail"
      },{
        url: "/admin/handler?param=far&auth=" + process.env.AUTH_KEY2 + "&",
        text: "Find and replace authors"
      }
    ];
    administrationTools.forEach((item) => {
      longStringOfInformation =
        longStringOfInformation +
        '<button formaction="' +
        item.url +
        'type="submit" class="list-group-item list-group-item-action">' +
        item.text +
        "</button>";
    });
    res.send(longStringOfInformation);
  } else {
    res.send("<h1>Incorrect key value</h1>");
  }
});

app.post("/admin/handler/", (req, res) => {
  const auth = req.query.auth;
  if (req.cookies.auth == process.env.AUTH_KEY3) {
    if (auth == process.env.AUTH_KEY2) {
      const target = req.query.param;
      if (target == "dmail") {
        res.redirect("/autotrg/ifttt/auth/" + process.env.AUTH_KEY);
      } else if (target == "smail") {
        res.redirect("/split/mailer/" + process.env.AUTH_KEY);
      } else if (target == "far") {
        res.redirect("/find/and/replace?key=" + process.env.AUTH_KEY2);
      } else {
        res.send("<h1>Failure</h1>");
      }
    } else {
      res.send("<h1>Incorrect Key</h1>");
    }
  } else {
    res.send("<h1>Incorrect Cookie</h1>");
  }
});

app.listen(port, () => {
  console.log("app is listening on port " + port);
});
