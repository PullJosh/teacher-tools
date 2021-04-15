import { useRef, useState, createContext, useContext } from "react";

export default function MathDisplay({ children, ...props }) {
  return (
    <div className="Math" {...props}>
      {children}{" "}
      <style jsx>{`
        .Math {
          font-family: "Computer Modern", serif;
          font-size: 20px;
        }
      `}</style>
    </div>
  );
}

const PemdasContext = createContext(null);

function withPemdas(matchingParents, Component) {
  return function (props) {
    const pemdasParent = useContext(PemdasContext);
    if (matchingParents.includes(pemdasParent)) {
      return (
        <Parenthesis>
          <Component {...props} />
        </Parenthesis>
      );
    }
    return <Component {...props} />;
  };
}

export const Add = withPemdas(
  [
    "Subtract",
    "Multiply",
    "Divide",
    "Exponent_base",
    "Exponent_power",
    "PlusMinus",
  ],
  ({ a, b }) => {
    return (
      <span>
        <PemdasContext.Provider value="Add">
          {a}
          <span> + </span>
          {b}
        </PemdasContext.Provider>
      </span>
    );
  }
);

export const Subtract = withPemdas(
  ["Multiply", "Divide", "Exponent_base", "Exponent_power", "PlusMinus"],
  ({ a, b }) => {
    return (
      <span>
        <PemdasContext.Provider value="Subtract">
          {a}
          <span> - </span>
          {b}
        </PemdasContext.Provider>
      </span>
    );
  }
);

export const Multiply = withPemdas(
  ["Exponent_base", "PlusMinus"],
  ({ a, b, style }) => {
    return (
      <span>
        <PemdasContext.Provider value="Multiply">
          {a}
          <ClipboardText copyString="*">
            {style === "hidden" ? null : <span>&sdot;</span>}
          </ClipboardText>
          {b}
        </PemdasContext.Provider>
      </span>
    );
  }
);

export const Divide = withPemdas(["Exponent_base", "PlusMinus"], ({ a, b }) => {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        verticalAlign: "middle",
      }}
    >
      <PemdasContext.Provider value="Divide">
        <span>{a}</span>
        <span
          style={{ alignSelf: "stretch", borderBottom: "1px solid black" }}
        />
        <span>{b}</span>
      </PemdasContext.Provider>
    </span>
  );
});

export const Exponent = withPemdas(
  ["Exponent_base", "PlusMinus"],
  ({ base, power }) => {
    return (
      <span>
        <PemdasContext.Provider value="Exponent_base">
          {base}
        </PemdasContext.Provider>
        <ClipboardText copyString="^" />
        <PemdasContext.Provider value="Exponent_power">
          <sup>{power}</sup>
        </PemdasContext.Provider>
      </span>
    );
  }
);

export const Root = withPemdas([], ({ base, power }) => {
  return (
    <span>
      <PemdasContext.Provider value="Root_power">
        <sup>{power}</sup>
      </PemdasContext.Provider>
      <PemdasContext.Provider value="Root_base">
        <span
          style={{
            display: "inline-block",
            borderLeft: "1px solid black",
            borderTop: "1px solid black",
            padding: "1px 4px",
          }}
        >
          {base}
        </span>
      </PemdasContext.Provider>
    </span>
  );
});

export function PlusMinus({ children }) {
  return (
    <PemdasContext.Provider value="PlusMinus">
      <span>±{children}</span>
    </PemdasContext.Provider>
  );
}

export function Parenthesis({ children }) {
  const pemdasParent = useContext(PemdasContext);

  const content = (
    <PemdasContext.Provider value={null}>{children}</PemdasContext.Provider>
  );

  if (pemdasParent === "Divide") {
    return <span>{content}</span>;
  }

  return <span>({content})</span>;
}

export function Variable({ children, color }) {
  return <span style={{ fontStyle: "italic", color }}>{children}</span>;
}

export const Equal = withPemdas([], ({ a, b }) => {
  return (
    <PemdasContext.Provider value={null}>
      {a}
      <span> = </span>
      {b}
    </PemdasContext.Provider>
  );
});

function ClipboardText({ copyString, children }) {
  return (
    <>
      <span style={{ position: "absolute", opacity: 0, fontSize: 0 }}>
        {copyString}
      </span>
      {children && <span style={{ userSelect: "none" }}>{children}</span>}
    </>
  );
}

export function HoverBox({ children, content, ...props }) {
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  return (
    <span className={"HoverBox" + (open ? " HoverBox--open" : "")}>
      <span
        ref={ref}
        className={
          "HoverBox__target" + (hovering ? " HoverBox__target--hovering" : "")
        }
        onMouseOver={(event) => {
          if (event.target.closest(".HoverBox") === ref.current.parentNode) {
            setHovering(true);
          }
        }}
        onMouseOut={() => {
          setHovering(false);
        }}
        onClick={() => {
          if (hovering) {
            setOpen(!open);
          }
        }}
        tabIndex="0"
        {...props}
      >
        {children}
      </span>
      {open && <div className="HoverBox__popup">{content}</div>}
      <style jsx>{`
        .HoverBox {
          position: relative;
        }
        .HoverBox__target {
          padding: 2px 4px;
          margin: -2px -4px;
          border-radius: 3px;
          cursor: pointer;
          display: inline-block;
        }
        .HoverBox__target--hovering {
          background: rgba(0, 0, 0, 0.1);
        }
        .HoverBox__target--hovering:active,
        .HoverBox--open > .HoverBox__target {
          background: rgba(0, 0, 0, 0.2);
        }
        .HoverBox__popup {
          position: absolute;
          z-index: 10;
          top: 100%;
          left: 50%;
          transform: translate(-50%, 4px);

          background: white;
          min-width: 200px;
          text-align: left;
          padding: 4px;
          border-radius: 7px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .HoverBox__popup::before {
          content: " ";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translate(-50%, -100%);

          border: 8px solid transparent;
          border-bottom-color: white;
        }
      `}</style>
    </span>
  );
}
