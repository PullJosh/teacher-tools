import { useState, useRef, forwardRef, useEffect, useCallback } from "react";
import Head from "next/head";

import { useReactToPrint } from "react-to-print";

import classNames from "classnames";
import { useHotkeys } from "react-hotkeys-hook";

import ReactMarkdown from "react-markdown";
import mathPlugin from "remark-math";
import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";

import {
  DragDropContext,
  Droppable,
  Draggable,
  resetServerContext,
} from "react-beautiful-dnd";

resetServerContext();

export default function QuizEditor() {
  const [title, setTitle] = useState("Quiz");
  const [subtitle, setSubtitle] = useState("Good luck and have fun!");
  const [id, setId] = useState("5afes"); // Math.random().toString(36).substr(2, 5)
  const [showId, setShowId] = useState(true);

  // const [nextUID, setNextUID] = useState(1);
  const uid = () => {
    // setNextUID(nextUID + 1);
    return String(Math.random().toString(36).substr(2, 10));
  };

  const [items, setItems] = useState([]);
  const setItem = (index, item) => {
    setItems([...items.slice(0, index), item, ...items.slice(index + 1)]);
  };

  const addItem = (type, index = items.length) => {
    const newItem = {
      type,
      id: uid(),
      content: "What is 1 + 2?",
      choices: ["One", "Two", "Three", "Four"],
      correctChoice: 2,
      answer: "3",
      workHeight: "100",
      style: "default",
      starred: false,
    };

    setItems([...items.slice(0, index), newItem, ...items.slice(index)]);
  };

  const deleteItem = (index) => {
    setItems([...items.slice(0, index), ...items.slice(index + 1)]);
  };

  const printPreview = useRef();
  const handlePrint = useReactToPrint({
    content: () => printPreview.current,
    pageStyle: `
    @page {
      size: auto;
      margin: 0.5in 0.5in 0.5in 0.5in;
    }
    `,
  });

  const previewWrapperRef = useRef();
  const previewContentRef = useRef();

  const [previewScale, setPreviewScale] = useState(1);

  const updatePreview = useCallback(() => {
    setTimeout(() => {
      const wrapperWidth = previewWrapperRef.current.getBoundingClientRect()
        .width;
      let contentWidth = previewContentRef.current.getBoundingClientRect()
        .width;

      // The content is already being affected by the current value of previewScale,
      // so to compute its "natural" width we need to undo the scaling effect:
      contentWidth = contentWidth / previewScale;

      const newScale = wrapperWidth / contentWidth;
      if (Math.abs(newScale - previewScale) > 0.01) {
        setPreviewScale(newScale);
      }
    }, 1);
  }, [previewScale]);

  useEffect(() => {
    updatePreview();

    window.addEventListener("resize", updatePreview);
    return () => {
      window.removeEventListener("resize", updatePreview);
    };
  }, [updatePreview]);

  // Keyboard shortcut for printing
  useHotkeys("ctrl+p, command+p", (event) => {
    event.preventDefault();
    handlePrint();
  });

  return (
    <div className="w-screen h-screen grid grid-cols-2 grid-rows-1 bg-gray-200">
      <div className="overflow-auto min-h-full flex flex-col relative">
        <div className="space-y-2 p-4 bg-white shadow mb-4 sticky top-0">
          <div className="flex space-x-2 items-center">
            <label className="block w-2/6 flex-grow">
              <div className="text-gray-600 text-xs">Title</div>
              <input
                type="text"
                className="border px-2 py-1 rounded w-full"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                }}
              />
            </label>

            <label className="block w-8/12 flex-grow">
              <div className="text-gray-600 text-xs">Subtitle</div>
              <input
                type="text"
                className="border px-2 py-1 rounded w-full"
                value={subtitle}
                onChange={(event) => {
                  setSubtitle(event.target.value);
                }}
              />
            </label>

            <div className="block w-2/12 flex-grow">
              <div className="text-gray-600 text-xs flex">
                <span>ID</span>
                <button
                  className="ml-1"
                  onClick={() => {
                    setId(Math.random().toString(36).substr(2, 5));
                  }}
                >
                  (rand)
                </button>
                <input
                  className="ml-auto w-3 h-3"
                  title="Show ID"
                  type="checkbox"
                  checked={showId}
                  onChange={(event) => {
                    setShowId(event.target.checked);
                  }}
                />
              </div>
              <input
                type="text"
                className="border px-2 py-1 rounded w-full"
                value={id}
                onChange={(event) => {
                  setId(event.target.value);
                }}
              />
            </div>
          </div>
        </div>

        <div className="px-4">
          <DragDropContext
            onDragEnd={(result) => {
              if (!result.destination) return;

              const reorder = (list, startIndex, endIndex) => {
                const result = Array.from(list);
                const [removed] = result.splice(startIndex, 1);
                result.splice(endIndex, 0, removed);

                return result;
              };

              setItems(
                reorder(items, result.source.index, result.destination.index)
              );
            }}
          >
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className="flex mb-4"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div className="flex-grow">
                            <ItemEditor
                              title={
                                item.type === "text"
                                  ? null
                                  : `Question ${
                                      items
                                        .filter((i) => i.type !== "text")
                                        .indexOf(item) + 1
                                    }`
                              }
                              handleProps={provided.dragHandleProps}
                              dragging={snapshot.isDragging}
                              item={item}
                              setItem={(item) => {
                                setItem(index, item);
                              }}
                              deleteItem={() => {
                                deleteItem(index);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="bg-white shadow p-4 space-x-2 mt-auto sticky bottom-0">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              addItem("freeResponse");
            }}
          >
            Add question
          </button>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              addItem("multipleChoice");
            }}
          >
            Add MC
          </button>

          <button
            className="bg-gray-600 text-white px-4 py-2 rounded"
            onClick={() => {
              addItem("text");
            }}
          >
            Add text
          </button>

          <button onClick={handlePrint}>Print</button>
          <button
            onClick={async () => {
              const fileContent = JSON.stringify(
                { title, subtitle, id, showId, items },
                null,
                2
              );

              const handle = await showSaveFilePicker({
                types: [
                  {
                    description: "Quiz Files",
                    accept: {
                      "application/json": [".json"],
                    },
                  },
                ],
              });

              const writable = await handle.createWritable();
              await writable.write(fileContent);
              await writable.close();
            }}
          >
            Save
          </button>
          <button
            onClick={async () => {
              const [fileHandle] = await window.showOpenFilePicker({
                types: [
                  {
                    description: "Quiz Files",
                    accept: {
                      "application/json": [".json"],
                    },
                  },
                ],
              });
              const file = await fileHandle.getFile();
              const fileContent = await file.text();
              const values = JSON.parse(fileContent);

              setTitle(values.title);
              setSubtitle(values.subtitle);
              setId(values.id);
              setShowId(values.showId);
              setItems(values.items);
            }}
          >
            Load
          </button>
        </div>
      </div>
      <div
        ref={previewWrapperRef}
        className="overflow-x-hidden overflow-y-auto bg-white border-l border-gray-300"
      >
        <div
          ref={previewContentRef}
          style={{
            width: "8.5in",
            minHeight: "11in",
            padding: "0.5in",
            // boxSizing: "border-box",
            transform: `scale(${previewScale})`,
            marginBottom: `-100%`,
            transformOrigin: "top left",
          }}
        >
          <QuizPreview
            id={id}
            showId={showId}
            ref={printPreview}
            title={title}
            subtitle={subtitle}
            items={items}
          />
        </div>
      </div>
    </div>
  );
}

