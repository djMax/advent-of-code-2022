import fs from 'fs';
import path from 'path';

export function getFile(fullpath: string) {
  return fs.readFileSync(fullpath, 'utf8');
}

export function getLines(filename: string) {
  return getFile(path.resolve('data', filename)).split('\n');
}
