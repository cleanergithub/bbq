// Avoid `console` errors in browsers that lack a console.
// https://github.com/h5bp/html5-boilerplate/blob/master/js/plugins.js
(function() {
    var method;
    var noop = function noop() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});
 
    while (length--) {
        method = methods[length];
 
        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

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


bbq.teamName = function () {
    if (bbq.team === '') {
        //$('h1').append('No Team Selected');
        $('#content').empty().append('<h1>Choose a Team</h1><p class="lead"><i class=" icon-arrow-left"></i> From the List</p>' + '<p>Or read about the <a href="https://github.com/cleanergithub/bbq/wiki/The-Football-Better-Balanced-Quotient">Better Balanced Quotient (the BBQ)</a>.</p>')
    }
    $.ajax({
        url: 'teams.json',
        success: function (json, textStatus, jqXHR) {
            $.each(json, function (key, value){
                //console.log('key : ' + key + ', value :' + value);
                if (key === bbq.team) {
                    $('.logo').append('<img src="images/logos/' + key + '.svg" width="150px"/>');
                    $('h1').text(value.name).css('color', value.color);
                    $('.team-url').prepend(value.url).attr('href', value.url);

                    $('.team-twitter').append(value.twitter).attr('href', 'https://twitter.com/' + value.twitter);
                }
                $('div.span3 ul').append('<li><a href="team.html?team=' + key + '"><img src="images/logos/' + key + '.svg" width="25px"/> ' + value.name + '</a></li>')

            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            ajaxConsoleLog('teamName', textStatus, jqXHR);
        }
    })
}

bbq.teamStanding = function () {
    $.ajax({
        url: 'standings.json',
        success : function (json, textStatus, jqXHR) {
            $.each(json, function (key, value) {
                console.log('teamStanding - key : ' + key + ', value :' + value.team.public_id);
                if (value.team.public_id === bbq.team) {
                    $('#wins span').append(value.wins);
                    $('#loses span').append(value.loses);
                    $('#ties span').append(value.ties);

                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            ajaxConsoleLog('teamName', textStatus, jqXHR);
        }
    });
}

bbq.teamBbq = function () {
    var teamBbqsA = [],
        teamBbqs;
    $.getJSON("team-total-bbqs.json").done(function(data) { 
        teamBbqsA = data; 
        teamBbqsA.forEach(function(team, index) { 
            if (team[0] === bbq.team) { 
                teamBbqs = team[1];
                var totalBbq = Math.round(teamBbqs.T),
                    offBbq = Math.round(teamBbqs.O),
                    defBbq = Math.round(teamBbqs.D);
                $('#bbq-rank span').append(index + 1);
                $('#total-bbq div').prepend(totalBbq);
                $('#off-bbq div').prepend(offBbq);
                $('#def-bbq div').prepend(defBbq);
            } 
        });
    });
}

$(function () {
    bbq.teamName();
    bbq.teamStanding();
    bbq.teamBbq();
});