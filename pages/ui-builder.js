import classNames from "classnames";
import { useState } from "react";

const sizeOptions = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "20",
  "24",
  "28",
  "32",
  "36",
  "40",
  "44",
  "48",
  "52",
  "56",
  "60",
  "64",
  "72",
  "80",
  "96",
];

const itemTypes = {
  page: {
    properties: {
      url: { type: "string", defaultValue: "/" },
      layoutMode: {
        type: "enum",
        options: ["page", "app"],
        defaultValue: "page",
      },
      item: { type: "item", allowedItemTypes: ["layout"], single: true },
    },
    allowedModifiers: ["backgroundColor"],
    Editor({
      item,
      properties,
      setProperty,
      items,
      addItem,
      setItem,
      deleteItem,
    }) {
      return (
        <div className="flex flex-col space-y-2">
          <label>
            <span className="font-semibold">URL:</span>
            <input
              type="text"
              value={properties.url}
              onChange={(event) => setProperty("url", event.target.value)}
            />
          </label>

          <label>
            <span className="font-semibold">Layout mode:</span>
            <select
              type="text"
              value={properties.layoutMode}
              onChange={(event) =>
                setProperty("layoutMode", event.target.value)
              }
            >
              <option value="page">Page</option>
              <option value="app">App</option>
            </select>
          </label>

          <div className="pb-2">
            <div className="flex justify-between">
              <span className="font-semibold">Children:</span>
              {!items.some((i) => i.belongsTo === item.id) && (
                <div className="space-x-2">
                  <button onClick={() => addItem("layout", item.id)}>
                    + Layout
                  </button>
                </div>
              )}
            </div>
            <div className="border border-gray-400 flex-grow">
              <ItemList
                items={items.filter((i) => i.belongsTo === item.id)}
                setItem={setItem}
                deleteItem={deleteItem}
              />
            </div>
          </div>
        </div>
      );
    },
  },
  box: {
    properties: {
      text: { type: "string", defaultValue: "Hello, world!" },
    },
    allowedModifiers: ["backgroundColor", "shadow", "padding", "rounded"],
    Editor({ properties, setProperty }) {
      return (
        <div className="flex flex-col space-y-2">
          <label>
            <span className="font-semibold">Text:</span>
            <textarea
              className="block w-full p-2 border border-gray-300 rounded"
              value={properties.text}
              onChange={(event) => setProperty("text", event.target.value)}
            />
          </label>
        </div>
      );
    },
  },
  layout: {
    properties: {
      direction: {
        type: "enum",
        options: ["row", "column"],
        defaultValue: "row",
      },
      justify: {
        type: "enum",
        options: ["start", "center", "end", "around", "between"],
        defaultValue: "center",
      },
      align: {
        type: "enum",
        options: ["start", "center", "end", "stretch"],
        defaultValue: "center",
      },
      space: {
        type: "enum",
        options: ["0", ...sizeOptions],
      },
    },
    allowedModifiers: ["backgroundColor", "shadow", "padding", "rounded"],
    Editor({
      item,
      properties,
      setProperty,
      items,
      addItem,
      setItem,
      deleteItem,
    }) {
      return (
        <div className="flex flex-col space-y-2">
          <label>
            <span className="font-semibold">Direction:</span>
            <select
              value={properties.direction}
              onChange={(event) => {
                setProperty("direction", event.target.value);
              }}
            >
              <option value="row">Horizontal</option>
              <option value="column">Vertical</option>
            </select>
          </label>

          <label>
            <span className="font-semibold">Justify:</span>
            <select
              value={properties.justify}
              onChange={(event) => {
                setProperty("justify", event.target.value);
              }}
            >
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
              <option value="around">Around</option>
              <option value="between">Between</option>
            </select>
          </label>

          <label>
            <span className="font-semibold">Align:</span>
            <select
              value={properties.align}
              onChange={(event) => {
                setProperty("align", event.target.value);
              }}
            >
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
              <option value="stretch">Stretch</option>
            </select>
          </label>

          <label>
            <span className="font-semibold">Item spacing:</span>
            <select
              disabled={
                !["start", "center", "end"].includes(properties.justify)
              }
              value={properties.space}
              onChange={(event) => {
                setProperty("space", event.target.value);
              }}
            >
              {itemTypes.layout.properties.space.options.map((option) => (
                <option value={option}>{option}</option>
              ))}
            </select>
          </label>

          <div className="py-4">
            <hr className="border-b border-gray-400" />
          </div>

          <div className="flex-grow flex flex-col pb-2">
            <div className="flex justify-between">
              <span className="font-semibold">Children:</span>
              <div className="space-x-2">
                <button onClick={() => addItem("box", item.id)}>+ Box</button>
                <button onClick={() => addItem("layout", item.id)}>
                  + Layout
                </button>
                <button onClick={() => addItem("image", item.id)}>
                  + Image
                </button>
                <button onClick={() => addItem("button", item.id)}>
                  + Button
                </button>
              </div>
            </div>
            <div className="border border-gray-400 flex-grow">
              <ItemList
                items={items.filter((i) => i.belongsTo === item.id)}
                setItem={setItem}
                deleteItem={deleteItem}
              />
            </div>
          </div>
        </div>
      );
    },
  },
  image: {
    properties: {
      url: { type: "string", defaultValue: "" },
      alt: { type: "string", defaultValue: "" },
      width: { type: "string", defaultValue: "" },
      height: { type: "string", defaultValue: "" },
    },
    allowedModifiers: ["backgroundColor", "shadow", "rounded"],
    Editor({ properties, setProperty }) {
      return (
        <div className="flex flex-col space-y-2">
          <label>
            <span className="font-semibold">URL:</span>
            <input
              type="text"
              value={properties.url}
              onChange={(event) => setProperty("url", event.target.value)}
            />
          </label>

          <label>
            <span className="font-semibold">Image description (alt):</span>
            <textarea
              value={properties.alt}
              onChange={(event) => setProperty("alt", event.target.value)}
            />
          </label>

          <label>
            <span className="font-semibold">Width:</span>
            <input
              type="text"
              placeholder="auto"
              value={properties.width}
              onChange={(event) => setProperty("width", event.target.value)}
            />
          </label>

          <label>
            <span className="font-semibold">Height:</span>
            <input
              type="text"
              placeholder="auto"
              value={properties.height}
              onChange={(event) => setProperty("height", event.target.value)}
            />
          </label>
        </div>
      );
    },
  },
  button: {
    properties: {
      text: { type: "string", defaultValue: "Button" },
      onClick: { type: "string", defaultValue: `alert("clicked!");` },
    },
    allowedModifiers: ["backgroundColor", "shadow", "padding", "rounded"],
    Editor({ properties, setProperty }) {
      return (
        <div className="flex flex-col space-y-2">
          <label>
            <span className="font-semibold">Text:</span>
            <input
              type="text"
              value={properties.text}
              onChange={(event) => setProperty("text", event.target.value)}
            />
          </label>

          <label>
            <span className="font-semibold">On click (JavaScript):</span>
            <textarea
              value={properties.onClick}
              onChange={(event) => setProperty("onClick", event.target.value)}
            />
          </label>
        </div>
      );
    },
  },
};

