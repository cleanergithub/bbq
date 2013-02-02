
$.getJSON("2012season.json").done( (data) ->
  teamBbqs = {}
  html = "<table>"
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
  $("body").append(html)
  bothRight = $(".same").length
  bothWrong = $(".both-wrong").length
  bbqRight = $(".bbq-right").length
  ydsRight = $(".yds-right").length
  $("body").append("<p>bbq better #{bbqRight} times</p>")
  $("body").append("<p>bbq worse #{ydsRight} times</p>")
  $("body").append("<p>both right #{bothRight} times</p>")
  $("body").append("<p>both wrong #{bothWrong} times</p>")

  teamBbqA = ([team, bbq] for team, bbq of teamBbqs)
  teamBbqA.sort((a,b) -> return b[1] - a[1])

  html = '<table>'
  teamBbqA.forEach((team) ->
    html += "<tr><td>#{team[0]}</td><td>#{Math.round(team[1]/16)}</td></tr>"
  )
  html += "</table>"
  $("body").append(html)
)

