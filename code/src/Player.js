import { play, sine } from "./sound.js";

class Player {
  constructor() {
    this.playing = null;
    this.sine = this.sine.bind(this);
  }
  stop() {
    console.log("Player", "stop");
    if (this.playing) {
      this.playing.removeListener("finish", this.sine);
      this.playing.end();
      this.playing = null;
    }
  }
  sine() {
    console.log("Player", "sine");
    this.stop();
    this.playing = sine();
  }
  play(stream, options={sine: true}) {
    this.stop();
    const speaker = play(stream);
    this.playing = speaker;
    return new Promise((resolve, reject) => {
      speaker.on("finish", () => {
        resolve();
        if (options.cb) {
          options.cb(); // Correction : options.cb() au lieu de cb()
        }
        if (options.sine) {
          this.sine();
        }
      });
    });
  }
}

export default Player;
