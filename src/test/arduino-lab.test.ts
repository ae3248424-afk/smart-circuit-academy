import { describe, expect, it } from 'vitest';
import { advanceUno, circuitReady, createUno, REQUIRED_BUTTON_WIRES, REQUIRED_LED_WIRES, safeWire } from '@/lib/arduino-lab';
import { PinState } from 'avr8js';

describe('Uno experiments', () => {
  it('executes firmware that configures D13 as output and blinks every 500 ms', () => {
    const uno = createUno('blink');
    expect(advanceUno(uno, 100)).toBe(true);
    expect((uno.cpu.data[0x24] ?? 0) & 0x20).toBe(0x20);
    expect(advanceUno(uno, 8_001_000)).toBe(false);
    expect(advanceUno(uno, 8_001_000)).toBe(true);
  });
  it('reads D2 pullup as HIGH released and LOW pressed', () => {
    const uno = createUno('button');
    expect(advanceUno(uno, 100)).toBe(false);
    uno.portD.setPin(2, false);
    expect(advanceUno(uno, 100)).toBe(true);
    uno.portD.setPin(2, true);
    expect(advanceUno(uno, 100)).toBe(false);
  });
  it('turns safety output off on an active-low stop input', () => {
    const uno = createUno('safety');
    expect(advanceUno(uno, 100)).toBe(true);
    uno.portD.setPin(2, false);
    expect(advanceUno(uno, 100)).toBe(false);
  });
  it('software PWM spends about 25 percent of cycles high', () => {
    const uno = createUno('pwm', 500, 25);
    let high = 0;
    for (let i = 0; i < 2000; i++) {
      advanceUno(uno, 160);
      if (uno.portB.pinState(5) === PinState.High) high++;
    }
    expect(high / 2000).toBeGreaterThan(0.22);
    expect(high / 2000).toBeLessThan(0.28);
  });
  it('requires series resistor and ground before a LED can light', () => {
    expect(circuitReady(REQUIRED_LED_WIRES, 'blink')).toBe(true);
    expect(circuitReady(REQUIRED_LED_WIRES.slice(0, 2), 'blink')).toBe(false);
    expect(safeWire({ from: 'D13', to: 'LED+' })).toBe(false);
  });
  it('requires a connected input button for button experiments', () => {
    expect(circuitReady(REQUIRED_LED_WIRES, 'button')).toBe(false);
    expect(circuitReady([...REQUIRED_LED_WIRES, ...REQUIRED_BUTTON_WIRES], 'button')).toBe(true);
    expect(safeWire({ from: '5V', to: 'GND' })).toBe(false);
  });
});