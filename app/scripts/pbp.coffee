
$.getJSON("2012season.json").done( (data) ->
  teamBbqs = {}
  html = "<table class='table table-condensed table-hover'>"
  data.forEach((week, index) ->
    html += "<tr><th>Week #{index + 1}</th>"
    week.forEach((game, index) ->
      teams = (team for team of game)
      game[teams[0]].NY = game[teams[0]].OY - game[teams[0]].DY
      game[teams[1]].NY = game[teams[1]].OY - game[teams[1]].DY

      if parseInt(game[teams[0]].P) >= parseInt(game[teams[1]].P)
        winner = game[teams[0]]
        loser = game[teams[1]]
      else
        winner = game[teams[1]]
        loser = game[teams[0]]

      # 4 cases
      # winner has a higher bbq and ny
      # winner has a lower bbq and ny
      # winner has a higher bbq and lower ny
      # winner has a lower bbq and higher ny
      if winner.T >= loser.T and winner.NY >= loser.NY
        html += "<td class='same'>"
      else if winner.T < loser.T and winner.NY < loser.NY
        # html += "<td>"
        html += "<td class='both-wrong' style='background-color: lightyellow;'>"
      else if winner.T >= loser.T and winner.NY < loser.NY
        html += "<td class='bbq-right' style='background-color: lightgreen;'>"
      else if winner.T < loser.T and winner.NY > loser.NY
        html += "<td class='yds-right' style='background-color: lightcoral;'>"

      for team, data of game
        do (team, data) ->
          teamBbqs[team] = 0 if !teamBbqs[team]?
          teamBbqs[team] += parseInt(data.T)
          html += "#{team} #{game[team].P} #{game[team].T}<br/>"
    )
    html += "</tr>"
  )
  html += "</table>"
  $("div[role='main']").append(html)
  bothRight = $(".same").length
  bothWrong = $(".both-wrong").length
  bbqRight = $(".bbq-right").length
  ydsRight = $(".yds-right").length
  $("div[role='main']").append("<p>bbq better #{bbqRight} times</p>")
  $("div[role='main']").append("<p>bbq worse #{ydsRight} times</p>")
  $("div[role='main']").append("<p>both right #{bothRight} times</p>")
  $("div[role='main']").append("<p>both wrong #{bothWrong} times</p>")

  teamBbqA = ([team, bbq] for team, bbq of teamBbqs)
  teamBbqA.sort((a,b) -> return b[1] - a[1])

  $("div[role='main']").append("<h2>Season Team BBQs</h2>")
  html = '<table>'
  teamBbqA.forEach((team) ->
    html += "<tr><td>#{team[0]}</td><td>#{Math.round(team[1]/16)}</td></tr>"
  )
  html += "</table>"
  $("div[role='main']").append(html)
)