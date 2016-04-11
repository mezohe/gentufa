"use strict";
var config = {
    server: 'irc.freenode.net',
    nick: 'djisku',
    realName: "ninpre fanza zmiboto -- newbie annoyer bot",
    options: {
        channels: ['#lojban', '#ckule', '#guaspi', '##jboselbau'],
        //channels: ['#guaspi', '##jboselbau'],
        debug: false,
        floodProtection: true,
        floodProtectionDelay: 750
    }
};

var limit_time = 1200 * 1000, limit_greet = 60 * 1000;

var irc = require('irc');
var fs = require("fs");
var path = require("path");
var sqlite3 = require("sqlite3");
var client = new irc.Client(config.server, config.nick, config.options);

var db = new sqlite3.Database(path.join(__dirname, "users.sqlite"));
var getuser = db.prepare("SELECT user FROM names WHERE user = ?");
var adduser = db.prepare("INSERT INTO names VALUES (?, ?)");

var noobs = {};
var masochists = {};
var names = {};

try {
    masochists = JSON.parse(fs.readFileSync(path.join(__dirname, "masochists"), {encoding: 'utf8'}));
} catch (e) {
    console.log("fliba co tcidu tua lo smasokista");
}

function remove(noob, keep) {
    if (!keep) delete names[noob];
    if (noob in noobs) {
        clearTimeout(noobs[noob].time);
        clearTimeout(noobs[noob].greet);
        delete noobs[noob];
    }
}

function promote(noob) {
    remove(noob, true);
    adduser.run(namenorm(noob), Date());
}

function updatemaso() {
    fs.writeFileSync(path.join(__dirname, "masochists"), JSON.stringify(masochists));
}

client.addListener('nick', function (from, to) {
    if (!(from in noobs) ) {
        adduser.run(namenorm(to), Date() + " (nick)");
    }
    names[to] = names[from];
    console.log("la'o " + quote(from) + " co'a se cmene zoi " + quote(to));
    delete names[from];
});

client.addListener('names', function (chan, newnames) {
    for (var name in newnames) {
        names[name] = newnames[name];
        console.log("cmene fa zoi " + quote(name));
    }
});

client.addListener('message', function(from, to, text, message) {
    getuser.get(namenorm(from), function(err, row) {
        if (row || !(from in noobs)) {
            console.log("cusku da fa noi slabu vau fa la'o " + quote(from) + " fe no'u zoi " + quote(text));
            if (!row)
                adduser.run(namenorm(from), Date() + "  (missed)");
            for (var /*hoist*/ noob in noobs)
                promote(noob);
            if (text == config.nick + ": ko mi fanza") {
                if (from in names)
                    client.say(to, "vi'o di'ai");
                masochists[from] = true;
                updatemaso();
            }
            if (text == config.nick + ": ko mi na fanza") {
                if (from in names)
                    client.say(to, "vi'o ri'e dai");
                delete masochists[from];
                updatemaso();
            }
        } else {
            if (!("greet" in noobs[from])) {
                Object.keys(masochists).forEach(function (a) {
                    if (a in names)
                        client.say(a, "la'o " + quote(from) + " noi cnino ru'a co'a tavla la'o " + quote(to));
                    console.log("kajde la'o " + quote(a) + " tu'a la'o " + quote(from));
                });
                noobs[from].greet = setTimeout(function () {
                    console.log("rinsa promote la'o " + quote(from));
                    promote(from);
                    if (from in names) {
                        client.say(to, from + ": coi cnino! It appears that noone has spoken to you in <ROBOTIC VOICE> ONE </ROBOTIC VOICE> minute(s)!!! I just wanted to let you know, this is a slow moving channel. Stay around for half an hour and someone is likely to notice and come around.");
                        console.log("from in names");
                    }
                }, limit_greet);
                console.log("cusku da fa noi cnino vau fa la'o " + quote(from));
            }
            if (Object.keys(noobs).filter(function (a) { return "greet" in noobs[a] }).length > 1) {
                for (var /*hoist*/ noob in noobs)
                    promote(noob);
                console.log("ca ku za'u cnino cu tavla .i ja'e bo promote ro lo cnino");
            }
        }
    });
        
});

function namenorm(name) {
    return name.replace(/[`_^-]$/, "");
}

client.addListener('join', function(channel, who) {
    names[who] = "yay";
    getuser.get(namenorm(who), function (err, row) {
        if (err) {
            console.log(err);
        }
        if (!row && !(who in noobs)) {
            noobs[who] = {
                time: setTimeout(function () {
                    promote(who);
                    console.log("ditcu promote la'o " + quote(who));
                }, limit_time),
            };
        }
        console.log("co'a jorne fa la'o " + quote(who));
    });
});

var quit = function(channel, who) {
    remove(who);
    console.log("co'u jorne fa la'o " + quote(who));
}
var quit_reorder = function(who, reason, channels) {
	channels.forEach(function (channel) { quit(channel, who) });
}
client.addListener('part', quit);
client.addListener('quit', quit_reorder);



function _normalize(string) {
    if (string == null) return null;
    return string.toLowerCase()
            .replace(/\./g, "")
            .replace(/à/g, "a")
            .replace(/è/g, "e")
            .replace(/[ìĭ]/g, "i")
            .replace(/ò/g, "o")
            .replace(/[ùŭw]/g, "u")
            ;
}

function quote(text) {
    var con = "bcdfgjklmnprstvxz";
    var con_i = 0;
    var vow = "aeiouy";
    var vow_i = 0;
    var delim = "fa";
    var norm_text = _normalize(text);
    while (norm_text.match("(^|[^a-z'])" + delim) && con_i < con.length && vow_i < vow.length) {
        con_i += 1; vow_i += 1;
        delim = con[con_i] + vow[vow_i];
    }
    var delim_text = delim + " " + text + " " + delim;
    return delim_text;
}

