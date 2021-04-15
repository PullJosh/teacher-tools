import {
  useState,
  useRef,
  useMemo,
  useEffect,
  createContext,
  useContext,
  Children,
  isValidElement,
  cloneElement,
} from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { Line, MapControls, OrbitControls, Text } from "@react-three/drei";
import {
  Plane,
  DoubleSide,
  Vector3,
  PlaneGeometry,
  EdgesGeometry,
  ParametricGeometry,
  Color,
} from "three";

export const varColors = ["#aa0000", "#0000aa", "green", "orange", "purple"];

const GraphContext = createContext({ axes: [], size: 400, controls: null });

export default function Graph({ children, axes = ["x", "y"], size = 400 }) {
  const controls = useRef();

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        border: "1px solid #ddd",
        borderRadius: 3,
        boxShadow: "inset 0 1px 3px -1px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Canvas
        orthographic={true}
        camera={{
          zoom: 20,
          position: [0, 0, 100],
          near: 0,
          up: new Vector3(0, 0, 1),
        }}
        /*
        camera={{
          position: new Vector3(0, 0, 10),
          up: new Vector3(0, 0, 1),
        }}
        */
      >
        {/* <color attach="background" args={[0x2b004d]} /> */}

        <GraphContext.Provider value={{ axes, size, controls }}>
          {axes.length <= 2 && (
            <MapControls
              ref={controls}
              enableDamping={false}
              dampingFactor={0.2}
              enabled={true}
              // maxPolarAngle={Math.PI / 2}
              enableRotate={false}
              maxZoom={2 ** 44}
              minZoom={2 ** -19}
            />
          )}

          {axes.length > 2 && <OrbitControls ref={controls} enabled={true} />}

          {/* <fog color={0x000000} near={1} far={1000} /> */}
          {/* <fog attach="fog" args={["pink", 16, 20]} /> */}
          <ambientLight color={0xffffff} intensity={0.5} />
          <directionalLight
            color={0xffffff}
            intensity={0.5}
            position={new Vector3(0.25, 1.0, 0.15)}
          />

          <GraphGridLines />
          {/* <axesHelper size={6} /> */}
          {/* <RenderClippingPlanes /> */}

          {children}

          {/* <NewGridLines /> */}
        </GraphContext.Provider>
      </Canvas>
    </div>
  );
}

function useGraphingWindow() {
  const { size, controls } = useContext(GraphContext);
  const { camera } = useThree();

  function getWindow() {
    const { target } = controls?.current || { target: new Vector3(0, 0, 0) };

    let extent = 0.5 * (size / (camera.zoom || 20));

    // Shrink window when looking in 3D:
    const camDir = new Vector3();
    camera.getWorldDirection(camDir);
    const onAxisAmount = Math.abs(camDir.dot(new Vector3(0, 0, 1)));
    extent = extent * (0.6 + 0.4 * onAxisAmount ** 5);

    /*
    return [
      [-5, 5],
      [-5, 5],
      [-5, 5],
    ];
    */

    return [
      [-extent, extent].map((x) => x + target.x),
      [-extent, extent].map((y) => y + target.y),
      [-extent, extent].map((z) => z + target.z),
    ];
  }

  const [window, setWindow] = useState(getWindow());

  useFrame(() => {
    const newWindow = getWindow();
    if (window.flat().join(",") !== newWindow.flat().join(",")) {
      setWindow(newWindow);
    }
  });

  return window;
}

function useClippingPlanes() {
  const window = useGraphingWindow();

  const { gl } = useThree();
  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  const clippingPlanes = [
    new Plane(new Vector3(1, 0, 0), -window[0][0]),
    new Plane(new Vector3(-1, 0, 0), window[0][1]),
    new Plane(new Vector3(0, 1, 0), -window[1][0]),
    new Plane(new Vector3(0, -1, 0), window[1][1]),
    new Plane(new Vector3(0, 0, 1), -window[2][0]),
    new Plane(new Vector3(0, 0, -1), window[2][1]),
  ];

  return clippingPlanes;
}

