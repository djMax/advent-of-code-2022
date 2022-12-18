# advent-of-code-2022

[![Build and run tests](https://github.com/djMax/advent-of-code-2022/actions/workflows/pull_requests.yml/badge.svg)](https://github.com/djMax/advent-of-code-2022/actions/workflows/pull_requests.yml)

Solutions for the Advent of Code 2022 written in Typescript with an attempt
to lean heavily on embracing a "Github Copilot focused" style of building.

To run all the puzzles:

```
yarn install
yarn test
```

All the code for the puzzles is in `__tests__`, `src` just has common functions. My general
process is to write the code and run it on the sample data until I get the same answer, and then run it on the real thing.

# Random notes
* Day 11 finally introduces math.
* Day 12 trying to explain the simplification of the graph in part 2 to my kids was a fun one.
* Day 13 had a cute trick that running a lexical sort yielded the correct sample answer, but of course not the correct real answer. I had just done `list.sort()` instead of `list.sort(myComparator)` and that took 20 minutes to figure out. Fun! THAT would be something cool for Github Copilot to underline with a red squiggle or something.