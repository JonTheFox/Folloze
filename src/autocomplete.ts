import {LitElement, html} from 'lit-element';
// @ts-ignore : TODO: add typing for demoData.js
import demoData from './mockData/demoData.js';

const MAX_MATCHES = 15;

// @ts-ignore: TODO: class typing
export class litAutocomplete extends LitElement {
  _inputEl: any; // can be null or an object of type HTMLElement
  _suggestionEl: any; // same as the comment above
  _highlightedEl: any; // same as the comment above
  _eventReferences: {
    onKeyUp: Function;
    onKeyDown: Function;
    onFocus: Function;
    onBlur: Function;
  };
  items: [];
  _matches = [];
  opened: Boolean;
  maxSuggestions: any; // TODO: add number type
  _blur: Boolean;
  _mouseEnter: Boolean;

  static override get properties() {
    return {
      options: {type: Array},
      opened: {type: Boolean, reflect: true},
      maxSuggestions: Number,
    };
  }

  get contentElement() {
    if (this._inputEl) {
      return this._inputEl;
    }

    // @ts-ignore: TODO: add typings
    // prettier-ignore
    const slotInputList: any = this.shadowRoot?.getElementById?.('dropdown-input')?.assignedNodes?.()?.[1];

    this._inputEl = slotInputList
      ? slotInputList
      : this.shadowRoot?.getElementById('defaultInput');

    return this._inputEl;
  }

  set options(_options: []) {
    this.items = _options;
  }

  constructor() {
    super();
    this._eventReferences = {
      onBlur: () => {},
      onFocus: () => {},
      onKeyUp: () => {},
      onKeyDown: () => {},
    };
    this._matches = [];
    this.items = demoData.map((text: String) => ({text, value: text}));
    this.opened = false;
    this.maxSuggestions = MAX_MATCHES;
    this._inputEl = {};
    this._suggestionEl = null;
    this._blur = true;
    this._mouseEnter = false;
  }

  override firstUpdated() {
    this._suggestionEl = this.shadowRoot?.getElementById?.('suggestions');
    this._suggestionEl.style.width =
      this.contentElement.getBoundingClientRect().width - 4 + 'px';

    this._suggestionEl.onclick = this._onItemClick.bind(this);

    this._eventReferences.onFocus = this._onFocus.bind(this);
    this._eventReferences.onBlur = this._onBlur.bind(this);

    this._eventReferences.onKeyDown = this._onKeyDown.bind(this);
    this._eventReferences.onKeyUp = this._onKeyUp.bind(this);

    // attach the event listeners
    this.contentElement.addEventListener(
      'focus',
      this._eventReferences.onFocus
    );
    this.contentElement.addEventListener('blur', this._eventReferences.onBlur);

    this.contentElement.addEventListener(
      'keydown',
      this._eventReferences.onKeyDown
    );

    // @ts-ignore : TODO: fix typing of this._eventReferences.onKeyUp
    window.addEventListener('keyup', this._eventReferences.onKeyUp);
  }

  override updated(changed: {has: Function}) {
    if (
      changed.has('opened') &&
      this.opened &&
      this._suggestionEl.childElementCount
    ) {
      for (let item of this._suggestionEl.children) {
        item.classList.remove('active');
      }
      this._highlightedEl = this._suggestionEl.children[0];
      this._highlightedEl.classList.add('active');
    }
  }

  override disconnectedCallback() {
    if (!this.contentElement) {
      return;
    }

    this.contentElement.removeEventListener(
      'keydown',
      this._eventReferences.onKeyDown
    );
    this.contentElement.removeEventListener(
      'keyup',
      this._eventReferences.onKeyUp
    );
    this.contentElement.removeEventListener(
      'focus',
      this._eventReferences.onFocus
    );
    this.contentElement.removeEventListener(
      'blur',
      this._eventReferences.onBlur
    );
  }

  ////////////////////////////////////
  //Events
  ////////////////////////////////////

  _onKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
      ev.preventDefault();
      ev.stopPropagation();
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  _onKeyUp(ev: KeyboardEvent) {
    switch (ev.key) {
      case 'ArrowUp':
        ev.preventDefault();
        ev.stopPropagation();
        this._markPreviousElement();
        break;

      case 'ArrowDown':
        ev.preventDefault();
        ev.stopPropagation();

        this._markNextElement();
        break;

      case 'Enter':
        this._highlightedEl && this._highlightedEl.click();
        break;
      case 'Escape':
        this.close();
        break;
      default:
        const items = this.items;
        if (items.length) {
          let suggestions = this.getSuggestions();

          if (suggestions.length === 0) {
            suggestions = [];
            suggestions.push({
              value: null,
              text: 'Sorry, No matches',
              isNoMatchesText: true,
            });
          }

          this.suggest(suggestions);
        }
    }
  }

  _markPreviousElement() {
    if (!this._highlightedEl || !this._highlightedEl.previousElementSibling) {
      return;
    }

    this._highlightedEl.classList.remove('active');
    this._highlightedEl = this._highlightedEl.previousElementSibling;
    this._highlightedEl.classList.add('active');
  }

