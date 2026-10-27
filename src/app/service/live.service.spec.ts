import { TestBed } from '@angular/core/testing';

import { type LiveFeed } from '../board/live.interface';

import { LiveService } from './live.service';

describe('LiveService', () => {
  let service: LiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveService);
  });

  it('exposes the Lichess TV channels', () => {
    expect(service.defaultFeed.feed).toBe('Lichess-bullet');
    expect(service.liveList.map(feed => feed.type)).toEqual(['bullet', 'blitz', 'rapid']);
  });

  it('returns the requested feed', () => {
    expect(service.getLiveFeedItem('Lichess-blitz').url).toBe('https://lichess.org/api/tv/blitz/feed');
  });

  it('falls back to the default feed for unknown channels', () => {
    expect(service.getLiveFeedItem('nope' as LiveFeed)).toBe(service.defaultFeed);
  });
});
