
phantom.injectJs("../components/jquery/jquery.min.js")

page = require('webpage').create()

page.onResourceError = (request) ->
  console.error("onResourceError:")
  console.error(JSON.stringify(request))

console.log("[")
year = 2010
page.open(
  "http://api.sportsdatallc.org/nfl-t1/#{year}/REG/schedule.xml?api_key=uwvp3s9um5m9am2hajtpessq",
  (status) ->
    if status != "success"
      console.error("Could not load #{year} data. " + status)
      phantom.exit()

    xmlDoc = $.parseXML(page.content)
    $xml = $(xmlDoc)

    weeks = $.makeArray($xml.find("week"))

    loadNextWeek = ->
      if weeks.length == 0
        console.log("]")
        phantom.exit()

      week = weeks.shift()

      pbps = $.makeArray($("link[rel=pbp]", week))

      loadNextGame = ->
        if pbps.length == 0
          console.log("]")
          console.log(",") if weeks.length > 0
          loadNextWeek()
        element = pbps.shift()
        href = $(element).attr("href")
        newPage = require('webpage').create()
        newPage.onResourceError = page.onResourceError

        newPage.open(
          "http://api.sportsdatallc.org/nfl-t1#{href}?api_key=uwvp3s9um5m9am2hajtpessq",
          (status) ->
            if status != "success"
              console.error("Could not load game data.")
              console.log(",") if pbps.length > 0
              newPage.close()
              loadNextGame()

            calcGameBbqs(newPage.content)
            newPage.close()
            console.log(",") if pbps.length > 0
            loadNextGame()
          )

      loadNextGame()

    loadNextWeek()
)




calcGameBbqs = (xml) ->
  # Need to fix for 1st and 3rd quarter endings (need to append first next quarter drive
  # plays to previous quarter drive plays if same team)

  xmlDoc = $.parseXML(xml) 
  $xml = $(xmlDoc)

  homeTeam = $xml.find("game").attr("home")
  awayTeam = $xml.find("game").attr("away")

  otherSide = {}
  otherSide[homeTeam] = awayTeam
  otherSide[awayTeam] = homeTeam

  bbqs = {}

  # T = Team BBQ
  # O = Offense BBQ
  # D = Defense BBQ
  # NY = Net Yards (offense gained - defense allowed)
  # OY = Offensive yards gained
  # DY = Defensive yards allowed
  bbqs[homeTeam] = T: 0, O: 0, OA: [], D: 0, DA: [], NY: 0, OY: 0, DY: 0
  bbqs[awayTeam] = T: 0, O: 0, OA: [], D: 0, DA: [], NY: 0, OY: 0, DY: 0

  bbqs[homeTeam].P = $xml.find("game > summary > home").attr("points")
  bbqs[awayTeam].P = $xml.find("game > summary > away").attr("points")

  # Before we process drives, fix drives before the end of the 1st and 3rd
  # quarters since those drives may continue the next quarter in a separate
  # drive element
  for quarter in [0, 2]
    do (quarter) ->
      drive = $xml.find("quarter:nth(#{quarter}) > drive:last")
      nextQuarterDrive = $xml.find("quarter:nth(#{quarter + 1}) > drive:first")

      if $(drive).attr("team") == $(nextQuarterDrive).attr("team")
        $(drive).append($(nextQuarterDrive).find("play"))

  $xml.find("drive").each(
    (index, element) -> 
      # YTG = Yards To Go
      # LYTG = Last Yards To Go (aka how fare to TD after last play)
      team = $(element).attr("team")
      plays = $("play[type=rush], play[type=pass]", element)
      return if plays.length == 0
      firstPlay = $(plays).first()
      YTG = parseInt($(firstPlay).attr("yard_line"), 10)
      YTG = 100 - YTG if $(firstPlay).attr("side") == team
      lastPlay = $(plays).last()
      LYTG = parseInt($(lastPlay).attr("yard_line"), 10)
      LYTG = 100 - LYTG if $(lastPlay).attr("side") == team
      matches = $("summary", lastPlay).text().match(/(-?\d+) yard/)
      LYTG -= parseInt(matches[1], 10) if matches?
      obbq = (YTG - LYTG)/YTG
      dbbq = 1 - obbq
      if (isNaN(obbq))
        console.log("Something went wrong, offensive bbq for drive #{index} was NaN.")
      else
        bbqs[team].OY += YTG - LYTG
        bbqs[otherSide[team]].DY += YTG - LYTG
        bbqs[team].OA.push(obbq)
        bbqs[otherSide[team]].DA.push(dbbq)
  )

  [homeTeam, awayTeam].forEach( (team) ->
    ["O", "D"].forEach( (platoon) ->
      bbqs[team][platoon] = Math.round(bbqs[team]["#{platoon}A"].reduce( (a,b) ->
        return a + b) / bbqs[team]["#{platoon}A"].length * 100) if bbqs[team]["#{platoon}A"].length > 0
    )
    bbqs[team].T = Math.round((bbqs[team].O + bbqs[team].D)/2)
  )

  console.log(JSON.stringify(bbqs))

