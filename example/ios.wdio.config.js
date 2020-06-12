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
      platformName: 'iOS',
      platformVersion: '13.5',
      deviceName: 'iPhone 11',
      app: path.join(__dirname, 'ios/build/RNUMITestApp.xcarchive/Products/Applications/RNUMITestApp.app'),
      automationName: 'XCUITest',
    },
  ],
  logLevel: 'error',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 7200000,
  connectionRetryTimeout: 3600000,
  connectionRetryCount: 3,
  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 1200000,
    expectationResultHandler: function () {
      // NOOP
    },
  },
};