function NewGridLines() {
  const window = useGraphingWindow();

  return (
    <mesh geometry={new PlaneGeometry(100, 100, 1, 1)}>
      <shaderMaterial
        transparent={true}
        side={DoubleSide}
        vertexShader={`
          varying vec3 vPos;
          varying vec3 vNorm;
          varying vec2 vUv;
          varying float distToCamera;

          void main() {
            vPos = position;
            vNorm = normal;
            vUv = uv;

            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            distToCamera = -modelViewPosition.z;
            gl_Position = projectionMatrix * modelViewPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vPos;
          varying vec3 vNorm;
          varying vec2 vUv;
          varying float distToCamera;

          void main() {            
            float xDist = abs(vPos.x - round(vPos.x));
            float yDist = abs(vPos.y - round(vPos.y));
            float distFromGridline = min(xDist, yDist);

            vec3 color = vec3(1.0, 0.0, 1.0);
            float a = distFromGridline < 0.05 ? 1.0 : (0.4 * pow(1.0 - distFromGridline, 3.0));
            a = a * clamp(1.0 - (distToCamera - 15.0) / 25.0, 0.0, 1.0);

            gl_FragColor = vec4(color, a);
          }
        `}
      />
    </mesh>
  );
}

export function GraphGridLines() {
  const window = useGraphingWindow();

  const lines = useMemo(() => {
    const windowWidth = Math.abs(window[0][1] - window[0][0]);

    const base = 2;
    const largeLineEvery =
      base ** Math.floor(Math.log(windowWidth) / Math.log(base) - 1);
    // const largeLineEvery = 1;
    const smallLineEvery = largeLineEvery / base;

    const mod = (n, m) => ((n % m) + m) % m; // Modulo that handles negative numbers
    const fadeMultiplier = 1 - mod(Math.log(windowWidth) / Math.log(base), 1);

    const minX = Math.floor(window[0][0] / smallLineEvery) * smallLineEvery;
    const maxX = Math.ceil(window[0][1] / smallLineEvery) * smallLineEvery;
    const minY = Math.floor(window[1][0] / smallLineEvery) * smallLineEvery;
    const maxY = Math.ceil(window[1][1] / smallLineEvery) * smallLineEvery;

    let lines = [];
    for (let x = minX; x <= maxX; x += smallLineEvery) {
      let points = [];
      points.push(x, minY, 0);
      points.push(x, maxY, 0);

      let opacity = 0.7 * fadeMultiplier;
      if (x % largeLineEvery === 0) opacity = 0.7;
      if (x === 0) opacity = 0.9;

      lines.push({
        points,
        color: x === 0 ? varColors[1] : 0x888888,
        opacity,
        width: x === 0 ? 3 : 2,
      });
    }
    for (let y = minY; y <= maxY; y += smallLineEvery) {
      let points = [];
      points.push(minX, y, 0);
      points.push(maxX, y, 0);

      let opacity = 0.7 * fadeMultiplier;
      if (y % largeLineEvery === 0) opacity = 0.7;
      if (y === 0) opacity = 0.9;

      lines.push({
        points,
        color: y === 0 ? varColors[0] : 0x888888,
        opacity, // y % 4 === 0 ? 0.3 : 0.3 * 0,
        width: y === 0 ? 3 : 2,
      });
    }
    return lines;
  }, [window]);

  const clippingPlanes = useClippingPlanes();

  return (
    <>
      {lines.map(({ points, color, opacity, width }) => (
        <Line
          points={points}
          color={color}
          lineWidth={width}
          clippingPlanes={clippingPlanes}
          // opacity={opacity}
          // transparent={true}
          // depthTest={false}
          // renderOrder={-1}
        />
      ))}
    </>
  );
}

