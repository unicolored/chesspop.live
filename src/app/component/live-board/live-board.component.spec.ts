import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { type Chessfield } from 'chessfield';
import { Subject } from 'rxjs';

import { type LichessTvFeed } from '../../board/live.interface';
import { StreamService } from '../../service/stream.service';
import { type BothPlayers } from '../players/players.component';

import { LiveBoardComponent } from './live-board.component';

describe('LiveBoardComponent', () => {
  let fixture: ComponentFixture<LiveBoardComponent>;
  let component: LiveBoardComponent;
  let streamService: jasmine.SpyObj<StreamService>;
  let stream: Subject<LichessTvFeed>;

  function fakeChessfield(): jasmine.SpyObj<Chessfield> {
    return jasmine.createSpyObj<Chessfield>('Chessfield', ['configUpdate', 'setFen', 'setState']);
  }

  beforeEach(async () => {
    spyOn(console, 'log');
    stream = new Subject<LichessTvFeed>();
    streamService = jasmine.createSpyObj<StreamService>('StreamService', ['startTv', 'stopTv']);
    streamService.startTv.and.returnValue(stream.asObservable());

    await TestBed.configureTestingModule({
      imports: [LiveBoardComponent],
      providers: [{ provide: StreamService, useValue: streamService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LiveBoardComponent);
    component = fixture.componentInstance;

    // Keep the test away from WebGL: the board is covered by its own consumers.
    spyOn(component as unknown as { initChessfield: () => void }, 'initChessfield');

    fixture.componentRef.setInput('feed', 'Lichess-top');
    fixture.detectChanges();
  });

  it('starts the stream of the selected feed', () => {
    expect(streamService.startTv).toHaveBeenCalledWith('https://lichess.org/api/tv/feed');
  });

  it('stops the previous stream and starts the selected one', () => {
    fixture.componentRef.setInput('feed', 'Lichess-blitz');
    fixture.detectChanges();

    expect(streamService.stopTv).toHaveBeenCalled();
    expect(streamService.startTv).toHaveBeenCalledWith('https://lichess.org/api/tv/blitz/feed');
  });

  it('stops the stream when destroyed', () => {
    fixture.destroy();

    expect(streamService.stopTv).toHaveBeenCalled();
  });

  it('emits the featured players', () => {
    let received: BothPlayers | undefined;
    component.playersChange.subscribe(players => (received = players));
    const chessfield = fakeChessfield();
    component.chessfield = chessfield;

    stream.next({
      t: 'featured',
      d: {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        players: [
          { user: { id: 'white-id', name: 'Alice', title: 'GM' }, color: 'white', rating: 2800 },
          { user: { id: 'black-id', name: 'Bob' }, color: 'black', rating: 2700 },
        ],
      },
    });

    expect(received?.white).toEqual(
      jasmine.objectContaining({ id: 'white-id', name: 'Alice', rating: 2800 }),
    );
    expect(received?.black).toEqual(jasmine.objectContaining({ id: 'black-id', name: 'Bob', rating: 2700 }));
    expect(chessfield.configUpdate).toHaveBeenCalledWith({
      playerNames: { white: 'GM Alice', black: 'Bob' },
    });
  });

  it('applies a FEN to the board', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const chessfield = fakeChessfield();
    component.chessfield = chessfield;

    stream.next({ t: 'fen', d: { fen } });

    expect(chessfield.setFen).toHaveBeenCalledWith(fen, undefined);
    expect(chessfield.setState).not.toHaveBeenCalled();
  });

  it('reports a checkmate winner', () => {
    const chessfield = fakeChessfield();
    component.chessfield = chessfield;

    stream.next({ t: 'fen', d: { fen: '7k/6Q1/6K1/8/8/8/8/8 b - - 0 1' } });

    expect(chessfield.setState).toHaveBeenCalledWith(jasmine.objectContaining({ winner: 'w' }));
  });

  it('reports a timeout winner', () => {
    const chessfield = fakeChessfield();
    component.chessfield = chessfield;

    stream.next({ t: 'fen', d: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', wc: 0 } });

    expect(chessfield.setState).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 'timeout', winner: 'b' }),
    );
  });
});
