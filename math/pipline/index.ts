import { nodesMatch } from "../nodesMatch";
import { serialize } from "../parseText";
import { Expression } from "../types/expression";

type PipelineStage = (expr: Expression) => Expression | null;

export function expressionPipelines(
  input: Expression,
  stageSets: PipelineStage[][]
): Expression {
  let result = input;
  for (let i = 0; i < stageSets.length; i++) {
    const stages = stageSets[i];
    result = expressionPipeline(result, stages);
  }
  return result;
}

export function expressionPipeline(
  input: Expression,
  stages: PipelineStage[]
): Expression {
  for (let i = 0; i < stages.length; i++) {
    const result = applyStageToExpression(input, stages[i]);
    if (result !== null) {
      // As soon as we change something, start
      // the entire process again from the top:
      console.log(serialize(result), "<--", stages[i].name);
      return expressionPipeline(result, stages);
    }
  }
  return input;
}

function applyStageToExpression(
  expr: Expression,
  stage: PipelineStage
): Expression | null {
  const result = stage(expr);
  if (result !== null && !nodesMatch(expr, result)) {
    return result;
  }

  if ("inputs" in expr) {
    for (let i = 0; i < expr.inputs.length; i++) {
      const result = applyStageToExpression(expr.inputs[i], stage);
      if (result !== null && !nodesMatch(expr.inputs[i], result)) {
        return {
          ...expr,
          inputs: [
            ...expr.inputs.slice(0, i),
            result,
            ...expr.inputs.slice(i + 1),
          ] as any,
        };
      }
    }
  }

  return null;
}

export { sortAddition, sortMultiplication } from "./sortTerms";
export { combineLikeTermsAdd, combineLikeTermsMult } from "./combineLikeTerms";
export { distributeMultOverAdd } from "./distributeMultOverAdd";
export { computeConstantValues } from "./computeConstantValues";
export { replaceInverseOperations } from "./replaceInverseOperations";
export { opsWithZeroAndOne } from "./opsWithZeroAndOne";
export { exponentToExponent } from "./exponentToExponent";
export { expandNaturalPower } from "./expandNaturalPower";
