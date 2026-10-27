import { Injectable } from '@angular/core';
import { EMPTY, type Observable, Subject } from 'rxjs';

import { type LichessTvFeed } from '../board/live.interface';

@Injectable({
  providedIn: 'root',
})
export class StreamService {
  reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  isStreaming = false;

  startTv(streamUrl: string): Observable<LichessTvFeed> {
    if (this.isStreaming) {
      return EMPTY;
    }

    this.isStreaming = true;

    const dataSubject = new Subject<LichessTvFeed>();

    fetch(streamUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Stream request failed: ${response.status}`);
        }
        if (!this.isStreaming) {
          return response.body?.cancel();
        }
        this.reader = response.body!.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        const processStream = (
          res: ReadableStreamReadResult<Uint8Array>,
        ): Promise<ReadableStreamReadResult<Uint8Array> | void> => {
          if (!this.isStreaming) {
            return Promise.resolve();
          }

          if (res.done) {
            this.finishStream();
            dataSubject.complete();
            return Promise.resolve();
          }

          buffer += decoder.decode(res.value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) {
              continue;
            }
            let event: LichessTvFeed;
            try {
              event = JSON.parse(line) as LichessTvFeed;
            } catch (e) {
              this.finishStream();
              dataSubject.error(new Error(`JSON Parse Error: ${e}`));
              return Promise.resolve();
            }
            dataSubject.next(event);
          }

          return this.reader!.read().then(processStream);
        };

        return this.reader.read().then(processStream);
      })
      .catch(error => {
        this.finishStream();
        dataSubject.error(error);
      });

    return dataSubject.asObservable();
  }

  stopTv() {
    this.finishStream();
  }

  private finishStream(): void {
    if (!this.isStreaming && !this.reader) {
      return;
    }
    this.isStreaming = false;
    const reader = this.reader;
    this.reader = null;
    reader?.cancel();
  }
}
