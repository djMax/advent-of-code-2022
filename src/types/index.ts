export type Resource = 'ore' | 'clay' | 'obsidian' | 'geode';

export interface Blueprint {
  index: number;
  costs: Record<Resource, Record<Resource, number>>;
}

export type Cardinal = 'N' | 'S' | 'E' | 'W';

export type CardinalCombo = Cardinal | 'NE' | 'NW' | 'SE' | 'SW';
