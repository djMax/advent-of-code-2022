import { Position } from './types';

export class MatrixBoard<T> {
  static read<T>(lines: string, element: (c: string) => T) {
    return new MatrixBoard(lines.split('\n').map((line) => line.split('').map(element)));
  }

  constructor(public board: T[][]) {}

  forEach(fn: (p: Position, v: T) => void, filter: (p: Position, v: T) => boolean = () => true) {
    for (let y = 0; y < this.board.length; y += 1) {
      for (let x = 0; x < this.board[y].length; x += 1) {
        const p: Position = [x, y];
        const v = this.board[y][x];
        if (filter(p, v)) {
          fn(p, v);
        }
      }
    }
  }

  map(fn: (p: Position, v: T) => T) {
    const newBoard: T[][] = [];
    for (let y = 0; y < this.board.length; y += 1) {
      newBoard.push(this.board[y].map((v, x) => fn([x, y], v)));
    }
    return new MatrixBoard(newBoard);
  }

  get dimension(): Position {
    return [this.board[0].length, this.board.length];
  }

  inRange(pos: Position) {
    const dim = this.dimension;
    return pos.every((p, ix) => p >= 0 && p < dim[ix]);
  }

  expand(dx: number, dy: number, empty: T) {
    const { board } = this;
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

  toSet(filter: (v: T, p: Position) => boolean) {
    const set = new Set<string>();
    this.forEach((p, v) => {
      if (filter(v, p)) {
        set.add(p.toString());
      }
    });
    return set;
  }
}
