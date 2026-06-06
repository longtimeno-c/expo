import type { ExportedConfig } from '@expo/config-plugins';
import { compileModsAsync } from '@expo/config-plugins';
import plist from '@expo/plist';
import { vol } from 'memfs';

import rnFixture from './fixtures/react-native-project';
import { getDirFromFS } from './getDirFromFS';
import { withMacosExpoPlugins } from '../withDefaultPlugins';

jest.mock('fs');

// Reuse the iOS bare project fixture, relocated to the macOS native directory.
const macosFixture = Object.fromEntries(
  Object.entries(rnFixture)
    .filter(([key]) => key.startsWith('ios/'))
    .map(([key, value]) => [key.replace(/^ios\//, 'macos/'), value])
);

describe(withMacosExpoPlugins, () => {
  const projectRoot = '/app';

  beforeEach(() => {
    // Trick Info.plist reading into not requiring a real macOS host.
    Object.defineProperty(process, 'platform', { value: 'not-darwin' });
    vol.fromJSON(macosFixture, projectRoot);
  });

  afterEach(() => {
    vol.reset();
  });

  it('applies app config to the macOS project', async () => {
    let config: ExportedConfig = {
      name: 'my cool app',
      slug: 'mycoolapp',
      version: '1.2.3',
      ios: { buildNumber: '7' },
      _internal: { projectRoot },
    };

    config = withMacosExpoPlugins(config, { bundleIdentifier: 'com.bacon.todo' });
    config = await compileModsAsync(config, { projectRoot, platforms: ['macos'] });

    const after = getDirFromFS(vol.toJSON(), projectRoot);

    // Info.plist values are applied to the macOS project.
    const infoPlist = plist.parse(after['macos/HelloWorld/Info.plist']);
    expect(infoPlist.CFBundleIdentifier).toBe('com.bacon.todo');
    expect(infoPlist.CFBundleDisplayName).toBe('my cool app');
    expect(infoPlist.CFBundleShortVersionString).toBe('1.2.3');
    expect(infoPlist.CFBundleVersion).toBe('7');

    // The bundle identifier is applied to the macOS Xcode project.
    expect(after['macos/HelloWorld.xcodeproj/project.pbxproj']).toContain('com.bacon.todo');

    // The config was applied via macos mods.
    expect((config.mods as any).macos).toBeDefined();
  });
});
