module.exports = process_parse_tree;

/* Just for testing the program from the terminal. */
var test_input = ["text",["text_part_2",[["free",["vocative",[["COI_clause",["COI_pre",["COI",[["c","c"],["o","o"],["i","i"]]],["spaces",["initial_spaces"]]]]]],["sumti",["sumti_1",["sumti_2",["sumti_3",["sumti_4",["sumti_5",["quantifier",["number",["PA_clause",["PA_pre",["PA",[["r","r"],["o","o"]]],["spaces",["initial_spaces"]]]]],["BOI"]],["sumti_6",["KOhA_clause",["KOhA_pre",["KOhA",[["d","d"],["o","o"]]]]]]]]]]]],["DOhU"]]]]];

console.log(JSON.stringify(process_parse_tree(test_input)));
process.exit();

// =========================================================================== //

/*
 * EXAMPLE OF PARSE TREE PRUNING PROCEDURE
 * 
 * process_parse_tree(parse_tree)
 * 
 * This function takes a parse tree, and join the expressions of the following
 * nodes:
 * "cmevla", "gismu_2", "lujvo", "fuhivla", "spaces"
 * as well as any selmaho node (e.g. "KOhA").
 * 
 */
 
function process_parse_tree(pt) {
    if (pt.length < 1) return [];
    var i;
    /* Sometimes nodes have no label and have instead an array as their first
       element. */
    if (is_array(pt[0])) i = 0;
    else { // The first element is a label (node name).
        // Let's check if this node is a candidate for our pruning.
        if (is_target_node(pt)) {
            /* We join recursively all the terminal elements (letters) in this
             * node and its child nodes, and put the resulting string in the #1
             * slot of the array; afterwards we delete all the remaining elements
             * (their terminal values have been concatenated into pt[1]). */
            pt[1] = join_expr(pt);
            // If pt[1] contains an empty string, let's delete it as well:
            pt.splice((pt[1] == "") ? 1 : 2);
            return pt;
        }
        i = 1;
    }
    /* If we've reached here, then this node is not a target for pruning, so let's
       do recursion into its child nodes. */
    while (i < pt.length) {
        process_parse_tree(pt[i]);
        i++;
    }
    return pt;
}

/* This function returns the string resulting from the recursive concatenation of
 * all the leaf elements of the parse tree argument (except node names). */
function join_expr(n) {
    if (n.length < 1) return "";
    var s = "";
    var i = is_array(n[0]) ? 0 : 1;
    while (i < n.length) {
        s += is_string(n[i]) ? n[i] : join_expr(n[i]);
        i++;
    }
    return s;
}

/* Checks whether the argument node is a target for pruning. */
function is_target_node(n) {
    return (among(n[0], ["cmevla", "gismu_2", "lujvo", "fuhivla", "spaces"])
            || is_selmaho(n[0]));
}

function among(v, s) {
    var i = 0;
    while (i < s.length) if (s[i++] == v) return true;
    return false;
}

function is_selmaho(v) {
    return (0 == v.search(/^(?!h)((h(?![IU]))?[IUBCDFGJKLMNPRSTVXZ]?([AEIOUY]|(AI|EI|OI|AU)))+$/g));
}

function is_string(v) {
    if (typeof v === 'undefined') return false;
    else return typeof v.valueOf() === 'string';
}

function is_array(v) {
    if (typeof v === 'undefined') return false;
    else return (typeof v === 'object' && v.constructor === Array);
}
