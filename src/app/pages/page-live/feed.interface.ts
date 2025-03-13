import { LichessStreamData } from "../../board/lichess.interface";

export interface LichessTvFeed {
  t: "fen" | "featured";
  d: LichessStreamData;
}

export interface PlayerUI {
  id: string;
  title?: string;
  name: string;
  rating: number;
  color: string;
}
