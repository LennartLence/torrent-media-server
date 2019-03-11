import webTorrent from "webtorrent";
import downloadsFolder from "downloads-folder";
import torrentNameParser from "torrent-name-parser";
import path from "path";
import fs from "fs";
import rimraf from "rimraf";

class TorrentServer {
  constructor() {
    this.torrents = new Map();
    this.aduioFormats = /.flac|.mp3|.wav/;
    this.videoFormats = /.mp4|.avi|.m4v|.mkv/;
    this.defStorePath = downloadsFolder() + "/Project Lens Downloads";
  }

  /**
   * @param {Object} opts
   */
  
  newTorrent(torrentId, opts = {}) {
    return new Promise((resolve, reject) => {
      try {
        opts.storePath =
          typeof storePath === "string" ? opts.storePath : this.defStorePath;
        opts.metadataTimeout =
          typeof storePath === "number" ? opts.metadataTimeout : 10000;

        const torrent = new webTorrent();

        torrent.add(torrentId, { path: opts.storePath });

        const tSession = torrent.get(torrentId);
        const tSessionPort = Math.floor(1000 + Math.random() * 9000);

        torrent.on("error", err => {
          throw new Error(err);
        });
        tSession.on("error", err => {
          throw new Error(err);
        });

        setTimeout(() => {
          if (tSession.metadata == null) {
            throw new Error("Metadata timeout!");
          }
        }, opts.metadataTimeout);

        this.torrents.set(torrentId, {
          torrent,
          files: [],
          onMetadata: () => {
            console.log("metadata");
          },
          onVerifying: () => {
            console.log("verifying");
          },
          onReady: (tSessionPort) => {
            console.log(`ready on ${tSessionPort}`);
          }
        });

        const torrentItem = this.torrents.get(torrentId);

        tSession.on("metadata", () => {
          tSession.deselect(0, tSession.pieces.length - 1, false);

          let torrentFiles = tSession.files.map((item, index) => {
            const parsedInfo = torrentNameParser(item.name);

            if (this.aduioFormats.test(item.path)) {
              parsedInfo.title = item.name.replace(this.aduioFormats, "");
            } else {
              const toTitleCase = str => {
                return str.replace(/\w\S*/g, function(txt) {
                  return (
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  );
                });
              };

              parsedInfo.title = toTitleCase(
                parsedInfo.title.replace(/[^a-zA-Zа-яА-Я1-9* ]/g, "")
              );
            }

            if (parsedInfo.title.length < 2) {
              parsedInfo.title = "Unknown";
            }

            return {
              torrentId: torrentId,
              sessionPort: tSessionPort,
              fileIndex: index,
              filePath: item.path,
              parsedInfo: parsedInfo
            };
          });

          torrentFiles = torrentFiles.filter(item => {
            return this.aduioFormats.test(item.filePath) ||
              this.videoFormats.test(item.filePath)
              ? true
              : false;
          });

          torrentItem.files = torrentFiles;

          torrentItem.onMetadata();

          if (
            tSession.files.find(file => {
              return fs.existsSync(
                opts.storePath + "/" + file.path.replace(/\\/g, "/")
              );
            }) !== undefined
          ) {
            torrentItem.onVerifying();
          }
        });

        tSession.on("ready", () => {
          tSession.createServer().listen(tSessionPort);

          torrentItem.onReady(tSessionPort);

          resolve();
        });
      } catch (error) {
        reject(error);

        this.removeTorrent(torrentId);
      }
    });
  }

  removeTorrent(magnet) {
    return new Promise((resolve, reject) => {
      try {
        const torrent = this.torrents.get(magnet).torrent;

        rimraf(
          path.join(torrent.torrents[0].path, torrent.torrents[0].name),
          () => {}
        );

        torrent.destroy();

        this.torrents.delete(magnet);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new TorrentServer();
