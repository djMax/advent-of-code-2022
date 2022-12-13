declare module 'lite-pathfindings' {
  export type WeightedEdge = Record<string, number>;
  export type EdgeMap = Record<string, WeightedEdge>;
  interface InitResult {}

  export const Djikstra: {
    init(edges: EdgeMap, start: string): InitResult;
    getPath(pred: InitResult, start: string, end: string): any;
  };
}
