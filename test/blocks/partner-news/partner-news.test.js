import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import init from './../../../eds/blocks/partner-news/partner-news.js';
import { PartnerCards } from "./../../../eds/components/PartnerCards.js";

const cardsString = await readFile({ path: './mocks/cards.json' });
const cards = JSON.parse(cardsString);

describe('partner-news block', () => {
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

    const block = document.querySelector('.partner-news');
    expect(block).to.exist;

    const component = await init(block);
    expect(component).to.exist;

    const partnerNewsWrapper = document.querySelector('.partner-news-wrapper');
    expect(partnerNewsWrapper.shadowRoot).to.exist;
    const partnerCardsCollection = partnerNewsWrapper.shadowRoot.querySelector('.partner-cards-collection');
    expect(partnerCardsCollection).to.exist;
    expect(partnerCardsCollection.innerHTML).to.include('news-card');
    const firstCard = partnerCardsCollection.querySelector('.card-wrapper');
    expect(firstCard.shadowRoot).to.exist;
    const searchBarWrapper = partnerNewsWrapper.shadowRoot.querySelector('.partner-cards-sidebar .search-wrapper');
    expect(searchBarWrapper.shadowRoot).to.exist;
    const spectrumSearch = searchBarWrapper.querySelector('#search');
    expect(spectrumSearch.shadowRoot).to.exist;
    const paginationWrapper = partnerNewsWrapper.shadowRoot.querySelector('.partner-cards-content .pagination-wrapper');
    expect(paginationWrapper).to.exist;
    const loadMoreBtn = partnerNewsWrapper.shadowRoot.querySelector('.partner-cards-content .pagination-wrapper .load-more-btn');
    expect(loadMoreBtn).to.exist;
    const sortWrapper = partnerNewsWrapper.shadowRoot.querySelector('.partner-cards-content .sort-wrapper');
    expect(sortWrapper).to.exist;
    const firstSortItem = sortWrapper.querySelector('.sort-list .sort-item');
    expect(firstSortItem).to.exist;

    return { partnerNewsWrapper };
  };

  it('should have shadow root and render partner cards for mobile', async () => {
    const { partnerNewsWrapper } = await setupAndCommonTest(500);

    const filtersBtn = partnerNewsWrapper.shadowRoot.querySelector('.filters-btn-mobile');
    expect(filtersBtn).to.exist;
    const filtersWrapper = partnerNewsWrapper.shadowRoot.querySelector('.all-filters-wrapper-mobile');
    expect(filtersWrapper).to.exist;
    const firstFilter = filtersWrapper.querySelector('.filter-wrapper-mobile');
    expect(firstFilter).to.exist;
  });
  it('should have shadow root and render partner cards for desktop', async () => {
    const { partnerNewsWrapper } = await setupAndCommonTest(1500);

    const sidebarFiltersWrapper = partnerNewsWrapper.shadowRoot.querySelector('.sidebar-filters-wrapper');
    expect(sidebarFiltersWrapper).to.exist;
    const firstFilter = sidebarFiltersWrapper.querySelector('.filter');
    expect(firstFilter).to.exist;
  });
});
