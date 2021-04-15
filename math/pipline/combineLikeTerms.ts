import { Expression } from "../types/expression";
import {
  add,
  exponent,
  multiply,
  multiplyTwo,
  real,
} from "../nodeBuilders/expression";

import { flattenAddition, flattenMultiplication } from "../flattenTerms";
import { nodesMatch } from "../nodesMatch";

export function combineLikeTermsAdd(expr: Expression): Expression | null {
  if (expr.type !== "add") return null;

  let terms = flattenAddition(expr);
  let anythingChanged = false;
  for (let i = 0; i < terms.length - 1; i++) {
    let termI = terms[i];
    if (termI.type !== "multiply") {
      termI = multiplyTwo(real(1), termI);
    }

    for (let j = i + 1; j < terms.length; j++) {
      let termJ = terms[j];
      if (termJ.type !== "multiply") {
        termJ = multiplyTwo(real(1), termJ);
      }

      let iCoeff = termI.inputs[0];
      let iContent = multiply(...termI.inputs.slice(1));
      if (iCoeff.type !== "real") {
        iCoeff = real(1);
        iContent = termI;
      }

      let jCoeff = termJ.inputs[0];
      let jContent = multiply(...termJ.inputs.slice(1));
      if (jCoeff.type !== "real") {
        jCoeff = real(1);
        jContent = termJ;
      }

      if (nodesMatch(iContent, jContent)) {
        terms[i] = multiply(real(iCoeff.value + jCoeff.value), iContent);
        terms.splice(j, 1);
        j--;
        anythingChanged = true;
      }
    }
  }

  if (anythingChanged) {
    return add(...terms);
  }

  return null;
}

export function combineLikeTermsMult(expr: Expression): Expression | null {
  if (expr.type !== "multiply") return null;

  const terms = flattenMultiplication(expr);
  let anythingChanged = false;
  for (let i = 0; i < terms.length; i++) {
    let termI = terms[i];
    if (termI.type !== "exponent") {
      termI = exponent(termI, real(1));
    }
    for (let j = i + 1; j < terms.length; j++) {
      let termJ = terms[j];
      if (termJ.type !== "exponent") {
        termJ = exponent(termJ, real(1));
      }

      if (nodesMatch(termI.inputs[0], termJ.inputs[0])) {
        terms[i] = exponent(
          termI.inputs[0],
          add(termI.inputs[1], termJ.inputs[1])
        );
        terms.splice(j, 1);
        j--;
        anythingChanged = true;
      }
    }
  }

  if (anythingChanged) {
    return multiply(...terms);
  }

  return null;
}
