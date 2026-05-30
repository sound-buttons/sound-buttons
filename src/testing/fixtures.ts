// Factory builders for domain models used across the test suite.
// Keep these pure and side-effect free so specs can compose deterministic inputs.

import { Button, IButton, ISource } from '../app/sound-buttons/Buttons';
import { ButtonGroup, IButtonGroup } from '../app/sound-buttons/ButtonGroup';
import { IColor } from '../app/services/color.service';
import { IConfig, IFullConfig } from '../app/services/config.service';

export function makeSource(overrides: Partial<ISource> = {}): ISource {
  return { videoId: 'dQw4w9WgXcQ', start: 12.7, end: 20, ...overrides };
}

export function makeButton(overrides: Partial<IButton> = {}): IButton {
  const base: IButton = {
    id: 'btn-1',
    filename: 'hello.webm',
    text: 'Hello',
    baseRoute: 'assets/sound/',
    volume: 1,
    SASToken: '',
  };
  return { ...base, ...overrides };
}

export function makeButtonInstance(overrides: Partial<IButton> = {}): Button {
  const b = makeButton(overrides);
  return new Button(b.id, b.filename, b.text, b.baseRoute, b.volume, b.source, b.SASToken, b.index);
}

export function makeButtonGroupInstance(
  name = 'Group A',
  baseRoute = 'assets/sound/',
  buttons: IButton[] = [makeButton()]
): ButtonGroup {
  return new ButtonGroup(name, baseRoute, buttons);
}

export function makeIButtonGroup(overrides: Partial<IButtonGroup> = {}): IButtonGroup {
  return {
    name: 'Group A',
    baseRoute: 'assets/sound/',
    buttons: [makeButton()],
    ...overrides,
  };
}

export function makeColor(overrides: Partial<IColor> = {}): IColor {
  return { primary: '#112233', secondary: '#445566', ...overrides };
}

export function makeBriefConfig(overrides: Partial<IConfig> = {}): IConfig {
  return {
    name: 'template',
    fullName: 'Template Chara',
    imgSrc: 'assets/img/template.png',
    fullConfigURL: 'assets/configs/template.json',
    liveUpdateURL: 'https://example.com/template.live.json',
    ...overrides,
  };
}

export function makeFullConfig(overrides: Partial<IFullConfig> = {}): IFullConfig {
  return {
    ...makeBriefConfig(),
    intro: 'Intro text',
    buttonGroups: [makeIButtonGroup()],
    ...overrides,
  };
}
