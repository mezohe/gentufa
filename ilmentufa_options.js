var config = {nick: "spagetufa"};

var docs = {
	"+sidju": "lo se pruce cu te gerna la'o fa \n" +
			"  selruhe = optiio+ \" \" selsku / selsku\n" +
			"  optiio = [+-][a-z]+\n" +
			"fa (to zo selsku sinxa la'oi text ne lo gerna be lo jbobau toi)\n" +
			".i lo nu pilno lo .optiio zo'u tu'e\n" +
			"  .i zo'oi  +brackets  noi ditfaulte zo'u lo te pruce cu se melgau je nai cu se fanva\n" +
			"  .i zo'oi  +gloss                   zo'u lo skami cu spoja\n" + //te pruce cu gloso fi lo glibau (to na sai bredi toi)\n" +
			"  .i zo'oi  +raw                     zo'u lo te pruce na se melgau\n" +
			"  .i zo'oi  +s                       zo'u lo cmene be lo selma'o cu pagbu\n" +
			"  .i zo'oi  +f         noi ditfaulte zo'u lo famyma'o poi jai se rivbi cu pagbu\n" +
			"  .i zo'oi  +p                       zo'u lo tersumpoi pe lo selbrisle cu pagbu\n" +
			"  .i zo'oi  +k         noi ditfaulte zo'u zo'oi / jbini lo se porsi be ro rafsi relgrama\n" +
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
			"  .i zo'oi  +rafcau                  zo'u lo se gu rafcla valstuge'a gi rafcau valturge'a cu se pilno \n" +
			"                                          (to pa javni zo'u ro brivla da jai cuntu toi) \n" +
			"  .i zo'oi  +dujoi                   zo'u zo du cmavo ma'oi joi je nai ma'oi go'a\n" +
			"  .i zo'oi  +diftogoteha             zo'u zo si'u cmavo ma'oi ui je nai ma'oi pu\n" +
			"                                          .i je zo di'o cmavo ma'oi coi je nai ma'oi pu \n" +
			"                                          .i je zo se'e cmavo ma'oi ko'a je nai ma'oi by \n" +
			"  .i zo'oi  +cktj                    zo'u dunli lo nu pilno ro mei'e zo'oi voi zo'oi ckt zo'oi du zo'oi su\n" +
			"                                                                     zo'oi zai zo'oi lau zo'oi po zo'oi koi \n" +
			"  .i zo'oi  +zaho                    zo'u dunli lo nu pilno zo'oi cktj je zo'oi diftogoteha\n" +
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
			"  +gloss              : the computer explodes\n" + //output is glossed into English (not by any means complete)\n" +
			"  +raw                : the output is not prettified\n" +
			"  +s                  : selma'o names are shown\n" +
			"  +f         (default): elided terminators are shown\n" +
			"  +p                  : sumti places of all tanru units are shown\n" +
			"  +k         (default): '/' is inserted between rafsi\n" +
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
			"  +rafcau             : rafsi-free morphology (single brivla rule)\n" +
			"  +dujoi              : {du} is in JOI, not GOhA\n" +
			"  +diftogoteha        : {si'u} is in UI, not PU, {di'o} is in COI, not PU, and {se'e} is in KOhA, not BY\n" +
			"  +cktj               : all of +voi, +ckt, +du, +su, +zai, +lau, +po, and +koi are active\n" +
			"  +zaho               : both +cktj and +diftogoteha are active\n" +
			"  Using an option with a minus sign instead of a plus sign reverses the option's effect.\n" +
			"For use in a public channel, \"" + config.nick + ": \" needs to precede the input."
			,
};

var minisyntax = config.nick + ": (([+-](brackets|gloss|raw|s|f|p|k|voi|ckt|du|su|buhu|bu|zai|po|koi|lau|lerfu|rafcau|dujoi|diftogoteha|cktj|zaho))+ )? ";

var minidocs = {
	"+sidju": "lo sintasa zo'u  " + minisyntax + "LO_SELSKU_POI_TE_GENTUFA\n.i lo ditfaulte zo'u  +brackets+f+k+voi+buhu\n.i lo nu benji lo sivni notci pe zo'oi +sidju cu rinka lo nu viska lo zmadu",
	"+help": "syntax:  " + minisyntax + "TEXT_TO_PARSE\ndefault:  +brackets+f+k+voi+buhu\nSend a private message with \"+help\" to see more",
};

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
	k: true,
	voi: true,
	ckt: false,
	du: false,
	su: false,
	buhu: null,
	po: false,
	koi: false,
	lau: false,
	lerfu: false,
	dujoi: false,
	diftogoteha: false,
	rafcau: false,
	startRule: "text",
};
var flag_pattern = "[+-]\\w+"

module.exports.docs = docs;
module.exports.minidocs = minidocs;
module.exports.formats = formats;
module.exports.buhu = buhu;
module.exports.ret = ret;
module.exports.flag_pattern = flag_pattern;
