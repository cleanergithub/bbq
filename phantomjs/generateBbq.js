// Generated by CoffeeScript 1.4.0
(function() {
  var calcGameBbqs, page;

  phantom.injectJs("../components/jquery/jquery.min.js");

  page = require('webpage').create();

  page.onResourceError = function(request) {
    console.error("onResourceError:");
    return console.error(JSON.stringify(request));
  };

  console.log("[");

  page.open("http://api.sportsdatallc.org/nfl-t1/2012/REG/schedule.xml?api_key=uwvp3s9um5m9am2hajtpessq", function(status) {
    var $xml, loadNextWeek, weeks, xmlDoc;
    if (status !== "success") {
      console.error("Could not load 2012 data. " + status);
      phantom.exit();
    }
    xmlDoc = $.parseXML(page.content);
    $xml = $(xmlDoc);
    weeks = $.makeArray($xml.find("week"));
    loadNextWeek = function() {
      var loadNextGame, pbps, week;
      if (weeks.length === 0) {
        console.log("]");
        phantom.exit();
      }
      week = weeks.shift();
      pbps = $.makeArray($("link[rel=pbp]", week));
      loadNextGame = function() {
        var element, href, newPage;
        if (pbps.length === 0) {
          console.log("]");
          if (weeks.length > 0) {
            console.log(",");
          }
          loadNextWeek();
        }
        element = pbps.shift();
        href = $(element).attr("href");
        newPage = require('webpage').create();
        newPage.onResourceError = page.onResourceError;
        return newPage.open("http://api.sportsdatallc.org/nfl-t1" + href + "?api_key=uwvp3s9um5m9am2hajtpessq", function(status) {
          if (status !== "success") {
            console.error("Could not load game data.");
            if (pbps.length > 0) {
              console.log(",");
            }
            newPage.close();
            loadNextGame();
          }
          calcGameBbqs(newPage.content);
          newPage.close();
          if (pbps.length > 0) {
            console.log(",");
          }
          return loadNextGame();
        });
      };
      return loadNextGame();
    };
    return loadNextWeek();
  });

  calcGameBbqs = function(xml) {
    var $xml, awayTeam, bbqs, homeTeam, otherSide, quarter, xmlDoc, _fn, _i, _len, _ref;
    xmlDoc = $.parseXML(xml);
    $xml = $(xmlDoc);
    homeTeam = $xml.find("game").attr("home");
    awayTeam = $xml.find("game").attr("away");
    otherSide = {};
    otherSide[homeTeam] = awayTeam;
    otherSide[awayTeam] = homeTeam;
    bbqs = {};
    bbqs[homeTeam] = {
      T: 0,
      O: 0,
      OA: [],
      D: 0,
      DA: [],
      NY: 0,
      OY: 0,
      DY: 0
    };
    bbqs[awayTeam] = {
      T: 0,
      O: 0,
      OA: [],
      D: 0,
      DA: [],
      NY: 0,
      OY: 0,
      DY: 0
    };
    bbqs[homeTeam].P = $xml.find("game > summary > home").attr("points");
    bbqs[awayTeam].P = $xml.find("game > summary > away").attr("points");
    _ref = [0, 2];
    _fn = function(quarter) {
      var drive, nextQuarterDrive;
      drive = $xml.find("quarter:nth(" + quarter + ") > drive:last");
      nextQuarterDrive = $xml.find("quarter:nth(" + (quarter + 1) + ") > drive:first");
      if ($(drive).attr("team") === $(nextQuarterDrive).attr("team")) {
        return $(drive).append($(nextQuarterDrive).find("play"));
      }
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      quarter = _ref[_i];
      _fn(quarter);
    }
    $xml.find("drive").each(function(index, element) {
      var LYTG, YTG, dbbq, firstPlay, lastPlay, matches, obbq, plays, team;
      team = $(element).attr("team");
      plays = $("play[type=rush], play[type=pass]", element);
      if (plays.length === 0) {
        return;
      }
      firstPlay = $(plays).first();
      YTG = parseInt($(firstPlay).attr("yard_line"), 10);
      if ($(firstPlay).attr("side") === team) {
        YTG = 100 - YTG;
      }
      lastPlay = $(plays).last();
      LYTG = parseInt($(lastPlay).attr("yard_line"), 10);
      if ($(lastPlay).attr("side") === team) {
        LYTG = 100 - LYTG;
      }
      matches = $("summary", lastPlay).text().match(/(-?\d+) yard/);
      if (matches != null) {
        LYTG -= parseInt(matches[1], 10);
      }
      obbq = (YTG - LYTG) / YTG;
      dbbq = 1 - obbq;
      if (isNaN(obbq)) {
        return console.log("Something went wrong, offensive bbq for drive " + index + " was NaN.");
      } else {
        bbqs[team].OY += YTG - LYTG;
        bbqs[otherSide[team]].DY += YTG - LYTG;
        bbqs[team].OA.push(obbq);
        return bbqs[otherSide[team]].DA.push(dbbq);
      }
    });
    [homeTeam, awayTeam].forEach(function(team) {
      ["O", "D"].forEach(function(platoon) {
        return bbqs[team][platoon] = Math.round(bbqs[team]["" + platoon + "A"].reduce(function(a, b) {
          return a + b;
        }) / bbqs[team]["" + platoon + "A"].length * 100);
      });
      return bbqs[team].T = Math.round((bbqs[team].O + bbqs[team].D) / 2);
    });
    return console.log(JSON.stringify(bbqs));
  };

}).call(this);
