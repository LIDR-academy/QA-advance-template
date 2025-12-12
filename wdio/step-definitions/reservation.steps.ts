import { Given, When, Then } from '@wdio/cucumber-framework';
import ReservationPage from '../pages/ReservationPage';

const reservationPage = new ReservationPage();

let initialListCount: number = 0;
let lastNetworkStatus: number = 0;

Given(/^I am on the reservation page$/, async () => {
  await reservationPage.open();
  initialListCount = await reservationPage.getListCount();
});

Given(/^I have created a reservation with email "([^"]*)"$/, async (email: string) => {
  await reservationPage.fill(email, 2, 0);
  await reservationPage.clickSubmit();

  // Wait for response
  lastNetworkStatus = await reservationPage.lastStatusFor('/reservations');

  if (lastNetworkStatus === 201) {
    // Update initial count after successful creation
    await browser.pause(1000); // Wait for UI update
    initialListCount = await reservationPage.getListCount();
  }
});

When(/^I fill the form with email "([^"]*)", (\d+) adults and (\d+) children$/, async (
  email: string,
  adults: string,
  children: string
) => {
  await reservationPage.fill(email, parseInt(adults), parseInt(children));
});

When(/^I click on "([^"]*)"$/, async (buttonText: string) => {
  await reservationPage.clickSubmit();
});

Then(/^the network responds with status (\d+)$/, async (expectedStatus: string) => {
  const status = await reservationPage.lastStatusFor('/reservations');
  lastNetworkStatus = status;

  expect(status).toBe(parseInt(expectedStatus));
});

Then(/^I see the toast "([^"]*)"$/, async (expectedToast: string) => {
  await reservationPage.waitToast(expectedToast);

  const toastElement = await reservationPage.getToastElement();
  await expect(toastElement).toBeDisplayed();

  const toastText = await toastElement.getText();
  expect(toastText).toContain(expectedToast);
});

Then(/^the list changes by (-?\d+) items$/, async (expectedDelta: string) => {
  const delta = parseInt(expectedDelta);
  await reservationPage.listDelta(delta, initialListCount);

  // Update initial count for next scenario if needed
  if (delta !== 0) {
    initialListCount = await reservationPage.getListCount();
  }
});

// UI Verification Steps (without network monitoring)
Then(/^I should see the email input field$/, async () => {
  const emailInput = await $('[data-testid="input-email"]');
  await expect(emailInput).toBeDisplayed();
});

Then(/^I should see the adults input field$/, async () => {
  const adultsInput = await $('[data-testid="input-adults"]');
  await expect(adultsInput).toBeDisplayed();
});

Then(/^I should see the children input field$/, async () => {
  const childrenInput = await $('[data-testid="input-children"]');
  await expect(childrenInput).toBeDisplayed();
});

Then(/^I should see the submit button$/, async () => {
  const submitButton = await $('[data-testid="button-submit"]');
  await expect(submitButton).toBeDisplayed();
});

Then(/^the email field should contain "([^"]*)"$/, async (expectedValue: string) => {
  const emailInput = await $('[data-testid="input-email"]');
  const value = await emailInput.getValue();
  expect(value).toBe(expectedValue);
});

Then(/^the adults field should contain "([^"]*)"$/, async (expectedValue: string) => {
  const adultsInput = await $('[data-testid="input-adults"]');
  const value = await adultsInput.getValue();
  expect(value).toBe(expectedValue);
});

Then(/^the children field should contain "([^"]*)"$/, async (expectedValue: string) => {
  const childrenInput = await $('[data-testid="input-children"]');
  const value = await childrenInput.getValue();
  expect(value).toBe(expectedValue);
});
