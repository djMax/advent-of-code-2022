import { Cardinal, CardinalCombo } from './types/index';

export class Point {
  static N = new Point(0, -1);

  static S = new Point(0, 1);

  static E = new Point(1, 0);

  static W = new Point(-1, 0);

  public x: number;

  public y: number;

  constructor(xOrStr: number | string, y: number | undefined = undefined) {
    if (typeof xOrStr === 'string') {
      [this.x, this.y] = xOrStr.split(',').map((s) => parseInt(s, 10));
    } else {
      this.x = xOrStr;
      this.y = y!;
    }
  }

  add(p: Point): Point {
    return new Point(this.x + p.x, this.y + p.y);
  }

  eq(p?: Point): boolean {
    return this.x === p?.x && this.y === p?.y;
  }

  toString(): string {
    return `${this.x},${this.y}`;
  }

  move(combo: CardinalCombo): Point {
    return this.add(Point.getDelta(combo));
  }

  static getDelta(combo: CardinalCombo) {
    const dirs = combo.split('') as Cardinal[];
    return dirs.reduce((acc, dir) => acc.add(Point[dir]), new Point(0, 0));
  }

  static bounds(points: Point[]) {
    let {
      e, w, n, s,
    } = {
      e: 0,
      w: Infinity,
      n: Infinity,
      s: 0,
    };
    points.forEach(({ x, y }) => {
      e = Math.max(e, x);
      w = Math.min(w, x);
      n = Math.min(n, y);
      s = Math.max(s, y);
    });
    return {
      e, w, n, s,
    };
  }
}
