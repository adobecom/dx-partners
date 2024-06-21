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

/**
 * The decision engine for where to get Milo's libs from.
 */
export const [setLibs, getLibs] = (() => {
  let libs;
  return [
    (prodLibs, location) => {
      libs = (() => {
        const { hostname, search } = location || window.location;
        // TODO: check if better ways are possible for partners.stage.adobe.com
        if (!(hostname.includes('.hlx.') || hostname.includes('local') || hostname === 'partners.stage.adobe.com')) return prodLibs;
        const branch = new URLSearchParams(search).get('milolibs') || 'main';
        if (branch === 'local') return 'http://localhost:6456/libs';
        return branch.includes('--') ? `https://${branch}.hlx.live/libs` : `https://${branch}--milo--adobecom.hlx.live/libs`;
      })();
      return libs;
    }, () => libs,
  ];
})();

export const prodHosts = [
  'main--dx-partners--adobecom.hlx.page',
  'main--dx-partners--adobecom.hlx.live',
  'partners.adobe.com'
];

/*
 * ------------------------------------------------------------
 * Edit above at your own risk.
 *
 * Note: This file should have no self-invoking functions.
 * ------------------------------------------------------------
 */

export async function useMiloSample() {
  const { createTag } = await import(`${getLibs()}/utils/utils.js`);
}

const miloLibs = setLibs('/libs');

const { createTag, localizeLink, getConfig } = await import(`${miloLibs}/utils/utils.js`);
export { createTag, localizeLink, getConfig };

const { replaceText } = await import(`${miloLibs}/features/placeholders.js`);
export { replaceText };
