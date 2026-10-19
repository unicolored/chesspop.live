import { computed, Injectable, signal } from '@angular/core';
import { type Observable, of, Subject } from 'rxjs';

import { type LichessTvFeed } from '../pages/page-live/feed.interface';

@Injectable({
  providedIn: 'root',
})
export class StreamService {
  reader: ReadableStreamDefaultReader<Uint8Array> | null = null; // Store the reader globally to control it

  isLoadingSignal = signal<boolean>(false);
  isLoading = computed<boolean>(() => this.isLoadingSignal());

  isStreaming = false; // Flag to track streaming status

  startTv(streamUrl: string): Observable<LichessTvFeed | null> {
    if (this.isStreaming) {
      return of(null);
    }

    this.isStreaming = true;

    const dataSubject = new Subject<any>();

    fetch(streamUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        this.reader = response.body!.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        const processStream = (
          res: ReadableStreamReadResult<Uint8Array>,
        ): Promise<ReadableStreamReadResult<Uint8Array> | void> => {
          if (!this.isStreaming) {
            this.reader?.cancel();
            return Promise.resolve();
          }

          if (res.done) {
            console.log('Stream completed');
            dataSubject.complete();
            return Promise.resolve();
          }

          // Decode and process the stream
          buffer += decoder.decode(res.value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          lines.forEach(line => {
            if (line.trim()) {
              try {
                const json = JSON.parse(line);
                dataSubject.next(json);
              } catch (e) {
                dataSubject.error(`JSON Parse Error: ${e}`);
              }
            }
          });

          // Continue reading
          return this.reader!.read().then(processStream);
        };

        return this.reader.read().then(processStream);
      })
      .catch(error => dataSubject.error(error));

    return dataSubject.asObservable();
  }

  stopTv() {
    if (!this.isStreaming) return;
    this.isStreaming = false;
    if (this.reader) {
      this.reader.cancel(); // Terminate the reader to stop fetching
      console.log('Streaming stopped');
    }
  }
}
