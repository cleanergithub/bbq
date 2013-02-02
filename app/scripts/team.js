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

var teamName = function () {
    var team = getURLParameter('team');

    if (team === '') {
        $('h1').append('No Team Selected')
    }

    console.log('team is ' + team)

    $.ajax({
        url: 'teams.json',
        success: function (json) {
            $.each(json, function(key, value){
                console.log('key : ' + key + ', value :' + value);
                if (key === team) {
                    $('.logo').append('<img src="images/logos/' + key + '.svg" width="150px"/>');
                    $('h1').append(value.name).css('color', value.color);
                    $('.team-url').prepend(value.url);
                }
                $('div.span3 ul').append('<li><a href="team.html?team=' + key + '"><img src="images/logos/' + key + '.svg" width="25px"/> ' + value.name + '</a></li>')

            });
        },
        error: function () {

        }
    })
}


$(function () {
    teamName();
});