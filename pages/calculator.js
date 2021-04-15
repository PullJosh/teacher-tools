import { useState, useMemo, useEffect, useCallback } from "react";

import {
  parse,
  serialize,
  computeNumberValue,
  usedVariables,
  sortVarsByAxis,
  solveForX,
  pathsToMatchingNodes,
  getExplicitExpressions,
} from "../math/index.ts";

import {
  expressionPipelines,
  distributeMultOverAdd,
  combineLikeTermsAdd,
  combineLikeTermsMult,
  sortAddition,
  sortMultiplication,
  computeConstantValues,
  replaceInverseOperations,
  opsWithZeroAndOne,
  exponentToExponent,
  expandNaturalPower,
} from "../math/pipline/index";

import MathDisplay, {
  HoverBox,
  Add,
  Subtract,
  Multiply,
  Divide,
  Exponent,
  Parenthesis,
  PlusMinus,
  Variable,
  Equal,
  Root,
} from "../components/MathDisplay";

import Graph, {
  GraphFunction,
  FadeOutOnAxis,
  varColors,
} from "../components/Graph";
import { add } from "../math/nodeBuilders/expression";

export default function RenderPage() {
  const [inputs, setInputs] = useState([""]);
  const [editing, setEditing] = useState(0);

  const setInput = (index, value) => {
    setInputs((inputs) => [
      ...inputs.slice(0, index),
      value,
      ...inputs.slice(index + 1),
    ]);
  };

  return (
    <div className="App">
      {inputs.map((input, index) => (
        <div className="App__row">
          <CalculationRow
            value={input}
            setValue={(value) => {
              setInput(index, value);
            }}
            editing={editing === index}
            setEditing={(on) => {
              if (on) {
                setEditing(index);
              } else {
                if (editing === index) {
                  setEditing(null);
                }
              }
            }}
            createRow={() => {
              setEditing(inputs.length);
              setInputs([...inputs, ""]);
            }}
          />
        </div>
      ))}

      <style jsx global>{`
        body {
          margin: 0;
        }
      `}</style>
      <style jsx>{`
        .App {
          width: 100vw;
          height: 100vh;
        }
        .App__row {
          position: relative;
        }
        .App::before {
          content: " ";
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 40%;
          background: #eee;
        }
      `}</style>
    </div>
  );
}

