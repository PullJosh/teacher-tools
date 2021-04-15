import { Add, Multiply, Expression } from "./types/expression";

export function flattenAddition(add: Add): Expression[] {
  let terms: Expression[] = [];
  for (let i = 0; i < add.inputs.length; i++) {
    const input = add.inputs[i];
    if (input.type === "add") {
      terms.push(...flattenAddition(input));
    } else {
      terms.push(input);
    }
  }
  return terms;
}

export function flattenMultiplication(add: Multiply): Expression[] {
  let terms: Expression[] = [];
  for (let i = 0; i < add.inputs.length; i++) {
    const input = add.inputs[i];
    if (input.type === "multiply") {
      terms.push(...flattenMultiplication(input));
    } else {
      terms.push(input);
    }
  }
  return terms;
}
