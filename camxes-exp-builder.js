// // load peg.js and the file system module
var fs = require("fs")
var PEG = require("pegjs")
// // read peg and build a parser
var camxes_peg = fs.readFileSync("\camxes-exp.js.peg").toString();
try {
	var camxes = PEG.buildParser(camxes_peg, {
		cache: true, 
		output: "source",
		allowedStartRules: [
			"text",
			"sentence",
			"terms",
			"bridi_tail",
			"sumti",
			"selbri",
			"BRIVLA_clause",
			"CMAVO",
			"BRIVLA",
			"gismu",
			"lujvo",
			"fuhivla",
			"fuhivla_head",
			"brivla_head",
			"stressed_syllable",
			"consonantal_syllable",
			"unstressed_syllable",
			"extended_rafsi",
			"stressed_extended_rafsi",
			"initial_rafsi",
			"stressed_initial_rafsi",
			"brivla_core",
			"slihykru",
			"slinkuhi",
			"slinkuhi_ignore",
			"tense_modal",
			"abs_tag_term",
			"brivla_rafcau",
		],
	});
} catch (e) {
	console.log(JSON.stringify(e));
	throw e;
}
// // write to a file
// fs.writeFileSync("\camxes.js", camxes.toSource());
var fd = fs.openSync("\camxes-exp.js", 'w+');
var buffer = new Buffer('var camxes = ');
fs.writeSync(fd, buffer, 0, buffer.length);
buffer = new Buffer(camxes);
fs.writeSync(fd, buffer, 0, buffer.length);
buffer = new Buffer("\n\nmodule.exports = camxes;\n\nterm = process.argv[2];\nif (term !== undefined && typeof term.valueOf() === 'string')\n  console.log(JSON.stringify(camxes.parse(term)));\n\n");
fs.writeSync(fd, buffer, 0, buffer.length);
fs.close(fd);

