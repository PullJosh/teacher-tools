@preprocessor typescript

@{%
import { Expression, Equation } from "./math/types";
%}

main -> expression	{% id %}
	| equation		{% id %}

expression -> _ AS _ {% ([,a,]): Expression => (a) %}

equation -> expression "=" expression {% ([a,,b]): Equation => ({ type: "equal", inputs: [a, b] }) %}

# PEMDAS!
# We define each level of precedence as a nonterminal.

# Parentheses
P -> "(" _ AS _ ")" {% ([,,a,,]) => (a) %}
    | N             {% id %}

# Exponents
E -> E _ "^" _ P    {% ([base,,,,power]) => ({ type: "exponent", inputs: [base, power] }) %}
    | P             {% id %}

# Multiplication and division
MD -> MD _ "*" _ E  {% ([a,,,,b]) => ({ type: "multiply", inputs: [a, b], style: "dot" }) %}

	| MD _ var {% ([a,,b]) => ({ type: "multiply", inputs: [a, b], style: "hidden" }) %}
	| MD _ var _ "^" _ E {% ([a,,b,,,,e]) => ({
		type: "multiply",
		inputs: [a, { type: "exponent", inputs: [b, e] }],
		style: "hidden"
	}) %}
    | MD _ "(" _ AS _ ")"  {% ([a,,,,b]) => ({ type: "multiply", inputs: [a, b], style: "hidden" }) %}
	| MD _ "(" _ AS _ ")" _ "^" _ E  {% ([a,,,,b,,,,,,e]) => ({
		type: "multiply",
		inputs: [a, { type: "exponent", inputs: [b, e] }],
		style: "hidden"
	}) %}

    | MD _ "/" _ E  {% ([a,,,,b]) => ({ type: "divide", inputs: [a, b] }) %}
    | E             {% id %}

# Addition and subtraction
AS -> AS _ "+" _ MD {% ([a,,,,b]) => ({ type: "add", inputs: [a, b] }) %}
    | AS _ "-" _ MD {% ([a,,,,b]) => ({ type: "subtract", inputs: [a, b] }) %}
    | MD            {% id %}

# A number or a function of a number
N -> float          {% id %}
    | var           {% id %}
    | "sin" _ P     {% ([,,a]) => ({ type: "sin", inputs: [a] }) %}
    | "cos" _ P     {% ([,,a]) => ({ type: "cos", inputs: [a] }) %}
    | "tan" _ P     {% ([,,a]) => ({ type: "tan", inputs: [a] }) %}
	| [a-zA-Z] _ "(" _ (P "," _):* P _ ")" {% ([name,,,,inputs,input]) => ({ type: "function", name, inputs: [...inputs.map(i => i[0]), input] }) %}

# I use `float` to basically mean a number with a decimal point in it
float ->
      int "." int   {% (d) => ({ type: "real", value: parseFloat(d[0] + d[1] + d[2]) }) %}
    | int           {% (d) => ({ type: "real", value: parseInt(d[0]) }) %}
	| "-" _ float   {% (d) => ({ type: "real", value: -1 * d[2].value }) %}

int -> [0-9]:+      {% ([v]) => (v.join("")) %}

var -> [a-zA-Z]     {% ([c]) => ({ type: "variable", name: c }) %}

# Whitespace. The important thing here is that the postprocessor
# is a null-returning function. This is a memory efficiency trick.
_ -> [\s]:*     {% (d) => null %}
