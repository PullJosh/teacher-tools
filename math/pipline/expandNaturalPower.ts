import { multiply } from "../nodeBuilders/expression";
import { Expression } from "../types/expression";

export function expandNaturalPower(expr: Expression): Expression | null {
  if (expr.type !== "exponent") return null;

  const [base, power] = expr.inputs;
  if (power.type !== "real") return null;
  if (power.value < 1) return null;
  if (power.value % 1 !== 0) return null;

  // I'm not sure if this actually prevents infinite loops or if
  // we can still get ourselves into trouble...
  if (base.type === "real" || base.type === "variable") return null;

  return multiply(...new Array(power.value).fill(base));
}
