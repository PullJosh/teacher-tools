import { Equation, Expression } from "./types/expression";

export { parse, serialize } from "./parseText";

export function computeNumberValue(node: Expression, variableValues = {}) {
  const c = (t) => computeNumberValue(t, variableValues);

  switch (node.type) {
    case "real":
      return node.value;
    case "add":
      return c(node.inputs[0]) + c(node.inputs[1]);
    case "subtract":
      return c(node.inputs[0]) - c(node.inputs[1]);
    case "multiply":
      return c(node.inputs[0]) * c(node.inputs[1]);
    case "divide":
      return c(node.inputs[0]) / c(node.inputs[1]);
    case "exponent":
      return c(node.inputs[0]) ** c(node.inputs[1]);
    case "root":
      return c(node.inputs[0]) ** (1 / c(node.inputs[1]));
    case "variable":
      return variableValues[node.name];
    default:
      return null;
  }
}

export function usedVariables(node: Expression | Equation) {
  switch (node.type) {
    case "variable":
      return new Set([node.name]);
    case "add":
    case "subtract":
    case "multiply":
    case "divide":
    case "equal":
    case "exponent":
    case "root":
    case "plusMinus":
      return new Set(
        node.inputs.flatMap((node) => Array.from(usedVariables(node)))
      );
    default:
      return new Set();
  }
}

export function sortVarsByAxis(vars: Set<string>, node: Expression | Equation) {
  let availableVars = Array.from(vars);
  let result = [];

  // Place x, y, and z in 0, 1, and 2 positions if possible
  const xIndex = availableVars.indexOf("x");
  if (xIndex > -1) {
    availableVars.splice(xIndex, 1);
    result[0] = "x";
  }

  const yIndex = availableVars.indexOf("y");
  if (yIndex > -1 && vars.size >= 2) {
    availableVars.splice(yIndex, 1);
    result[1] = "y";
  }

  const zIndex = availableVars.indexOf("z");
  if (zIndex > -1 && vars.size >= 3) {
    availableVars.splice(zIndex, 1);
    result[2] = "z";
  }

  // Sort remaining variables alphabetically...
  availableVars = availableVars.sort();

  // ...but put "t" first
  if (availableVars.includes("t")) {
    availableVars = availableVars.filter((v) => v !== "t");
    availableVars.unshift("t");
  }

  for (let i = 0; i < vars.size; i++) {
    if (result[i] === undefined) {
      result[i] = availableVars.shift();
    }
  }

  return result;

  // In the future, adapt based on where the variables appear in the equation.
  // For instance, q = 3r should return ["r", "q"] because it makes more sense
  // to think of r as independent than q.
}

export function solveForX(node: Equation) {
  const matchX = (node: Expression) =>
    node.type === "variable" && node.name === "x";
  const path = pathsToMatchingNodes(node, matchX)[0];

  // If x is on the right, flip equation so it is on left
  if (path[0] === 1) {
    return solveForX({
      ...node,
      inputs: [node.inputs[1], node.inputs[0]],
    });
  }

  // Now we know x is on the left. Just unpack everything from here.
  const operator = node.inputs[0];
  if (operator.type === "add") {
    return solveForX({
      ...node,
      inputs: [
        operator.inputs[path[1]],
        {
          type: "subtract",
          inputs: [node.inputs[1], operator.inputs[1 - path[1]]],
        },
      ],
    });
  }

  if (operator.type === "subtract") {
    if (path[1] === 0) {
      return solveForX({
        ...node,
        inputs: [
          operator.inputs[0],
          {
            type: "add",
            inputs: [node.inputs[1], operator.inputs[1]],
          },
        ],
      });
    } else {
      return solveForX({
        ...node,
        inputs: [
          operator.inputs[1],
          {
            type: "subtract",
            inputs: [operator.inputs[0], node.inputs[1]],
          },
        ],
      });
    }
  }

  if (operator.type === "multiply") {
    return solveForX({
      ...node,
      inputs: [
        operator.inputs[path[1]],
        {
          type: "divide",
          inputs: [node.inputs[1], operator.inputs[1 - path[1]]],
        },
      ],
    });
  }

  if (operator.type === "divide") {
    if (path[1] === 0) {
      return solveForX({
        ...node,
        inputs: [
          operator.inputs[0],
          {
            type: "multiply",
            inputs: [node.inputs[1], operator.inputs[1]],
          },
        ],
      });
    } else {
      return solveForX({
        ...node,
        inputs: [
          operator.inputs[1],
          {
            type: "divide",
            inputs: [operator.inputs[0], node.inputs[1]],
          },
        ],
      });
    }
  }

  if (operator.type === "exponent") {
    if (path[1] === 0) {
      return solveForX({
        ...node,
        inputs: [
          operator.inputs[0],
          {
            type: "plusMinus",
            inputs: [
              {
                type: "root",
                inputs: [node.inputs[1], operator.inputs[1]],
              },
            ],
          },
        ],
      });
    }
  }

  return node;
}

export function pathsToMatchingNodes(
  node: Expression | Equation,
  condition: (node: Expression | Equation) => boolean
) {
  const f = (
    node: Expression | Equation,
    condition: (node: Expression | Equation) => boolean,
    pathPrefix: number[]
  ) => {
    if (condition(node)) {
      return [pathPrefix];
    }

    if ("inputs" in node) {
      return node.inputs.flatMap((input, index) =>
        f(input, condition, [...pathPrefix, index])
      );
    }

    return [];
  };

  return f(node, condition, []);
}

// Sometimes expressions contain ±, which means they are really
// multiple separate expressions bundled up into one. This function
// splits a single expression, possibly containing ±, into a list
// of potentially many expressions that do not contain ±
export function getExplicitExpressions(node: Expression): Expression[] {
  if (node.type === "plusMinus") {
    return getExplicitExpressions(node.inputs[0]).flatMap((e) => [
      e,
      {
        type: "subtract",
        inputs: [{ type: "real", value: 0 }, e],
      },
    ]);
  }

  if (!("inputs" in node)) {
    return [node];
  }

  const inputVariations = node.inputs.map(getExplicitExpressions);
  function getAllInputCombinations(options) {
    if (options.length === 0) return [[]];

    return getAllInputCombinations(options.slice(1)).flatMap((next) =>
      options[0].map((option) => [option, ...next])
    );
  }

  const inputCombinations = getAllInputCombinations(inputVariations);
  return inputCombinations.map((inputs) => ({ ...node, inputs }));
}
