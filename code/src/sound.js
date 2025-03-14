import fs from "fs";
import path from "path";
import lame from "lame";
import Speaker from "speaker";
import Oscillator from "audio-oscillator";

function play(stream) {
  var speaker = new Speaker();
  stream.pipe(new lame.Decoder()).pipe(speaker);
  return speaker;
}

function sine() {
  var speaker = new Speaker();
  return Oscillator({
    frequency: 440,
    detune: 0,
    type: "sine",
    normalize: true
  }).pipe(speaker);
  return speaker;
}

const isHiddenFile = path => path.charAt(0) === ".";
const isDirectory = path => fs.statSync(path).isDirectory();
const isSound = path => path.substring(path.length - 4) === ".mp3";
const listDir = (path, filter = () => true) =>
  fs.readdirSync(path).filter(f => !isHiddenFile(f)).filter(filter);

const scan = root => listDir(root, name =>
  isDirectory(path.join(root, name))).reduce(
  (sounds, subFolderName) => {
    const subFolderPath = path.join(root, subFolderName);
    sounds[subFolderName] = listDir(subFolderPath, name =>
      isSound(path.join(subFolderPath, name)));
    return sounds;
  },
  {}
);

// Utilise 'export' pour rendre les fonctions accessibles en ESM
export { play, sine, scan };
