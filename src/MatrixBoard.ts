import { Point } from './Point';

export class MatrixBoard<T> {
  static read<T>(lines: string, element: (c: string) => T) {
    return new MatrixBoard(lines.split('\n').map((line) => line.split('').map(element)));
  }

  constructor(public contents: T[][]) {}

  forEach(fn: (p: Point, v: T) => void, filter: (p: Point, v: T) => boolean = () => true) {
    for (let y = 0; y < this.contents.length; y += 1) {
      for (let x = 0; x < this.contents[y].length; x += 1) {
        const p: Point = new Point(x, y);
        const v = this.contents[y][x];
        if (filter(p, v)) {
          fn(p, v);
        }
      }
    }
  }

  map(fn: (p: Point, v: T) => T) {
    const newBoard: T[][] = [];
    for (let y = 0; y < this.contents.length; y += 1) {
      newBoard.push(this.contents[y].map((v, x) => fn(new Point(x, y), v)));
    }
    return new MatrixBoard(newBoard);
  }

  get dimension(): Point {
    return new Point(this.contents[0].length, this.contents.length);
  }

  inRange(pos: Point) {
    const dim = this.dimension;
    return pos.x >= 0 && pos.x < dim.x && pos.y >= 0 && pos.y < dim.y;
  }

  expand(dx: number, dy: number, empty: T) {
    const { contents: board } = this;
    const newBoard: T[][] = [];
    for (let y = 0; y < board.length + dy; y += 1) {
      if (y < dy) {
        newBoard.push(new Array(board[0].length + dx).fill(empty));
      } else {
        const newRow: T[] = [];
        newBoard.push(newRow);
        for (let x = 0; x < (board[y]?.length || 0) + dx; x += 1) {
          if (x < dx) {
            newRow.push(empty);
          } else {
            newRow.push(board[y - dy][x - dx]);
          }
        }
      }
    }
    return new MatrixBoard(newBoard);
  }

  toSet(filter: (v: T, p: Point) => boolean) {
    const set = new Set<string>();
    this.forEach((p, v) => {
      if (filter(v, p)) {
        set.add(p.toString());
      }
    });
    return set;
  }

  toString(elementWidth = 1) {
    return this.contents.map((line) => line.map((s) => String(s).padEnd(elementWidth)).join('')).join('\n');
  }
}
