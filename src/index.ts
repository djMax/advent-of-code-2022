import fs from 'fs';
import path from 'path';
import console from 'console';

export function getFile(fullpath: string) {
  return fs.readFileSync(fullpath, 'utf8');
}

export function getLines(filename: string) {
  return getFile(path.resolve('data', filename)).split('\n');
}

export function readGrid<T>(lines: string[], element: (c: string) => T) {
  return lines.map((line) => line.split('').map(element));
}

export function log(...args: any[]) {
  console.log(...args);
}

export function loop(fn: () => void, n: number, interval = 0) {
  for (let i = 0; i < n; i += 1) {
    if (interval && i % interval === 0) {
      log(`Completed ${i} iterations`);
    }
    fn();
  }
}

export function printGrid<T>(grid: T[][], elementWidth = 1) {
  console.log(`
${grid.map((line) => line.map((s) => String(s).padEnd(elementWidth)).join('')).join('\n')}
`);
}

export function findInGrid<T>(grid: T[][], element: T): [number, number] | undefined {
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[y].length; x += 1) {
      if (grid[y][x] === element) {
        return [x, y];
      }
    }
  }
  return undefined;
}

export function printPositions(positions: number[][]) {
  const minX = Math.min(...positions.map((p) => p[0]));
  const minY = Math.min(...positions.map((p) => p[1]));
  const maxX = Math.max(...positions.map((p) => p[0]));
  const maxY = Math.max(...positions.map((p) => p[1]));

  for (let y = minY; y <= maxY; y += 1) {
    const line = [];
    for (let x = minX; x <= maxX; x += 1) {
      const first = positions.findIndex((p) => p[0] === x && p[1] === y);
      if (first >= 0) {
        line.push(first === 0 ? 'H' : first);
      } else {
        line.push('.');
      }
    }
    log(line.join(''));
  }
}
