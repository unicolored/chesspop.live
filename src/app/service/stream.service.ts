import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { type LichessTvFeed } from '../board/live.interface';

@Injectable({
  providedIn: 'root',
})
export class StreamService {
  /**
   * Opens a Lichess TV feed. Every subscription owns its request, so
   * unsubscribing aborts that request without touching any other stream.
   */
  startTv(streamUrl: string): Observable<LichessTvFeed> {
    return new Observable<LichessTvFeed>(subscriber => {
      const controller = new AbortController();

      const readStream = async (): Promise<void> => {
        const response = await fetch(streamUrl, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Stream request failed: ${response.status}`);
        }
        if (!response.body) {
          throw new Error('Stream request returned no body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        try {
          while (!subscriber.closed) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.trim()) {
                subscriber.next(parseEvent(line));
              }
            }
          }

          subscriber.complete();
        } finally {
          reader.cancel().catch(() => undefined);
        }
      };

      readStream().catch(error => {
        // An abort is a deliberate teardown, not a stream failure.
        if (!controller.signal.aborted) {
          subscriber.error(error);
        }
      });

      return () => controller.abort();
    });
  }
}

function parseEvent(line: string): LichessTvFeed {
  try {
    return JSON.parse(line) as LichessTvFeed;
  } catch (e) {
    throw new Error(`JSON Parse Error: ${e}`);
  }
}
