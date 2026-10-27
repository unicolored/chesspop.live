import { TestBed } from '@angular/core/testing';

import { AudioService } from './audio.service';

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];

  close = jasmine.createSpy('close').and.resolveTo();

  constructor() {
    FakeAudioContext.instances.push(this);
  }
}

describe('AudioService', () => {
  let service: AudioService;
  let originalAudioContext: typeof AudioContext;

  beforeEach(() => {
    FakeAudioContext.instances = [];
    originalAudioContext = window.AudioContext;
    window.AudioContext = FakeAudioContext as unknown as typeof AudioContext;

    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioService);
  });

  afterEach(() => {
    window.AudioContext = originalAudioContext;
  });

  it('creates one audio context and reuses it while sounds stay enabled', () => {
    service.initSounds(true);
    service.initSounds(true);

    expect(FakeAudioContext.instances.length).toBe(1);
  });

  it('closes the audio context when sounds are disabled', () => {
    service.initSounds(true);
    service.initSounds(false);

    expect(FakeAudioContext.instances[0].close).toHaveBeenCalled();
  });
});
