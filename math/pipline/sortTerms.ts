import { Expression } from "../types/expression";
import { add, multiply } from "../nodeBuilders/expression";

import { asPolynomialTerm } from "../polynomialTerm";
import { flattenAddition, flattenMultiplication } from "../flattenTerms";

export function sortAddition(expr: Expression): Expression | null {
  if (expr.type !== "add") return null;

  let terms = flattenAddition(expr);
  terms.sort((a, b) => {
    const aAsPoly = asPolynomialTerm(a);
    const bAsPoly = asPolynomialTerm(b);

    if (aAsPoly === null && bAsPoly !== null) return 1;
    if (aAsPoly !== null && bAsPoly === null) return -1;

    if (aAsPoly !== null && bAsPoly !== null) {
      if (aAsPoly.varName < bAsPoly.varName) return -1;
      if (aAsPoly.varName > bAsPoly.varName) return 1;

      if (aAsPoly.power < bAsPoly.power) return 1;
      if (aAsPoly.power > bAsPoly.power) return -1;

      if (aAsPoly.coefficient < bAsPoly.coefficient) return 1;
      if (aAsPoly.coefficient > bAsPoly.coefficient) return -1;
    }

    return 0;
  });

  return add(...terms);
}

export function sortMultiplication(expr: Expression): Expression | null {
  if (expr.type !== "multiply") return null;

  let terms = flattenMultiplication(expr);
  terms.sort((a, b) => {
    if (a.type === "real" && b.type !== "real") {
      return -1;
    }
    if (a.type !== "real" && b.type === "real") {
      return 1;
    }

    if (a.type === "variable" && b.type === "variable") {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
    }

    return 0;
  });

  return multiply(...terms);
}
