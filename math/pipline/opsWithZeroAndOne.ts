import { add, multiply, real } from "../nodeBuilders/expression";
import { nodesMatch } from "../nodesMatch";
import { Expression } from "../types/expression";

export function opsWithZeroAndOne(expr: Expression): Expression | null {
  // Add zero
  if (expr.type === "add") {
    let nonZeroTerms = expr.inputs.filter(
      (input) => !nodesMatch(input, real(0))
    );
    if (nonZeroTerms.length < expr.inputs.length) {
      if (nonZeroTerms.length === 0) return real(0);
      return add(...nonZeroTerms);
    }
  }

  // Multiply by one
  if (expr.type === "multiply") {
    let nonOneTerms = expr.inputs.filter(
      (input) => !nodesMatch(input, real(1))
    );
    if (nonOneTerms.length < expr.inputs.length) {
      if (nonOneTerms.length === 0) return real(1);
      return multiply(...nonOneTerms);
    }
  }

  // Multiply by zero
  if (expr.type === "multiply") {
    if (expr.inputs.some((input) => nodesMatch(input, real(0)))) {
      return real(0);
    }
  }

  if (expr.type === "exponent") {
    // x ^ 0
    // TODO: Consider that 0^0 ≠ 1
    if (nodesMatch(expr.inputs[1], real(0))) {
      return real(1);
    }

    // x ^ 1
    if (nodesMatch(expr.inputs[1], real(1))) {
      return expr.inputs[0];
    }

    // 0 ^ x
    // TODO: Consider that 0 ^ 0 ≠ 1
    if (nodesMatch(expr.inputs[0], real(0))) {
      return real(0);
    }

    // 1 ^ x
    if (nodesMatch(expr.inputs[0], real(1))) {
      return real(1);
    }
  }

  return null;
}
