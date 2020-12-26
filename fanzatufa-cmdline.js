try {
  var morfo = require("./fanzatufa-morfo.js");
  var stura = require("./fanzatufa-stura.js");
  var sturaPost = require("./postproc.js");
} catch (e) {
  stura = camxes;
}

var morfoMacros = {
  "Ё":"IO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"C","Щ":"C","З":"Z","Х":"X","Ъ":"Y","Ь":"'","ё":"io","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"c","щ":"c","з":"z","х":"x","ъ":"y","ь":"'","Ф":"F","Ы":"Y","В":"V","А":"a","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"J","Э":"E","ф":"f","ы":"y","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"j","э":"e","Я":"IA","Ч":"TC","С":"S","М":"M","И":"I","Т":"T","Б":"B","Ю":"IU","я":"ia","ч":"tc","с":"s","м":"m","и":"i","т":"t","б":"b","ю":"iu",
  0:"no",1:"pa",2:"re",3:"ci",4:"vo",5:"mu",6:"xa",7:"ze",8:"bi",9:"so",
  "’":"'","‘":"'",sh:"c",zh:"j",ch:"tc",kh:"x","ı":"i","ʃ":"c","ʒ":"j","ɛ":"e","Ɛ":"E","ɛ́":"E","ɛ̀":"E","ə":"y","ŋ":"n"
};

var morfoIpaMacros = {
  "c":"ʃ","'":"h","j":"ʒ","ĭ":"j","ŭ":"w","y":"ə",".":"ʔ"
};

function morfoPre(text) {
  text = text.replace(/([0-9])\.([0-9])/g, "$1 pi $2");
  text = text.replace(/([0-9]):([0-9])/g, "$1 pi'e $2");
  text = text.split("").map(ch => morfoMacros[ch] || ch).join("");
  return text;
}

function morfoSingleWord(word) {
  var selmaho = word.selmaho;
  if (selmaho == "cmavo")
    return word.word;
  if (selmaho == "brivla" || selmaho == "cmevla")
    selmaho = "GOhA";
  return selmaho + ":<" + word.word.replace(/>/g, ">>") + ">"
}

function morfoJoin(words) {
  return words.map(morfoSingleWord)
              .join(" ")
              + " ";
}

function morfoMergeDot(array, elem) {
  if (array[array.length - 1] == ".")
    array[array.length - 1] += elem;
  else
    array[array.length] = elem;
  return array;
}

function morfoIpaPost(word) {
  if (word.match(/[A-Z]/))
    word = "ˈ" + word.toLowerCase();
  word = word.split("").map(ch => morfoIpaMacros[ch] || ch).join("");
  word = word.replace(/([aeo])i/g, "$1j");
  word = word.replace(/au/g, "aw");
  return word;
}

var morfoPost = [morfoJoin];

var camxes = {
  parse: function(text, options) {
    if (options.ipa)
      return this.ipa(text, options);
    text = morfoPre(text);
    try {
      var morfoRaw = morfo.parse(text, options);
    } catch (e) {
      if (typeof e == "object") {
        e.parser = "morfo";
        e.text = text;
      }
      throw e;
    }
    var morfoStr = morfoPost.reduce((text, step) => step(text), morfoRaw);
    try {
      var sturaRaw = stura.parse(morfoStr, options);
    } catch (e) {
      if (typeof e == "object") {
        e.parser = "stura";
        e.text = morfoStr;
      }
      throw e;
    }
    return sturaRaw;
  },
  ipa: function(text, options) {
    text = morfoPre(text);
    try {
      var morfoRaw = morfo.parse(text, options);
    } catch (e) {
      if (typeof e == "object") {
        e.parser = "morfo";
        e.text = text;
      }
      throw e;
    }
    return morfoRaw.map(w => w.syllables || [w.word])
                   .reduce((a, b) => a.concat(b), [])
                   .reduce(morfoMergeDot, [])
                   .map(morfoIpaPost)
                   .join(".")
                   .replace(/.ˈ/g, "ˈ");
  }
}

if (typeof module !== "undefined") {
    module.exports = camxes;
    if (typeof process !== "undefined" && require !== "undefined" && require.main === module) {
      var input = process.argv[2];
      var fun = process.argv[3] || "parse";
      if (Object.prototype.toString.call(input) === "[object String]")
        console.log(JSON.stringify(camxes[fun](input, {ckt: true})));
    }
}

