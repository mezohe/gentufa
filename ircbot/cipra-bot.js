"use strict";
var config = {
  server: 'irc.freenode.net',
  nick: 'spagetufa',
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

var docs = {
	"+sidju": "lo se pruce cu te gerna la'o fa \n" +
			"  selruhe = optiio+ \" \" selsku / selsku\n" +
			"  optiio = [+-][a-z]+\n" +
			"fa (to la selsku cu dunli la'oi text ne lo gerna be lo jbobau toi)\n" +
			".i lo nu pilno lo optiio zo'u tu'e\n" +
			"  .i zo'oi  +brackets  noi ditfaulte zo'u lo te pruce cu se melgau je nai cu se fanva\n" +
			"  .i zo'oi  +gloss                   zo'u lo te pruce cu se fanva fi lo glibau\n" +
			"  .i zo'oi  +raw                     zo'u lo te pruce na se melgau\n" +
			"  .i zo'oi  +s                       zo'u lo cmene be lo selma'o cu pagbu\n" +
			"  .i zo'oi  +f         noi ditfaulte zo'u lo famyma'o poi jai se rivbi cu pagbu\n" +
			"  .i zo'oi  +p                       zo'u lo tersumpoi pe lo selbrisle cu pagbu\n" +
			"  .i zo'oi  +voi       noi ditfaulte zo'u zo voi cmavo ma'oi nu je nai ma'oi noi\n" +
			"  .i zo'oi  +ckt                     zo'u ro mei'e  zo ce joi zo ce'u  zo ki joi zo ke'a  zo tau joi zo tu'a\n" +
			"                                          cu voi lo se gunma be ke'a cu bastysi \n" +
			"  .i zo'oi  +du                      zo'u zo du jo'u zo du'u bastysi\n" +
			"  .i zo'oi  +su                      zo'u zo su jo'u zo su'o bastysi .i ma'oi su se cmene zo su'o\n" +
			"  .i zo'oi  +buhu      noi ditfaulte zo'u ro mei'e zo bu zo bu'u zo zai cu cmavo lo fadni\n" +
			"  .i zo'oi  +bu                      zo'u zo bu jo'u zo bu'u bastysi\n" +
			"  .i zo'oi  +zai                     zo'u zo zai cmavo ma'oi pu je nai ma'oi lau ja bo ma'oi ce'a\n" +
			"  .i zo'oi  +po                      zo'u ma'oi lo'oi se cmene zo po noi cmavo vo'a je nai ma'oi goi\n" +
			"                                          .i je ma'oi ku'au se cmene zo po'e noi cmavo vo'a je nai ma'oi goi \n" +
			"  .i zo'oi  +koi                     zo'u zo koi cmavo ma'oi ui je nai ma'oi pu\n" +
			"  .i zo'oi  +lau                     zo'u zo lau cmavo ma'oi ko'a je nai ma'oi lau noi se cmene zo ce'a\n" +
			"  .i zo'oi  +lerfu                   zo'u na ka'e ku su'o lerpoi cu se pagbu ge su'o vlale'u gi su'o nacle'u \n" +
			"  .i zo'oi  +diftogoteha             zo'u zo si'u cmavo ma'oi ui je nai ma'oi pu\n" +
			"                                          .i je zo di'o cmavo ma'oi coi je nai ma'oi pu \n" +
			"  .i zo'oi  +cktj                    zo'u dunli lo nu pilno ro mei'e zo'oi voi zo'oi ckt zo'oi du zo'oi su\n" +
			"                                                                     zo'oi zai zo'oi lau zo'oi po zo'oi koi \n" +
			"  .i lo nu pilno lo .optiio valsi poi va'o ce'u me'o ni'u bu basti me'o ma'u bu cu rinka lo fatne be lo se skicu\n" +
			"tu'u\n" +
			".i lo nu pilno va'o lo gubni se .irci cu se sarcu lo nu lidnygau zoi fa " + config.nick + ":  fa lo se pruce"
			,
	"+help": "The input is composed like this: \n" +
			"  input = option+ \" \" text / text\n" +
			"  option = [+-][a-z]+\n" +
			"(\"text\" refers to the \"text\" rule of the Lojban grammar)\n" +
			"Use of options:\n" +
			"  +brackets  (default): the output is prettified but not translated\n" +
			"  +gloss              : the output is translated into English\n" +
			"  +raw                : the output is not prettified\n" +
			"  +s                  : selma'o names are shown\n" +
			"  +f         (default): elided terminators are shown\n" +
			"  +p                  : sumti places of all tanru units are shown\n" +
			"  +voi       (default): {voi} is in NU, not NOI\n" +
			"  +ckt                : {ce} and {ce'u}, {ki} and {ke'a}, and {tau} and {tu'a} switch places\n" +
			"  +du                 : {du} and {du'u} switch places\n" +
			"  +su                 : {su} and {su'o} switch places. SU is named SUhO\n" +
			"  +buhu      (default): {bu}, {bu'u}, and {zai} are all in their usual selma'o\n" +
			"  +bu                 : {bu} and {bu'u} switch places\n" +
			"  +zai                : {zai} is in PU, not LAU or CEhA\n" +
			"  +po                 : {po} is not in GOI, but in LOhOI, which is named PO\n" +
			"                        and {po'e} is not in GOI, but in KUhAU, which is named POhE\n" +
			"  +koi                : {koi} is in UI, not PU\n" +
			"  +lau                : {lau} is in KOhA, not LAU, which is named CEhA\n" +
			"  +lerfu              : no letter or number sequence may contain both letters and numbers\n" +
			"  +diftogoteha        : {si'u} is in UI, not PU, and {di'o} is in COI, not PU\n" +
			"  +cktj               : all of +voi, +ckt, +du, +su, +zai, +lau, and +po are active\n" +
			"  Using an option with a minus sign instead of a plus sign reverses the option's effect.\n" +
			"For use in a public channel, \"" + config.nick + ": \" needs to precede the input."
			,
};

var minidocs = {
	"+sidju": "lo sintasa zo'u  " + config.nick + ": (([+-](brackets|gloss|raw|s|f|p|voi|ckt|du|su|buhu|bu|zai|po|koi|lau|lerfu|diftogoteha|cktj))+ )?LO_SELSKU_POI_TE_GENTUFA\n.i lo ditfaulte zo'u  +brackets+f+voi+buhu\n.i lo nu benji lo sivni notci pe zo'oi +sidju cu rinka lo nu viska lo zmadu",
	"+help": "syntax:  " + config.nick + ": (([+-](brackets|gloss|raw|s|f|p|voi|ckt|du|su|buhu|bu|zai|po|koi|lau|lerfu|diftogoteha|cktj))+ )?TEXT_TO_PARSE\ndefault:  +brackets+f+voi+buhu\nSend a private message with \"+help\" to see more",
};

var processor = function(client, from, to, text, message) {
	if (!text) return;
	var sendTo = from; // send privately
	if (to.indexOf('#') > -1) {
		sendTo = to; // send publicly
	}
	if (sendTo == to) {	// Public
		if (text.indexOf(config.nick + ": ") == '0') {
			text = text.substr(config.nick.length + 2);
			if (text in minidocs) {
				client.say(sendTo, minidocs[text]);
				return;
			}
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
		if (text in docs) {
			client.say(sendTo, docs[text]);
			return;
		}
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