function ItemEditor({
  title,
  item,
  setItem,
  deleteItem,
  handleProps,
  dragging,
}) {
  switch (item.type) {
    case "freeResponse":
      return (
        <ItemEditorContainer
          title={title}
          handleProps={handleProps}
          dragging={dragging}
          item={item}
          setItem={setItem}
          deleteItem={deleteItem}
          content={
            <>
              <textarea
                className="border rounded px-2 py-1 w-full"
                value={item.content}
                onChange={(event) => {
                  setItem({ ...item, content: event.target.value });
                }}
              />

              <label>
                <span className="font-medium">Answer: </span>
                <input
                  type="text"
                  className="border rounded px-2 py-1"
                  value={item.answer}
                  onChange={(event) => {
                    setItem({ ...item, answer: event.target.value });
                  }}
                />
              </label>
            </>
          }
          theme={
            <label>
              <span className="font-bold">Work space: </span>
              <input
                type="number"
                className="border rounded px-2 py-1"
                value={item.workHeight}
                onChange={(event) => {
                  setItem({ ...item, workHeight: event.target.value });
                }}
              />
            </label>
          }
        />
      );
    case "multipleChoice":
      return (
        <ItemEditorContainer
          title={title}
          handleProps={handleProps}
          dragging={dragging}
          item={item}
          setItem={setItem}
          deleteItem={deleteItem}
          content={
            <>
              <textarea
                className="border rounded px-2 py-1 w-full"
                value={item.content}
                onChange={(event) => {
                  setItem({ ...item, content: event.target.value });
                }}
              />

              <div>
                <div className="font-medium">Answer choices:</div>
                <div>
                  {item.choices.map((choice, index) => (
                    <div
                      key={index}
                      className={classNames(
                        "relative border focus-within:ring-2 focus-within:z-20 focus-within:border-blue-500",
                        {
                          "rounded-t -mb-px": index === 0,
                          "-mb-px":
                            index > 0 && index < item.choices.length - 1,
                          "rounded-b": index === item.choices.length - 1,
                          "bg-blue-50 border-blue-200 z-10":
                            item.correctChoice === index,
                        }
                      )}
                    >
                      <label className="absolute top-0 left-0 bottom-0 w-8 flex items-center justify-center cursor-pointer">
                        <div
                          className={classNames("w-4 h-4 rounded-full", {
                            "bg-blue-600": item.correctChoice === index,
                            "bg-gray-300": item.correctChoice !== index,
                          })}
                        />
                        <input
                          className="hidden"
                          type="radio"
                          name="mc-answer"
                          checked={item.correctChoice === index}
                          onChange={(event) => {
                            setItem({ ...item, correctChoice: index });
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        className="px-2 py-1 pl-8 w-full bg-transparent outline-none"
                        value={choice}
                        onChange={(event) => {
                          setItem({
                            ...item,
                            choices: [
                              ...item.choices.slice(0, index),
                              event.target.value,
                              ...item.choices.slice(index + 1),
                            ],
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          }
          theme={
            <label>
              <span className="font-bold">Work space: </span>
              <input
                type="number"
                className="border rounded px-2 py-1"
                value={item.workHeight}
                onChange={(event) => {
                  setItem({ ...item, workHeight: event.target.value });
                }}
              />
            </label>
          }
        />
      );
    case "text":
      return (
        <ItemEditorContainer
          title={title}
          handleProps={handleProps}
          dragging={dragging}
          item={item}
          setItem={setItem}
          deleteItem={deleteItem}
          content={
            <textarea
              className="border rounded px-2 py-1 w-full"
              value={item.content}
              onChange={(event) => {
                setItem({ ...item, content: event.target.value });
              }}
            />
          }
          theme={
            <label>
              <span className="font-bold">Style: </span>
              <select
                className="border rounded px-2 py-1"
                value={item.style}
                onChange={(event) => {
                  setItem({ ...item, style: event.target.value });
                }}
              >
                <option value="default">Default</option>
                <option value="box">Box</option>
              </select>
            </label>
          }
        />
      );
  }
}

function ItemEditorContainer({
  title,
  content,
  theme,
  handleProps,
  dragging,
  item,
  setItem,
  deleteItem,
}) {
  return (
    <div
      className={classNames(
        "bg-white rounded-lg overflow-hidden transition-shadow",
        {
          shadow: !dragging,
          "shadow-lg": dragging,
        }
      )}
    >
      <div className="bg-gray-100 border-b flex items-center">
        <div
          className="self-stretch border-r px-2 flex items-center"
          {...handleProps}
        >
          <svg
            className="w-4 h-6 text-gray-400"
            width="100%"
            height="100%"
            viewBox="0 0 16 24"
          >
            <g fill="currentColor">
              <circle cx="4.5" cy="5" r="2" />
              <circle cx="11.5" cy="5" r="2" />
              <circle cx="4.5" cy="12" r="2" />
              <circle cx="11.5" cy="12" r="2" />
              <circle cx="4.5" cy="19" r="2" />
              <circle cx="11.5" cy="19" r="2" />
            </g>
          </svg>
        </div>

        <button
          className={classNames("self-stretch px-2", {
            "text-gray-400": !item.starred,
            "text-gray-800": item.starred,
          })}
          onClick={() => {
            setItem({ ...item, starred: !item.starred });
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeWidth={2}
              strokeLinejoin="round"
              fill={item.starred ? "currentColor" : "none"}
              d="M12,2L14.245,8.91L21.511,8.91L15.633,13.18L17.878,20.09L12,15.82L6.122,20.09L8.367,13.18L2.489,8.91L9.755,8.91L12,2Z"
            />
          </svg>
        </button>

        {title && <span className="text-gray-600">{title}</span>}

        <div className="py-1 px-1 flex flex-grow items-center justify-end">
          <select
            className="border rounded px-2 py-1"
            value={item.type}
            onChange={() => {
              setItem({ ...item, type: event.target.value });
            }}
          >
            <optgroup label="Question">
              <option value="freeResponse">Free Response</option>
              <option value="multipleChoice">Multiple Choice</option>
            </optgroup>
            <optgroup label="Decoration">
              <option value="text">Text</option>
            </optgroup>
          </select>

          {/* <Menu
            title={title}
            trigger={
              <span className="block ml-2 w-5 h-5 bg-gray-300 rounded-full cursor-pointer" />
            }
          >
            <MenuItem className="text-red-600" onClick={deleteItem}>
              Delete
            </MenuItem>
          </Menu> */}
        </div>

        <button
          className="self-stretch border-l px-2 flex items-center text-red-600"
          onClick={() => {
            deleteItem();
          }}
        >
          <svg className="w-4 h-6" viewBox="0 0 16 24" version="1.1">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12,11L11,18L5,18L4,11" />
              <path d="M3,8L13,8" />
              <path d="M6,7L10,7" />
              <path d="M7,15L7,11" strokeWidth={1} />
              <path d="M9,15L9,11" strokeWidth={1} />
            </g>
          </svg>
        </button>
      </div>
      <div className="p-3">
        <div className="border-b pb-3">{content}</div>
        <div className="pt-3">{theme}</div>
      </div>
    </div>
  );
}

const QuizPreview = forwardRef(function QuizPreview(
  { title, subtitle, items, id, showId },
  ref
) {
  return (
    <div style={{ fontFamily: "Roboto", fontSize: "14pt" }} ref={ref}>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div
        className="grid grid-cols-5 gap-x-4 mb-16"
        style={{ breakInside: "avoid" }}
      >
        <div className="col-start-1 col-span-3">
          <h1 className="font-bold" style={{ fontSize: "28pt" }}>
            {title}
          </h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="col-start-4 col-span-2">
          <div className="flex items-baseline justify-between">
            <span className="font-bold">Name</span>
            {id && showId && (
              <div className="font-mono text-sm text-gray-400">ID: #{id}</div>
            )}
          </div>
          <input
            type="text"
            className="border border-black text-2xl px-2 py-1 w-full"
          />
        </div>
      </div>

      <ol className="space-y-8">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="grid grid-cols-5 gap-x-4"
            style={{ breakInside: "avoid" }}
          >
            <ItemPreview
              item={item}
              getItemIndex={(item) =>
                items.filter((i) => i.type !== "text").indexOf(item)
              }
            />
          </li>
        ))}
      </ol>
    </div>
  );
});

function ItemPreview({ item, getItemIndex }) {
  switch (item.type) {
    case "freeResponse":
      return (
        <>
          <div className="col-start-1 col-span-3">
            <h6 className="font-bold">Question {getItemIndex(item) + 1}</h6>
            <ReactMarkdown plugins={[mathPlugin]} renderers={renderers}>
              {evaluateStr(item.content)}
            </ReactMarkdown>
            <div style={{ height: Number(item.workHeight) }} />
          </div>

          <div className="col-start-4 col-span-2">
            <h6 className="font-bold flex items-center justify-between">
              <span>Answer {getItemIndex(item) + 1}</span>
              {item.starred && (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    fill={item.starred ? "currentColor" : "none"}
                    d="M12,2L14.245,8.91L21.511,8.91L15.633,13.18L17.878,20.09L12,15.82L6.122,20.09L8.367,13.18L2.489,8.91L9.755,8.91L12,2Z"
                  />
                </svg>
              )}
            </h6>
            <input
              type="text"
              className="border border-black text-2xl px-2 py-1 w-full"
            />
          </div>
        </>
      );
    case "multipleChoice":
      return (
        <>
          <div className="col-start-1 col-span-3">
            <h6 className="font-bold">Question {getItemIndex(item) + 1}</h6>
            <ReactMarkdown plugins={[mathPlugin]} renderers={renderers}>
              {evaluateStr(item.content)}
            </ReactMarkdown>
            <div style={{ height: Number(item.workHeight) }} />
          </div>

          <div className="col-start-4 col-span-2 space-y-2">
            <h6 className="font-bold">Answer {getItemIndex(item) + 1}</h6>
            <ol className="space-y-2">
              {item.choices.map((choice, index) => (
                <div key={index} className="flex items-center">
                  <div className="self-stretch flex-shrink-0">
                    <span className="w-7 h-7 mr-2 border border-black rounded-full flex items-center justify-center">
                      {String.fromCharCode("A".charCodeAt(0) + index)}
                    </span>
                  </div>
                  <span>
                    <ReactMarkdown plugins={[mathPlugin]} renderers={renderers}>
                      {evaluateStr(choice)}
                    </ReactMarkdown>
                  </span>
                </div>
              ))}
            </ol>
          </div>
        </>
      );
    case "text":
      switch (item.style) {
        case "box":
          return (
            <div className="col-start-1 col-span-5 border-2 border-black p-4">
              <ReactMarkdown plugins={[mathPlugin]} renderers={renderers}>
                {evaluateStr(item.content)}
              </ReactMarkdown>
            </div>
          );
        default:
          return (
            <div className="col-start-1 col-span-5">
              <ReactMarkdown plugins={[mathPlugin]} renderers={renderers}>
                {evaluateStr(item.content)}
              </ReactMarkdown>
            </div>
          );
      }
    default:
      return null;
  }
}

function evaluateStr(expression, context = {}) {
  if (typeof context === "string") {
    try {
      context = JSON.parse(context);
    } catch (err) {
      context = {};
    }
  }

  return expression
    .split(/#{(.*?)}/)
    .map((s, index) => (index % 2 === 0 ? s : String(evaluateExpr(s, context))))
    .join("");
}

function evaluateExpr(expression, context = {}) {
  const defaultContext = {
    polynomial(terms, { simplify = true, varName = "x" } = {}) {
      return (
        terms
          .reverse()
          .map((c, index) => {
            if (simplify && c === 0) return null;

            let result;
            if (index === 0) {
              result = "";
            } else if (index === 1 && simplify) {
              result = `${varName}`;
            } else {
              result = `${varName}^${index}`;
            }

            if (!(c === 1 && index !== 0 && simplify)) {
              result = `${c}${result}`;
            }

            return result;
          })
          .filter((s) => s !== null)
          .reverse()
          .join(" + ") || "0"
      );
    },
  };
  const entries = Object.entries({ ...defaultContext, ...context });
  const keys = entries.map(([k, v]) => k);
  const values = entries.map(([k, v]) => v);

  try {
    return new Function(...keys, `return (${expression});`)(...values);
  } catch (err) {
    console.error(err);
    return null;
  }
}

const renderers = {
  inlineMath: ({ value }) => <TeX math={value} />,
  math: ({ value }) => <TeX block math={value} />,
  heading: ({ level, children }) => {
    switch (level) {
      case 1:
        return (
          <h2
            className="font-bold border-b-2 border-gray-300 pb-2"
            style={{ fontSize: "24pt" }}
          >
            {children}
          </h2>
        );
      case 2:
        return (
          <h3
            className="font-bold border-b-2 border-gray-300 pb-2"
            style={{ fontSize: "20pt" }}
          >
            {children}
          </h3>
        );
      case 3:
        return (
          <h4 className="font-bold" style={{ fontSize: "18pt" }}>
            {children}
          </h4>
        );
      default:
        return <h5 className="font-bold">{children}</h5>;
    }
  },
};

function Menu({ trigger, title, children, ...props }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      {...props}
      className={classNames("relative", props.className)}
      onClick={() => {
        setOpen(!open);

        if (props.onClick) props.onClick();
      }}
    >
      {trigger}

      {open && (
        <div className="absolute top-full right-0 mt-1 ml-1 bg-white border shadow-lg rounded overflow-hidden w-48">
          <div className="flex flex-col">
            {title && (
              <div className="px-4 text-sm bg-gray-100 py-1 text-gray-500">
                {title}
              </div>
            )}
            <div className="my-1 flex flex-col">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ children, ...props }) {
  return (
    <button
      {...props}
      className={classNames(
        "px-4 py-1 text-left hover:bg-gray-100",
        props.className
      )}
    >
      {children}
    </button>
  );
}
