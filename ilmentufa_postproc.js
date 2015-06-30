/*
 * CAMXES.JS POSTPROCESSOR
 * Created by Ilmen (ilmen.pokebip <at> gmail.com) on 2013-08-16.
 * Last change: 2014-01-26.
 * 
 * Entry point: camxes_postprocessing(text, mode)
 * Arguments:
 *    -- text:  [string] camxes' raw output
 *    -- mode:  [uint] output mode flag
 *         0 = Raw output (no change)
 *         1 = Condensed
 *         2 = Prettified
 *         3 = Prettified + selma'o
 *         4 = Prettified + selma'o + bridi parts
 *         5 = Prettified - famyma'o
 *         6 = Prettified - famyma'o + selma'o
 *         7 = Prettified - famyma'o + selma'o + bridi parts
 * Return value:
 *       [string] postprocessed version of camxes' output
 */

/*
 * Function list:
 *   -- camxes_postprocessing(text, mode)
 *   -- erase_elided_terminators(str)
 *   -- delete_superfluous_brackets(str)
 *   -- prettify_brackets(str)
 *   -- is_string(v)
 *   -- str_print_uint(val, charset)
 *   -- str_replace(str, pos, len, sub)
 *   -- chr_check(chr, list)
 *   -- dbg_bracket_count(str)
 */

alert = console.log;

var glossfallback = {};
var xmlDoc;

function camxes_postprocessing(text, mode) {
	if (mode.format == "rawstructure") return JSON.stringify(text);
	if (mode.format == "raw") return JSON.stringify(remove_structure(text));
	if (mode.format == "brackets") return prettify_brackets(bracket(text, mode));
	if (mode.format == "gloss") return prettify_brackets(gloss(text, glossfallback));
	throw "invalid mode";
}

function prettify_brackets(str) {
	var open_brackets = ["(", "[", "{", "<"];
	var close_brackets = [")", "]", "}", ">"];
	var brackets_number = 4;
//	var numset = ['0','1','2','3','4','5','6','7','8','9'];
	var numset = ['\u2070','\u00b9','\u00b2','\u00b3','\u2074',
	              '\u2075','\u2076','\u2077','\u2078','\u2079'];
	var i = 0;
	var floor = 0;
	while (i < str.length) {
		if (str[i] == '[') {
			var n = floor % brackets_number;
			var num = (floor && !n) ?
				str_print_uint(floor / brackets_number, numset) : "";
			str = str_replace(str, i, 1, open_brackets[n] + num);
			floor++;
		} else if (str[i] == ']') {
			floor--;
			var n = floor % brackets_number;
			var num = (floor && !n) ?
				str_print_uint(floor / brackets_number, numset) : "";
			str = str_replace(str, i, 1, num + close_brackets[n]);
		}
		i++;
	}
	return str;
}

function remove_structure(obj) {
	if (!obj) return obj;
	if (obj.structure && Array.isArray(obj.structure)) obj.structure.forEach(remove_structure);
	delete obj.structure;
	if (typeof obj == "object")
		Object.keys(obj).map(function (a) { return obj[a] }).forEach(remove_structure);
	return obj;
}

function bracket(array, mode) {
	function _bracket(array) {
		if (Array.isArray(array)) {
			array = array.filter(function (a) { return a && (!Array.isArray(a) || a.length) && (mode.f || !a.elided || a.selmaho == "FA") });
			if (array.length == 1) return _bracket(array[0]);
			else return "[" + array.map(_bracket).join(" ") + "]";
		}
		
		if (typeof array == "object" && array.structure) {
			if (mode.p && array.se_table)
				return "[" + array.se_table + "]:" + _bracket(array.structure);
			return _bracket(array.structure);
		}
		
		if (typeof array == "object" && array.word) {
			var /*hoisting*/ ret = _bracket(array.elided ? array.word.toUpperCase() : array.word);
			return mode.s && array.selmaho && !array.elided ? array.selmaho + ":" + ret : ret;
		}
		
		if (typeof array == "string")
			return array;
			
		return "[???]";
	}
	return _bracket(array);
}

function _empty(array) {
	return array && (!Array.isArray(array) || array.length) && array;
}

