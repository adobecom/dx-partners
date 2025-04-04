import { expect } from '@playwright/test';

export default class SmokeTest {
  constructor(page) {
    this.page = page;
    this.gnav = page.locator('.global-navigation.ready');
    this.contactUsLinkSP = page.locator('a[href*="/solution-partners/contact.html"]');
    this.findPartnerLinkSP = page.locator('a[href*="/s/directory/solution"]');
    this.learnMoreLinkSP = page.locator('a[href*="/solution-partners/about.html"]');
    this.contactUsLinkTP = page.locator('a[href*="/technologyprogram/experiencecloud/support.html"]');
    this.findPartnerLinkTP = page.locator('a[href*="/s/directory/technology"]');
    this.learnMoreLinkTP = page.locator('a[href*="/technologyprogram/experiencecloud/about.html"]');
    this.contactUsLinkAR = page.locator('a[href*="/en/apc-helpdesk"]');
    this.findPartnerLinkAR = page.locator('a[href*="/PartnerSearch?lang=en"]');
    this.learnMoreLinkAR = page.locator('a[href*="/na/channelpartners/program/"]');
    this.visitAdobeExchangeLink = page.locator('a[href*="https://stage.exchange.adobe.com/"]');
    this.joinNowLinkSP = page.locator('a[href*="/solution-partners/registration.html"]');
    this.joinNowLinkTP = page.locator('a[href*="/technologyprogram/experiencecloud/registration.html"]');
    this.joinNowLinkAR = page.locator('a[href*="/na/channelpartners/enrollment/"]');
    this.footer = page.locator('.global-footer');
  }

  async verifyStatusCode(url) {
    const response = await this.page.goto(url);
    if (!response || response.status() !== 200) {
      throw new Error(`Page failed to load. Status: ${response ? response.status() : "No response"}`);
    }
  }

  async verifyIfGnavIsPresent() {
    return await this.gnav.isVisible();
  }

  async verifyIfFooterIsPresent() {
    return await this.footer.isVisible();
  }

  async verifyPartnerDirectoryLinks(data, baseURL) {
    // Solution Partners - Contact Us
    await expect(this.contactUsLinkSP).toBeVisible();
    await expect(this.contactUsLinkSP).toHaveAttribute('href', data.contactUsSPURL);

    // Solution Partners - Find a partner
    await expect(this.findPartnerLinkSP).toBeVisible();
    await expect(this.findPartnerLinkSP).toHaveAttribute('href', `${baseURL}${data.findPartnerSPURL}`);

    // Solution Partners - Learn more
    await expect(this.learnMoreLinkSP).toBeVisible();
    await expect(this.learnMoreLinkSP).toHaveAttribute('href', data.learnMoreSPURL);

    // Technology Partners - Contact Us
    await expect(this.contactUsLinkTP).toBeVisible();
    await expect(this.contactUsLinkTP).toHaveAttribute('href', `${baseURL}${data.contactUsTPURL}`);

    // Technology Partners - Find a partner
    await expect(this.findPartnerLinkTP).toBeVisible();
    await expect(this.findPartnerLinkTP).toHaveAttribute('href', `${baseURL}${data.findPartnerTPURL}`);

    // Technology Partners - Learn more
    await expect(this.learnMoreLinkTP).toBeVisible();
    await expect(this.learnMoreLinkTP).toHaveAttribute('href', `${baseURL}${data.learnMoreTPURL}`);

    // Authorized Resellers - Contact Us
    await expect(this.contactUsLinkAR).toBeVisible();
    await expect(this.contactUsLinkAR).toHaveAttribute('href', data.contactUsLinkAR);

    // Authorized Resellers - Find a partner
    await expect(this.findPartnerLinkAR).toBeVisible();
    await expect(this.findPartnerLinkAR).toHaveAttribute('href', data.findPartnerLinkAR);

    // Authorized Resellers - Learn more
    await expect(this.learnMoreLinkAR).toBeVisible();
    await expect(this.learnMoreLinkAR).toHaveAttribute('href', `${baseURL}${data.learnMoreARURL}`);

    // Visit Adobe Exchange
    await expect(this.visitAdobeExchangeLink).toBeVisible();
    await expect(this.visitAdobeExchangeLink).toHaveAttribute('href', data.visitAdobeExchangeURL);
  }

  async verifyPartnerDirectoryJoinLinks(data, baseURL) {
    // Solution Partners - Learn more
    await expect(this.learnMoreLinkSP).toBeVisible();
    await expect(this.learnMoreLinkSP).toHaveAttribute('href', data.learnMoreSPURL);

    // Solution Partners - Join Now
    await expect(this.joinNowLinkSP).toBeVisible();
    await expect(this.joinNowLinkSP).toHaveAttribute('href', data.joinNowSPURL);

    // Technology Partners - Learn more
    await expect(this.learnMoreLinkTP).toBeVisible();
    await expect(this.learnMoreLinkTP).toHaveAttribute('href', `${baseURL}${data.learnMoreTPURL}`);

    // Technology Partners - Join Now
    await expect(this.joinNowLinkTP).toBeVisible();
    await expect(this.joinNowLinkTP).toHaveAttribute('href', `${baseURL}${data.joinNowTPURL}`);

    // Authorized Resellers - Learn more
    await expect(this.learnMoreLinkAR).toBeVisible();
    await expect(this.learnMoreLinkAR).toHaveAttribute('href', `${baseURL}${data.learnMoreARURL}`);

    // Authorized Resellers - Join Now
    await expect(this.joinNowLinkAR).toBeVisible();
    await expect(this.joinNowLinkAR).toHaveAttribute('href', `${baseURL}${data.joinNowARURL}`);
  }
}