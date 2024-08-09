import { getCaasUrl, getLibs } from '../../scripts/utils.js';
import { replaceText, getConfig, populateLocalizedTextFromListItems } from '../utils/utils.js';
import KnowledgeBaseOverview from './KnowledgeBaseOverview.js';

function declareKnowledgeBaseOverview() {
  if (customElements.get('knowledge-base-overview')) return;
  customElements.define('knowledge-base-overview', KnowledgeBaseOverview);
}

async function localizationPromises(localizedText, config) {
  return Promise.all(Object.keys(localizedText).map(async (key) => {
    const value = await replaceText(key, config);
    if (value.length) localizedText[key] = value;
  }));
}

export default async function init(el) {
  performance.mark('knowledge-base-overview:start');

  const miloLibs = getLibs();
  const config = getConfig();

  const sectionIndex = el.parentNode.getAttribute('data-idx');

  const localizedText = {
    '{{apply}}': 'Apply',
    '{{back}}': 'Back',
    '{{clear-all}}': 'Clear all',
    '{{current-month}}': 'Current month',
    '{{date}}': 'Date',
    '{{filter}}': 'Filter',
    '{{filter-by}}': 'Filter by',
    '{{filters}}': 'Filters',
    '{{last-6-months}}': 'Last 6 months',
    '{{next}}': 'Next',
    '{{next-page}}': 'Next Page',
    '{{load-more}}': 'Load more',
    '{{no-results-description}}': 'Try checking your spelling or broadening your search.',
    '{{no-results-title}}': 'No Results Found',
    '{{of}}': 'Of',
    '{{page}}': 'Page',
    '{{prev}}': 'Prev',
    '{{previous-month}}': 'Previous month',
    '{{previous-page}}': 'Previous Page',
    '{{results}}': 'Results',
    '{{search}}': 'Search',
    '{{show-all}}': 'Show all',
  };

  populateLocalizedTextFromListItems(el, localizedText);

  const deps = await Promise.all([
    localizationPromises(localizedText, config),
    import(`${miloLibs}/features/spectrum-web-components/dist/theme.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/search.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/checkbox.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/button.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/progress-circle.js`),
  ]);

  declareKnowledgeBaseOverview();

  const dateFilter = {
    key: 'date',
    value: localizedText['{{date}}'],
    tags: [
      { key: 'show-all', value: localizedText['{{show-all}}'], parentKey: 'date', checked: true, default: true },
      { key: 'current-month', value: localizedText['{{current-month}}'], parentKey: 'date', checked: false },
      { key: 'previous-month', value: localizedText['{{previous-month}}'], parentKey: 'date', checked: false },
      { key: 'last-6-months', value: localizedText['{{last-6-months}}'], parentKey: 'date', checked: false },
    ],
  };

  const block = {
    el,
    name: 'knowledge-base-overview',
    collectionTag: '"caas:adobe-partners/collections/knowledge-base"',
    ietf: config.locale.ietf
  }

  const blockData = {
    localizedText,
    tableData: el.children,
    dateFilter,
    cardsPerPage: 12,
    pagination: 'default',
    caasUrl: getCaasUrl(block)
  };

  const app = document.createElement('knowledge-base-overview');
  app.className = 'content knowledge-base-overview-wrapper';
  app.blockData = blockData;
  app.setAttribute('data-idx', sectionIndex);
  el.replaceWith(app);

  await deps;
  performance.mark('knowledge-base-overview:end');
  performance.measure('knowledge-base-overview block', 'knowledge-base-overview:start', 'knowledge-base-overview:end');
  return app;
}