  _markNextElement() {
    if (!this._highlightedEl || !this._highlightedEl.nextElementSibling) {
      return;
    }

    this._highlightedEl.classList.remove('active');
    this._highlightedEl = this._highlightedEl.nextElementSibling;
    this._highlightedEl.classList.add('active');
  }

  _onFocus() {
    this._blur = false;
    this._matches.length && this.open();
  }

  _onBlur() {
    this._blur = true;
    !this._mouseEnter && this.close();
  }

  _onItemClick() {
    this._mouseEnter = true;
  }

  _handleItemMouseEnter() {
    this._mouseEnter = true;
  }

  _handleItemMouseLeave() {
    this._mouseEnter = false;
    this._blur && this.close();
  }

  ////////////////////////////////////
  //Methods
  ////////////////////////////////////

  getSuggestions() {
    const items = this.items;
    if (!items.length) return [];

    const searchTerm = this.contentElement.value;
    const maxSuggestions = this.maxSuggestions;

    let suggestions = [];
    suggestions =
      searchTerm &&
      items
        .filter(
          (item: any) =>
            item.text
              .replace(',', '')
              .replace(/\s/g, '')
              .toLowerCase()
              .search(
                searchTerm.replace(',', '').replace(/\s/g, '').toLowerCase()
              ) != -1
        )
        .slice(0, maxSuggestions); // Limit results
    return suggestions;
  }

  open() {
    if (this._matches.length) {
      this.opened = true;
    }
  }

  close() {
    this.opened = false;
    this._highlightedEl = null;
  }

  suggest(suggestions: []) {
    this._matches = suggestions || [];
    this._matches.length ? this.open() : this.close();
    this.requestUpdate();
  }

  autocomplete(value: String, text: String) {
    this.contentElement.value = value;

    this.close();

    this.dispatchEvent(
      new CustomEvent('selected-autocomplete', {
        detail: {value, text},
        composed: true,
        bubbles: true,
      })
    );
  }

  override render() {
    return html`
      <style>
        #suggestions {
          position: absolute;
          margin: 6px auto;
          background: transparent;
          margin-top: 6px;
          padding: 0;
          left: 0;
          z-index: 5000;
          list-style-type: none;
          max-width: 100%;
          border-radius: 6px;
          box-shadow: 0 10px 16px 0 rgb(0 0 0 / 20%),
            0 6px 20px 0 rgb(0 0 0 / 19%);
        }

        #suggestions.dropdown-is-shown {
          display: block;
        }
        #suggestions.dropdown-is-hidden {
          display: none;
        }

        li.suggestion {
          transition: all 0.1s;
          padding: 10px;
          margin: 4px;
          border-radius: 8px;
          width: 100%;
        }

        li.no-matches {
          padding: 8px;
          background: white;
        }

        li .matching-char {
          background: yellow;
        }

        .glass {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        li.suggestion.active {
          background: white;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: black;
          opacity: 1;
        }

        li.suggestion:hover {
          font-weight: bold;
        }

        [hidden] {
          display: none;
        }
      </style>

      <slot id="dropdown-input">
        <input id="defaultInput" type="text" />
      </slot>

      <ul
        id="suggestions"
        class=${this.opened ? 'dropdown-is-shown' : 'dropdown-is-hidden'}
        @mouseenter=${this._handleItemMouseEnter}
        @mouseleave=${this._handleItemMouseLeave}
      >
        ${this._matches.map((matchingItem: any) => {
          const className = `${
            matchingItem.isNoMatchesText ? 'no-matches' : 'suggestion'
          }`;

          const searchTerm = this._inputEl.value;
          const matchingItemText = matchingItem.text;
          const matchingItemChars = [];
          const markedMatchingChars: any[] = [];
          // convert {value: "a", text: "a"} to "a"
          for (
            let charIndexInMatchingItem = 0;
            charIndexInMatchingItem < matchingItemText.length;
            charIndexInMatchingItem++
          ) {
            const currentMatchingItemChar =
              matchingItemText[charIndexInMatchingItem];
            matchingItemChars.push(currentMatchingItemChar);
          }

          // loop over the matchingItemsChars
          // to find which chars are in the search term
          matchingItemChars.map(
            (charInMatchingItem: String, charInMatchingItemIndex: Number) => {
              // @ts-ignore : TODO: find out why a number can't be used as an index for an array items
              const charInSearchTerm = searchTerm[charInMatchingItemIndex];

              markedMatchingChars.push({
                // @ts-ignore : TODO: find out why a number can't be used as an index for an array items
                char: charInMatchingItem,
                isMatching:
                  charInSearchTerm?.toLowerCase?.() ===
                  charInMatchingItem?.toLowerCase?.(),
              });
            }
          );

          return html`
            <li
              class=${className}
              @click=${() => {
                console.log(matchingItem);
                return this.autocomplete(
                  matchingItem.value ? matchingItem.value : null,
                  ''
                );
              }}
            >
              <span class="suggestion--text matching">
                ${markedMatchingChars.map(({char, isMatching}) => {
                  if (!isMatching) return html`${char}`;
                  return html`<span class="matching-char">${char}</span>`;
                })}
              </span>
            </li>
          `;
        })}
      </ul>
    `;
  }
}

window.customElements.define('lit-autocomplete', litAutocomplete);
