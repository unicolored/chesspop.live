export interface LichessTvFeed {
  t: 'fen' | 'featured';
  d: {
    fen: string;
    lm: string;
    wc: number;
    bc: number;
  };
}
