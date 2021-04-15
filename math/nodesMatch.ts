import { Equation, Expression } from "./types/expression";

export function nodesMatch(
  a: Expression | Equation,
  b: Expression | Equation
): boolean {
  if (a.type !== b.type) return false;

  if (a.type === "real" && b.type === "real") {
    return a.value === b.value;
  }

  if (a.type === "variable" && b.type === "variable") {
    return a.name === b.name;
  }

  if ("inputs" in a && "inputs" in b) {
    if (a.inputs.length !== b.inputs.length) return false;

    for (let i = 0; i < a.inputs.length; i++) {
      if (!nodesMatch(a.inputs[i], b.inputs[i])) {
        return false;
      }
    }

    return true;
  }

  console.error("Nodes:", a, b);
  throw new Error("nodesMatch failed: Unexpected node format");
}
