/* global $ */

describe('RNUMITestApp', () => {
  beforeEach(() => {
    const basicLayoutView = $('~basicLayoutView');
    basicLayoutView.waitForDisplayed();

    const textInBasicLayout = $('~textInBasicLayout');
    textInBasicLayout.waitForDisplayed();
    expect(textInBasicLayout.getText()).toBe('basic layout');
  });

  it('should render IndexPage', () => {
    const linkToHome = $('~linkToHome');
    linkToHome.waitForDisplayed();
    expect(linkToHome.getText()).toBe('Go to home');

    const greetingText = $('~greetingText');
    greetingText.waitForDisplayed();
    expect(greetingText.getText()).toBe('Hello, umi!');
  });

  it('should navigate to HomePage with query params', () => {
    const linkToHome = $('~linkToHome');
    linkToHome.click();

    const homeTitle = $('~homePageTitle');
    homeTitle.waitForDisplayed();
    expect(homeTitle.getText()).toBe('Home Page');

    const textInHomePage = $('~textInHomePage');
    textInHomePage.waitForDisplayed();
    expect(textInHomePage.getText()).toBe(JSON.stringify({ foo: 'bar' }));

  });

  // it('should navigate to nested deeply FeedbackPage', () => {
  //   const linkToFeedback = $('~linkToFeedback');
  //   linkToFeedback.click();
  //
  //   const feedbackLayoutView = $('~feedbackLayoutView');
  //   feedbackLayoutView.waitForDisplayed();
  //
  //   const textInFeedBackPage = $('~textInFeedBackPage');
  //   textInFeedBackPage.waitForDisplayed();
  //   expect(textInFeedBackPage.getText()).toBe('feedback');
  // });
});
