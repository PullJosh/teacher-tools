import { flattenAddition } from "../flattenTerms";
import { add, multiply } from "../nodeBuilders/expression";
import { Expression } from "../types/expression";

export function distributeMultOverAdd(expr: Expression): Expression | null {
  if (expr.type !== "multiply") return null;

  for (let i = 0; i < expr.inputs.length; i++) {
    const input = expr.inputs[i];
    if (input.type === "add") {
      const remainingMultInputs = [
        ...expr.inputs.slice(0, i),
        ...expr.inputs.slice(i + 1),
      ];
      const remainingMultiply = multiply(...remainingMultInputs);
      const additionTerms = flattenAddition(input);

      return add(
        ...additionTerms.map((term) => multiply(remainingMultiply, term))
      );
    }
  }

  return null;
}
