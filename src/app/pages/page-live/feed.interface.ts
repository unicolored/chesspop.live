import { LichessStreamData } from "../../board/lichess.interface";

export type LivePlatform = "Lichess" | string;
export type LiveType = "top" | "rapid" | "blitz" | "bullet" | string;
export type LiveFeed = `${LivePlatform}-${LiveType}`;

export interface LiveFeedItem {
  feed: LiveFeed;
  type: LiveType;
  url: string;
  platform: LivePlatform;
}

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
