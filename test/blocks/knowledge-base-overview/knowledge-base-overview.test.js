import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import init from './../../../eds/blocks/knowledge-base-overview/knowledge-base-overview.js';
import { PartnerCards } from "./../../../eds/components/PartnerCards.js";

const cardsString = await readFile({ path: './mocks/cards.json' });
const cards = JSON.parse(cardsString);

describe('knowledge-base-overview block', () => {
  beforeEach(async () => {
    sinon.stub(PartnerCards.prototype, 'fetchData').resolves({ cards });

    sinon.stub(PartnerCards.prototype, 'firstUpdated').callsFake(async function() {
      this.allCards = this.cards = cards;
      this.paginatedCards = this.cards.slice(0, 3);
      this.hasResponseData = true;
    });

    await import('./../../../eds/scripts/scripts.js');
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
  });

  afterEach(() => {
    PartnerCards.prototype.fetchData.restore();
    PartnerCards.prototype.firstUpdated.restore();
  });

  const setupAndCommonTest = async (windowWidth) => {
    Object.defineProperty(window, 'innerWidth', { value: windowWidth });

    const block = document.querySelector('.knowledge-base-overview');
    expect(block).to.exist;

    const component = await init(block);
    expect(component).to.exist;

    const knowledgeBaseWrapper = document.querySelector('.knowledge-base-overview-wrapper');
    expect(knowledgeBaseWrapper.shadowRoot).to.exist;
    const partnerCardsCollection = knowledgeBaseWrapper.shadowRoot.querySelector('.partner-cards-collection');
    expect(partnerCardsCollection).to.exist;
    expect(partnerCardsCollection.innerHTML).to.include('news-card');
    const firstCard = partnerCardsCollection.querySelector('.card-wrapper');
    expect(firstCard.shadowRoot).to.exist;
    const searchBarWrapper = knowledgeBaseWrapper.shadowRoot.querySelector('.partner-cards-sidebar .search-wrapper');
    expect(searchBarWrapper.shadowRoot).to.exist;
    const spectrumSearch = searchBarWrapper.querySelector('#search');
    expect(spectrumSearch.shadowRoot).to.exist;
    const paginationWrapper = knowledgeBaseWrapper.shadowRoot.querySelector('.partner-cards-content .pagination-wrapper');
    expect(paginationWrapper).to.exist;
    const paginationPrevBtn = knowledgeBaseWrapper.shadowRoot.querySelector('.partner-cards-content .pagination-wrapper .pagination-prev-btn');
    expect(paginationPrevBtn).to.exist;
    const firstPageBtn = knowledgeBaseWrapper.shadowRoot.querySelector('.partner-cards-content .pagination-wrapper .page-btn');
    expect(firstPageBtn).to.exist;
    const paginationNextBtn = knowledgeBaseWrapper.shadowRoot.querySelector('.partner-cards-content .pagination-wrapper .pagination-next-btn');
    expect(paginationNextBtn).to.exist;
    const sortWrapper = knowledgeBaseWrapper.shadowRoot.querySelector('.partner-cards-content .sort-wrapper');
    expect(sortWrapper).to.exist;
    const firstSortItem = sortWrapper.querySelector('.sort-list .sort-item');
    expect(firstSortItem).to.exist;

    return { knowledgeBaseWrapper };
  };

  it('should have shadow root and render partner cards for mobile', async () => {
    const { knowledgeBaseWrapper } = await setupAndCommonTest(500);

    const filtersBtn = knowledgeBaseWrapper.shadowRoot.querySelector('.filters-btn-mobile');
    expect(filtersBtn).to.exist;
    const filtersWrapper = knowledgeBaseWrapper.shadowRoot.querySelector('.all-filters-wrapper-mobile');
    expect(filtersWrapper).to.exist;
    const firstFilter = filtersWrapper.querySelector('.filter-wrapper-mobile');
    expect(firstFilter).to.exist;
  });
  it('should have shadow root and render partner cards for desktop', async () => {
    const { knowledgeBaseWrapper } = await setupAndCommonTest(1500);

    const sidebarFiltersWrapper = knowledgeBaseWrapper.shadowRoot.querySelector('.sidebar-filters-wrapper');
    expect(sidebarFiltersWrapper).to.exist;
    const firstFilter = sidebarFiltersWrapper.querySelector('.filter');
    expect(firstFilter).to.exist;
  });
});
