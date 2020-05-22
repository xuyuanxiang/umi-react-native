/* global $ */

const timeout = 10000;

describe('RNUMITestApp', () => {
  it('should render IndexPage', () => {
    const linkToHome = $('~linkToHome');
    linkToHome.waitForDisplayed({ timeout });
    expect(linkToHome.getText()).toBe('Go to home');

    const greetingText = $('~greetingText');
    greetingText.waitForDisplayed({ timeout });
    expect(greetingText.getText()).toBe('Hello, umi!');
  });

  it('should navigate to HomePage with query params', () => {
    const linkToHome = $('~linkToHome');
    linkToHome.click();

    const homeTitle = $('~homeTitle');
    homeTitle.waitForDisplayed({ timeout });
    expect(homeTitle.getText()).toBe('Home Page');

    const homeText = $('~homeText');
    homeText.waitForDisplayed({ timeout });
    expect(homeText.getText()).toBe(JSON.stringify({ foo: 'bar' }));
  });
});
