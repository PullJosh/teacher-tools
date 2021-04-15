import { Expression } from "../types/expression";

import { add, exponent, multiply, real } from "../nodeBuilders/expression";

export function replaceInverseOperations(expr: Expression): Expression | null {
  switch (expr.type) {
    case "subtract":
      return add(expr.inputs[0], multiply(real(-1), expr.inputs[1]));
    case "divide":
      return multiply(expr.inputs[0], exponent(expr.inputs[1], real(-1)));
    case "root":
      return exponent(expr.inputs[0], exponent(expr.inputs[1], real(-1)));
    default:
      return null;
  }
}
