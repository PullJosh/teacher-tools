import { flattenAddition, flattenMultiplication } from "../flattenTerms";
import { add, multiply, real } from "../nodeBuilders/expression";
import { Expression } from "../types/expression";

export function computeConstantValues(expr: Expression): Expression | null {
  if (expr.type === "add") {
    const terms = flattenAddition(expr);
    let constantSum = 0;
    let otherTerms = [];
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      if (term.type === "real") {
        constantSum += term.value;
      } else {
        otherTerms.push(term);
      }
    }
    if (otherTerms.length < terms.length) {
      let resultingTerms = [...otherTerms];
      if (constantSum !== 0) resultingTerms.push(real(constantSum));
      return add(...resultingTerms);
    }
  }

  if (expr.type === "multiply") {
    const terms = flattenMultiplication(expr);
    let constantProduct = 1;
    let otherTerms = [];
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      if (term.type === "real") {
        constantProduct *= term.value;
      } else {
        otherTerms.push(term);
      }
    }
    if (otherTerms.length < terms.length) {
      let resultingTerms = [...otherTerms];
      if (constantProduct !== 1) resultingTerms.unshift(real(constantProduct));
      return multiply(...resultingTerms);
    }
  }

  if (expr.type === "exponent") {
    const base = expr.inputs[0];
    const power = expr.inputs[1];
    if (base.type === "real" && power.type === "real") {
      return real(base.value ** power.value);
    }
  }

  return null;
}
