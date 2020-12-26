"use strict";
var config = {
  server: 'irc.freenode.net',
  nick: 'fanzygerna',
  options: {
    //channels: ['#lojban', '#ckule', '#jbosnu', '#guaspi', '#balningau', '##jboselbau'],
    channels: ['#guaspi'],
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

var camxes = {fanza: require('../fanzatufa-cmdline.js')};
var camxes_post = require('../postproc.js');

var options = {
  formats: {
    brackets: "brackets", text: "text", raw: "raw",
    b: "brackets", t: "text", r: "raw",
    stura: "brackets", flecu: "text", krasi: "raw",
  },
  ret: {
    parser: "fanza",
    format: "brackets",
    s: false,
    f: true,
    h: false,
    ckt: false,
    startRule: "text",
    ipa: false,
  },
  flag_pattern: "[+-]\\w+",
}

var fs = require("fs");
var path = require("path");

var regexps = {
  coi:  new RegExp("(^| )coi la .?"  + config.nick + ".?"),
  juhi: new RegExp("(^| )ju'i la .?" + config.nick + ".?"),
  kihe: new RegExp("(^| )ki'e la .?" + config.nick + ".?")
}

var minisyntax = '+raw, +s, -f';
var minidocs = {
  '+sidju': "liste lo .optiio fa'o " + minisyntax,
  '+help': "Available options: " + minisyntax,
}

var processor = function(client, from, to, text, message) {
  if (!text) return;
  text = text.replace(/^<[^>]+>: /, "");
  var sendTo = from; // send privately
  if (to.indexOf('#') > -1) {
    sendTo = to; // send publicly
  }
  if (sendTo == to) {  // Public
    if (text.indexOf(config.nick + ": ") == '0') {
      text = text.substr(config.nick.length + 2);
      if (text in minidocs) {
        client.say(sendTo, minidocs[text]);
        return;
      }
      var ret = extract_mode(text);
      var out = run_camxes(ret[0], ret[1]);
      client.say(sendTo, out);
      if (ret[1].invalid)
        if (sendTo == "#jbosnu")
          client.say(sendTo, ".i fliba lo ka tersmu zo'oi " + ret[1].invalid + " noi .optiiyvla .i lo nu benji zoi fa " + config.nick + ": +sidju fa cu rinka lo nu viska lo liste be lo ro .optiio");
        else
          client.say(sendTo, "Unrecognized option " + ret[1].invalid + " - use '" + config.nick + ": +help' for a list of all options");
    } else if (text.search(regexps.coi) >= 0) {
      client.say(sendTo, "coi");
    } else if (text.search(regexps.juhi) >= 0) {
      client.say(sendTo, "re'i");
    } else if (text.search(regexps.kihe) >= 0) {
      client.say(sendTo, "je'e fi'i");
    }
  } else {  // Private
    if (text in minidocs) {
      client.say(sendTo, minidocs[text]);
      return;
    }
    var ret = extract_mode(text);
    var out = run_camxes(ret[0], ret[1]);
    client.say(sendTo, out);
    if (ret[1].invalid)
      client.say(sendTo, "Unrecognized option " + ret[1].invalid + " - use '+help' for a list of all options");
  }
};

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
      } else if (bool && (name in camxes)) {
        ret.parser = name;
      } else if (name in formats) {
        ret.format = bool ? formats[name] : name == "brackets" ? "raw" : "brackets";
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

function run_camxes(input, mode) {
  var result;
  var syntax_error = false;
  result = input;
  try {
    result = camxes[mode.parser].parse(result, mode);
  } catch (e) {
    result = e;
    syntax_error = true;
  }
  if (!syntax_error) {
    let oldMode = "M";
    if (mode.format == 'raw') {
      oldMode = "TRJM";
    } else {
      if (mode.s) oldMode += "C";
      if (mode.f) oldMode += "T";
    }
    result = JSON.stringify(result, undefined, 2);
    result = camxes_post.postprocessing(result, oldMode);
  }
  return result;
}
