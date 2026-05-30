import { ButtonFilterPipe } from './button-filter.pipe';
import { makeIButtonGroup, makeButton } from '../../testing/fixtures';

// Capability: sound-button-grid — client-side text filtering of button groups.
describe('ButtonFilterPipe', () => {
  let pipe: ButtonFilterPipe;

  beforeEach(() => (pipe = new ButtonFilterPipe()));

  it('keeps only buttons whose text contains the term (substring match)', () => {
    const group = makeIButtonGroup({
      buttons: [makeButton({ text: 'apple' }), makeButton({ text: 'banana' })],
    });

    const result = pipe.transform([group], 'app');

    expect(result[0].buttons.length).toBe(1);
    expect(result[0].buttons[0].text).toBe('apple');
  });

  it('keeps all buttons when the term is empty', () => {
    const group = makeIButtonGroup({
      buttons: [makeButton({ text: 'a' }), makeButton({ text: 'b' })],
    });

    const result = pipe.transform([group], '');

    expect(result[0].buttons.length).toBe(2);
  });

  it('retains the group object even when all its buttons are filtered out', () => {
    const group = makeIButtonGroup({
      name: 'G',
      buttons: [makeButton({ text: 'apple' })],
    });

    const result = pipe.transform([group], 'zzz');

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('G');
    expect(result[0].buttons.length).toBe(0);
  });

  it('performs a case-sensitive match', () => {
    const group = makeIButtonGroup({ buttons: [makeButton({ text: 'Apple' })] });

    expect(pipe.transform([group], 'apple')[0].buttons.length).toBe(0);
    expect(pipe.transform([group], 'Apple')[0].buttons.length).toBe(1);
  });
});
