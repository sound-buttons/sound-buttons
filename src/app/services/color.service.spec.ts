import { ColorService } from './color.service';

// Capability: theming — CSS custom property application.
describe('ColorService', () => {
  let service: ColorService;

  beforeEach(() => {
    service = new ColorService();
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--bs-primary');
    document.documentElement.style.removeProperty('--bs-secondary');
  });

  it('exposes a default black/grey color', () => {
    expect(service.color).toEqual(service.defaultColor);
    expect(service.defaultColor.primary).toBe('#000000');
  });

  it('writes --bs-primary/--bs-secondary on documentElement when color is set', () => {
    service.color = { primary: '#ff0000', secondary: '#00ff00' };

    expect(document.documentElement.style.getPropertyValue('--bs-primary')).toBe('#ff0000');
    expect(document.documentElement.style.getPropertyValue('--bs-secondary')).toBe('#00ff00');
    expect(service.color.primary).toBe('#ff0000');
  });

  it('resetColor restores the default values', () => {
    service.color = { primary: '#ff0000', secondary: '#00ff00' };
    service.resetColor();

    expect(service.color).toEqual(service.defaultColor);
    expect(document.documentElement.style.getPropertyValue('--bs-primary')).toBe('#000000');
  });
});
