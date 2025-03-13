export interface LichessMoves {
  moves: LichessStreamData[];
}

export interface LichessStreamData {
  id?: string;
  variant?: Variant;
  speed?: string;
  perf?: string;
  rated?: boolean;
  initialFen?: string;
  fen: string;
  player?: string;
  turns?: number;
  startedAtTurn?: number;
  source?: string;
  status?: Status;
  createdAt?: number;
  lastMove?: string;
  players?: Player[];
  wc?: number;
  bc?: number;
  lm?: string;
}

export interface Player {
  user: {
    title?: string;
    name: string;
    id: string;
  };
  color: string;
  rating: number;
}

export interface Players {
  white: White;
  black: Black;
}

export interface Black {
  user: BlackUser;
  rating: number;
}

export interface BlackUser {
  title?: string;
  name: string;
  id: string;
}

export interface White {
  user: WhiteUser;
  rating: number;
}

export interface WhiteUser {
  name: string;
  title: string;
  id: string;
}

export interface Status {
  id: number;
  name: string;
}

export interface Variant {
  key: string;
  name: string;
  short: string;
}
