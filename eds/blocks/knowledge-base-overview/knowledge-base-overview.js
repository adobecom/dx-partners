import { getLibs, replaceText, getConfig } from './../../scripts/utils.js';
import { KnowledgeBaseOverview } from './KnowledgeBaseOverview.js';

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

  let localizedText = {
    '{{apply}}': 'Apply',
    '{{back}}': 'Back',
    '{{clear-all}}': 'Clear all',
    '{{filter}}': 'Filter',
    '{{filter-by}}': 'Filter by',
    '{{filters}}': 'Filters',
    '{{next}}': 'Next',
    '{{next-page}}': 'Next Page',
    '{{no-results-description}}': 'Try checking your spelling or broadening your search.',
    '{{no-results-title}}': 'No Results Found',
    '{{of}}': 'Of',
    '{{page}}': 'Page',
    '{{prev}}': 'Prev',
    '{{previous-page}}': 'Previous Page',
    '{{results}}': 'Results',
    '{{search}}': 'Search',
  };

  const deps = await Promise.all([
    localizationPromises(localizedText, config),
    import(`${miloLibs}/features/spectrum-web-components/dist/theme.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/search.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/checkbox.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/button.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/progress-circle.js`),
  ]);

  declareKnowledgeBaseOverview();

  const blockData = {
    'localizedText': localizedText,
    'tableData' : el.children,
    'cardsPerPage': 9,
    'ietf': config.locale.ietf,
    'collectionTags': '"caas:adobe-partners/collections/knowledge-base"'
  }

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
