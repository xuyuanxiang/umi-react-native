/* global $ */

describe('RNUMITestApp', () => {
  it('should render IndexPage', () => {
    const linkToHome = $('~linkToHome');
    linkToHome.waitForDisplayed(10000);
    expect(linkToHome.getText()).toBe('Go to home');

    const linkToLogin = $('~linkToLogin');
    linkToLogin.waitForDisplayed(10000);
    expect(linkToLogin.getText()).toBe('Go to login');

    // linkToHome.click();
  });
});
