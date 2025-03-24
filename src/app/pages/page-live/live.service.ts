import { Injectable } from "@angular/core";
import { LiveFeed, LiveFeedItem } from "./feed.interface";

@Injectable({
  providedIn: "root",
})
export class LiveService {
  defaultFeed: LiveFeedItem = {
    feed: "Lichess-top",
    type: "top",
    url: "https://lichess.org/api/tv/feed",
    platform: "Lichess",
  };
  readonly liveList: LiveFeedItem[] = [];

  constructor() {
    this.liveList.push(this.defaultFeed);
    this.liveList.push({
      feed: "Lichess-blitz",
      type: "blitz",
      url: "https://lichess.org/api/tv/blitz/feed",
      platform: "Lichess",
    });
    this.liveList.push({
      feed: "Lichess-bullet",
      type: "bullet",
      url: "https://lichess.org/api/tv/bullet/feed",
      platform: "Lichess",
    });
    this.liveList.push({
      feed: "Lichess-rapid",
      type: "rapid",
      url: "https://lichess.org/api/tv/rapid/feed",
      platform: "Lichess",
    });
  }

  getLiveFeedItem(selectedFeed: LiveFeed): LiveFeedItem {
    return (
      this.liveList.find((l) => `${l.feed}` === selectedFeed) ??
      this.defaultFeed
    );
  }
}
