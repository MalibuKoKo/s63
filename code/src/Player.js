import { play, sine } from "./sound.js";

class Player {
  constructor() {
    this.playing = null;
    this.sine = this.sine.bind(this);
  }

  stop() {
    console.log("Player", "stop");
    if (this.playing) {
      this.playing.removeListener("close", this.sine);
      this.playing.kill(); // Utilisation de kill() au lieu de end()
      this.playing = null;
    }
  }

  sine() {
    console.log("Player", "sine");
    this.stop();
    this.playing = sine();
  }

  play(stream, options = { sine: true }) {
    this.stop();
    const process = play(stream); // Renvoie un processus spawn

    this.playing = process;

    return new Promise((resolve, reject) => {
      process.on("close", () => { // Remplace "finish" par "close"
        resolve();
        if (options.cb) {
          options.cb();
        }
        if (options.sine) {
          this.sine();
        }
      });

      process.on("error", (err) => {
        console.error("Player error:", err);
        reject(err);
      });
    });
  }
}

export default Player;
