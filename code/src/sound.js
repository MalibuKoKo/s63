import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { spawn } from "child_process";
import Oscillator from "audio-oscillator";

function play(stream) {
  const ffplay = spawn("ffplay", ["-nodisp", "-autoexit", "-"], { stdio: ["pipe", "ignore", "ignore"] });
  ffmpeg(stream)
    .format("wav")
    .on("error", err => console.error("FFmpeg error:", err))
    .pipe(ffplay.stdin);
  return ffplay;
}

function sine() {
  const ffplay = spawn("ffplay", ["-nodisp", "-autoexit", "-"], { stdio: ["pipe", "ignore", "ignore"] });
  Oscillator({
    frequency: 440,
    detune: 0,
    type: "sine",
    normalize: true
  }).pipe(ffplay.stdin);
  return ffplay;
}

const isHiddenFile = filePath => filePath.charAt(0) === ".";
const isDirectory = dirPath => {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
};
const isSound = filePath => path.extname(filePath) === ".mp3";
const listDir = (dirPath, filter = () => true) =>
  fs.readdirSync(dirPath).filter(f => !isHiddenFile(f)).filter(filter);

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

export { play, sine, scan };
