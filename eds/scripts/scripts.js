/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {prodHosts, setLibs} from './utils.js';

function updateImsRedirectUrl() {
  // Program will be extracted from url (solutionpartner, technologypartners etc.) and idea is for default to be eg. /solutionpartners/
  // Just in case that metadata is not authored we redirect user to the programs home public page
  let target = '/solutionpartners/drafts/ratko/public-page'
  // Based on the user status, set redirection uri
  // This url is where user will be redirected after he finishes with IMS flow (login or logout)
  if (window.adobeIMS.isSignedInUser()) {
    target = document.querySelector('meta[name="adobe-target-after-logout"]')?.content ?? target;
  } else {
    target = document.querySelector('meta[name="adobe-target-after-login"]')?.content;
  }

  window.adobeIMS.adobeIdData.redirect_uri = window.location.origin + target;
}

// If we move adobe-target-after-login from runtime
// Redirect user if he is logged in, based on partner_data cookie and adobe-target-after-login metadata is authored
(function afterLoginRedirect() {
  const cookies = {};
  // Find better solution if there is
  document.cookie?.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    cookies[name] = value;
  });

  if (cookies['partner_data']) {
    // Check if user is member of the program based on partner_data cookie and pathname
    const memberOfProgram = true;
    const target = document.querySelector('meta[name="adobe-target-after-login"]')?.content;
    if (target && target !== window.location.pathname && memberOfProgram) {
      window.location.assign(window.location.origin + target);
    }
  }
}());

// Add project-wide style path here.
const STYLES = '';

// Use 'https://milo.adobe.com/libs' if you cannot map '/libs' to milo's origin.
const LIBS = '/libs';



const imsClientId = prodHosts.includes(window.location.host) ? 'MILO_PARTNERS_PROD' : 'MILO_PARTNERS_STAGE';

// Add any config options.
const CONFIG = {
  codeRoot: '/eds',
  contentRoot: '/eds/partners-shared',
  imsClientId: imsClientId,
  // geoRouting: 'off',
  // fallbackRouting: 'off',
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
    kr: { ietf: 'ko-KR', tk: 'zfo3ouc' },
  },
};

(function removeAccessToken() {
  if (window.location.hash.startsWith('#access_token')) {
    window.location.hash = '';
  }
}());

// Load LCP image immediately
(function loadLCPImage() {
  const lcpImg = document.querySelector('img');
  lcpImg?.removeAttribute('loading');
}());

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

const miloLibs = setLibs(LIBS);

(function loadStyles() {
  const paths = [`${miloLibs}/styles/styles.css`];
  if (STYLES) { paths.push(STYLES); }
  paths.forEach((path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  });
}());

(async function loadPage() {
  const { loadArea, setConfig } = await import(`${miloLibs}/utils/utils.js`);

  setConfig({ ...CONFIG, miloLibs });
  await loadArea();

  // Wait for the ims lib to be loaded
  const loadIMS = setInterval(() => {
    if (window.adobeIMS) {
      clearInterval(loadIMS);
      updateImsRedirectUrl();
    }
  }, 500);
}());
