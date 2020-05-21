const path = require('path');

exports.config = {
  runner: 'local',
  port: 4723,
  services: ['appium'],
  specs: ['./e2e/*.js'],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      platformName: 'iOS',
      platformVersion: '13.3',
      deviceName: 'iPhone 11',
      app: path.join(__dirname, 'ios/build/RNUMITestApp.xcarchive/Products/Applications/RNUMITestApp.app'),
      automationName: 'XCUITest',
    },
  ],
  logLevel: 'debug',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
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