function gloss(array, words) {
	var remove = {
		ku: 1, ke: 1, "ke'e": 1, vau: 1, "ku'o": 1, kei: 1, boi: 1,
	};
	var unconditional = {
		lu: "«", "li'u": "»", "lo'u": "«", "le'u": "»",
		to: "(", toi: ")", sei: "(", "se'u": ")",
	};
	var english = {
		"lo": "a(n)", "le": "the", "la": "that-named", "nu": "event-of", "zo": "the-word:", "coi": "hello", "co'o": "goodbye", "ro": "each-of", "ma": "what", "na": "not", "na'e": "not", "nai": "-not", "nelci": "fond-of", "ka": "being", "tu'a": "about", "ie": "yeah", "e'u": "I-suggest", "e": "and", "a": "and/or", "je": "and", "ja": "and/or", "gi'e": ",-and", "gi'a": ",-and/or", "bu'u": "at", "ca": "at-present", "zo'u": ":", "za'a": "as-I-can-see", "za'adai": "as-you-can-see", "pu": "in-past", "ba": "in-future", "vau": "]", "doi": "oh", "uinai": "unfortunately", "u'u": "sorry", "ko": "do-it-so-that-you", "poi": "that", "noi": ", which", "me": "among", "pe'i": "in-my-opinion", "ui": "yay", "ju": "whether-or-not", "gu": "whether-or-not", "gi'u": "whether-or-not", "u": "whether-or-not", "xu": "is-it-true-that", "ka'e": "possibly-can", "re'u": "time", "roi": "times", "mi": "me",
	};
	function trygloss (string) {
		var cnt = xmlDoc.get("/dictionary/direction[1]/valsi[translate(@word,\""+string.toUpperCase()+"\",\""+string+"\")=\""+string+"\"]/glossword[1]");
		if (cnt) return cnt.attr("word").value();
	}
	function trykeyword (string, place) {
		var cnt = xmlDoc.get("/dictionary/direction[1]/valsi[translate(@word,\""+string.toUpperCase()+"\",\""+string+"\")=\""+string+"\"]/keyword[@place=\"" + (place || 1) + "\"]");
		if (cnt) return cnt.attr("word").value();
	}

	function _(string) { // translation shield
		return string && {translated: string};
	}
	function _bridi_tail(tail, upper_tail_terms_pre) {
		if (tail.left && tail.right) {
			var upper_tail_terms_all = [tail.tail_terms].concat(upper_tail_terms_pre).filter(_empty);
			var left = _bridi_tail(tail.left, upper_tail_terms_all);
			var right = _bridi_tail(tail.right, upper_tail_terms_all);
			return [left, tail.jek, tail.bo_tag, tail.bo, right].filter(_empty);
		}
		var preterms = _terms(tail.preterms, tail.selbri);
		var tail_terms = _terms(tail.tail_terms, tail.selbri);
		if (upper_tail_terms_pre)
			var upper_tail_terms = upper_tail_terms_pre.map(function (a) { return _terms(a, tail.selbri) });
		if (upper_tail_terms || tail.fa_after_tail && !(1 in tail.fa_after_tail.used))
			return [preterms, _selbri_first(tail.selbri), tail_terms].concat(upper_tail_terms).filter(_empty);
		else
			return [preterms, tail_terms].concat(upper_tail_terms).filter(_empty);
	}
	function _terms(terms, selbri) {
		if (!terms || !terms.terms) return null;
		if (terms.terms.terms) terms = terms.terms; // XXX
		return terms.terms.map(function (term) {
			return _term(term, selbri);
		});
	}
	function _selbri_word(selbri) {
		// XXX HACK HACK
		if (selbri && selbri._selbri_word)
			return selbri._selbri_word;
		while (selbri && selbri.tertau)
			selbri = selbri.tertau;
		if (!selbri) return null;
		selbri._selbri_word = selbri.word || _empty(selbri.structure.filter(function (a) { return typeof a == "string" })) || "SELBRI-NOT-FOUND";
		return selbri._selbri_word;
	}
	function _term(term, selbri) {
		if (term.right) {
			return _conjunction(term, _term, selbri);
		} else if (term.terms) {
			return _terms(term, selbri);
		} else {
			var fa = _empty(term.tag && term.tag.fa);
			var selbri_fa = fa && selbri && selbri.se_table && selbri.se_table[fa[0] - 1];
			var selbri_word = _selbri_word(selbri); // XXX don't run this for every term
			var placetable = glossfallback[selbri_word];
			var ret;
			if (!fa || !selbri_fa || !placetable) {
				ret = null;
			} else if (selbri_fa == 1) {
				//ret = term.sumti
				ret = [term.sumti, _(placetable.bridi1post)].filter(_empty);
			} else if (selbri_fa == 2) {
				ret = [_(placetable.bridi2), term.sumti, _(placetable.bridi2post)].filter(_empty);
			} else {
				ret = [_(placetable.bridirest[selbri_fa - 3]), term.sumti].filter(_empty);
			}
			return _empty(ret) || (selbri_fa && selbri_word && [selbri_word + selbri_fa, term.sumti]) || term;
		}
	}
	function _selbri_first(selbri) {
		var selbri_word = _selbri_word(selbri);
		var placetable = glossfallback[selbri_word];
		if (placetable)
			return placetable.bridi1post;
		return selbri_word || selbri;
	}
	function _selbri_noun(selbri) {
		if (!selbri) return selbri;
		if (selbri.left && selbri.right) {
			var left = _selbri_noun(selbri.left);
			var right = _selbri_noun(selbri.right);
			return [left, selbri.jek, selbri.bo_tag, selbri.bo, right].filter(_empty);
		}
		if (selbri.tertau) {
		
		}
		var selbri_fa = selbri.se_table[0];
		var selbri_word = null;
	}
	function _conjunction(terjoma, fun, args) {
		if (terjoma.right) {
			if (terjoma.left) terjoma.left = fun.call(null, args ? [terjoma.left].concat(args) : terjoma.left);
			terjoma.right = fun.call(null, args ? [terjoma.right].concat(args) : terjoma.right);
			return terjoma;
		}
		return fun(terjoma);
	}
	function _transform(array) {
		//if (array.word in remove)
			//array.gloss_elided = true;
		if (array.role == "bridi") {
			//return JSON.stringify(remove_structure(array));
			if (array.head) array.head = _terms(array.head, array.tail.selbri);
			array.tail = _bridi_tail(array.tail);
			//return JSON.stringify(remove_structure([array.head, array.tail].filter(_empty)));
			return [array.head, array.tail].filter(_empty);
		}
		if (array.role + "DISABLE" == "relativized_selbri") {
			if (!array.selbri) return array;
			return [array.quantifier, _selbri_noun(array.selbri), array.relative].filter(_empty);
		}
		if (array.role == "precedence") {
			return array.contents;
		}
		return array;
	}
	function _bracket(array) {
		array = _transform(array);
	
		if (Array.isArray(array)) {
			array = array.filter(function (a) { return a && (!Array.isArray(a) || a.length) && !a.gloss_elided && !(a.word in remove) && !(a in remove); });
			if (array.length == 1) return _bracket(array[0]);
			else return "[" + array.map(_bracket).join(" ") + "]";
		}
		
		if (typeof array == "object" && array.translated) {
			return array.translated;
		}
		
		if (typeof array == "object" && array.structure) {
			return _bracket(array.structure);
		}
		
		if (typeof array == "object" && array.word) {
			return _bracket(array.word);
		}
		
		if (typeof array == "string") {
			return unconditional[array] || english[array] || trygloss(array) || array;
		}
		console.log(JSON.stringify(array));
		return "[???]";
	}
	return _bracket(array);
}