function CalculationRow({ value, setValue, editing, setEditing, createRow }) {
  const parsed = useMemo(() => parse(value), [value]);
  const tree = parsed.length > 0 ? parsed[0] : null;

  const vars = sortVarsByAxis(usedVariables(tree || {}));
  const varColorsMap = Object.fromEntries(
    vars.map((varName, index) => [varName, varColors[index]])
  );

  return (
    <div className="CalculationRow">
      <div className="input">
        {editing && (
          <input
            type="text"
            className="textInput"
            autoFocus
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                createRow();
              }
              if (event.key === "Escape") {
                setEditing(false);
              }
            }}
          />
        )}
        {!editing && (
          <div
            onDoubleClick={() => {
              setEditing(true);
            }}
          >
            {tree !== null && (
              <>
                <MathDisplay>
                  <RenderTree
                    tree={tree}
                    setTree={(newTree) => {
                      setValue(serialize(newTree));
                    }}
                    varColorsMap={varColorsMap}
                  />
                </MathDisplay>
              </>
            )}
            {tree === null && (
              <span style={{ color: "red", fontFamily: "monospace" }}>
                Error {value && `(${value})`}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="output">{tree && <Result tree={tree} />}</div>

      <style jsx>{`
        .CalculationRow {
          display: grid;
          grid-template-columns: 2fr 3fr;
        }

        .input,
        .output {
          padding: 16px;
        }

        .input {
          text-align: right;
        }
        .textInput {
          width: 100%;
          box-sizing: border-box;
          text-align: right;
          font-size: 20px;
          padding: 8px;
        }
      `}</style>
    </div>
  );
}

function RenderTree({
  tree,
  setTree,
  varColorsMap = {},
  node = tree,
  path = [],
}) {
  const replaceNode = (tree, path, newNode) => {
    if (path.length === 0) return newNode;
    return {
      ...tree,
      inputs: tree.inputs.map((input, index) => {
        if (index === path[0]) {
          return replaceNode(input, path.slice(1), newNode);
        }

        return input;
      }),
    };
  };

  const r = (index) => (
    <RenderTree
      tree={tree}
      setTree={setTree}
      varColorsMap={varColorsMap}
      node={node.inputs[index]}
      path={[...path, index]}
    />
  );

  let result = null;
  switch (node.type) {
    case "real":
      if (setTree) {
        return (
          <DragValue
            value={node.value}
            setValue={(value) => {
              setTree(replaceNode(tree, path, { ...node, value }));
            }}
          >
            {(dragging) => (
              <span style={{ fontWeight: dragging ? "bold" : undefined }}>
                {node.value}
              </span>
            )}
          </DragValue>
        );
      } else {
        return String(node.value);
      }
    case "add":
      if (node.inputs.length > 2) {
        result = (
          <Add
            a={<RenderTree tree={add(...node.inputs.slice(0, -1))} />}
            b={r(node.inputs.length - 1)}
          />
        );
      } else {
        result = <Add a={r(0)} b={r(1)} />;
      }
      break;
    case "subtract":
      result = <Subtract a={r(0)} b={r(1)} />;
      break;
    case "multiply":
      if (node.inputs.length > 2) {
        result = (
          <Multiply
            a={
              <RenderTree
                tree={{ ...node, inputs: node.inputs.slice(0, -1) }}
              />
            }
            b={r(node.inputs.length - 1)}
            style={node.style}
          />
        );
      } else {
        result = <Multiply a={r(0)} b={r(1)} style={node.style} />;
      }
      break;
    case "divide":
      result = <Divide a={r(0)} b={r(1)} />;
      break;
    case "exponent":
      result = <Exponent base={r(0)} power={r(1)} />;
      break;
    case "root":
      result = <Root base={r(0)} power={r(1)} />;
      break;
    case "plusMinus":
      result = <PlusMinus>{r(0)}</PlusMinus>;
      break;
    case "parenthesis":
      return <Parenthesis>{r(0)}</Parenthesis>;
    case "variable":
      return (
        <Variable color={varColorsMap[node.name] || "black"}>
          {node.name}
        </Variable>
      );
    case "equal":
      return <Equal a={r(0)} b={r(1)} />;
    default:
      return null;
  }

  if (node === tree) return result;
  return <HoverBox content={<Result tree={node} />}>{result}</HoverBox>;
}

function Result({ tree }) {
  const vars = sortVarsByAxis(usedVariables(tree), tree);

  /*
  console.clear();
  const improved = expressionPipelines(tree, [
    [replaceInverseOperations],
    [expandNaturalPower, distributeMultOverAdd],
    [
      computeConstantValues,
      opsWithZeroAndOne,
      combineLikeTermsMult,
      combineLikeTermsAdd,
      sortMultiplication,
      sortAddition,
      exponentToExponent,
    ],
  ]);

  return (
    <div>
      <MathDisplay>
        <RenderTree tree={improved} />
      </MathDisplay>
      <pre>= {serialize(improved)}</pre>
    </div>
  );
  */

  const isEquation = tree.type === "equal";
  if (isEquation) {
    switch (vars.length) {
      case 0:
        if (computeNumberValue(tree)) {
          return <span>Yeeeeeaaaaahh boiiiiii</span>;
        } else {
          return <span>haha no</span>;
        }
      case 1:
      case 2:
      case 3:
        if (tree.inputs[0].type === "variable") {
          const dependentVariable = tree.inputs[0].name;
          if (!usedVariables(tree.inputs[1]).has(dependentVariable)) {
            return (
              <Graph axes={vars} size={400}>
                <GraphFunction
                  independentAxes={vars.filter((v) => v !== dependentVariable)}
                  f={(values) => ({
                    [dependentVariable]: computeNumberValue(
                      tree.inputs[1],
                      values
                    ),
                  })}
                />
              </Graph>
            );
          }
        } else {
          const matchX = (node) =>
            node.type === "variable" && node.name === "x";

          const paths = pathsToMatchingNodes(tree, matchX);
          if (paths.length === 1) {
            const solution = solveForX(tree);
            const solutionSet = getExplicitExpressions(solution);

            const variable = solution.inputs[0];

            // I'm not sure if solving always works (yet), so double check
            // that the left side is actually just a variable
            if (variable.type === "variable") {
              return (
                <div>
                  <MathDisplay style={{ display: "inline-block" }}>
                    <RenderTree tree={solution} />
                  </MathDisplay>{" "}
                  <span style={{ color: "gray", marginLeft: 16 }}>
                    &larr; Solved for {variable.name}
                  </span>
                  <Graph axes={vars} size={400}>
                    {solutionSet.map((sol) => (
                      <GraphFunction
                        color="black"
                        independentAxes={vars.filter(
                          (v) => v !== variable.name
                        )}
                        f={(values) => ({
                          [variable.name]: computeNumberValue(
                            sol.inputs[1],
                            values
                          ),
                        })}
                      />
                    ))}
                  </Graph>
                </div>
              );
            } else {
              // Failed to solve. Show our work-in-progress:
              return (
                <div>
                  <MathDisplay>
                    <RenderTree tree={solution} />
                  </MathDisplay>
                  <pre>{JSON.stringify(solution, null, 2)}</pre>
                </div>
              );
            }
          }
        }
    }
  } else {
    // This is not an equation; just an expression
    switch (vars.length) {
      case 0:
        return (
          <MathDisplay>
            {Math.round(computeNumberValue(tree) * 1000) / 1000}
          </MathDisplay>
        );
      case 1:
      case 2:
        const expressionSet = getExplicitExpressions(tree);

        return (
          <Graph axes={[...vars, null]} size={400}>
            {expressionSet.map((expression) => (
              <GraphFunction
                independentAxes={vars}
                f={(values) => ({
                  [null]: computeNumberValue(expression, values),
                })}
              />
            ))}
          </Graph>
        );
    }
  }

  // Not sure how to process this input
  return <span>🤷‍♂️</span>;
}

function DragValue({ value, setValue, children }) {
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(value);

  const onMouseDown = useCallback(
    (event) => {
      event.preventDefault();
      setDragStartX(event.clientX);
      setDragStartValue(value);
      setDragging(true);
    },
    [value]
  );

  const onMouseMove = useCallback(
    (event) => {
      if (dragging) {
        const precision = 10 ** 2;
        const delta = (event.clientX - dragStartX) / 100;
        let newValue = dragStartValue + delta;
        newValue = Math.round(newValue * precision) / precision;

        /*
        const snapDistance = 5 / precision;
        if (Math.abs(newValue) % 1 <= snapDistance) {
          newValue = Math.floor(Math.abs(newValue)) * Math.sign(newValue);
        }
        if (Math.abs(newValue) % 1 >= 1 - snapDistance) {
          newValue = Math.ceil(Math.abs(newValue)) * Math.sign(newValue);
        }
        */

        setValue(newValue);
      }
    },
    [dragging, dragStartX, dragStartValue]
  );

  const onMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseUp, onMouseMove]);

  return (
    <span style={{ cursor: "ew-resize" }} onMouseDown={onMouseDown}>
      {children(dragging)}
    </span>
  );
}
