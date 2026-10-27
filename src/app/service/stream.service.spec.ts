import { TestBed } from '@angular/core/testing';

import { type LichessTvFeed } from '../board/live.interface';

import { StreamService } from './stream.service';

function ndjsonResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });

  return new Response(stream);
}

describe('StreamService', () => {
  let service: StreamService;

  beforeEach(() => {
    spyOn(console, 'log');
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreamService);
  });

  afterEach(() => {
    service.stopTv();
  });

  it('parses NDJSON events split across chunks', done => {
    spyOn(globalThis, 'fetch').and.resolveTo(
      ndjsonResponse(['{"t":"fen","d":{"fen":"first"}}\n{"t":"fea', 'tured","d":{"fen":"second"}}\n']),
    );

    const events: LichessTvFeed[] = [];

    service.startTv('https://example.test/feed').subscribe({
      next: event => events.push(event),
      error: done.fail,
      complete: () => {
        expect(events.length).toBe(2);
        expect(events[0].t).toBe('fen');
        expect(events[0].d.fen).toBe('first');
        expect(events[1].t).toBe('featured');
        expect(events[1].d.fen).toBe('second');
        expect(service.isStreaming).toBe(false);
        done();
      },
    });
  });

  it('can start again once a stream has completed', done => {
    const fetchSpy = spyOn(globalThis, 'fetch').and.callFake(() => Promise.resolve(ndjsonResponse([])));

    service.startTv('https://example.test/first').subscribe({
      complete: () => {
        service.startTv('https://example.test/second').subscribe({
          complete: () => {
            expect(fetchSpy).toHaveBeenCalledTimes(2);
            done();
          },
          error: done.fail,
        });
      },
      error: done.fail,
    });
  });

  it('fails on invalid JSON lines', done => {
    spyOn(globalThis, 'fetch').and.resolveTo(ndjsonResponse(['not-json\n']));

    service.startTv('https://example.test/feed').subscribe({
      next: () => done.fail('No event was expected'),
      error: error => {
        expect(error).toEqual(jasmine.any(Error));
        expect(error.message).toContain('JSON Parse Error');
        expect(service.isStreaming).toBe(false);
        done();
      },
    });
  });

  it('fails when the stream request is rejected', done => {
    spyOn(globalThis, 'fetch').and.resolveTo(new Response(null, { status: 500 }));

    service.startTv('https://example.test/feed').subscribe({
      next: () => done.fail('No event was expected'),
      error: error => {
        expect(error.message).toContain('500');
        expect(service.isStreaming).toBe(false);
        done();
      },
    });
  });

  it('ignores a response that arrives after the stream was stopped', async () => {
    let respond!: (response: Response) => void;
    spyOn(globalThis, 'fetch').and.returnValue(new Promise<Response>(resolve => (respond = resolve)));

    service.startTv('https://example.test/feed');
    service.stopTv();
    respond(new Response(new ReadableStream<Uint8Array>()));

    await new Promise(resolve => setTimeout(resolve));

    expect(service.reader).toBeNull();
    expect(service.isStreaming).toBe(false);
  });

  it('does not start a second stream while one is running', () => {
    spyOn(globalThis, 'fetch').and.returnValue(new Promise<Response>(() => {}));

    service.startTv('https://example.test/first');
    let completed = false;

    service.startTv('https://example.test/second').subscribe({
      complete: () => (completed = true),
    });

    expect(service.isStreaming).toBe(true);
    expect(completed).toBe(true);

    service.stopTv();
    expect(service.isStreaming).toBe(false);
  });
});
