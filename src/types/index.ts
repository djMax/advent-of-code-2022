export type Resource = 'ore' | 'clay' | 'obsidian' | 'geode';

export interface Blueprint {
  index: number;
  costs: Record<Resource, Record<Resource, number>>;
}
