import { Component } from "@angular/core";
import * as cg from "chessground/types";

@Component({
  selector: "app-widget",
  imports: [],
  templateUrl: "./widget.component.html",
  styleUrl: "./widget.component.css",
})
export class WidgetComponent {
  someFens: { fen: cg.FEN; lastMove: cg.Key[] }[] = [
    {
      fen: "8/8/4kpp1/3p4/p6P/2B4b/6P1/6K1 w - - 1 48",
      lastMove: ["f5", "h3"],
    },
    {
      fen: "2rq2kb/pbQr3p/2n1R1pB/1pp2pN1/3p4/P1PP2P1/1P3PBP/4R1K1 b - - 1 1",
      lastMove: ["f4", "c7"],
    },
    {
      fen: "5rk1/pp4pp/4p3/2R3Q1/3n4/6qr/P1P2PPP/5RK1 w - - 2 24",
      lastMove: ["c3", "g3"],
    },
    {
      fen: "r4k1r/1b2bPR1/p4n1B/3p4/4P2P/1q5B/PpP5/1K4R1 b - - 1 26",
      lastMove: ["e3", "h6"],
    },
    {
      fen: "8/6kp/6p1/4p3/p3rPRP/3K2P1/8/8 w - - 2 44",
      lastMove: ["f6", "g7"],
    },
  ];
}
