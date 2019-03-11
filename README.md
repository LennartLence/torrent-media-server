## Torrent-Webserver

Enhanced wrapper of webtorrent client.

### Installation

```shell
npm i torrent-webserver
```

### Usage

```js
import torrentServer from "torrent-webserver";

torrentServer
  .newTorrent(magnetURI)
  .then(torrnet => {
    console.log(torrent);
    
    torrent.onMetadata = () => {
      console.log("Received Metadata");
    };
    torrent.onVerifying = () => {
      console.log("Verifying files...");
    };
    torrent.onReady = () => {
      console.log("Torrnet Ready");
    };
  })
  .catch(err => {
    console.log(err);
  });
```
