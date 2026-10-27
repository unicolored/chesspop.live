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

function openResponse(): Response {
  return new Response(new ReadableStream<Uint8Array>({ start() {} }));
}

function settle(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve));
}

describe('StreamService', () => {
  let service: StreamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreamService);
  });

  it('parses NDJSON events split across chunks', async () => {
    spyOn(globalThis, 'fetch').and.resolveTo(
      ndjsonResponse(['{"t":"fen","d":{"fen":"first"}}\n{"t":"fea', 'tured","d":{"fen":"second"}}\n']),
    );

    const events: LichessTvFeed[] = [];
    await new Promise<void>(resolve => {
      service.startTv('https://example.test/feed').subscribe({
        next: event => events.push(event),
        error: fail,
        complete: resolve,
      });
    });

    expect(events.length).toBe(2);
    expect(events[0].t).toBe('fen');
    expect(events[0].d.fen).toBe('first');
    expect(events[1].t).toBe('featured');
    expect(events[1].d.fen).toBe('second');
  });

  it('aborts only the request that was unsubscribed', () => {
    const signals = new Map<string, AbortSignal>();

    spyOn(globalThis, 'fetch').and.callFake((input, init) => {
      signals.set(String(input), init!.signal!);
      return Promise.resolve(openResponse());
    });

    const first = service.startTv('https://example.test/first').subscribe({ error: fail });
    const second = service.startTv('https://example.test/second').subscribe({ error: fail });

    first.unsubscribe();

    expect(signals.get('https://example.test/first')?.aborted).toBe(true);
    expect(signals.get('https://example.test/second')?.aborted).toBe(false);

    second.unsubscribe();
  });

  it('can start again once a stream has completed', async () => {
    const fetchSpy = spyOn(globalThis, 'fetch').and.callFake(() => Promise.resolve(ndjsonResponse([])));

    await new Promise<void>(resolve => {
      service.startTv('https://example.test/first').subscribe({ complete: resolve, error: fail });
    });
    await new Promise<void>(resolve => {
      service.startTv('https://example.test/second').subscribe({ complete: resolve, error: fail });
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('fails on invalid JSON lines', async () => {
    spyOn(globalThis, 'fetch').and.resolveTo(ndjsonResponse(['not-json\n']));

    const error = await new Promise<Error>(resolve => {
      service.startTv('https://example.test/feed').subscribe({
        next: () => fail('No event was expected'),
        error: resolve,
      });
    });

    expect(error).toEqual(jasmine.any(Error));
    expect(error.message).toContain('JSON Parse Error');
  });

  it('fails when the stream request is rejected', async () => {
    spyOn(globalThis, 'fetch').and.resolveTo(new Response(null, { status: 500 }));

    const error = await new Promise<Error>(resolve => {
      service.startTv('https://example.test/feed').subscribe({
        next: () => fail('No event was expected'),
        error: resolve,
      });
    });

    expect(error.message).toContain('500');
  });

  it('does not report an error when the subscription is aborted', async () => {
    spyOn(globalThis, 'fetch').and.resolveTo(openResponse());

    const error = jasmine.createSpy('error');
    const subscription = service.startTv('https://example.test/feed').subscribe({ error });

    subscription.unsubscribe();
    await settle();

    expect(error).not.toHaveBeenCalled();
  });
});