const modifierTypes = {
  backgroundColor: {
    properties: {
      color: { type: "string", defaultValue: "blue" },
    },
    Editor({ properties, setProperty }) {
      return (
        <div className="flex flex-col space-y-2">
          <label>
            <span className="font-semibold">Background color:</span>
            <input
              type="text"
              value={properties.color}
              onChange={(event) => setProperty("color", event.target.value)}
            />
          </label>
        </div>
      );
    },
  },
  shadow: {
    properties: {
      shadow: {
        type: "enum",
        options: [
          "shadow-sm",
          "shadow",
          "shadow-md",
          "shadow-lg",
          "shadow-xl",
          "shadow-2xl",
          "shadow-inner",
        ],
        defaultValue: "shadow",
      },
    },
    Editor({ properties, setProperty }) {
      return (
        <div className="flex flex-col space-y-2">
          <label>
            <span className="font-semibold">Shadow: </span>
            <select
              value={properties.shadow}
              onChange={(event) => setProperty("shadow", event.target.value)}
            >
              <optgroup label="Outset">
                <option value="shadow-sm">Small</option>
                <option value="shadow">Normal</option>
                <option value="shadow-md">Medium</option>
                <option value="shadow-lg">Large</option>
                <option value="shadow-xl">Extra Large</option>
                <option value="shadow-2xl">2XL</option>
              </optgroup>
              <optgroup label="Inset">
                <option value="shadow-inner">Inner</option>
              </optgroup>
            </select>
          </label>
        </div>
      );
    },
  },
  padding: {
    properties: {
      size: { type: "enum", options: sizeOptions, defaultValue: "4" },
      top: { type: "boolean", defaultValue: true },
      bottom: { type: "boolean", defaultValue: true },
      left: { type: "boolean", defaultValue: true },
      right: { type: "boolean", defaultValue: true },
    },
    Editor({ properties, setProperty }) {
      return (
        <div className="grid grid-rows-3 grid-cols-5 place-items-center">
          <select
            className="row-start-2 col-start-2 col-span-3 place-self-stretch"
            value={properties.size}
            onChange={(event) => setProperty("size", event.target.value)}
          >
            {modifierTypes.padding.properties.size.options.map((option) => (
              <option value={option}>{option}</option>
            ))}
          </select>

          <input
            type="checkbox"
            className="row-start-1 col-start-3"
            checked={properties.top}
            onChange={(event) => setProperty("top", event.target.checked)}
          />
          <input
            type="checkbox"
            className="row-start-3 col-start-3"
            checked={properties.bottom}
            onChange={(event) => setProperty("bottom", event.target.checked)}
          />
          <input
            type="checkbox"
            className="row-start-2 col-start-1"
            checked={properties.left}
            onChange={(event) => setProperty("left", event.target.checked)}
          />
          <input
            type="checkbox"
            className="row-start-2 col-start-5"
            checked={properties.right}
            onChange={(event) => setProperty("right", event.target.checked)}
          />
        </div>
      );
    },
  },
  rounded: {
    properties: {
      size: {
        type: "enum",
        options: ["sm", "normal", "md", "lg", "xl", "3xl", "2xl", "full"],
        defaultValue: "normal",
      },
      topLeft: { type: "boolean", defaultValue: true },
      topRight: { type: "boolean", defaultValue: true },
      bottomLeft: { type: "boolean", defaultValue: true },
      bottomRight: { type: "boolean", defaultValue: true },
    },
    Editor({ properties, setProperty }) {
      return (
        <div className="grid grid-rows-3 grid-cols-5 place-items-center">
          <select
            className="row-start-2 col-start-2 col-span-3 place-self-stretch"
            value={properties.size}
            onChange={(event) => setProperty("size", event.target.value)}
          >
            <option value="sm">Small</option>
            <option value="normal">Normal</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
            <option value="2xl">2XL</option>
            <option value="3xl">3XL</option>
            <option disabled>---</option>
            <option value="full">Full</option>
          </select>

          <input
            type="checkbox"
            className="row-start-1 col-start-1"
            checked={properties.topLeft}
            onChange={(event) => setProperty("topLeft", event.target.checked)}
          />
          <input
            type="checkbox"
            className="row-start-1 col-start-5"
            checked={properties.topRight}
            onChange={(event) => setProperty("topRight", event.target.checked)}
          />
          <input
            type="checkbox"
            className="row-start-3 col-start-1"
            checked={properties.bottomLeft}
            onChange={(event) =>
              setProperty("bottomLeft", event.target.checked)
            }
          />
          <input
            type="checkbox"
            className="row-start-3 col-start-5"
            checked={properties.bottomRight}
            onChange={(event) =>
              setProperty("bottomRight", event.target.checked)
            }
          />
        </div>
      );
    },
  },
};

