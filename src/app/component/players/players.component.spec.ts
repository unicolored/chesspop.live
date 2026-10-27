import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersComponent } from './players.component';

describe('PlayersComponent', () => {
  let fixture: ComponentFixture<PlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayersComponent);
    fixture.componentRef.setInput('players', {
      white: { id: 'white-id', name: 'Alice', rating: 2800, color: 'white' },
      black: { id: 'black-id', name: 'Bob', rating: 2700, color: 'black' },
    });
    fixture.detectChanges();
  });

  it('renders both players', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const players = compiled.querySelectorAll('app-player');

    expect(players.length).toBe(2);
    expect(players[0].textContent).toContain('Alice');
    expect(players[0].textContent).toContain('2800');
    expect(players[1].textContent).toContain('Bob');
    expect(players[1].textContent).toContain('2700');
  });

  it('emits the camera color when a player is clicked', () => {
    const emitted: (string | undefined)[] = [];
    const players = fixture.nativeElement.querySelectorAll('app-player') as NodeListOf<HTMLElement>;

    fixture.componentInstance.emitCameraCol.subscribe(color => emitted.push(color));

    players[0].click();
    players[1].click();

    expect(emitted).toEqual(['white', 'black']);
  });
});
