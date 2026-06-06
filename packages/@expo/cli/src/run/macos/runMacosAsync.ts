import spawnAsync from '@expo/spawn-async';
import chalk from 'chalk';
import { sync as globSync } from 'glob';
import fs from 'fs';
import path from 'path';

import { resolveXcodeProject } from '../ios/options/resolveXcodeProject';
import type { ProjectInfo, XcodeConfiguration } from '../ios/XcodeBuild.types';
import { getLaunchInfoForBinaryAsync } from '../ios/launchApp';
import * as Log from '../../log';
import { CommandError } from '../../utils/errors';
import { setNodeEnv, loadEnvFiles } from '../../utils/nodeEnv';
import { getSchemesForIosAsync } from '../../utils/scheme';
import { ensureNativeProjectAsync } from '../ensureNativeProject';
import { logProjectLogsLocation } from '../hints';
import { resolveBundlerPropsAsync } from '../resolveBundlerProps';
import { startBundlerAsync } from '../startBundler';

const debug = require('debug')('expo:run:macos') as typeof console.log;

export interface MacosRunOptions {
  buildCache?: boolean;
  install?: boolean;
  bundler?: boolean;
  port?: number;
  binary?: string;
  output?: string;
  scheme?: string | boolean;
  configuration?: XcodeConfiguration;
}

/** The native directory for the macOS project, relative to the project root. */
const MACOS_DIR = 'macos';

/**
 * Build the `xcodebuild` arguments for a macOS build. macOS targets build against the `macosx` SDK
 * and run natively on the host, so there's no simulator/device destination to resolve.
 */
export function getMacosXcodeBuildArgs({
  projectInfo,
  scheme,
  configuration,
  derivedDataPath,
}: {
  projectInfo: ProjectInfo;
  scheme: string;
  configuration: XcodeConfiguration;
  derivedDataPath: string;
}): string[] {
  return [
    projectInfo.isWorkspace ? '-workspace' : '-project',
    projectInfo.name,
    '-scheme',
    scheme,
    '-configuration',
    configuration,
    '-sdk',
    'macosx',
    '-derivedDataPath',
    derivedDataPath,
    'build',
  ];
}

/** Locate the built `.app` bundle inside the derived data products directory. */
export function getMacosAppBinaryPath(
  derivedDataPath: string,
  configuration: XcodeConfiguration
): string {
  // macOS products are written to `Build/Products/<configuration>/<App>.app` (no SDK suffix,
  // unlike the iOS simulator's `Debug-iphonesimulator`).
  const productsDir = path.join(derivedDataPath, 'Build', 'Products', configuration);
  const [appPath] = globSync('*.app', { cwd: productsDir, absolute: true });
  if (!appPath) {
    throw new CommandError(
      'MACOS_BUILD',
      `Couldn't find a built macOS app (.app) in "${productsDir}". The xcodebuild step may have failed.`
    );
  }
  return appPath;
}

export async function runMacosAsync(projectRoot: string, options: MacosRunOptions) {
  setNodeEnv(options.configuration === 'Release' ? 'production' : 'development');
  loadEnvFiles(projectRoot);

  assertMacosPlatform();

  const install = !!options.install;
  await ensureNativeProjectAsync(projectRoot, { platform: 'macos', install });

  const bundlerProps = await resolveBundlerPropsAsync(projectRoot, options);
  const configuration: XcodeConfiguration = options.configuration || 'Debug';
  const projectInfo = resolveXcodeProject(projectRoot, MACOS_DIR);
  const scheme = await resolveMacosSchemeAsync(projectRoot, options.scheme);

  let binaryPath: string;
  if (options.binary) {
    binaryPath = path.resolve(options.binary);
    Log.log('Using custom binary path:', binaryPath);
  } else {
    const derivedDataPath = path.join(projectRoot, MACOS_DIR, 'build');
    if (options.buildCache === false) {
      await fs.promises.rm(derivedDataPath, { recursive: true, force: true });
    }
    const args = getMacosXcodeBuildArgs({ projectInfo, scheme, configuration, derivedDataPath });
    debug('Building macOS app with xcodebuild', args.join(' '));
    Log.log(chalk`{bold Building}\n› xcodebuild ${args.join(' ')}`);
    await spawnAsync('xcodebuild', args, { stdio: 'inherit', cwd: projectRoot });
    binaryPath = getMacosAppBinaryPath(derivedDataPath, configuration);
  }

  if (options.output) {
    binaryPath = await copyBinaryToOutputAsync(binaryPath, options.output);
  }

  debug('Binary path:', binaryPath);

  const launchInfo = await getLaunchInfoForBinaryAsync(binaryPath);

  // Start the dev server so the launched app can connect to Metro.
  const manager = await startBundlerAsync(projectRoot, {
    port: bundlerProps.port,
    headless: !bundlerProps.shouldStartBundler,
    scheme: options.binary
      ? launchInfo.schemes[0]
      : (await getSchemesForIosAsync(projectRoot))?.[0],
  });

  // macOS apps run directly on the host — there's no simulator or device to install onto.
  Log.log(chalk`{bold Launching} ${path.basename(binaryPath)}`);
  await spawnAsync('open', [binaryPath]);

  if (bundlerProps.shouldStartBundler) {
    logProjectLogsLocation();
  } else {
    await manager.stopAsync();
  }
}

async function resolveMacosSchemeAsync(
  projectRoot: string,
  scheme?: string | boolean
): Promise<string> {
  // Lazily import to avoid loading config-plugins for `--help`.
  const { IOSConfig } = await import('@expo/config-plugins');
  const schemes = IOSConfig.Paths.findSchemeNames(projectRoot, MACOS_DIR);
  if (!schemes.length) {
    throw new CommandError(
      'MACOS_MALFORMED',
      `No Xcode schemes found in the macOS project. Generate one with \`npx expo prebuild -p macos\`.`
    );
  }
  if (typeof scheme === 'string') {
    if (!schemes.includes(scheme)) {
      throw new CommandError(
        'MACOS_SCHEME',
        `Scheme "${scheme}" not found in the macOS project. Available schemes: ${schemes.join(', ')}`
      );
    }
    return scheme;
  }
  return schemes[0]!;
}

function assertMacosPlatform() {
  if (process.platform !== 'darwin') {
    Log.exit(
      chalk`macOS apps can only be built on macOS devices. Use {cyan eas build -p ios} for cloud builds of Apple apps.`
    );
  }
}

/** Copy the built binary to the specified output directory. */
async function copyBinaryToOutputAsync(binaryPath: string, outputDir: string): Promise<string> {
  const absoluteOutputDir = path.resolve(outputDir);
  const appName = path.basename(binaryPath);
  const outputPath = path.join(absoluteOutputDir, appName);

  await fs.promises.mkdir(absoluteOutputDir, { recursive: true });
  await fs.promises.cp(binaryPath, outputPath, { recursive: true });

  Log.log(chalk`{dim Copied to} ${outputPath}`);
  return outputPath;
}