export default function UIBuilder() {
  const [items, setItems] = useState([]);

  const [selectedItemId, setSelectedItemId] = useState(null);
  const selectedItem = items.find((item) => item.id === selectedItemId) || null;

  function addItem(type, belongsTo = null) {
    const id = Math.random().toString(16).slice(2);
    let item = {
      id,
      type,
      name: type,
      belongsTo,
      properties: {},
      modifiers: [],
    };

    for (const [name, prop] of Object.entries(itemTypes[type].properties)) {
      item.properties[name] = prop.defaultValue;
    }

    setItems([...items, item]);
  }

  function setItem(id, item) {
    const index = items.findIndex((item) => item.id === id);
    setItems([...items.slice(0, index), item, ...items.slice(index + 1)]);
  }

  function deleteItem(id) {
    // TODO: This is not adequately recursive! (Does not delete children of children)
    setItems(items.filter((item) => item.id !== id && item.belongsTo !== id));

    if (selectedItemId === id || selectedItem?.belongsTo === id) {
      setSelectedItemId(null);
    }
  }

  return (
    <div className="w-screen min-h-screen grid grid-cols-4">
      <div className="bg-gray-200 flex flex-col max-h-screen sticky top-0">
        <div className="flex justify-between border-b border-gray-400 px-4 py-2">
          <div className="font-bold">Pages</div>

          <div className="space-x-2">
            <button
              className="bg-blue-700 text-white px-1 rounded"
              onClick={() => {
                addItem("page");
              }}
            >
              + Page
            </button>
          </div>
        </div>

        <ItemTree
          items={items}
          match={(item) => item.belongsTo === null}
          setItem={setItem}
          deleteItem={deleteItem}
          selectedItemId={selectedItemId}
          setSelectedItemId={setSelectedItemId}
        />
      </div>

      <div className="col-span-2 p-8">
        <h2 className="font-bold text-lg mb-2">Preview</h2>
        <div className="space-y-8">
          {items
            .filter((item) => item.type === "page")
            .map((page) => (
              <div className="border border-black h-96 overflow-auto relative">
                <ItemPreview item={page} items={items} />
              </div>
            ))}
        </div>
      </div>

      <div className="bg-gray-200 flex flex-col max-h-screen sticky top-0">
        {selectedItem === null && (
          <span className="flex-grow flex items-center justify-center text-gray-600">
            No item selected.
          </span>
        )}
        {selectedItem !== null && (
          <>
            <div className="flex justify-between border-b border-gray-400 px-4 py-2">
              <input
                className="font-bold bg-transparent px-4 py-2 -mx-4 mr-0 -my-2"
                type="text"
                value={selectedItem.name}
                onChange={(event) => {
                  setItem(selectedItemId, {
                    ...selectedItem,
                    name: event.target.value,
                  });
                }}
              />
            </div>

            <div className="flex-grow px-4 py-2 flex flex-col">
              {(() => {
                const Editor = itemTypes[selectedItem.type].Editor;
                return (
                  <Editor
                    item={selectedItem}
                    properties={selectedItem.properties}
                    setProperty={(name, value) => {
                      setItem(selectedItemId, {
                        ...selectedItem,
                        properties: {
                          ...selectedItem.properties,
                          [name]: value,
                        },
                      });
                    }}
                    items={items}
                    addItem={addItem}
                    setItem={setItem}
                    deleteItem={deleteItem}
                  />
                );
              })()}

              {selectedItem.modifiers.map((modifier) => {
                const Editor = modifierTypes[modifier.type].Editor;
                return (
                  <div className="bg-gray-300 mt-4">
                    <div className="flex justify-between">
                      <span className="font-bold">{modifier.type}</span>
                      <button
                        onClick={() => {
                          setItem(selectedItemId, {
                            ...selectedItem,
                            modifiers: selectedItem.modifiers.filter(
                              (m) => m !== modifier
                            ),
                          });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    <Editor
                      properties={modifier.properties}
                      setProperty={(name, value) => {
                        setItem(selectedItemId, {
                          ...selectedItem,
                          modifiers: selectedItem.modifiers.map((m) =>
                            m === modifier
                              ? {
                                  ...modifier,
                                  properties: {
                                    ...modifier.properties,
                                    [name]: value,
                                  },
                                }
                              : m
                          ),
                        });
                      }}
                    />
                  </div>
                );
              })}

              {itemTypes[selectedItem.type].allowedModifiers.map(
                (modifierName) => (
                  <button
                    className="mt-2"
                    onClick={() => {
                      setItem(selectedItemId, {
                        ...selectedItem,
                        modifiers: [
                          ...selectedItem.modifiers,
                          {
                            type: modifierName,
                            properties: Object.fromEntries(
                              Object.entries(
                                modifierTypes[modifierName].properties
                              ).map(([name, prop]) => [name, prop.defaultValue])
                            ),
                          },
                        ],
                      });
                    }}
                  >
                    Add {modifierName}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ItemTree({
  items,
  match,
  setItem,
  deleteItem,
  selectedItemId,
  setSelectedItemId,
}) {
  return (
    <div>
      {items.filter(match).map((item) => {
        return (
          <div key={item.id}>
            <div
              className={classNames("px-4 py-1 flex justify-between", {
                "bg-blue-600 text-white": selectedItemId === item.id,
              })}
              onClick={() => {
                setSelectedItemId(item.id);
              }}
            >
              <input
                className="bg-transparent"
                type="text"
                value={item.name}
                onChange={(event) => {
                  setItem(item.id, { ...item, name: event.target.value });
                }}
              />

              <button
                onClick={() => {
                  deleteItem(item.id);
                }}
              >
                -
              </button>
            </div>
            <div className="pl-6">
              <ItemTree
                items={items}
                match={(innerItem) => innerItem.belongsTo === item.id}
                setItem={setItem}
                deleteItem={deleteItem}
                selectedItemId={selectedItemId}
                setSelectedItemId={setSelectedItemId}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ItemList({ items, setItem, deleteItem }) {
  const [selectedItemId, setSelectedItemId] = useState(null);

  return (
    <div>
      {items.map((item) => {
        return (
          <div key={item.id}>
            <div
              className={classNames("px-4 py-1 flex justify-between", {
                "bg-blue-600 text-white": selectedItemId === item.id,
              })}
              onClick={() => {
                setSelectedItemId(item.id);
              }}
            >
              <input
                className="bg-transparent"
                type="text"
                value={item.name}
                onChange={(event) => {
                  setItem(item.id, { ...item, name: event.target.value });
                }}
              />

              <button
                onClick={() => {
                  deleteItem(item.id);
                }}
              >
                -
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ItemPreview({ item, items }) {
  const backgroundColor =
    [...item.modifiers].reverse().find((m) => m.type === "backgroundColor")
      ?.properties?.color || undefined;

  const shadow = classNames(
    item.modifiers
      .filter((m) => m.type === "shadow")
      .map((m) => m.properties.shadow)
  );

  const padding = classNames(
    ...item.modifiers
      .filter((m) => m.type === "padding")
      .map(({ properties: p }) => ({
        [`pt-${p.size}`]: p.top,
        [`pb-${p.size}`]: p.bottom,
        [`pl-${p.size}`]: p.left,
        [`pr-${p.size}`]: p.right,
      }))
  );

  const rounded = classNames(
    ...item.modifiers
      .filter((m) => m.type === "rounded")
      .map(({ properties: p }) => ({
        [p.size === "normal"
          ? "rounded-tl"
          : `rounded-tl-${p.size}`]: p.topLeft,
        [p.size === "normal"
          ? "rounded-tr"
          : `rounded-tr-${p.size}`]: p.topRight,
        [p.size === "normal"
          ? "rounded-bl"
          : `rounded-bl-${p.size}`]: p.bottomLeft,
        [p.size === "normal"
          ? "rounded-br"
          : `rounded-br-${p.size}`]: p.bottomRight,
      }))
  );

  switch (item.type) {
    case "page": {
      const pageItem = items.find(
        (innerItem) => innerItem.belongsTo === item.id
      );
      return (
        <div
          className={classNames("absolute top-0 left-0 right-0 bottom-0", {
            "overflow-auto": item.properties.layoutMode === "page",
            "overflow-hidden grid grid-rows-1 grid-cols-1":
              item.properties.layoutMode === "app",
          })}
          style={{ backgroundColor }}
        >
          {pageItem && <ItemPreview item={pageItem} items={items} />}
        </div>
      );
    }
    case "box": {
      return (
        <div
          key={item.id}
          className={classNames(shadow, padding, rounded)}
          style={{ backgroundColor }}
        >
          {item.properties.text}
        </div>
      );
    }
    case "layout":
      return (
        <div
          key={item.id}
          className={classNames(
            "flex",
            {
              "flex-col": item.properties.direction === "column",
              "justify-start": item.properties.justify === "start",
              "justify-center": item.properties.justify === "center",
              "justify-end": item.properties.justify === "end",
              "justify-around": item.properties.justify === "around",
              "justify-between": item.properties.justify === "between",
              "items-start": item.properties.align === "start",
              "items-center": item.properties.align === "center",
              "items-end": item.properties.align === "end",
              "items-stretch": item.properties.align === "stretch",
            },
            ["start", "center", "end"].includes(item.properties.justify)
              ? {
                  [`space-x-${item.properties.space}`]:
                    item.properties.direction === "row",
                  [`space-y-${item.properties.space}`]:
                    item.properties.direction === "column",
                }
              : {},
            shadow,
            padding,
            rounded
          )}
          style={{ backgroundColor }}
        >
          {items
            .filter((innerItem) => innerItem.belongsTo === item.id)
            .map((item) => (
              <ItemPreview item={item} items={items} />
            ))}
        </div>
      );
    case "image":
      return (
        <img
          src={item.properties.url}
          alt={item.properties.alt}
          className={classNames(shadow, rounded)}
          style={{
            width: Number(item.properties.width) || undefined,
            height: Number(item.properties.height) || undefined,
            backgroundColor,
          }}
        />
      );
    case "button":
      return (
        <button
          onClick={() => {
            eval(item.properties.onClick);
          }}
          className={classNames(shadow, padding, rounded)}
          style={{ backgroundColor }}
        >
          {item.properties.text}
        </button>
      );
  }
}
