var c = require("./camxes-exp.js");
var camxes_post = require('./ilmentufa_postproc.js');
var fs = require("fs");
var prep = function (text) {
	return text.replace(/[\]\[()\-!?:]/g, " ")
		.replace(/1/g, "pa")
		.replace(/2/g, "re")
		.replace(/3/g, "ci")
		.replace(/4/g, "vo")
		.replace(/5/g, "mu")
		.replace(/6/g, "xa")
		.replace(/7/g, "ze")
		.replace(/8/g, "bi")
		.replace(/9/g, "so")
		.replace(/0/g, "no")
}
var new_out = [];
fs.readFile("camxes_ilmen_js.json", "utf8", function(err, data) {
    JSON.parse(data).specs.forEach(function(a) {
		var updated = {txt: a.txt};
        try {
            console.log(a.txt + "  ==>  " + (updated.out = camxes_post.postprocessing(c.parse(prep(a.txt.split(" -- ")[0]), {startRule: "text"}), {format: "brackets", f: true})));
			if (a.out != "" && a.out != updated.out) console.log("UNEXPECTED ^^ (expected: " + a.out + ")");
        } catch (e) {
            if (!a.out.match(".*(ERROR|BAD).*")) {
                console.log(a.txt + "  ==>  !" + JSON.stringify(e));
				updated.out = a.out;
			} else {
				console.log(a.txt + "  ==>  (as expected)  " + JSON.stringify(e));
				updated.out = "ERROR";
			}
        }
		new_out.push(updated);
    });
	console.log(JSON.stringify({specs: new_out}, null, "	"));
});