/* ================== */
/* ===  Routines  === */
/* ================== */

function is_string(v) {
    return typeof v.valueOf() === 'string';
}

function str_print_uint(val, charset) {
	// 'charset' must be a character array.
	var radix = charset.length;
	var str = "";
	val -= val % 1;  // No float allowed
	while (val >= 1) {
		str = charset[val % radix] + str;
		val /= radix;
		val -= val % 1;
	}
	return str;
}

function str_replace(str, pos, len, sub) {
	if (pos < str.length) {
		if (pos + len >= str.length) len -= pos + len - str.length;
		return str.substring(0, pos) + sub + str.substring(pos + len);
	} else return str;
}

function chr_check(chr, list) {
	var i = 0;
	if (!is_string(list)) return false;
	do if (chr == list[i]) return true; while (i++ < list.length);
	return false;
}

function dbg_bracket_count(str) {
	var i = 0;
	var x = 0;
	var y = 0;
	while (i < str.length) {
		if (str[i] == '[') x++;
		else if (str[i] == ']') y++;
		i++;
	}
	alert("Bracket count: open = " + x + ", close = " + y);
}

module.exports.postprocessing = camxes_postprocessing;
module.exports.prettify = prettify_brackets;
module.exports.remove_structure = remove_structure;
module.exports.loadgloss = function (a, b) { glossfallback = a; xmlDoc = b; };

