/* global $ */

describe('UMIHaulExample', () => {
  it('should work', () => {
    // layouts/index.js
    const basicLayoutView = $('~basicLayoutView');
    basicLayoutView.waitForDisplayed();
    const textInBasicLayout = $('~textInBasicLayout');
    textInBasicLayout.waitForDisplayed();
    expect(textInBasicLayout.getText()).toBe('Basic Layout');

    // pages/index.js
    const textInIndexPage = $('~textInIndexPage');
    // text connected from models/foo.js
    textInIndexPage.waitForDisplayed();
    expect(textInIndexPage.getText()).toBe('Hello umi');
    const linkToFeedbackPage = $('~linkToFeedbackPage');
    linkToFeedbackPage.click();

    // pages/profile/settings/_layout.js
    const feedbackLayoutView = $('~feedbackLayoutView');
    feedbackLayoutView.waitForDisplayed();
    const textInFeedbackLayout = $('~textInFeedbackLayout');
    textInFeedbackLayout.waitForDisplayed();
    expect(textInFeedbackLayout.getText()).toBe('Feedback Layout');

    // pages/profile/settings/feedback.js
    const feedbackPageTitle = $('~feedbackPageTitle');
    feedbackPageTitle.waitForDisplayed();
    expect(feedbackPageTitle.getText()).toBe('Feedback Page');
    const textInFeedBackPage = $('~textInFeedBackPage');
    textInFeedBackPage.waitForDisplayed();
    expect(textInFeedBackPage.getText()).toBe(JSON.stringify({ foo: 'bar' }));
    const feedbackPageBackButton = $('~feedbackPageBackButton');
    feedbackPageBackButton.click();

    const linkToLoginPage = $('~linkToLoginPage');
    linkToLoginPage.click();

    const loginPageView = $('~loginPageView');
    loginPageView.waitForDisplayed();
    expect(loginPageView.isDisplayed()).toBeTruthy();
  });
});
