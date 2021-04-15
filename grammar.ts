// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }

import { Expression, Equation } from "./math/types";

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: undefined,
  ParserRules: [
    {"name": "main", "symbols": ["expression"], "postprocess": id},
    {"name": "main", "symbols": ["equation"], "postprocess": id},
    {"name": "expression", "symbols": ["_", "AS", "_"], "postprocess": ([,a,]): Expression => (a)},
    {"name": "equation", "symbols": ["expression", {"literal":"="}, "expression"], "postprocess": ([a,,b]): Equation => ({ type: "equal", inputs: [a, b] })},
    {"name": "P", "symbols": [{"literal":"("}, "_", "AS", "_", {"literal":")"}], "postprocess": ([,,a,,]) => (a)},
    {"name": "P", "symbols": ["N"], "postprocess": id},
    {"name": "E", "symbols": ["E", "_", {"literal":"^"}, "_", "P"], "postprocess": ([base,,,,power]) => ({ type: "exponent", inputs: [base, power] })},
    {"name": "E", "symbols": ["P"], "postprocess": id},
    {"name": "MD", "symbols": ["MD", "_", {"literal":"*"}, "_", "E"], "postprocess": ([a,,,,b]) => ({ type: "multiply", inputs: [a, b], style: "dot" })},
    {"name": "MD", "symbols": ["MD", "_", "var"], "postprocess": ([a,,b]) => ({ type: "multiply", inputs: [a, b], style: "hidden" })},
    {"name": "MD", "symbols": ["MD", "_", "var", "_", {"literal":"^"}, "_", "E"], "postprocess":  ([a,,b,,,,e]) => ({
        	type: "multiply",
        	inputs: [a, { type: "exponent", inputs: [b, e] }],
        	style: "hidden"
        }) },
    {"name": "MD", "symbols": ["MD", "_", {"literal":"("}, "_", "AS", "_", {"literal":")"}], "postprocess": ([a,,,,b]) => ({ type: "multiply", inputs: [a, b], style: "hidden" })},
    {"name": "MD", "symbols": ["MD", "_", {"literal":"("}, "_", "AS", "_", {"literal":")"}, "_", {"literal":"^"}, "_", "E"], "postprocess":  ([a,,,,b,,,,,,e]) => ({
        	type: "multiply",
        	inputs: [a, { type: "exponent", inputs: [b, e] }],
        	style: "hidden"
        }) },
    {"name": "MD", "symbols": ["MD", "_", {"literal":"/"}, "_", "E"], "postprocess": ([a,,,,b]) => ({ type: "divide", inputs: [a, b] })},
    {"name": "MD", "symbols": ["E"], "postprocess": id},
    {"name": "AS", "symbols": ["AS", "_", {"literal":"+"}, "_", "MD"], "postprocess": ([a,,,,b]) => ({ type: "add", inputs: [a, b] })},
    {"name": "AS", "symbols": ["AS", "_", {"literal":"-"}, "_", "MD"], "postprocess": ([a,,,,b]) => ({ type: "subtract", inputs: [a, b] })},
    {"name": "AS", "symbols": ["MD"], "postprocess": id},
    {"name": "N", "symbols": ["float"], "postprocess": id},
    {"name": "N", "symbols": ["var"], "postprocess": id},
    {"name": "N$string$1", "symbols": [{"literal":"s"}, {"literal":"i"}, {"literal":"n"}], "postprocess": (d) => d.join('')},
    {"name": "N", "symbols": ["N$string$1", "_", "P"], "postprocess": ([,,a]) => ({ type: "sin", inputs: [a] })},
    {"name": "N$string$2", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"s"}], "postprocess": (d) => d.join('')},
    {"name": "N", "symbols": ["N$string$2", "_", "P"], "postprocess": ([,,a]) => ({ type: "cos", inputs: [a] })},
    {"name": "N$string$3", "symbols": [{"literal":"t"}, {"literal":"a"}, {"literal":"n"}], "postprocess": (d) => d.join('')},
    {"name": "N", "symbols": ["N$string$3", "_", "P"], "postprocess": ([,,a]) => ({ type: "tan", inputs: [a] })},
    {"name": "N$ebnf$1", "symbols": []},
    {"name": "N$ebnf$1$subexpression$1", "symbols": ["P", {"literal":","}, "_"]},
    {"name": "N$ebnf$1", "symbols": ["N$ebnf$1", "N$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "N", "symbols": [/[a-zA-Z]/, "_", {"literal":"("}, "_", "N$ebnf$1", "P", "_", {"literal":")"}], "postprocess": ([name,,,,inputs,input]) => ({ type: "function", name, inputs: [...inputs.map(i => i[0]), input] })},
    {"name": "float", "symbols": ["int", {"literal":"."}, "int"], "postprocess": (d) => ({ type: "real", value: parseFloat(d[0] + d[1] + d[2]) })},
    {"name": "float", "symbols": ["int"], "postprocess": (d) => ({ type: "real", value: parseInt(d[0]) })},
    {"name": "float", "symbols": [{"literal":"-"}, "_", "float"], "postprocess": (d) => ({ type: "real", value: -1 * d[2].value })},
    {"name": "int$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "int$ebnf$1", "symbols": ["int$ebnf$1", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "int", "symbols": ["int$ebnf$1"], "postprocess": ([v]) => (v.join(""))},
    {"name": "var", "symbols": [/[a-zA-Z]/], "postprocess": ([c]) => ({ type: "variable", name: c })},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": (d) => null}
  ],
  ParserStart: "main",
};

export default grammar;
