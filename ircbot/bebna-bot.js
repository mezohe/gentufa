"use strict";
var config = {
  server: 'irc.freenode.net',
  nick: 'mankunaku',
  options: {
	channels: ['#lojban', '#jbosnu', '#guaspi', '##jboselbau'],
	debug: false,
	floodProtection: true,
	floodProtectionDelay: 750
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
var xmlDocEn;
var updategloss = function () { 
	try {
		var newgloss = {};
/*
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
*/
		xmlDocEn = libxmljs.parseXml(fs.readFileSync(path.join(__dirname,"dumps","en" + ".xml"),{encoding: 'utf8'}));
		camxes_post.loadgloss(newgloss, xmlDocEn);
	} catch (e) {
		console.log("while updating gloss: " + e);
	}
};
updategloss();

var nickexp = "(" + config.nick + "|" + config.nick.replace(/[`h]/g, "'") + ")";
var regexps = {
  coi:  new RegExp("(^| )coi la .?"  + nickexp + ".?"),
  juhi: new RegExp("(^| )ju'i la .?" + nickexp + ".?"),
  kihe: new RegExp("(^| )ki'e la .?" + nickexp + ".?")
}

var options = require("../ilmentufa_options.js");
	
	function _normalize(string) {
		if (string == null) return null;
		return string.replace(/\./g, "")
				.replace(/à/g, "a")
				.replace(/è/g, "e")
				.replace(/[ìĭ]/g, "i")
				.replace(/ò/g, "o")
				.replace(/[ùŭ]/g, "u")
				;
	}

var processor = function(client, from, to, text, message) {
	if (!text) return;
	text = text.replace(/^<[^>]+>: /, "");
	if (from.match(config.nick + ".*")) return;
	var sendTo = from; // send privately
	if (to.indexOf('#') > -1) {
		sendTo = to; // send publicly
	}
	if (from in {
		mensi: 1, zantufa: 1, spagetufa: 1, camxes: 1, cipra: 1, fenki: 1, phenny: 1, sidju: 1, ithkuil: 1, vlaste: 1
	}) return;
	if (text.search(regexps.coi) >= 0) {
		client.say(sendTo, "coi");
	} else if (text.search(regexps.juhi) >= 0) {
		client.say(sendTo, "re'i");
	} else if (text.search(regexps.kihe) >= 0) {
		client.say(sendTo, "je'e fi'i");
	} else if (text.match(/^mankunaku/)) {
		text = text.replace(/^[^ ]* /, "");
		var ret = extract_mode(text);
		var texts = ret[0].split(/ /g);
		ret[1].startRule = "eternal_lohu";
		var needs_fix;
		var out = texts.reduce(function (a, b) {
			if (b.trim() == "") return a;
			var parsed = run_camxes(b, ret[1]);
			if (!Array.isArray(parsed))
				return a.concat(b);
			return a.concat(parsed.map(function (a) { return a.word }));
		}, []);
		var out_fix = out.map(function (a) {
			var split = _normalize(a).split(/\//g);
			if (split.length < 2) return a;
			var choices = split.map(canonical).map(function(a, i) {
				return zifraf(selrafsi(a)) || [split[i]];
			});
			var tested = testjvo("", 0, choices);
			var original = a.replace(/\//g, "");
			var fixed = tested && tested[1].join("") || original;
			if (_normalize(fixed) == _normalize(original))
				return original;
			needs_fix = true;
			return "*" + fixed + "*";
		});
		if (needs_fix) {
			var out_str = out_fix.join(" ");
			client.say(sendTo, "la'o " + quote(from) + " pu djica lo ka si nu ri cusku zoi " + quote(out_str));
		}
	}
};

function testjvo(pre, score, post) {
	if (!post.length)
		return [score, run_camxes(pre, {startRule: "lujvo_brivla"}, true)];
	var mid = post[0];
	var newpost = post.slice(1);
	var results = mid.map(function (a, i) {
		return testjvo(pre + a, score + i, newpost);
	});
	results = results.filter(function (a) { return a && Array.isArray(a[1]) });
	return results[0];
}

var known = {
	gasnu: ["gau", "gasny"],
	zmadu: ["mau", "zma", "zmady"],
	mleca: ["mle", "me'a", "mlecy"],
	traji: ["rai", "tra", "trajy"],
	bangu: ["ban", "bau", "bany"],
	ckaji: ["cka", "kai", "ckajy"],
	milxe: ["mil", "mli", "mily"],
	zabna: ["zan", "zany", "za'a"],
	mabla: ["mal", "maly", "mably", "ma'a"],
	cusku: ["sku", "cus", "cusy", "cu'u"],
	lojbo: ["jbo", "lojby"],
};

function zifraf(selraf) {

	if (!selraf.match(/^[^aeiou'y]([aeiou][^aeiou'y]|[^aeiou'y][aeiou])[^aeiou'y][aeiou]$/)) return;
	if (selraf in known) return known[selraf];
	var vow = {a:1,e:1,i:1,o:1,u:1};
	if (selraf[1] in vow) {
		return [selraf.slice(0, 3), 
				run_camxes(selraf.slice(2), {startRule: "initial_rafsi"}, true), 
				selraf.slice(0, 3) + "y", 
				selraf.slice(0, 2) + "'" + selraf[4]
			].filter(function (a) { return typeof a == "string" });
	} else {
		return [selraf.slice(0, 3), selraf.slice(0, 4) + "y"];
	}
}

function canonical(rafsi) {
	return rafsi.replace(/^([^aeiouy'][aeiou]'?[aeiou])[rn]$/, "$1").replace(/'?y'?$/, "");
}

function selrafsi(lin) {
	
	var gag;

	var rev = xmlDocEn.get("/dictionary/direction[1]/valsi[rafsi=\""+lin+"\"]");
	//now try -raf- in notes
	if (!rev)
		rev =  xmlDocEn.get("/dictionary/direction[1]/valsi[contains(translate(./notes,\""+lin.toUpperCase()+"\",\""+lin+"\"),\" -"+lin+"-\")]");
	//now try to add a vowel
	if (!rev)
		rev = xmlDocEn.get("/dictionary/direction[1]/valsi[@word=\""+lin+"a\" and (@type=\"fu'ivla\" or @type=\"experimental gismu\" or @type=\"gismu\")]");
	if (!rev)
		rev = xmlDocEn.get("/dictionary/direction[1]/valsi[@word=\""+lin+"e\" and (@type=\"fu'ivla\" or @type=\"experimental gismu\" or @type=\"gismu\")]");
	if (!rev)
		rev = xmlDocEn.get("/dictionary/direction[1]/valsi[@word=\""+lin+"i\" and (@type=\"fu'ivla\" or @type=\"experimental gismu\" or @type=\"gismu\")]");
	if (!rev)
		rev = xmlDocEn.get("/dictionary/direction[1]/valsi[@word=\""+lin+"o\" and (@type=\"fu'ivla\" or @type=\"experimental gismu\" or @type=\"gismu\")]");
	if (!rev)
		rev = xmlDocEn.get("/dictionary/direction[1]/valsi[@word=\""+lin+"u\" and (@type=\"fu'ivla\" or @type=\"experimental gismu\" or @type=\"gismu\")]");
	//may be it's already a word? then just return it.
	if (rev)
		rev=rev.attr("word").value();
	else
		if (run_camxes(lin, {startRule: "BRIVLA"}).word)
			rev=lin;
		else
			rev=lin+"*";
	return rev;
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

function extract_mode(input) {
	var formats = options.formats;
	var buhu = options.buhu;
	var ret = JSON.parse(JSON.stringify(options.ret));
	var flag_pattern = options.flag_pattern;
	var match = input.match(new RegExp("^\\s*((?:" + flag_pattern + ")+)(.*)"))
	if (match != null) {
		input = match[2];
		var flags = match[1].match(new RegExp(flag_pattern, "g"))
		for (var i = 0; i < flags.length; ++i) {
			var name = flags[i].slice(1);
			var bool = flags[i][0] == "+";
			if (name[0] == "R") {
				ret.startRule = name.slice(1);
			} else if (name == "cktj" || name == "zaho") {
				ret.voi = bool;
				ret.ckt = bool;
				ret.du = bool;
				ret.su = bool;
				if (!ret.buhu) ret.buhu = bool ? "zai" : null;
				ret.lau = bool;
				ret.po = bool;
				ret.koi = bool;
				if (name == "zaho")
					ret.diftogoteha = bool;
			} else if (name in buhu) {
				ret.buhu = bool ? name : "buhu";
			} else if (name in formats) {
				ret.format = bool ? formats[name] : "brackets";
			} else if (name in ret) {
				ret[name] = bool;
			} else {
				if (ret.invalid)
					ret.invalid.push(name);
				else
					ret.invalid = [name];
			}
		}
	}
	return [input, ret];
}

function run_camxes(input, mode, no_pre) {
	var result;
	var syntax_error = false;
	result = no_pre && input || camxes_pre.preprocessing(input);
	//result = input;
	try {
	  result = camxes.parse(result, mode);
	  return result;
	} catch (e) {
		result = e;
		syntax_error = true;
	}
	if (!syntax_error) {
		result = camxes_post.postprocessing(result, mode);
	}
	return result;
}
