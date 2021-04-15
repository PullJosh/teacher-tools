import { Parabola } from "../types/geometry";

export function parabola(a: number, b: number, c: number): Parabola {
  return { type: "parabola", a, b, c };
}
