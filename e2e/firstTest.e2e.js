describe('Onboarding flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('shows the welcome screen', async () => {
    await expect(element(by.id('onboarding-welcome-screen'))).toBeVisible();
    await expect(element(by.id('onboarding-start-button'))).toBeVisible();
  });
});
