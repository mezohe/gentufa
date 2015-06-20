"use strict";
var config = {
  server: 'irc.freenode.net',
  nick: 'cipr',
  options: {
    channels: ['#guaspi', '##jboselbau'],
    debug: false,
	floodProtection: true,
	floodProtectionDelay: 700
  }
};

var irc = require('irc');
var client = new irc.Client(config.server, config.nick, config.options);

client.addListener('message', function(from, to, text, message) {
    processor(client, from, to, text, message);
});

var camxes = require('../camxes-exp.js');
var camxes_pre = require('../camxes_preproc.js');
var camxes_post = require('../ilmentufa_postproc.js');

var fs = require("fs");
var path = require("path");
var libxmljs = require("libxmljs");
var updategloss = function () { 
    try {
        var newgloss = {};
        var name = path.join(__dirname, "dumps", "gimste.txt");
        var contents = fs.readFileSync(name, {encoding: 'utf8'});
        contents.split("\n").forEach(function (line) {
            var cells = line.split("	");
            for (var i = 0; i < 12; i++) 
                cells[i] = cells[i] && cells[i].trim() || "";
            newgloss[cells[0]] = {
                bridi1post: cells[1],
                bridi2: cells[2],
                bridi2post: cells[3],
                bridirest: cells.slice(4, 7),
                sumtiplaces: cells.slice(7, 12) // don't copy
            };   
        });  
		var xmlDocEn = libxmljs.parseXml(fs.readFileSync(path.join(__dirname,"dumps","en" + ".xml"),{encoding: 'utf8'}));
        camxes_post.loadgloss(newgloss, xmlDocEn);
    } catch (e) {
        console.log("while updating gloss: " + e);
    }
};
updategloss();

var regexps = {
  coi:  new RegExp("(^| )coi la .?"  + config.nick + ".?"),
  juhi: new RegExp("(^| )ju'i la .?" + config.nick + ".?"),
  kihe: new RegExp("(^| )ki'e la .?" + config.nick + ".?")
}

var processor = function(client, from, to, text, message) {
	if (!text) return;
	var sendTo = from; // send privately
	if (to.indexOf('#') > -1) {
		sendTo = to; // send publicly
	}
	if (sendTo == to) {	// Public
		if (text.indexOf(config.nick + ": ") == '0') {
			text = text.substr(config.nick.length + 2);
			var ret = extract_mode(text);
			var out = run_camxes(ret[0], ret[1]);
			client.say(sendTo, out);
		} else if (text.search(regexps.coi) >= 0) {
			client.say(sendTo, "coi");
		} else if (text.search(regexps.juhi) >= 0) {
			client.say(sendTo, "re'i");
		} else if (text.search(regexps.kihe) >= 0) {
			client.say(sendTo, "je'e fi'i");
		}
	} else {	// Private
		var ret = extract_mode(text);
		var out = run_camxes(ret[0], ret[1]);
		client.say(sendTo, out);
	}
};

function extract_mode(input) {
	var formats = {
		brackets: "brackets", gloss: "gloss", raw: "raw",
		b: "brackets", g: "gloss", r: "raw",
	};
	var buhu = {
		buhu: 1, zai: 1, bu: 1,
	}
	var ret = {
		format: "brackets",
		s: false,
		f: true,
		p: false,
		voi: true,
		ckt: false,
		du: false,
		su: false,
		buhu: null,
		po: false,
		koi: false,
		lau: false,
		lerfu: false,
		diftogoteha: false,
		startRule: "text",
	};
	var flag_pattern = "[+-]\\w+"
	var match = input.match(new RegExp("^\\s*((?:" + flag_pattern + ")+)(.*)"))
	if (match != null) {
		input = match[2];
		var flags = match[1].match(new RegExp(flag_pattern, "g"))
		for (var i = 0; i < flags.length; ++i) {
			var name = flags[i].slice(1);
			var bool = flags[i][0] == "+";
			if (name[0] == "R") {
				ret.startRule = name.slice(1);
			} else if (name == "cktj") {
				ret.voi = bool;
				ret.ckt = bool;
				ret.du = bool;
				ret.su = bool;
				if (!ret.buhu) ret.buhu = bool ? "zai" : null;
				ret.lau = bool;
				ret.po = bool;
				ret.koi = bool;
			} else if (name in buhu) {
				ret.buhu = bool ? name : "buhu";
			} else if (name in formats) {
				ret.format = bool ? formats[name] : "brackets";
			} else if (name in ret) {
				ret[name] = bool;
			}
		}
	}
	return [input, ret];
}

function run_camxes(input, mode) {
	var result;
	var syntax_error = false;
	result = camxes_pre.preprocessing(input);
	//result = input;
	try {
	  result = camxes.parse(result, mode);
	} catch (e) {
		result = e;
		syntax_error = true;
	}
	if (!syntax_error) {
		result = camxes_post.postprocessing(result, mode);
	}
	return result;
}
