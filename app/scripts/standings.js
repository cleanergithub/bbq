$.getJSON("team-total-bbqs.json").done(function(teamBbqs) {
  var gdp = { Team: {}, Offense: {}, Defense: {} };

  teamBbqs.forEach(function(teamBbq) {
    gdp.Team[teamBbq[0]] = Math.round(teamBbq[1].T);
    gdp.Offense[teamBbq[0]] = Math.round(teamBbq[1].O);
    gdp.Defense[teamBbq[0]] = Math.round(teamBbq[1].D);    
  });
  slopeChart(gdp);
});

function slopeChart(all_data) {
  WIDTH = 900;
  HEIGHT = 1500;

  LEFT_MARGIN = 150;
  RIGHT_MARGIN = 150;
  TOP_MARGIN = 50;
  BOTTOM_MARGIN = 50;

  Y1 = 1995;
  Y2 = 1996;

  ELIGIBLE_SIZE = HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

  var data = _to_data("Offense","Team", "Defense", all_data)


  function _to_data(y1,y2,y3,d){
    var y1d = d[y1];
    var y2d = d[y2];
    var y3d = d[y3];

    var _d = {};
    for (var k1 in y1d) {
      _d[k1] = {};
      _d[k1]['left'] = y1d[k1];
      _d[k1]['middle'] = 0;
      _d[k1]['label'] = k1;
    }
    for (var k2 in y2d) {
      if (!_d.hasOwnProperty(k2)) {
        _d[k2] = {};
        _d[k2].left = 0;
        _d[k2]['label'] = k2;
      }
      _d[k2].middle = y2d[k2];
      if (_d[k2].middle === NaN) {
        _d[k2].middle = 0;
      }
    }
    for (var k3 in y3d) {
      if (!_d.hasOwnProperty(k3)) {
        _d[k3] = {};
        _d[k3].left = 0;
        _d[k3]['label'] = k3;
      }
      _d[k3].right = y3d[k3];
      if (_d[k3].right === NaN) {
        _d[k3].right = 0;
      }
    }
    Y1 = y1;
    Y2 = y2;
    Y3 = y3;
    d = [];
    var di;
    for (var k in _d){
      di = _d[k];
      d.push(di)
    }
    return d;
  }

  function _max_key(v){
    var vi, max_side;
    var _m = undefined;
    for (var i = 0; i < v.length; i += 1){
      vi = v[i];
      max_side = Math.max(vi.left, vi.middle, vi.right)
      if (_m == undefined || max_side > _m) {
        _m = max_side;
      }
    }
    return _m;
  }


  function _min_key(v){
    var vi, min_side;
    var _m = undefined;
    for (var i = 0; i < v.length; i += 1){
      vi = v[i];
      min_side = Math.min(vi.left, vi.middle, vi.right)
      if (_m == undefined || min_side < _m) {
        _m = min_side;
      }
    }
    return _m;
  }

  function _min_max(v){
    var vi, min_side, max_side;
    var _max = undefined;
    var _min = undefined;


    for (var i = 0; i < v.length; i += 1){
      vi = v[i];
      min_side = Math.min(vi.left_coord, vi.middle_coord, vi.right_coord);
      max_side = Math.max(vi.left_coord, vi.middle_coord, vi.right_coord);

      if (_min == undefined || min_side < _min) {
        _min = min_side;
      }
      if (_max == undefined || max_side > _max) {
        _max = max_side;
      }


    }
    return [_min, _max];
  }

  //



  var _y = d3.scale.linear()
        .domain([_min_key(data), _max_key(data)])
        .range([TOP_MARGIN, HEIGHT-BOTTOM_MARGIN])

  function y(d,i){
    return HEIGHT - _y(d)
  }

  //
  for (var i = 0; i < data.length; i += 1){
    data[i].left_coord = y(data[i].left);
    data[i].middle_coord = y(data[i].middle);
    data[i].right_coord = y(data[i].right);
  }

  function _slopegraph_preprocess(d){
    // computes y coords for each data point
    // create two separate object arrays for each side, then order them together, and THEN run the shifting alg.

    var offset;

    var font_size = 150;
    var l = d.length;

    var max = _max_key(d);
    var min = _min_key(d);
    var range = max-min;

    //
    var left = [];
    var middle = [];
    var right = [];
    var di
    for (var i = 0; i < d.length; i += 1) {
      di = d[i];
      left.push({label:di.label, value:di.left, side:'left', coord:di.left_coord})
      middle.push({label:di.label, value:di.middle, side:'middle', coord: di.middle_coord})
      right.push({label:di.label, value:di.right, side:'right', coord: di.right_coord})
    }

    var both = left.concat(middle).concat(right);
    both.sort(function(a,b){
      if (a.value > b.value){
        return 1
      } else if (a.value < b.value) {
        return -1
      } else { 
        if (a.label > b.label) {
          return 1
        } else if (a.lable < b.label) {
          return -1
        } else {
          return 0
        }
      }
    }).reverse()
    var new_data = {};
    var side, label, val, coord;
    for (var i = 0; i < both.length; i += 1) {

      label = both[i].label;
      side = both[i].side;
      val = both[i].value;
      coord = both[i].coord;

      if (!new_data.hasOwnProperty(both[i].label)) {
        new_data[label] = {}
      }
      new_data[label][side] = val;

      if (i > 0) {
        if (coord - font_size < both[i-1].coord || 
          !(val === both[i-1].value && side != both[i-1].side)) {
                  
          new_data[label][side + '_coord'] = coord + font_size;

          for (j = i; j < both.length; j += 1) {
            both[j].coord = both[j].coord + font_size;
          }
        } else {
          new_data[label][side + '_coord'] = coord;
        }

        if (val === both[i-1].value && side !== both[i-1].side) {
          new_data[label][side + '_coord'] = both[i-1].coord;
        }
    } else {
      new_data[label][side + '_coord'] = coord;
    }

    }
    d = [];

    for (var label in new_data){  
      val = new_data[label];
      val.label = label;
      d.push(val)
    }

    return d;
  }

  data = _slopegraph_preprocess(data)
  var min, max;
  var _ = _min_max(data)
  min = _[0]
  max = _[1]

  //HEIGHT = max + TOP_MARGIN + BOTTOM_MARGIN


  var sg = d3.select('#slopegraph')
    .append('svg:svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT);

  _y = d3.scale.linear()
    .domain([max, min])
    .range([TOP_MARGIN, HEIGHT-BOTTOM_MARGIN])

  function y(d,i){
    return HEIGHT - _y(d)
  }


  sg.selectAll('.left_labels')
    .data(data).enter().append('svg:text')
      .attr('x', LEFT_MARGIN-35)
      .attr('y', function(d,i){
        return y(d.left_coord)
      })
      .attr('dy', '.35em')
      .attr('font-size', 16)
      .attr('text-anchor', 'end')
      .text(function(d,i){ return d.label})
      .attr('fill', 'black')

  sg.selectAll('.left_values')
    .data(data).enter().append('svg:text')
      .attr('x', LEFT_MARGIN-10)
      .attr('y', function(d,i){
        return y(d.left_coord)
      })
      .attr('dy', '.35em')
      .attr('font-size', 16)
      .attr('text-anchor', 'end')
      .text(function(d,i){ return d.left})
      .attr('fill', 'black')

  sg.selectAll('.middle_labels')
    .data(data).enter().append('svg:text')
      .attr('x', WIDTH/2-40)
      .attr('y', function(d,i){
        return y(d.middle_coord)
      })
      .attr('dy', '.35em')
      .attr('dx', 35)
      .attr('font-size', 16)
      .text(function(d,i){ return d.label})
      .attr('fill', 'black')

  //
  sg.selectAll('.middle_values')
    .data(data).enter().append('svg:text')
      .attr('x', WIDTH/2-40)
      .attr('y', function(d,i){
        return y(d.middle_coord)
      })
      .attr('dy', '.35em')
      .attr('dx', 10)
      .attr('font-size', 16)
      .text(function(d,i){ return d.middle})
      .attr('fill', 'black')

  sg.selectAll('.right_labels')
    .data(data).enter().append('svg:text')
      .attr('x', WIDTH-RIGHT_MARGIN)
      .attr('y', function(d,i){
        return y(d.right_coord)
      })
      .attr('dy', '.35em')
      .attr('dx', 35)
      .attr('font-size', 16)
      .text(function(d,i){ return d.label})
      .attr('fill', 'black')


  //
  sg.selectAll('.right_values')
    .data(data).enter().append('svg:text')
      .attr('x', WIDTH-RIGHT_MARGIN)
      .attr('y', function(d,i){
        return y(d.right_coord)
      })
      .attr('dy', '.35em')
      .attr('dx', 10)
      .attr('font-size', 16)
      .text(function(d,i){ return d.right})
      .attr('fill', 'black')

  sg.append('svg:text')
    .attr('x', LEFT_MARGIN)
    .attr('y', TOP_MARGIN/2)
    .attr('text-anchor', 'end')
    .attr('opacity', .5)
    .text(Y1)

  //
  sg.append('svg:text')
    .attr('x', WIDTH/2 - 20)
    .attr('y', TOP_MARGIN/2)
    .attr('opacity', .5)
    .text(Y2)

  sg.append('svg:text')
    .attr('x', WIDTH-RIGHT_MARGIN)
    .attr('y', TOP_MARGIN/2)
    .attr('opacity', .5)
    .text(Y3)

  sg.append('svg:line')
    .attr('x1', LEFT_MARGIN/2)
    .attr('x2', WIDTH-RIGHT_MARGIN/2)
    .attr('y1', TOP_MARGIN*2/3)
    .attr('y2', TOP_MARGIN*2/3)
    .attr('stroke', 'black')
    .attr('opacity', .5)

  sg.append('svg:text')
    .attr('x', WIDTH/2)
    .attr('y', TOP_MARGIN/2)
    .attr('text-anchor', 'middle')
    .text('')
    .attr('font-variant', 'small-caps')

  sg.selectAll('.slopes')
    .data(data).enter().append('svg:line')
      .attr('x1', LEFT_MARGIN)
      .attr('x2', WIDTH/2 - 40)
      .attr('y1', function(d,i){
        return y(d.left_coord)
      })
      .attr('y2', function(d,i){
        return y(d.middle_coord)
      })
      .attr('opacity', .6)
      .attr('stroke', 'black')

    sg.selectAll('.slopes')
    .data(data).enter().append('svg:line')
      .attr('x1', WIDTH/2 + 40)
      .attr('x2', WIDTH-RIGHT_MARGIN)
      .attr('y1', function(d,i){
        return y(d.middle_coord)
      })
      .attr('y2', function(d,i){
        return y(d.right_coord)
      })
      .attr('opacity', .6)
      .attr('stroke', 'black')
}

// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values/901144#901144
var getURLParameter = function (name) {
    'use strict';
    name = name.replace(/[\[]/, "\\\\[").replace(/[\]]/, "\\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)",
        regex = new RegExp(regexS),
        results = regex.exec(window.location.search);
    if (results === null) {
        return "";
    } else {
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
};

// success: data, textStatus, jqXHR
// error: jqXHR, textStatus, errorThrown
window.ajaxConsoleLog = function (functionName, textStatus, jqXHR) {
    'use strict';
    var face;
    if (textStatus === 'success') {
        face = ':)';
    } else {
        face = ':(';
    }
    console.log(face + ' ' +  
        textStatus.toUpperCase()  + 
        ' -- for ' + functionName + ' : jqXHR.statusText = ' + jqXHR.statusText + 
        ', textStatus = ' + textStatus);
};

var bbq = {};

bbq.team = getURLParameter('team');

bbq.teamColors = function () {

    $.ajax({
        url: 'teams.json',
        success: function (json, textStatus, jqXHR) {
            $.each(json, function (key, value){
              var name = value.name,
                shortName = name.split(' ')[1];
                $('text:contains("' + key + '")').attr('fill', value.color).attr('font-weight', '600').text(shortName);
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            ajaxConsoleLog('teamName', textStatus, jqXHR);
        }
    })
}

bbq.teamColors();