function RenderClippingPlanes() {
  // const clippingPlanes = useClippingPlanes();
  const window = useGraphingWindow();

  const edgeGeometries = useMemo(() => {
    // This assumes the window is a cube because I'm
    // too lazy to do it properly right now:
    const width = window[0][1] - window[0][0];

    return [
      new PlaneGeometry(width, width, 1, 1)
        .rotateY(Math.PI / 2)
        .translate(window[0][0], 0, 0),
      new PlaneGeometry(width, width, 1, 1)
        .rotateY(-Math.PI / 2)
        .translate(window[0][1], 0, 0),
      new PlaneGeometry(width, width, 1, 1)
        .rotateX(-Math.PI / 2)
        .translate(0, window[2][0], 0),
      new PlaneGeometry(width, width, 1, 1)
        .rotateX(Math.PI / 2)
        .translate(0, window[2][1], 0),
      new PlaneGeometry(width, width, 1, 1)
        .rotateZ(0)
        .translate(0, 0, window[1][0]),
      new PlaneGeometry(width, width, 1, 1)
        .rotateX(Math.PI)
        .translate(0, 0, window[1][1]),
    ].map((planeGeom) => {
      return new EdgesGeometry(planeGeom);
    });
  }, [window]);

  return (
    <>
      {edgeGeometries.map((geom) => (
        <lineSegments geometry={geom}>
          <lineBasicMaterial color={0xaaaaaa} linewidth={2} />
        </lineSegments>
      ))}
    </>
  );
}

export function GraphFunction(props) {
  const { axes } = useContext(GraphContext);

  switch (props.independentAxes.length) {
    case 1:
      return <GraphFunction2D {...props} />;
    case 2:
      return <GraphFunction3D {...props} />;
    default:
      console.warn(`Cannot handle this graph on ${axes.length} axes!`, axes);
      return null;
  }
}

const interpolate = (t, [a, b]) => a + t * (b - a);

function GraphFunction2D({
  independentAxes,
  f,
  color = "black",
  opacity = 1.0,
}) {
  const { axes } = useContext(GraphContext);
  const window = useGraphingWindow();

  const curves = useMemo(() => {
    let points = [{}];
    for (let i = 0; i < independentAxes.length; i++) {
      points = points.flatMap((point) => {
        let newPoints = [];
        const axisWindow = window[axes.indexOf(independentAxes[i])];

        // Render slightly beyond the window boundaries
        // to prevent small artifacts and weirdness at the edges
        const padWindow = (window, amount) => {
          const width = window[1] - window[0];
          return [window[0] - width * amount, window[1] + width * amount];
        };

        for (let t = 0; t <= 1; t += 0.002) {
          newPoints.push({
            ...point,
            [independentAxes[i]]: interpolate(t, padWindow(axisWindow, 0.05)),
          });
        }
        return newPoints;
      });
    }

    points = points
      .map((point) => ({ ...point, ...f(point) }))
      .map((point) =>
        [0, 0, 0].map((_, index) => {
          if (index > axes.length - 1) return 0;
          return point[axes[index]];
        })
      );

    const isValidPoint = (point) => !point.some((value) => Number.isNaN(value));
    let curves = [];
    let curve = [];
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (isValidPoint(point)) {
        curve.push(point);
      } else {
        curves.push(curve);
        curve = [];
      }
    }
    curves.push(curve);

    curves = curves.filter((curve) => curve.length > 1);

    return curves;
  }, [independentAxes, f, axes, window]);

  const clippingPlanes = useClippingPlanes();

  return curves.map((points) => (
    <Line
      points={points}
      transparent={true}
      depthTest={false}
      renderOrder={2}
      color={color}
      opacity={opacity}
      lineWidth={4}
      clippingPlanes={clippingPlanes}
    />
  ));
}

