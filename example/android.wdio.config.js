const path = require('path');

exports.config = {
  runner: 'local',
  port: 4723,
  services: ['appium'],
  specs: ['./e2e/*.spec.js'],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      platformName: 'Android',
      platformVersion: '10.0',
      deviceName: 'Nexus 6 API 29',
      app: path.join(__dirname, 'android/app/build/outputs/apk/release/app-release.apk'),
      automationName: 'UiAutomator2',
    },
  ],
  logLevel: 'info',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 60000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 10,
  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000,
    expectationResultHandler: function () {
      // NOOP
    },
  },
};
