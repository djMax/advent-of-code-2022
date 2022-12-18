import { getLines } from '../src';

interface VmFile {
  name: string;
  size: number;
}

interface VmDirectory {
  name: string;
  totalSize: number;
  files: VmFile[];
  parent?: VmDirectory;
  directories: Record<string, VmDirectory>;
}

const sample = `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`;

function mkdirp(parent: VmDirectory, name: string): VmDirectory {
  parent.directories[name] = parent.directories[name] || {
    name,
    directories: {},
    files: [],
    totalSize: 0,
    parent,
  };
  return parent.directories[name];
}

function addSize(dir: VmDirectory, size: number) {
  dir.totalSize += size;
  if (dir.parent) {
    addSize(dir.parent, size);
  }
}

function vm(lines: string[]) {
  const root: VmDirectory = { name: '', directories: {}, files: [], totalSize: 0 };
  let cwd: VmDirectory = root;
  lines.forEach((line) => {
    if (line.startsWith('$')) {
      const cd = line.match(/cd (.*)/);
      if (cd) {
        if (cd[1] === '/') {
          cwd = root;
        } else if (cd[1] === '..') {
          if (!cwd.parent) {
            throw new Error('Cannot cd .. from root');
          }
          cwd = cwd.parent;
        } else {
          cwd = mkdirp(cwd, cd[1]);
        }
      }
      return;
    }
    const [dirOrSz, name] = line.split(' ');
    if (dirOrSz === 'dir') {
      mkdirp(cwd, line.substring(4).trim());
    } else {
      const size = parseInt(dirOrSz, 10);
      cwd.files.push({ name, size });
      addSize(cwd, size);
    }
  });
  return root;
}

function collect(dir: VmDirectory, predicate: (dir: VmDirectory) => boolean): VmDirectory[] {
  const result: VmDirectory[] = [];
  if (predicate(dir)) {
    result.push(dir);
  }
  Object.values(dir.directories).forEach((d) => {
    result.push(...collect(d, predicate));
  });
  return result;
}

function part1Result(root: VmDirectory) {
  const dirs = collect(root, (d) => d.totalSize < 100000);
  const sum = dirs.reduce((acc, d) => acc + d.totalSize, 0);
  return { dirs, sum };
}

function flatten(root: VmDirectory) {
  const rz = [root];
  Object.values(root.directories).forEach((d) => rz.push(...flatten(d)));
  return rz;
}

function part2Result(root: VmDirectory) {
  const flat = flatten(root).sort((a, b) => a.totalSize - b.totalSize);
  const free = 70000000 - root.totalSize;
  const needed = 30000000 - free;
  return flat.find((f) => f.totalSize >= needed)?.totalSize;
}

describe('day 7', () => {
  test('sample data', () => {
    const fs = vm(sample.split('\n'));
    const { dirs, sum } = part1Result(fs);
    expect(dirs.length).toEqual(2);
    expect(sum).toEqual(95437);
    const p2 = part2Result(fs);
    expect(p2).toEqual(24933642);
  });

  const lines = getLines('day7.txt');
  const fs = vm(lines);
  test.todo(`Part 1 Result: ${part1Result(fs).sum}`);
  test.todo(`Part 2 Result: ${part2Result(fs)}`);
});
