//1.
import {LitElement, html} from 'lit-element';

//2.
const MAX_MATCHES = 15;

//3.
const NO_RESULTS_MESSAGE_TIME = 5;

//4.
export class litAutocomplete extends LitElement {
  static get properties() {
    return {
      //5
      fulllist: {type: Array},
      opened: {type: Boolean, reflect: true},
      maxSuggestions: Number,
    };
  }

  //6.
  get contentElement() {
    //7.
    if (this._inputEl) {
      //8.
      return this._inputEl;
    }

    //9.
    var slotInputList = this.shadowRoot
      .getElementById('dropdown-input')
      .assignedNodes()[1];

    //10.
    this._inputEl = slotInputList
      ? slotInputList
      : this.shadowRoot.getElementById('defaultInput');

    //11.
    return this._inputEl;
  }

  //12.
  set fulllist(value) {
    //13.
    this.items = value;
  }

  //14.
  constructor() {
    //15.
    super();

    //16.
    this._eventReferences = {};

    //17.
    this._matches = [];

    //18.
    this.items = [];

    //19.
    this.opened = false;

    //20.
    this.maxSuggestions = MAX_MATCHES;
  }

  //21.
  firstUpdated() {
    this._suggestionEl = this.shadowRoot.getElementById('suggestions');
    this._suggestionEl.style.width =
      this.contentElement.getBoundingClientRect().width + 'px';

    //22.
    this._eventReferences.onFocus = this._onFocus.bind(this);
    this._eventReferences.onBlur = this._onBlur.bind(this);

    this._eventReferences.onKeyDown = this._onKeyDown.bind(this);
    this._eventReferences.onKeyUp = this._onKeyUp.bind(this);

    //23.
    this.contentElement.addEventListener(
      'focus',
      this._eventReferences.onFocus
    );
    this.contentElement.addEventListener('blur', this._eventReferences.onBlur);

    this.contentElement.addEventListener(
      'keydown',
      this._eventReferences.onKeyDown
    );
    this.contentElement.addEventListener(
      'keyup',
      this._eventReferences.onKeyUp
    );
  }

  //24.
  updated(changed) {
    console.log('updated!!');
    if (
      //25.
      changed.has('opened') &&
      this.opened &&
      this._suggestionEl.childElementCount
    ) {
      //26.
      for (let item of this._suggestionEl.children) {
        item.classList.remove('active');
      }
      this._highlightedEl = this._suggestionEl.children[0];
      this._highlightedEl.classList.add('active');
    }
  }

  //27.
  disconnectedCallback() {
    if (!this.contentElement) {
      //28.
      return;
    }

    //29.
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

  _onKeyDown(ev) {
    //30.
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  //31.
  _onKeyUp(ev) {
    switch (ev.key) {
      //32.
      case 'ArrowUp':
        ev.preventDefault();
        ev.stopPropagation();
        this._markPreviousElement();
        break;

      //33.
      case 'ArrowDown':
        ev.preventDefault();
        ev.stopPropagation();

        this._markNextElement();
        break;

      //34.
      case 'Enter':
        this._highlightedEl && this._highlightedEl.click();
        break;
      default:
        if (this.items.length) {
          var suggestions = [];
          var value = this.contentElement.value;

          suggestions =
            value &&
            this.items
              .filter(
                (item) =>
                  item.text
                    .replace(',', '')
                    .replace(/\s/g, '')
                    .toLowerCase()
                    .search(
                      value.replace(',', '').replace(/\s/g, '').toLowerCase()
                    ) != -1
              )

              //35.
              .slice(0, this.maxSuggestions); // Limit results

          //36.
          if (suggestions.length === 0) {
            suggestions = [];
            suggestions.push({value: null, text: 'Sorry, No matches'});
          }

          this.suggest(suggestions);
        }
    }
  }

  //37.
  _markPreviousElement() {
    if (!this._highlightedEl || !this._highlightedEl.previousElementSibling) {
      return;
    }

    this._highlightedEl.classList.remove('active');
    this._highlightedEl = this._highlightedEl.previousElementSibling;
    this._highlightedEl.classList.add('active');
  }

  //38.
  _markNextElement() {
    if (!this._highlightedEl || !this._highlightedEl.nextElementSibling) {
      return;
    }

    this._highlightedEl.classList.remove('active');
    this._highlightedEl = this._highlightedEl.nextElementSibling;
    this._highlightedEl.classList.add('active');
  }

  //39.
  _onFocus(ev) {
    console.log('on focus!');
    this._blur = false;
    this._matches.length && this.open();
  }

  //40.
  _onBlur(ev) {
    this._blur = true;
    !this._mouseEnter && this.close();
  }

  //41.
  _handleItemMouseEnter(ev) {
    this._mouseEnter = true;
  }

  //42.
  _handleItemMouseLeave(ev) {
    this._mouseEnter = false;
    //43.
    this._blur && setTimeout((_) => this.close(), 500);
  }

  ////////////////////////////////////
  //Methods
  ////////////////////////////////////

  //44.
  open() {
    console.log('open()');
    if (this._matches.length) {
      this.opened = true;
    }
  }

  //45.
  close() {
    console.log('close()');
    this.opened = false;
    this._highlightedEl = null;
  }

  //46.
  suggest(suggestions) {
    console.log('suggest');
    this._matches = suggestions || [];
    this._matches.length ? this.open() : this.close();
    this.requestUpdate();
  }

  //47.
  autocomplete(value, text) {
    this.contentElement.value = value;

    this.close();

    //48.
    this.dispatchEvent(
      new CustomEvent('selected-autocomplete', {
        detail: {value, text},
        composed: true,
        bubbles: true,
      })
    );
  }

  //49.
  render() {
    return html`
      <style>
        ul {
          position: absolute;
          margin: 0;
          padding: 0;
          z-index: 5000;
          background: white;
          display: block;
          list-style-type: none;
          width: 100% !important;
          border: 1px solid black;
        }

        li {
          padding: 10px;
        }

        li.active {
          background: gray;
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
        ?hidden=${!this.opened}
        @mouseenter=${this._handleItemMouseEnter}
        @mouseleave=${this._handleItemMouseLeave}
      >
        <!--50-->
        ${this._matches.map(
          (item) => html`
            <li
              @click=${(ev) =>
                this.autocomplete(item.text, item.value ? item.value : null)}
            >
              ${item.text}
            </li>
          `
        )}
      </ul>
    `;
  }
}

//51.
window.customElements.define('lit-autocomplete', litAutocomplete);
