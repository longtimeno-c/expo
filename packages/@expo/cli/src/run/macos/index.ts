#!/usr/bin/env node
import type arg from 'arg';
import chalk from 'chalk';
import path from 'path';

import type { XcodeConfiguration } from '../ios/XcodeBuild.types';
import type { Command } from '../../../bin/cli';
import { assertWithOptionsArgs, printHelp } from '../../utils/args';
import { logCmdError } from '../../utils/errors';

export const expoRunMacos: Command = async (argv) => {
  const rawArgsMap: arg.Spec = {
    // Types
    '--help': Boolean,
    '--no-build-cache': Boolean,
    '--no-install': Boolean,
    '--no-bundler': Boolean,
    '--configuration': String,
    '--binary': String,
    '--output': String,

    '--port': Number,

    // Aliases
    '-p': '--port',
    '-o': '--output',
    '-h': '--help',
  };
  const args = assertWithOptionsArgs(rawArgsMap, {
    argv,
    permissive: true,
  });

  if (args['--help']) {
    printHelp(
      `Run the macOS app locally`,
      `npx expo run:macos`,
      [
        `--no-build-cache                 Clear the native derived data before building`,
        `--no-install                     Skip installing dependencies`,
        `--no-bundler                     Skip starting the Metro bundler`,
        `--scheme [scheme]                Scheme to build`,
        `--binary <path>                  Path to existing .app to launch.`,
        chalk`--configuration <configuration>  Xcode configuration to use. Debug or Release. {dim Default: Debug}`,
        `-o, --output <path>              Directory to output the built app binary`,
        chalk`-p, --port <port>                Port to start the Metro bundler on. {dim Default: 8081}`,
        `-h, --help                       Usage info`,
      ].join('\n'),
      [
        '',
        chalk`  Build for production (unsigned) with the {bold Release} configuration:`,
        chalk`    {dim $} npx expo run:macos --configuration Release`,
        '',
      ].join('\n')
    );
  }

  const { resolveStringOrBooleanArgsAsync } = await import('../../utils/resolveArgs.js');
  const parsed = await resolveStringOrBooleanArgsAsync(argv ?? [], rawArgsMap, {
    '--scheme': Boolean,
  }).catch(logCmdError);

  const { runMacosAsync } = await import('./runMacosAsync.js');
  return runMacosAsync(path.resolve(parsed.projectRoot), {
    // Parsed options
    buildCache: !args['--no-build-cache'],
    install: !args['--no-install'],
    bundler: !args['--no-bundler'],
    port: args['--port'],
    binary: args['--binary'],
    output: args['--output'],

    // Custom parsed args
    scheme: parsed.args['--scheme'],
    configuration: parsed.args['--configuration'] as XcodeConfiguration,
  }).catch(logCmdError);
};
