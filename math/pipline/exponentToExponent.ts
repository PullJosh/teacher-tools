import { exponent, multiply } from "../nodeBuilders/expression";
import { Expression } from "../types/expression";

export function exponentToExponent(expr: Expression): Expression | null {
  if (expr.type !== "exponent") return null;

  const [base, power] = expr.inputs;

  if (base.type !== "exponent") return null;

  return exponent(base.inputs[0], multiply(base.inputs[1], power));
}
