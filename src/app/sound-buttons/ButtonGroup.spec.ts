import { ButtonGroup } from './ButtonGroup';
import { defaultBaseRoute } from './Buttons';
import { makeButton } from '../../testing/fixtures';

// Capability: configuration-loading — group base-route propagation.
describe('ButtonGroup (model)', () => {
  it('falls back to the default base route when none is provided', () => {
    const group = new ButtonGroup('G', '', [makeButton({ baseRoute: defaultBaseRoute })]);

    expect(group.baseRoute).toBe(defaultBaseRoute);
  });

  it('propagates its base route (with trailing slash) to default/empty child buttons', () => {
    const child = makeButton({ baseRoute: defaultBaseRoute });
    const group = new ButtonGroup('G', 'assets/sound/sub', [child]);

    expect(group.baseRoute).toBe('assets/sound/sub/');
    expect(child.baseRoute).toBe('assets/sound/sub/');
  });

  it('does not overwrite a child button that already has a custom base route', () => {
    const child = makeButton({ baseRoute: 'custom/path/' });
    new ButtonGroup('G', 'assets/sound/sub', [child]);

    expect(child.baseRoute).toBe('custom/path/');
  });

  it('resolves a multilingual group name to a string', () => {
    const group = new ButtonGroup({ zh: '群組', ja: 'グループ' } as never, '', [makeButton()]);

    expect(typeof group.name).toBe('string');
    expect(['群組', 'グループ']).toContain(group.name);
  });
});
