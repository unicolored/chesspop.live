import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerComponent } from './player.component';

describe('PlayerComponent', () => {
  let component: PlayerComponent;
  let fixture: ComponentFixture<PlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('player', {
      color: 'white',
      title: 'GM',
      name: 'Test',
      rating: 2500,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the player title, name and rating', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('GM');
    expect(compiled.textContent).toContain('Test');
    expect(compiled.textContent).toContain('2500');
  });
});
