import type { Options } from '@wdio/types';
import path from 'path';

const wdioDir = __dirname;

export const config: Options.Testrunner = {
  runner: 'local',

  specs: [path.join(wdioDir, 'features/**/*.feature')],
  exclude: [],

  maxInstances: 10,

  capabilities: [{
    browserName: 'chrome',
    acceptInsecureCerts: true,
    'goog:chromeOptions': {
      args: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1920,1080',
        '--disable-extensions',
        '--disable-setuid-sandbox',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disk-cache-size=0'
      ]
    }
  }],

  logLevel: 'info',
  bail: 0,

  baseUrl: process.env.WDIO_BASE_URL || 'http://127.0.0.1:8080',

  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    ['devtools', {
      logLevel: 'debug'
    }]
  ],

  framework: 'cucumber',

  reporters: [
    'spec',
    ['junit', {
      outputDir: path.join(process.cwd(), 'reports', 'wdio'),
      outputFileFormat: options => `junit-results.xml`,
      suiteNameFormat: /[^a-z0-9]+/
    }]
  ],

  cucumberOpts: {
    require: [path.join(wdioDir, 'step-definitions/**/*.ts')],
    backtrace: false,
    requireModule: ['ts-node/register'],
    dryRun: false,
    failFast: false,
    name: [],
    snippets: true,
    source: true,
    strict: false,
    tagExpression: '',
    timeout: 60000,
    ignoreUndefinedDefinitions: false
  },

  before: async function (capabilities, specs) {
    require('ts-node/register');
  },

  beforeScenario: async function (world, context) {
    await browser.maximizeWindow();
  },

  afterScenario: async function (world, result, context) {
    if (result.passed === false) {
      await browser.takeScreenshot();
    }
  }
};
