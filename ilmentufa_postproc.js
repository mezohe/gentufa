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

function camxes_postprocessing(text, mode) {
	if (mode == 0) return JSON.stringify(text);
	if (mode == 1) return JSON.stringify(remove_structure(text));
	if (mode == 2) return prettify_brackets(bracket(text));
	if (mode == 3 || mode == 4) return prettify_brackets(bracket(text, true));
	if (mode == 5) return prettify_brackets(bracket(text, false, true));
	if (mode > 5) return prettify_brackets(bracket(text, true, true));
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

function bracket(array, plus_s, minus_f) {
	function _bracket(array) {
		if (Array.isArray(array)) {
			array = array.filter(function (a) { return a && (!Array.isArray(a) || a.length) && (!minus_f || !a.elided || a.selmaho == "FA") });
			if (array.length == 1) return _bracket(array[0]);
			else return "[" + array.map(_bracket).join(" ") + "]";
		}
		
		if (typeof array == "object" && array.structure) {
			return _bracket(array.structure);
		}
		
		if (typeof array == "object" && array.word) {
			var /*hoisting*/ ret = _bracket(array.elided ? array.word.toUpperCase() : array.word);
			return plus_s && array.selmaho && !array.elided ? array.selmaho + ":" + ret : ret;
		}
		
		if (typeof array == "string")
			return array;
			
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

