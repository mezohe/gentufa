var morfo = require('./fanzatufa-morfo.js');
var stura = require('./fanzatufa-stura.js');
var sturaPost = require('./postproc.js');

function morfoSingleWord(word) {
  var selmaho = word.selmaho;
  if (selmaho == 'cmavo')
    return word.word;
  if (selmaho == 'brivla' || selmaho == 'cmevla')
    selmaho = 'GOhA';
  return selmaho + ':<' + word.word.replace(/>/g, '>>') + '>'
}

function morfoPost(words) {
  return words.filter(w => w.word != 'y')
              .map(morfoSingleWord)
              .join(' ')
              + ' ';
}

var camxes = {
  parse: function(text) {
    var morfoRaw = morfo.parse(text);
    var morfoStr = morfoPost(morfoRaw);
    var sturaRaw = stura.parse(morfoStr);
    return sturaRaw;
  }
}

if (typeof module !== 'undefined') {
    module.exports = camxes;
    if (typeof process !== 'undefined' && require !== 'undefined' && require.main === module) {
      var input = process.argv[2];
      if (Object.prototype.toString.call(input) === '[object String]')
        console.log(JSON.stringify(camxes.parse(input + ' ')));
    }
}

