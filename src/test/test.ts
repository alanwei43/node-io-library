// /Users/alan/workspace/temporary/Music
import { hashFile, hashFiles } from "../library";

const hub = hashFiles("/Users/alan/workspace/temporary/Music", {
  recursive: {
    filter: item => item.path.indexOf("AlbumArt") === -1,
    recursive: true
  },
  hash: {
    chunkSize: 1024 * 1024
  }
});
hub.on("log", data => {
  console.log(data.status, data.file.path);
})
hub.on("data", data => {
  console.log(data.hash, data.file.path);
});