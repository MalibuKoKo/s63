export class Gpio {
  constructor(pin, options) {
    console.log(`Mock GPIO: Pin ${pin} initialized with`, options);
  }
  digitalWrite(value) {
    console.log(`Mock GPIO: Writing ${value}`);
  }
  digitalRead() {
    console.log(`Mock GPIO: Reading value`);
    return 0;
  }
  pwmWrite(value) {
    console.log(`Mock GPIO: PWM writing ${value}`);
  }
}
