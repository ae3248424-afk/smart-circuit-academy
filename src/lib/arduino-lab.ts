import { CPU, AVRIOPort, avrInstruction, portBConfig, portDConfig, PinState } from 'avr8js';

export const LAB_MODES = ['blink', 'button', 'pwm', 'safety'] as const;
export type LabMode = typeof LAB_MODES[number];
export type Wire = { from: string; to: string };
export const REQUIRED_LED_WIRES: Wire[] = [
  { from: 'D13', to: 'R1' }, { from: 'R2', to: 'LED+' }, { from: 'LED-', to: 'GND' },
];
export const REQUIRED_BUTTON_WIRES: Wire[] = [{ from: 'D2', to: 'BTN1' }, { from: 'BTN2', to: 'GND' }];
export function sameWire(a: Wire, b: Wire) { return (a.from === b.from && a.to === b.to) || (a.from === b.to && a.to === b.from); }
export function circuitReady(wires: Wire[], mode: LabMode) {
  return [...REQUIRED_LED_WIRES, ...(mode === 'button' || mode === 'safety' ? REQUIRED_BUTTON_WIRES : [])].every(required => wires.some(wire => sameWire(wire, required)));
}
export function safeWire(wire: Wire) {
  return [...REQUIRED_LED_WIRES, ...REQUIRED_BUTTON_WIRES].some(required => sameWire(wire, required));
}
const sbi = (address: number, bit: number) => 0x9a00 | (address << 3) | bit;
const cbi = (address: number, bit: number) => 0x9800 | (address << 3) | bit;
const ldi = (register: number, value: number) => 0xe000 | ((value & 0xf0) << 4) | ((register - 16) << 4) | (value & 15);
const jump = (offset: number) => 0xc000 | (offset & 0x0fff);
function delayWords(milliseconds: number) {
  const count = Math.max(1, Math.round(milliseconds * 16000 / 5));
  return [ldi(18, count & 255), ldi(19, (count >> 8) & 255), ldi(20, (count >> 16) & 255), 0x5021, 0x4030, 0x4040, 0xf7e1];
}
export function makeFirmware(mode: LabMode, period = 500, duty = 50) {
  if (mode === 'button' || mode === 'safety') {
    return new Uint16Array([
      sbi(4, 5), cbi(10, 2), sbi(11, 2),
      0x994a, jump(2), mode === 'button' ? sbi(5, 5) : cbi(5, 5), jump(-4),
      mode === 'button' ? cbi(5, 5) : sbi(5, 5), jump(-6),
    ]);
  }
  const on = mode === 'pwm' ? Math.max(0.02, duty * 0.02) : period;
  const off = mode === 'pwm' ? Math.max(0.02, (100 - duty) * 0.02) : period;
  const words = [sbi(4, 5), sbi(5, 5), ...delayWords(on), cbi(5, 5), ...delayWords(off)];
  words.push(jump(1 - (words.length + 1)));
  return new Uint16Array(words);
}
export function createUno(mode: LabMode, period = 500, duty = 50) {
  const cpu = new CPU(makeFirmware(mode, period, duty));
  const portB = new AVRIOPort(cpu, portBConfig);
  const portD = new AVRIOPort(cpu, portDConfig);
  portD.setPin(2, true);
  return { cpu, portB, portD };
}
export function advanceUno(uno: ReturnType<typeof createUno>, cycles: number) {
  const end = uno.cpu.cycles + cycles;
  while (uno.cpu.cycles < end) { avrInstruction(uno.cpu); uno.cpu.tick(); }
  return uno.portB.pinState(5) === PinState.High;
}