import { getLibs } from '../scripts/utils.js';
import { partnerCardsStyles, newsCardStyles } from './PartnerCardsStyles.js';
const miloLibs = getLibs();
const { html, LitElement, css, repeat } = await import (`${miloLibs}/deps/lit-all.min.js`);

function formatDate(cardDate) {
  if (!cardDate) return;

  const dateObject = new Date(cardDate);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  const formattedDate = dateObject.toLocaleString('en-US', options);
  return formattedDate;
}

class NewsCard extends LitElement {
  static properties = {
    data: { type: Object }
  };

  static styles = newsCardStyles;

  render() {
    return html`
      <div class="news-card">
        <div class="card-header" style="background-image: url('${this.data.styles?.backgroundImage}')" alt="${this.data.styles?.backgroundAltText}"></div>
        <div class="card-content">
          <div class="card-text">
            <p class="card-title">${this.data.contentArea?.title}</p>
            <p class="card-description">${this.data.contentArea?.description}</p>
          </div>
          <div class="card-footer">
            <span class="card-date">${formatDate(this.data.cardDate)}</span>
            <a class="card-btn" href="${this.data.contentArea?.url}">${this.data.footer[0]?.right[0]?.text}</a>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('news-card', NewsCard);

export class PartnerCards extends LitElement {
  static styles = css`
    ${partnerCardsStyles}
    #search {
      width: 100%;
    }
  `;

  static properties = {
    blockData: { type: Object },
    cards: { type: Array },
    paginatedCards: { type: Array },
    searchTerm: { type: String },
    paginationCounter: { type: Number },
    selectedSortOrder: { type: Object },
    selectedFilters: { type: Object },
    urlSearchParams: { type: Object },
    mobileView: { type: Boolean }
  };

  constructor() {
    super();
    this.allCards = [];
    this.cards = [];
    this.paginatedCards = [];
    this.searchTerm = '';
    this.paginationCounter = 1;
    this.cardsPerPage = 3;
    this.selectedSortOrder = {};
    this.selectedFilters = {};
    this.urlSearchParams = {};
    this.mobileView = window.innerWidth <= 1200;
    this.updateView = this.updateView.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.updateView);
  }

  updateView() {
    this.mobileView = window.innerWidth <= 1200;
  }

  async firstUpdated() {
    await super.firstUpdated();
    await this.fetchData();
    if (this.blockData.filters.length) this.initUrlSearchParams();
    if (this.blockData.sort.items.length) this.selectedSortOrder = this.blockData.sort.default;
  }

  async fetchData() {
    try {
      const response = await fetch('https://14257-chimera-stage.adobeioruntime.net/api/v1/web/chimera-0.0.1/collection?originSelection=dx-partners&contentTypeTags=&secondSource=&secondaryTags=&collectionTags=&excludeContentWithTags=&language=en&country=US&complexQuery=&excludeIds=&currentEntityId=&featuredCards=&environment=&draft=false&size=&debug=true&flatFile=false&expanded=true');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const apiData = await response.json();
      if (apiData?.cards) {
        apiData.cards.forEach((card, index) => card.orderNum = index + 1);
        this.allCards = this.cards = apiData.cards;
        this.paginatedCards = this.cards.slice(0, this.cardsPerPage);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  initUrlSearchParams () {
    const { search } = location || window.location;
    this.urlSearchParams = new URLSearchParams(search);

    if (this.urlSearchParams.has('filters', 'yes')) {
      this.blockData.filters = this.blockData.filters.map((filter) => {
        if (this.urlSearchParams.has(filter.key)) {
          const filtersSearchTags = this.urlSearchParams.get(filter.key).split(',');

          filtersSearchTags.forEach(searchTag => {
            const filterTag = filter.tags.find(tag => tag.key === searchTag);
            if (filterTag) {
              filterTag.checked = true;
              this.selectedFilters = {
                ...this.selectedFilters,
                [filter.key]: [...(this.selectedFilters[filter.key] || []), filterTag]
              };
            }
          })
        }
        return filter;
      })
      this.handleActions();
    }
  }

  get partnerCards() {
    if (this.paginatedCards.length) {
      return html`${repeat(
        this.paginatedCards,
        (card) => card.id,
        (card) => html`<news-card class="card-wrapper" .data=${card}></news-card>`,
      )}`;
    } else {
      return html`<div class="no-results">
        <strong class="no-results-title">${this.blockData.localizedText['{{no-results-title}}']}</strong>
        <p class="no-results-description">${this.blockData.localizedText['{{no-results-description}}']}</p>
      </div>`
    }
  }

  get sortItems() {
    if (!this.blockData.sort.items.length) return;

    return html`${repeat(
      this.blockData.sort.items,
      (item) => item.key,
      (item) => html`<button
        class="sort-item ${this.selectedSortOrder.key === item.key ? 'selected' : ''}"
        value="${item.key}"
        @click="${() => this.handleSort(item)}">
        ${item.value}
      </button>`,
    )}`;
  }

  get pagination() {}

  get cardsCounter() {
    if (!this.paginatedCards.length) {
      return 0;
    }

    const { orderNum: firstElOrderNum } = this.paginatedCards[0];
    const lastIndex = this.paginatedCards.length - 1;
    const { orderNum: lastElOrderNum } = this.paginatedCards[lastIndex];
    return `${firstElOrderNum} - ${lastElOrderNum}`;
  }

  get filters() {
    if (!this.blockData.filters.length) return;

    return html`${repeat(
      this.blockData.filters,
      (filter) => filter.key,
      (filter) => {
        const selectedTagsData = this.countSelectedTags(filter.key);
        const tagsCount = selectedTagsData.tagsCount;

        return html`
          <div class="filter">
            <button class="filter-header" @click=${(e) => this.toggleFilter(e.currentTarget.parentNode)} aria-label="${filter.value}">
              <span class="filter-label">${filter.value}</span>
              <span class="filter-chevron-icon" />
            </button>
            <button class="filter-selected-tags-count-btn ${tagsCount ? '' : 'hidden'}" @click="${(e) => this.handleResetTags(filter.key)}" aria-label="${tagsCount}">
              <span class="filter-selected-tags-total-num">${tagsCount}</span>
            </button>
            <ul class="filter-list">
              <sp-theme theme="spectrum" color="light" scale="medium">
                ${this.getTagsByFilter(filter)}
              </sp-theme>
            </ul>
          </div>`
      }
    )}`;
  }

  get filtersMobile() {
    if (!this.blockData.filters.length) return;

    return html`${repeat(
      this.blockData.filters,
      (filter) => filter.key,
      (filter) => {
        const selectedTagsData = this.countSelectedTags(filter.key);
        const tagsString = selectedTagsData.tagsString;
        const tagsCount = selectedTagsData.tagsCount;

        return html`
          <div class="filter-wrapper-mobile">
            <div class="filter-mobile">
              <button class="filter-header-mobile" @click=${(e) => this.toggleFilter(e.target.closest('.filter-wrapper-mobile'))} aria-label="${filter.value}">
                <div class="filter-header-content-mobile">
                  <h3 class="filter-header-name-mobile">${filter.value}</h3>
                  ${tagsCount
                    ? html `
                      <div class="filter-header-selected-tags-mobile">
                        <span class="filter-header-selected-tags-text-mobile">${tagsString}</span>
                        <span class="filter-header-selected-tags-count-mobile">+ ${tagsCount}</span>
                      </div>
                    `
                    : ''
                  }
                </div>
                <span class="filter-header-chevron-icon" />
              </button>
              <ul class="filter-tags-mobile">
                <sp-theme theme="spectrum" color="light" scale="medium">
                  ${this.getTagsByFilter(filter)}
                </sp-theme>
              </ul>
              <div class="filter-footer-mobile-wrapper">
                <div class="filter-footer-mobile">
                  <span class="filter-footer-results-mobile">${this.cards?.length} ${this.blockData.localizedText['{{results}}']}</span>
                  <div class="filter-footer-buttons-mobile">
                    <button class="filter-footer-clear-btn-mobile" @click="${(e) => this.handleResetTags(filter.key)}" aria-label="${this.blockData.localizedText['{{clear-all}}']}">${this.blockData.localizedText['{{clear-all}}']}</button>
                    <sp-theme theme="spectrum" color="light" scale="medium">
                      <sp-button @click=${(e) => this.toggleFilter(e.target.closest('.filter-wrapper-mobile'))} aria-label="${this.blockData.localizedText['{{apply}}']}">${this.blockData.localizedText['{{apply}}']}</sp-button>
                    </sp-theme>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      }
    )}`;
  }

  get chosenFilters() {
    const extractedTags = Object.values(this.selectedFilters).flatMap(tagsArray => tagsArray);
    if (!extractedTags.length) return;

    const htmlContent = html`${repeat(
      extractedTags.sort((a, b) => a.value.localeCompare(b.value)),
      (tag) => tag.key,
      (tag) => html`
        <button class="sidebar-chosen-filter-btn" @click="${(e) => this.handleRemoveTag(tag)}" aria-label="${tag.value}">
          ${tag.value}
        </button>`
    )}`;

    return { htmlContent, tagsCount: extractedTags.length };
  }

  getTagsByFilter(filter) {
    const tags = filter.tags;

    return html`${repeat(
      tags,
      (tag) => tag.key,
      (tag) => html`<li><sp-checkbox
        size="m" emphasized
        ?checked=${tag.checked}
        @change=${(event) => this.handleTag(event, tag, filter.key)}
      >
        ${tag.value}
      </sp-checkbox></li>`,
    )}`;
  }

  toggleSort() {
    const element = this.shadowRoot.querySelector('.sort-list');
    element.classList.toggle('expanded')
  }

  toggleFilter(clickedFilter) {
    clickedFilter.classList.toggle('expanded');
  }

  openFiltersMobile() {
    const element = this.shadowRoot.querySelector('.all-filters-wrapper-mobile');
    element.classList.add('open');
  }

  closeFiltersMobile() {
    const element = this.shadowRoot.querySelector('.all-filters-wrapper-mobile');
    element.classList.remove('open');
  }

  handleActions() {
    this.handleSearchAction();
    if (this.blockData.sort.items.length) this.handleSortAction();
    if (this.blockData.filters.length) this.handleFilterAction();
    this.additionalActions();
    this.cards.forEach((card, index) => card.orderNum = index + 1);
  }

  additionalActions() {}

  handleResetActions() {
    this.searchTerm = '';
    this.selectedFilters = {};
    this.blockData.filters.forEach(filter => {
      filter.tags.forEach(tag => tag.checked = false);
      this.urlSearchParams.delete(filter.key);
    });
    this.urlSearchParams.delete('filters');
    this.additionalResetActions();
    this.paginationCounter = 1;
    this.handleActions();
    this.handleUrlSearchParams();
  }

  additionalResetActions() {}

  handleSearchAction() {
    this.cards = this.allCards.filter((card) =>
      card.contentArea?.title.toLowerCase().includes(this.searchTerm) ||
      card.contentArea?.description.toLowerCase().includes(this.searchTerm)
    );
  }

  handleSearch(event){
    this.searchTerm = event.target.value.toLowerCase();

    this.paginationCounter = 1;
    this.handleActions();
  }

  handleSortAction() {
    const sortFunctions = {
      'newest': (a, b) => new Date(b.cardDate) - new Date(a.cardDate),
      'oldest': (a, b) => new Date(a.cardDate) - new Date(b.cardDate),
    };
    this.cards.sort(sortFunctions[this.selectedSortOrder.key]);
  }

  handleSort(selectedItem) {
    this.toggleSort();

    if (selectedItem.key !== this.selectedSortOrder.key) {
      this.selectedSortOrder = selectedItem;

      this.paginationCounter = 1;
      this.handleActions();
    }
  }

  handleFilterAction() {
    const selectedFiltersKeys = Object.keys(this.selectedFilters);

    if (selectedFiltersKeys.length) {
      this.cards = this.cards.filter((card) => {
        if (!card.arbitrary.length) return;

        let cardArbitraryArr = [...card.arbitrary];
        const firstObj = card.arbitrary[0];
        if (firstObj.hasOwnProperty('id') && firstObj.hasOwnProperty('version')) cardArbitraryArr = cardArbitraryArr.slice(1);

        return selectedFiltersKeys.every((key) =>
          cardArbitraryArr.some((arbitraryTag) => {
            if (key === arbitraryTag.key.toLowerCase()) {
              return this.selectedFilters[key].some((selectedTag) => selectedTag.key === arbitraryTag.value.toLowerCase());
            }
            return false;
          })
        )
      });
    } else {
      this.urlSearchParams.delete('filters');
    }
  }

  handleUrlSearchParams() {
    let url = new URL(window.location.href);

    const searchParamsString = this.urlSearchParams.toString();
    if (searchParamsString.length) {
      url.search = decodeURIComponent(searchParamsString);
    } else {
      url.search = '';
    }

    window.history.pushState({}, '', url);
  }

  handleTag(event, tag, filterKey) {
    if (!event.target.checked) {
      this.handleRemoveTag(tag);
      return;
    }

    tag.checked = true;

    if (this.selectedFilters[filterKey]) {
      this.selectedFilters = {
        ...this.selectedFilters,
        [filterKey]: [...this.selectedFilters[filterKey], tag]
      };

      let filterSearchValue = this.urlSearchParams.get(filterKey);
      filterSearchValue += ',' + tag.key;
      this.urlSearchParams.set(filterKey, filterSearchValue);
    } else {
      if (!Object.keys(this.selectedFilters).length) {
        this.urlSearchParams.append('filters', 'yes');
      }

      this.selectedFilters = {
        ...this.selectedFilters,
        [filterKey]: [tag]
      };

      this.urlSearchParams.append(filterKey, tag.key);
    }

    this.paginationCounter = 1;
    this.handleActions();
    this.handleUrlSearchParams();
  }

  handleRemoveTag(tag) {
    tag.checked = false;
    const { key: tagKey, parentKey: filterKey } = tag;

    const updatedFilterTags = [...this.selectedFilters[filterKey]].filter(filterTag => filterTag.key !== tagKey);

    if (updatedFilterTags.length) {
      this.selectedFilters = {
        ...this.selectedFilters,
        [filterKey]: updatedFilterTags
      };

      const filterSearchParams = this.urlSearchParams.get(filterKey).split(',');
      const updatedSearchFilterTags = filterSearchParams.filter(param => param !== tagKey);
      this.urlSearchParams.set(filterKey, updatedSearchFilterTags.toString());
    } else {
      const { [filterKey]: _removedKeyFilters, ...updatedSelectedFilters } = this.selectedFilters;
      this.selectedFilters = updatedSelectedFilters;
      this.urlSearchParams.delete(filterKey);
    }

    this.paginationCounter = 1;
    this.handleActions();
    this.handleUrlSearchParams();
  }

  handleResetTags(filterKey) {
    const { [filterKey]: _removedKeyFilters, ...updatedSelectedFilters } = this.selectedFilters;
    this.selectedFilters = {...updatedSelectedFilters};
    this.urlSearchParams.delete(filterKey);

    this.blockData.filters.forEach(filter => {
      if (filter.key === filterKey) {
        filter.tags.forEach((tag) => tag.checked = false)
      }
    });

    this.paginationCounter = 1;
    this.handleActions();
    this.handleUrlSearchParams();
  }

  countSelectedTags(filterKey) {
    if (!this.selectedFilters[filterKey]) {
      return {
        'tagsString': '',
        'tagsCount': 0
      };
    }

    const tags = [...this.selectedFilters[filterKey]].map(tag => tag.value);
    return {
      'tagsString': tags.join(', '),
      'tagsCount': tags.length
    };
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.updateView);
  }

  render() {
    return html`
      <div class="partner-cards">
        <div class="partner-cards-sidebar-wrapper">
          <div class="partner-cards-sidebar">
            <sp-theme class="search-wrapper" theme="spectrum" color="light" scale="medium">
              <sp-search id="search" size="m" value="${this.searchTerm}" @input="${this.handleSearch}" placeholder="${this.blockData.localizedText['{{search}}']}"></sp-search>
            </sp-theme>
            ${!this.mobileView
              ? html`
                <div class="sidebar-header">
                  <h3 class="sidebar-title">${this.blockData.localizedText['{{filter}}']}</h3>
                  <button class="sidebar-clear-btn" @click="${this.handleResetActions}" aria-label="${this.blockData.localizedText['{{clear-all}}']}">${this.blockData.localizedText['{{clear-all}}']}</button>
                </div>
                <div class="sidebar-chosen-filters-wrapper">
                  ${this.chosenFilters && this.chosenFilters.htmlContent}
                </div>
                <div class="sidebar-filters-wrapper">
                  ${this.filters}
                </div>
              `
              : ''
            }
          </div>
        </div>
        <div class="partner-cards-content">
          <div class="partner-cards-header">
            <div class="partner-cards-title-wrapper">
              <h3 class="partner-cards-title">${this.blockData.title}</h3>
              <span class="partner-cards-cards-results"><strong>${this.cards?.length}</strong> ${this.blockData.localizedText['{{results}}']}</span>
            </div>
            <div class="partner-cards-sort-wrapper">
              ${this.mobileView
                ? html `
                  <button class="filters-btn-mobile" @click="${this.openFiltersMobile}" aria-label="${this.blockData.localizedText['{{filters}}']}">
                    <span class="filters-btn-mobile-icon"></span>
                    <span class="filters-btn-mobile-title">${this.blockData.localizedText['{{filters}}']}</span>
                    ${this.chosenFilters?.tagsCount
                      ? html `
                        <span class="filters-btn-mobile-total">${this.chosenFilters.tagsCount}</span>
                      `
                      : ''
                    }
                  </button>
                `
                : ''
              }
              <div class="sort-wrapper">
                <button class="sort-btn" @click="${this.toggleSort}">
                  <span class="sort-btn-text">${this.selectedSortOrder.value}</span>
                  <span class="filter-chevron-icon" />
                </button>
                <div class="sort-list">
                  ${this.sortItems}
                </div>
              </div>
              
            </div>
          </div>
          <div class="partner-cards-collection">
            ${this.allCards.length
              ? this.partnerCards
              : html`
                <div class="progress-circle-wrapper">
                  <sp-theme theme="spectrum" color="light" scale="medium">
                    <sp-progress-circle label="Cards loading" indeterminate="" size="l" role="progressbar"></sp-progress-circle>
                  </sp-theme>
                </div>
              `
            }
          </div>
          ${this.cards.length
            ? html`
              <div class="pagination-wrapper">
                ${this.pagination}
                <span class="pagination-total-results">${this.cardsCounter} ${this.blockData.localizedText['{{of}}']} ${this.cards.length} ${this.blockData.localizedText['{{results}}']}</span>
              </div>
            `
            : ''
            }
        </div>
      </div>

      ${this.mobileView
        ? html `
          <div class="all-filters-wrapper-mobile">
            <div class="all-filters-header-mobile">
              <button class="all-filters-header-back-btn-mobile" @click="${this.closeFiltersMobile}" aria-label="${this.blockData.localizedText['{{back}}']}"></button>
              <span class="all-filters-header-title-mobile">${this.blockData.localizedText['{{filter-by}}']}</span>
            </div>
            <div class="all-filters-list-mobile">
              ${this.filtersMobile}
            </div>
            <div class="all-filters-footer-mobile">
              <span class="all-filters-footer-results-mobile">${this.cards?.length} ${this.blockData.localizedText['{{results}}']}</span>
              <div class="all-filters-footer-buttons-mobile">
                <button class="all-filters-footer-clear-btn-mobile" @click="${this.handleResetActions}" aria-label="${this.blockData.localizedText['{{clear-all}}']}">${this.blockData.localizedText['{{clear-all}}']}</button>
                <sp-theme theme="spectrum" color="light" scale="medium">
                  <sp-button @click="${this.closeFiltersMobile}" aria-label="${this.blockData.localizedText['{{apply}}']}">${this.blockData.localizedText['{{apply}}']}</sp-button>
                </sp-theme>
              </div>
            </div>
          </div>
        `
        : ''
      }
    `;
  }
}