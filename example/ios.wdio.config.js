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
      platformVersion: '13.4',
      deviceName: 'iPhone 11',
      app: path.join(__dirname, 'ios/build/RNUMITestApp.xcarchive/Products/Applications/RNUMITestApp.app'),
      automationName: 'XCUITest',
    },
  ],
  logLevel: 'debug',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 60000,
  connectionRetryTimeout: 300000,
  connectionRetryCount: 3,
  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000,
    expectationResultHandler: function () {
      // NOOP
    },
  },
};
