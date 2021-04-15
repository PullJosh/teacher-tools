// Numbers
export interface Real {
  type: "real";
  value: number;
}

export type Num = Real;

// Variables
export interface Variable {
  type: "variable";
  name: string;
}

// Operators
export interface Add {
  type: "add";
  inputs: Expression[];
}

export interface Subtract {
  type: "subtract";
  inputs: [Expression, Expression];
}

export interface Multiply {
  type: "multiply";
  inputs: Expression[];
}

export interface Divide {
  type: "divide";
  inputs: [Expression, Expression];
}

export interface Exponent {
  type: "exponent";
  inputs: [Expression, Expression];
}

export interface Root {
  type: "root";
  inputs: [Expression, Expression];
}

export type Operator = Add | Subtract | Multiply | Divide | Exponent | Root;

// Plus/Minus (±)
export interface PlusMinus {
  type: "plusMinus";
  inputs: [Expression];
}

export type Expression = Num | Variable | Operator | PlusMinus;

export interface Equal {
  type: "equal";
  inputs: [Expression, Expression];
}

export type Equation = Equal;
export function isEquation(node: Expression | Equation): node is Equation {
  return node.type === "equal";
}
