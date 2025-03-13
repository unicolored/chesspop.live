import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StreamService } from '../../stream.service';
import { LichessTvFeed } from './feed.interface';
import { Chessfield } from 'chessfield';

@Component({
  standalone: true,
  imports: [FormsModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="flex w-full text-center">
      <div class="chessfield-wrap" #chessfield></div>
    </div>
  `,
  styleUrls: ['../pages.common.scss', './home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  title = 'chessfield-tv';

  streamService = inject(StreamService);

  items: LichessTvFeed[] = [];

  chessfieldElement = viewChild<ElementRef>('chessfield');

  ngAfterViewInit(): void {
    const element: HTMLCanvasElement = this.chessfieldElement()?.nativeElement;

    if (typeof document !== 'undefined') {
      const chessfield = new Chessfield(element, {
        orientation: 'white',
        fen: 'r2q2k1/1p6/p2p4/2pN1rp1/N1Pb2Q1/8/PP1B4/R6K b - - 2 25',
        camera: 'top',
      });
    }
  }
}
