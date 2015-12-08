var config = {nick: "stetudu"};

var docs = {
	"+sidju": "lo se pruce cu te gerna la'o fa \n" +
			"  selruhe = optiio+ \" \" selsku / selsku\n" +
			"  optiio = [+-][a-z]+\n" +
			"fa (to zo selsku sinxa la'oi text ne lo gerna be lo jbobau toi)\n" +
			".i lo nu pilno lo .optiio zo'u tu'e\n" +
			"  .i zo'oi  +stura     noi ditfaulte zo'u lo te pruce cu se melgau\n" +
			"  .i zo'oi  +flecu                   zo'u lo te pruce cu se melgau je na se pagbu lo stura lerfu\n" +
			"  .i zo'oi  +krasi                   zo'u lo te pruce na se melgau\n" +
			//"  .i zo'oi  +s                       zo'u lo cmene be lo selma'o cu pagbu\n" +
			"  .i zo'oi  +f         noi ditfaulte zo'u lo famyma'o poi jai se rivbi cu pagbu\n" +
			//"  .i zo'oi  +p                       zo'u lo tersumpoi pe lo selbrisle cu pagbu\n" +
			//"  .i zo'oi  +k         noi ditfaulte zo'u zo'oi / jbini lo se porsi be ro rafsi relgrama\n" +
			//"  .i zo'oi  +slaka                   zo'u lo brivla cu se fendi fi lo slaka\n" +
			//"  .i zo'oi  +lerfu                   zo'u na ka'e ku su'o lerpoi cu se pagbu ge su'o vlale'u gi su'o nacle'u \n" +
			//"  .i zo'oi  +rafcau                  zo'u lo se gu rafcla valstuge'a gi rafcau valturge'a cu se pilno \n" +
			//"                                          (to pa javni zo'u ro brivla da jai cuntu toi) \n" +
			"  .i lo nu pilno lo .optiio valsi poi va'o ce'u me'o ni'u bu basti me'o ma'u bu cu rinka lo fatne be lo se skicu\n" +
			"tu'u\n" +
			".i lo nu pilno va'o lo gubni se .irci cu se sarcu lo nu lidnygau zoi fa " + config.nick + ":  fa lo se pruce"
			,
	"+help": "The input is composed like this: \n" +
			"  input = option+ \" \" text / text\n" +
			"  option = [+-][a-z]+\n" +
			"(\"text\" refers to the \"text\" rule of the Lojban grammar)\n" +
			"Use of options:\n" +
			"  +brackets  (default): the output is prettified\n" +
			"  +text               : the output is prettified and brackets are removed\n" +
			"  +raw                : the output is not prettified\n" +
			//"  +s                  : selma'o names are shown\n" +
			"  +f         (default): elided terminators are shown\n" +
			//"  +p                  : sumti places of all tanru units are shown\n" +
			//"  +k         (default): '/' is inserted between rafsi\n" +
			"  +slaka              : brivla are divided into syllables\n" +
			"  +lerfu              : no letter or number sequence may contain both letters and numbers\n" +
			"  +rafcau             : rafsi-free morphology (single brivla rule)\n" +
			"  Using an option with a minus sign instead of a plus sign reverses the option's effect.\n" +
			"For use in a public channel, \"" + config.nick + ": \" needs to precede the input."
			,
};

//var minisyntax = config.nick + ": (([+-](brackets|raw|s|f|p|k|slaka|lerfu|rafcau))+ )? ";
var minisyntax = config.nick + ": (([+-](brackets|raw|f))+ )? ";

var minidocs = {
	"+sidju": "lo sintasa zo'u  " + minisyntax + "LO_SELSKU_POI_SE_GENTUFA\n.i lo ditfaulte zo'u  +brackets+f\n.i lo nu benji lo sivni notci pe zo'oi +sidju cu rinka lo nu viska lo zmadu",
	"+help": "syntax:  " + minisyntax + "TEXT_TO_PARSE\ndefault:  +brackets+f\nSend a private message with \"+help\" to see more",
};

var formats = {
	brackets: "brackets", text: "text", raw: "raw",
	b: "brackets", t: "text", r: "raw",
	stura: "brackets", flecu: "text", krasi: "raw",
};
var ret = {
	format: "brackets",
	s: false,
	f: true,
	p: false,
	k: true,
	h: false,
	slaka: false,
	lerfu: false,
	rafcau: false,
	slinku: true,
	startRule: "utterance",
};
var flag_pattern = "[+-]\\w+"

module.exports.docs = docs;
module.exports.minidocs = minidocs;
module.exports.formats = formats;
module.exports.buhu = {};
module.exports.ret = ret;
module.exports.flag_pattern = flag_pattern;
