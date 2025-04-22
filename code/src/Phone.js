"use strict";

import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "johnny-five";
const { Board, Relay, Button } = pkg;
import fetch from "node-fetch";
import xs from "xstream";
import fromEvent from "xstream/extra/fromEvent.js";
import delay from "xstream/extra/delay.js";

import Rotary from "./Rotary.js";
import Player from "./Player.js";
import { scan } from "./sound.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLAN_PATH = path.join(__dirname, "..", "plan");
console.log(PLAN_PATH);
const SOUNDS = scan(PLAN_PATH);

const getUrlStream = url => fetch(url).then(res => res.body).catch(e => console.log(e));
const getTTSStream = text => getUrlStream(`http://translate.google.com/translate_tts?tl=fr&q=${encodeURIComponent(text)}&client=gtx&ie=UTF-8`);
const getLocalSoundPath = relativePath => path.join(PLAN_PATH, relativePath);
const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

const playSilence = (duration) => new Promise((resolve) => {
  console.log("playSilence", duration);
  player.stop();
  setTimeout(resolve, duration * 1000);
});

const playStream = (stream, options) => {
  console.log("playStream", options);
  return player.play(stream, options);
};

const playSine = () => {
  console.log("playSine");
  return player.sine();
};

const playLocalSound = (relativePath) => {
  console.log("playLocalSound", relativePath);
  return playStream(fs.createReadStream(getLocalSoundPath(relativePath)));
};

const playText = (text, options) => {
  return getTTSStream(text).then(stream => playStream(stream, options));
};

// Fonction d'initialisation
async function init() {
  let Raspi = null;
  const useGPIOMock = process.env.USE_GPIOMOCK === "true"; // Vérification de la variable d'environnement

  if (!useGPIOMock && os.platform() !== "darwin" && os.arch() === "arm64") {
    // Si GPIO n'est pas mocké et qu'on est sur ARM64, charger raspi-io
    const raspiModule = await import("raspi-io");
    Raspi = raspiModule.default;
  } else {
    // Sinon, mocker le GPIO (en fonction de USE_GPIOMOCK)
    console.log("GPIO non disponible ou mocké, utilisation d'une version factice");
    // Création d'un mock pour les pins GPIO de Johnny-Five
    Raspi = function () {
      this.pins = []; // Liste des pins, vide pour le mock
      this.pinMode = () => {};
      this.digitalWrite = () => {};
      this.analogWrite = () => {};
      this.pin = () => {
        return {
          mode: null,
          value: null,
          write: (value) => {
            this.value = value;
          },
        };
      };
      
      // Mock de la méthode 'once' utilisée pour l'événement de la carte
      this.once = (event, callback) => {
        if (event === "ready") {
          // Simule immédiatement l'événement 'ready'
          setImmediate(callback);
        }
      };
    };
  }
  console.log("ici");

  const board = new Board({ io: Raspi ? new Raspi() : undefined });

  // Logique des relais et des boutons
  board.on("ready", function() {
    var ringRelay = new Relay({
      pin: "GPIO4",
      type: "NC"
    });
    ringRelay.open();

    var hangupButton = new Button({
      pin: "GPIO21",
      isPullup: true,
      invert: false,
      holdtime: 10
    });

    var rotaryButton = new Button({
      pin: "GPIO17",
      isPullup: true,
      holdtime: 10,
      invert: true
    });

    const RING_INTERVAL = 1000;
    const RING_TIMEOUT = 5000;

    var pickup$ = fromEvent(hangupButton, 'up').mapTo('pickup');
    var hangup$ = fromEvent(hangupButton, 'down').mapTo('hangup').drop(1);
    var ring$ = xs.periodic(RING_INTERVAL).startWith(0).endWhen(pickup$).endWhen(xs.periodic(RING_TIMEOUT).take(1));
    var hangupButton$ = xs.merge(pickup$, hangup$);

    hangupButton$.addListener({
      next: i => {
        board.info("hangupButton$", i);
      },
      error: err => console.error('err', err),
      complete: e => {
        console.log("e", e);
        board.info("hangupButton$", "complete");
      }
    });

    const placeCall = (stream) => {
      ring$.addListener({
        next: i => {
          board.info("ring$", "next");
          ringRelay.toggle();
        },
        error: err => console.error('err', err),
        complete: e => {
          board.info("ring$", e);
          ringRelay.open();
          player.stop();
          setTimeout(() => playStream(stream), 1000);
        }
      });
    };

    board.repl.inject({
      ringRelay,
      hangupButton
    });

    hangupButton.on("up", function() {
      board.info("Phone", "PICK UP");
      ringRelay.open();
      player.sine();
    });

    hangupButton.on("down", function() {
      board.info("Phone", "HANG UP");
      player.stop();
      ringRelay.open();
    });

    const rotary = new Rotary();

    // define some internal callbacks
    const callbacks = {
      "99": () => {
        board.info("DEBUG", `debug`);
        setTimeout(() => {
          board.info("DEBUG", `timeout`);
          getTTSStream("Bonjour, Comment allez-vous aujourd'hui ?").then(placeCall);
        }, 3000);
      },
      // default behaviour :
      default: number => {
        board.info("Phone", `fallback number`);
        const numberPath = (SOUNDS[number] && number) || "default";
        const sounds = SOUNDS[numberPath];
        const modulePath = path.join(PLAN_PATH, number, 'index.js');
        if (fs.existsSync(modulePath) && fs.statSync(modulePath).isFile()) {
          board.info("Phone", `detected index.js, execute`);
          const numberModule = require(modulePath);
          numberModule({
            playText: playText,
            playSilence: playSilence,
            playStream: playStream,
            playSine: playSine,
            hangupButton$: hangupButton$
          });
        } else {
          const pickedSound = pickRandom(sounds);
          const sound = numberPath + "/" + pickedSound;
          if (pickedSound) {
            board.info("Phone", `START Play ${sound}`);
            playLocalSound(sound);
          } else {
            board.error("Phone", `CANNOT Play sound ${sound}`);
          }
        }
      }
    };

    rotary.on("compositionend", number => {
      board.info("Rotary", `COMPOSE ${number}`);
      player.stop();
      if (callbacks[number]) {
        callbacks[number]();
      } else {
        callbacks.default(number);
      }
    });

    rotaryButton.on("up", () => rotary.onPulse());
  });

  const player = new Player();
}

init().catch(console.error);

export default class Phone {
}