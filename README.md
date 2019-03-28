## Torrent-Webserver

Minimal wrapper of webtorrent client for media files.

### Installation

```shell
npm i torrent-webserver
```

### Usage

```js
import torrentServer from "torrent-webserver";

torrentServer
  .newTorrent(magnetURI)
  .then(torrent => {
    torrent.onMetadata = () => {
      console.log("Received Metadata", torrent.files);
    };
    torrent.onVerifying = () => {
      console.log("Verifying files...");
    };
    torrent.onReady = sessionPort => {
      console.log(`Torrent ready! Navigate to http://localhost:${sessionPort}`);
    };
  })
  .catch(err => {
    console.log(err);
  });
```
