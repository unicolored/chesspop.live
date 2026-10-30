import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { type Chessfield } from 'chessfield';
import { Observable, Subject } from 'rxjs';

import { type LichessTvFeed } from '../../board/live.interface';
import { StreamService } from '../../service/stream.service';

import { LiveBoardComponent } from './live-board.component';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('LiveBoardComponent', () => {
  let fixture: ComponentFixture<LiveBoardComponent>;
  let component: LiveBoardComponent;
  let streamService: jasmine.SpyObj<StreamService>;
  let stream: Subject<LichessTvFeed>;

  function fakeChessfield(): jasmine.SpyObj<Chessfield> {
    return jasmine.createSpyObj<Chessfield>('Chessfield', ['configUpdate', 'setFen', 'setState']);
  }

  function settle(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve));
  }

  function featured(fen: string): LichessTvFeed {
    return {
      t: 'featured',
      d: {
        fen,
        players: [
          { user: { id: 'white-id', name: 'Alice', title: 'GM' }, color: 'white', rating: 2800 },
          { user: { id: 'black-id', name: 'Bob' }, color: 'black', rating: 2700 },
        ],
      },
    };
  }

  beforeEach(async () => {
    spyOn(console, 'error');
    stream = new Subject<LichessTvFeed>();
    streamService = jasmine.createSpyObj<StreamService>('StreamService', ['startTv']);
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

  it('reports the connection while the stream is opening', () => {
    expect(component.status()).toBe('connecting');
    expect(fixture.nativeElement.querySelector('.cf-status').textContent).toContain(
      'Connecting to Lichess · bullet',
    );
  });

  it('starts the selected feed when the channel changes', () => {
    fixture.componentRef.setInput('feed', 'Lichess-blitz');
    fixture.detectChanges();

    expect(streamService.startTv).toHaveBeenCalledWith('https://lichess.org/api/tv/blitz/feed');
    expect(component.status()).toBe('connecting');
  });

  it('stops the stream when destroyed', () => {
    const teardown = jasmine.createSpy('teardown');
    streamService.startTv.and.returnValue(new Observable<LichessTvFeed>(() => teardown));

    fixture.componentRef.setInput('feed', 'Lichess-blitz');
    fixture.detectChanges();
    fixture.destroy();

    expect(teardown).toHaveBeenCalled();
  });

  it('shows the featured position and player names right away', async () => {
    const chessfield = fakeChessfield();
    component.chessfield = chessfield;
    const playSound = spyOn(component.audioService, 'playSound');

    stream.next(featured(START_FEN));
    await settle();
    fixture.detectChanges();

    expect(chessfield.setFen).toHaveBeenCalledWith(START_FEN);
    expect(chessfield.setState).toHaveBeenCalledWith({});
    expect(chessfield.configUpdate).toHaveBeenCalledWith({
      playerNames: { white: 'GM Alice', black: 'Bob' },
    });
    expect(playSound).not.toHaveBeenCalled();
    expect(component.status()).toBe('live');
    expect(fixture.nativeElement.querySelector('.cf-status')).toBeNull();

    const rows = Array.from(fixture.nativeElement.querySelectorAll('.cf-player')) as HTMLElement[];
    expect(rows.length).toBe(2);
    expect(rows[0].classList).toContain('is-white');
    expect(rows[0].textContent).toContain('GM');
    expect(rows[0].textContent).toContain('Alice');
    expect(rows[0].textContent).toContain('2800');
    expect(rows[1].classList).toContain('is-black');
    expect(rows[1].textContent).toContain('Bob');
    expect(rows[1].textContent).toContain('2700');
  });

  it('drops the player names when the channel changes', async () => {
    component.chessfield = fakeChessfield();

    stream.next(featured(START_FEN));
    await settle();
    fixture.detectChanges();

    fixture.componentRef.setInput('feed', 'Lichess-blitz');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.cf-players')).toBeNull();
    expect(component.orderedPlayers()).toEqual([]);
  });

  it('switches the camera when a player is clicked', async () => {
    component.chessfield = fakeChessfield();
    const switchCamera = spyOn(component.chessfieldService, 'switchCamera');

    stream.next(featured(START_FEN));
    await settle();
    fixture.detectChanges();

    const rows = Array.from(fixture.nativeElement.querySelectorAll('.cf-player')) as HTMLButtonElement[];
    rows[1].click();

    expect(switchCamera).toHaveBeenCalledWith('black');
  });

  it('applies a FEN to the board', () => {
    const chessfield = fakeChessfield();
    component.chessfield = chessfield;
    const playSound = spyOn(component.audioService, 'playSound');

    stream.next({ t: 'fen', d: { fen: START_FEN } });

    expect(chessfield.setFen).toHaveBeenCalledWith(START_FEN, undefined, undefined);
    expect(chessfield.setState).not.toHaveBeenCalled();
    expect(playSound).toHaveBeenCalled();
    expect(component.status()).toBe('live');
  });

  it('sends the remaining clocks with the position', () => {
    const chessfield = fakeChessfield();
    component.chessfield = chessfield;

    stream.next({ t: 'fen', d: { fen: START_FEN, lm: 'e2e4', wc: 42, bc: 7 } });

    expect(chessfield.setFen).toHaveBeenCalledWith(START_FEN, ['e2', 'e4'], { white: 42, black: 7 });
  });

  it('drops a one-sided clock', () => {
    const chessfield = fakeChessfield();
    component.chessfield = chessfield;

    stream.next({ t: 'fen', d: { fen: START_FEN, wc: 42 } });

    expect(chessfield.setFen).toHaveBeenCalledWith(START_FEN, undefined, undefined);
  });

  it('offers a retry when the stream fails', () => {
    stream.error(new Error('boom'));
    fixture.detectChanges();

    expect(component.status()).toBe('error');

    const retryStream = new Subject<LichessTvFeed>();
    streamService.startTv.and.returnValue(retryStream.asObservable());
    (fixture.nativeElement.querySelector('.cf-retry') as HTMLButtonElement).click();

    expect(streamService.startTv).toHaveBeenCalledTimes(2);
    expect(component.status()).toBe('connecting');
  });

  it('offers a retry when the feed closes', () => {
    stream.complete();

    expect(component.status()).toBe('error');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.cf-retry')).not.toBeNull();
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

    stream.next({ t: 'fen', d: { fen: START_FEN, wc: 0 } });

    expect(chessfield.setState).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 'timeout', winner: 'b' }),
    );
  });
});
