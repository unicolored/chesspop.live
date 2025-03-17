import { computed, Injectable, signal } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { LichessTvFeed } from "../pages/page-live/feed.interface";

@Injectable({
  providedIn: "root",
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
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        this.reader = response.body!.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        const processStream = (res: ReadableStreamReadResult<Uint8Array>) => {
          if (!this.isStreaming) {
            this.reader?.cancel(); // Stop the stream if streaming is stopped
            return;
          }

          if (res.done) {
            console.log("Stream completed");
            dataSubject.complete();
            return;
          }

          // Decode and process the stream
          buffer += decoder.decode(res.value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          lines.forEach((line) => {
            if (line.trim()) {
              // Skip empty lines
              try {
                const json = JSON.parse(line);
                dataSubject.next(json); // Emit each parsed object
              } catch (e) {
                dataSubject.error(`JSON Parse Error: ${e}`);
              }
            }
          });

          // Continue reading
          this.reader?.read().then(processStream);
        };

        this.reader.read().then(processStream);
      })
      .catch((error) => dataSubject.error(error));

    return dataSubject.asObservable();
  }

  stopTv() {
    if (!this.isStreaming) return;
    this.isStreaming = false;
    if (this.reader) {
      this.reader.cancel(); // Terminate the reader to stop fetching
      console.log("Streaming stopped");
    }
  }
}
