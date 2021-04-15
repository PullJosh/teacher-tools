import { Expression } from "./types/expression";

interface PolynomialTerm {
  coefficient: number;
  power: number;
  varName: string;
}

export function asPolynomialTerm(
  expression: Expression
): PolynomialTerm | null {
  if (expression.type === "variable") {
    return {
      coefficient: 1,
      power: 1,
      varName: expression.name,
    };
  }

  if (expression.type === "exponent") {
    if (expression.inputs[0].type === "variable") {
      if (expression.inputs[1].type === "real") {
        return {
          coefficient: 1,
          power: expression.inputs[1].value,
          varName: expression.inputs[0].name,
        };
      }
    }
  }

  if (expression.type === "multiply") {
    if (expression.inputs[0].type === "real") {
      if (expression.inputs[1].type === "variable") {
        return {
          coefficient: expression.inputs[0].value,
          power: 1,
          varName: expression.inputs[1].name,
        };
      } else if (expression.inputs[1].type === "exponent") {
        if (expression.inputs[1].inputs[0].type === "variable") {
          if (expression.inputs[1].inputs[1].type === "real") {
            return {
              coefficient: expression.inputs[0].value,
              power: expression.inputs[1].inputs[1].value,
              varName: expression.inputs[1].inputs[0].name,
            };
          }
        }
      }
    }
  }

  return null;
}
