import type { ExpoConfig } from '@expo/config-types';
import { globSync } from 'glob';
import { vol } from 'memfs';
import path from 'path';

import { evalModsAsync } from '../mod-compiler';
import { withMacosBaseMods } from '../withIosBaseMods';
import { withMod } from '../withMod';

jest.mock('fs');
jest.mock('glob');

describe(withMacosBaseMods, () => {
  afterEach(() => {
    vol.reset();
    jest.mocked(globSync).mockReset();
  });

  it('compiles macos mods against the macos/ directory', async () => {
    vol.fromJSON({
      '/macos/HelloWorld/AppDelegate.swift': 'fake AppDelegate',
    });

    // Resolve the macOS AppDelegate so the project name can be derived from `macos/`.
    jest.mocked(globSync).mockImplementation((pattern) => {
      if (pattern === 'macos/*/AppDelegate.@(m|mm|swift)') {
        return ['/macos/HelloWorld/AppDelegate.swift'];
      }
      return [];
    });

    let capturedModRequest: any;
    let config: ExpoConfig = { name: 'HelloWorld', slug: 'helloworld' };
    config = withMod<Record<string, string>>(config, {
      platform: 'macos',
      mod: 'infoPlist',
      action(config) {
        capturedModRequest = config.modRequest;
        config.modResults.added = 'macos';
        return config;
      },
    });

    // Base mods must be added last. Use a custom provider to isolate the platform plumbing.
    config = withMacosBaseMods(config, {
      saveToInternal: true,
      providers: {
        infoPlist: {
          getFilePath() {
            return '';
          },
          async read() {
            return {};
          },
          async write() {},
        },
      },
    });

    config = await evalModsAsync(config, { projectRoot: '/', platforms: ['macos'] });

    // The mod ran under the `macos` platform (not `ios`).
    expect((config.mods as any).macos.infoPlist).toBeDefined();
    expect((config.mods as any).ios).toBeUndefined();

    // The mod request targets the macos/ project, with the project name derived from macos/.
    expect(capturedModRequest.platform).toBe('macos');
    expect(capturedModRequest.platformProjectRoot).toBe(path.join('/', 'macos'));
    expect(capturedModRequest.projectName).toBe('HelloWorld');
  });

  it('only compiles macos mods when the macos platform is requested', async () => {
    vol.fromJSON({});

    let ran = false;
    let config: ExpoConfig = { name: 'HelloWorld', slug: 'helloworld' };
    config = withMod<Record<string, string>>(config, {
      platform: 'macos',
      mod: 'infoPlist',
      action(config) {
        ran = true;
        return config;
      },
    });
    config = withMacosBaseMods(config, {
      saveToInternal: true,
      providers: {
        infoPlist: {
          getFilePath() {
            return '';
          },
          async read() {
            return {};
          },
          async write() {},
        },
      },
    });

    // Requesting only iOS should skip the macos mods entirely.
    config = await evalModsAsync(config, { projectRoot: '/', platforms: ['ios'] });
    expect(ran).toBe(false);
  });
});
