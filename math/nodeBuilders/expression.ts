import {
  Add,
  Divide,
  Exponent,
  Expression,
  Multiply,
  PlusMinus,
  Real,
  Subtract,
  Variable,
} from "../types/expression";

export function real(value: number): Real {
  return { type: "real", value };
}

export function variable(name: string): Variable {
  return { type: "variable", name };
}

export function add(...inputs: Expression[]): Expression {
  // Will this automatic handling of zero terms ever come back to haunt me?
  if (inputs.length === 0) return real(0); // throw new Error("Cannot add zero terms");
  if (inputs.length === 1) return inputs[0];
  return { type: "add", inputs };
}

export function subtract(a: Expression, b: Expression): Subtract {
  return { type: "subtract", inputs: [a, b] };
}

export function multiply(...inputs: Expression[]): Expression {
  // Will this automatic handling of zero terms ever come back to haunt me?
  if (inputs.length === 0) return real(1); // throw new Error("Cannot multiply zero terms");
  if (inputs.length === 1) return inputs[0];
  return { type: "multiply", inputs };
}

export function multiplyTwo(a: Expression, b: Expression): Multiply {
  return { type: "multiply", inputs: [a, b] };
}

export function divide(numerator: Expression, denominator: Expression): Divide {
  return { type: "divide", inputs: [numerator, denominator] };
}

export function exponent(base: Expression, power: Expression): Exponent {
  return { type: "exponent", inputs: [base, power] };
}

export function plusMinus(a: Expression): PlusMinus {
  return { type: "plusMinus", inputs: [a] };
}