function GraphFunction3D({
  independentAxes,
  f,
  color = 0xaaaaff,
  opacity = 0.9,
}) {
  const { axes } = useContext(GraphContext);
  const window = useGraphingWindow();

  /*
  const windowChunk = useMemo(
    () =>
      window.map((range) => {
        const gridScale = 2 ** Math.ceil(Math.log2(range[1] - range[0]));
        return [
          Math.floor(range[0] / gridScale) * gridScale,
          Math.ceil(range[1] / gridScale) * gridScale,
        ];
      }),
    [window]
  );
  */

  const geometry = useMemo(() => {
    console.log("Recomputing geometry");

    const uRange = window[axes.indexOf(independentAxes[0])];
    const vRange = window[axes.indexOf(independentAxes[1])];
    const geometry = new ParametricGeometry(
      (u, v, dest) => {
        let point = {
          [independentAxes[0]]: interpolate(u, uRange),
          [independentAxes[1]]: interpolate(v, vRange),
        };
        Object.assign(point, f(point));
        dest.set(point[axes[0]], point[axes[1]], point[axes[2]]);
      },
      32,
      32
    );
    geometry.computeVertexNormals();

    return geometry;
  }, [independentAxes, f, window.flat().join(",")]);

  const clippingPlanes = useClippingPlanes();

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        transparent={true}
        opacity={opacity}
        side={DoubleSide}
        color={color}
        clippingPlanes={clippingPlanes}
        // clipIntersection={true}
      />
      {/* <meshNormalMaterial
        transparent={true}
        opacity={opacity}
        side={DoubleSide}
        clippingPlanes={clippingPlanes}
      /> */}
      {/* <shaderMaterial
        transparent={true}
        side={DoubleSide}
        clipping={true}
        clippingPlanes={clippingPlanes}
        // wireframe={true}
        // uniforms={{
        //   colorA: { type: "vec3", value: new Color(0xff0000) },
        //   colorB: { type: "vec3", value: new Color(0x0000ff) },
        // }}
        vertexShader={`
          varying vec3 vPos;
          varying vec3 vNorm;
          varying vec2 vUv;
          varying float distToCamera;

          #include <clipping_planes_pars_vertex>

          void main() {
            #include <begin_vertex>

            vPos = position;
            vNorm = normal;
            vUv = uv;

            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            distToCamera = -modelViewPosition.z;
            gl_Position = projectionMatrix * modelViewPosition;

            #include <project_vertex>
            #include <clipping_planes_vertex>
          }
        `}
        fragmentShader={`
          varying vec3 vPos;
          varying vec3 vNorm;
          varying vec2 vUv;
          varying float distToCamera;

          #include <clipping_planes_pars_fragment>

          void main() {
            #include <clipping_planes_fragment>
            
            float x = mod(vPos.x, 1.0) < 0.5 ? 1.0 : 0.0;
            float y = mod(vPos.y, 1.0) < 0.5 ? 1.0 : 0.0;
            vec3 color = vec3(mod(x + y, 2.0));
            
            // vec3 color = hsv2rgb(vec3(vPos.z * 0.05, 1.0, 1.0));

            gl_FragColor = vec4(color, 0.8);

            // gl_FragColor = vec4(vec3(1.0 - 0.02 * distToCamera), 1.0);
          }
        `}
      /> */}
    </mesh>
  );
}

export function FadeOutOnAxis({ axis, children }) {
  const { camera } = useThree();
  const [opacity, setOpacity] = useState(0.9);

  const { axes } = useContext(GraphContext);

  useFrame(() => {
    const camDir = new Vector3();
    camera.getWorldDirection(camDir);

    const axisDir = new Vector3(...axes.map((a) => (a === axis ? 1 : 0)));
    const onAxisAmount = Math.abs(camDir.dot(axisDir));

    const newOpacity = Math.round((0.9 - onAxisAmount ** 10) * 1000) / 1000;
    if (opacity !== newOpacity) {
      setOpacity(newOpacity);
    }
  });

  return Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child, { opacity });
    }

    return child;
  });
}
