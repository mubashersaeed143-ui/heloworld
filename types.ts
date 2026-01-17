
export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export enum RunStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export type Lane = -1 | 0 | 1; // Left, Center, Right

export type EntityType = 'OBSTACLE_LOW' | 'OBSTACLE_HIGH' | 'COIN';

export interface Entity {
  id: string;
  lane: Lane;
  z: number; // Position on the track (0 to 100)
  type: EntityType;
  model: 'CAR' | 'CONE' | 'BARRIER' | 'COIN';
}

export interface GameState {
  status: GameStatus;
  score: number;
  lane: Lane;
  jumpY: number; // Vertical offset for jumping
  speed: number;
  entities: Entity[];
  phase: number;
  currentWorld: string;
  narrative: string;
  bgUrl: string;
}

export interface RunData {
  distance: number;
  elapsedTime: number;
  pace: number;
  calories: number;
}

export interface Encounter {
  id: string;
  timestamp: number;
  distanceMarker: number;
  narrative: string;
  choice?: {
    text: string;
  };
}
