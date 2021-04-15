import nearley from "nearley";
import grammar from "../grammar";

import { Expression, Equation } from "./types/expression";

export function parse(input: string): (Expression | Equation)[] {
  try {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(input);
    return parser.results;
  } catch (e) {
    return [];
  }
}

export function serialize(node: Expression | Equation): string {
  if (node.type === "real") {
    return String(Math.round(node.value * 10000) / 10000);
  }

  if (node.type === "variable") {
    return node.name;
  }

  const operator = (symbol, needsParens = []) => {
    return node.inputs
      .map((input) =>
        needsParens.includes(input.type)
          ? `(${serialize(input)})`
          : serialize(input)
      )
      .join(symbol);
  };

  switch (node.type) {
    case "add":
      return operator(" + ");
    case "subtract":
      return operator(" - ");
    case "multiply":
      return operator("*", ["add", "subtract"]);
    case "divide":
      return operator("/", ["add", "subtract"]);
    case "exponent":
      return operator("^", ["add", "subtract", "multiply", "divide"]);
    case "root":
      return `(${serialize(node.inputs[0])}) ^ (1/(${serialize(
        node.inputs[1]
      )}))`;
    case "plusMinus":
      return `±(${serialize(node.inputs[0])})`;
    case "equal":
      return operator("=");
    default:
      return "";
  }
}
