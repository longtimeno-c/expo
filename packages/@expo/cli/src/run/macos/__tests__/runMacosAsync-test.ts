import { sync as globSync } from 'glob';

import { getMacosAppBinaryPath, getMacosXcodeBuildArgs } from '../runMacosAsync';

jest.mock('glob');

describe(getMacosXcodeBuildArgs, () => {
  it('builds workspace args against the macosx SDK', () => {
    expect(
      getMacosXcodeBuildArgs({
        projectInfo: { name: '/app/macos/App.xcworkspace', isWorkspace: true },
        scheme: 'App',
        configuration: 'Debug',
        derivedDataPath: '/app/macos/build',
      })
    ).toEqual([
      '-workspace',
      '/app/macos/App.xcworkspace',
      '-scheme',
      'App',
      '-configuration',
      'Debug',
      '-sdk',
      'macosx',
      '-derivedDataPath',
      '/app/macos/build',
      'build',
    ]);
  });

  it('uses -project for non-workspace projects and the given configuration', () => {
    const args = getMacosXcodeBuildArgs({
      projectInfo: { name: '/app/macos/App.xcodeproj', isWorkspace: false },
      scheme: 'App',
      configuration: 'Release',
      derivedDataPath: '/dd',
    });
    expect(args.slice(0, 2)).toEqual(['-project', '/app/macos/App.xcodeproj']);
    expect(args).toContain('Release');
    expect(args).toContain('macosx');
  });
});

describe(getMacosAppBinaryPath, () => {
  afterEach(() => jest.mocked(globSync).mockReset());

  it('returns the .app from the products directory', () => {
    jest.mocked(globSync).mockReturnValue(['/dd/Build/Products/Debug/App.app']);
    expect(getMacosAppBinaryPath('/dd', 'Debug')).toBe('/dd/Build/Products/Debug/App.app');
    expect(globSync).toHaveBeenCalledWith('*.app', {
      cwd: '/dd/Build/Products/Debug',
      absolute: true,
    });
  });

  it('throws a helpful error when no app is found', () => {
    jest.mocked(globSync).mockReturnValue([]);
    expect(() => getMacosAppBinaryPath('/dd', 'Debug')).toThrow(/Couldn't find a built macOS app/);
  });
});
