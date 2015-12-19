var config = {
  server: 'irc.freenode.net',
  nick: 'gua',
  options: {
    channels: ['#lojban', '#ckule', '#jbosnu', '#guaspi', '#gua\\spi', '#balningau', '##jboselbau'],
    debug: false
  }
};

var irc = require('irc');
var client = new irc.Client(config.server, config.nick, config.options);

client.addListener('message', function(from, to, text, message) {
    processor(client, from, to, text, message);
});

var camxes = require('../guaspi.js');
var camxes_bnf = require('../guaspi-bnf.js');
var camxes_pre = require('../camxes_preproc.js');
var camxes_post = require('../camxes_postproc.js');
var xankua_gloss = require('../xankua-gloss.js');

var regexps = {
  help:  new RegExp(config.nick + "[^a-z].*(help|sidju|bwu)", "g"),
}

var processor = function(client, from, to, text, message) {
  if (!text) return;
  var sendTo = from; // send privately
  if (to.indexOf('#') > -1) {
    sendTo = to; // send publicly
  }
  if (sendTo == to) {  // Public
    if (text.indexOf(config.nick + "bnf: ") == '0') {
      text = text.substr(config.nick.length + 5);
      var ret = extract_mode(text);
      client.say(sendTo, run_camxes(ret[0], ret[1], camxes_bnf));
    } else if (text.indexOf(config.nick + ": ") == '0') {
      text = text.substr(config.nick.length + 2);
      var ret = extract_mode(text);
      client.say(sendTo, run_camxes(ret[0], ret[1], camxes));
    } else if (text.indexOf(config.nick + "gloss: ") == '0') {
      text = text.substr(config.nick.length + 7);
      var ret = [text, GLOSS];
      client.say(sendTo, run_camxes(ret[0], ret[1], camxes));
    } else if (text.match(regexps.help)) {
      client.say(sendTo, '"' + config.nick + ': [text]" for the parser written from scratch, "' 
        + config.nick + 'bnf: [text]" for the one translated from BNF, "'
        + config.nick + 'gloss: [text]" for kinda-sorta-glossing' );
    }
  } else {  // Private
	var ret = extract_mode(text);
    client.say(sendTo, run_camxes(ret[0], ret[1]));
  }
};

var GLOSS = 8;

function extract_mode(input) {
  if (input.indexOf("+s ") == '0') {
    return [input.substr(3), 3];
  } else if (input.indexOf("-f ") == '0') {
    return [input.substr(3), 5];
  } else if (input.indexOf("-f+s ") == '0') {
    return [input.substr(5), 6];
  } else return [input, 1];
}

function guaspi_post(node) {
  if (!node.terms || !node.terms.length)
    return node.predicate.join("");
  return "[" + node.predicate.join("") + " [" + node.terms.map(guaspi_post).join(", ") + "]]";
}

function guaspi_gloss_one(predicate) {
  var ret = "";
  predicate.forEach(function (verb) {
    ret += verb;
    var gloss = xankua_gloss[verb.replace(/[^a-z:]/g, "")];
    if (gloss) ret += "_" + gloss.g.split(",")[0];
  });
  return ret;
}
function guaspi_gloss(node) {
  if (!node.terms || !node.terms.length)
    return guaspi_gloss_one(node.predicate);
  return "[" + guaspi_gloss_one(node.predicate) + " [" + node.terms.map(guaspi_gloss).join(", ") + "]]";
}

function run_camxes(input, mode, parser) {
	var result;
	var syntax_error = false;
	//result = camxes_pre.preprocessing(input);
	result = input;
	try {
	  result = parser.parse(result);
	} catch (e) {
		result = e;
		syntax_error = true;
	}
	if (!syntax_error) {
    if (parser != camxes) {
      result = JSON.stringify(result, undefined, 2);
      result = camxes_post.postprocessing(result, mode);
    } else {
      result = "[" + result.map(mode & GLOSS ? guaspi_gloss : guaspi_post).join(" ") + "]";
      result = camxes_post.prettify_brackets(result);
    }
	}
	return result;
}
