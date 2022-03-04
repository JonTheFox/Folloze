/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

const MAX_MATCHES = 15;
const MAX_SUGGESTIONS = 3;
const NO_RESULTS_MESSAGE_TIME = 5;

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
  `;

  constructor() {
    super();
      debugger;
    this._eventReferences = {};
    this._matches = [];
    this.items = [];
    this.opened = false;
    this.maxSuggestions = MAX_MATCHES;
  }

  //
  // methods
  //

  // called after the element's DOM has been updated the first time,
  // immediately before the "updated" method is called.
  firstUpdated() {
    debugger;
    this.suggestionEl = this.shadowRoot?.getElementById('suggestions');
    this.suggestionEl.style.width =
      this.contentElements.getBoundingClientRect().width + 'px';

    // add our event handlers, found in the _eventReferences field, to keyboard events
    // this will allow us to remove them later
    this._eventReferences.onFocus = this._onFocus.bind(this);
    this._eventReferences.onBlur = this._onBlur.bind(this);
    this._eventReferences.onKeyDown = this._onKeyDown.bind(this);
    this._eventReferences.onKeyUp = this._onKeyUp.bind(this);

    // attach the event listeners to the DOM elements
    this.contentElement.addEventListener(
      'focus',
      'this._eventReferences.onFocus'
    );
    this.contentElement.addEventListener(
      'blur',
      'this._eventReferences.onBlur'
    );
    this.contentElement.addEventListener(
      'keydown',
      'this._eventReferences.onKeyDown'
    );
    this.contentElement.addEventListener(
      'keyup',
      'this._eventReferences.onKeyUp'
    );
  }

  //called when the element's DOM has been updated and rendered. We implement this to perform some tasks after an update.
  updated(changed) {
     debugger;
    // if the dropdown is open and we have a list of suggestions
    if (
      changed.has('opened') &&
      this.opened &&
      this._suggestionEl.childElementCount
    ) {
      // remove the 'active' class from the suggestions (they might have been ssigned this class previously)
      for (let item of this._suggestionEl.children) {
        item.classList.remove('active');
      }
      // add the 'active' class to the first suggested item
      this._highlightedEl = this._suggestionEl.children[0];
      this._highlightedEl.classList.add('active');
    }
  }

  // invoked when a component is removed from the document's DOM
  disconnectedCallback() {
     debugger;
    if (!this.contentElement) {
      // no events to remove
      return;
    }

    //remove our event listeners
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

  _onKeyDown(ev) {
     debugger;
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
      // tell the user agent that if the event does not get excplicitly handled, its default value will not be taken as it as normally would be.
      ev.preventDefault();
      // prevent further propagating the current event in the capturing and bubbling phases.
      ev.stopPropagation();
    }
  }

  _onKeyUp(ev) {
     debugger;
    switch (ev.key) {
      case 'ArrowUp':
        ev.preventDefault();
        ev.stopPropagation();
        // highlight the previous element of the suggestion list
        this._markPreviousElement();
        break;
      case 'ArrowDown':
        ev.preventDefault();
        ev.stopPropagation();
        // highlight the following element of the suggestion list
        this._markPreviousElement();
        break;
      case 'Enter':
        // if there is a highlighted element, invoke a click on it
        this._highlightedEl && this._highlightedEl.click();
        break;

      default:
        if (this.items.length) {
          let suggestions = [];
          let value = this.contentElement.value;

          suggestions =
            value &&
            this.items
              .filter((item) => {
                return item.text
                  .replace(',', '') // remove commas
                  .replace(/\s/g, '') // remove whitespaces
                  .toLowerCase()
                  .search(
                    value.replace(',', '').replace(/\s/g, '').toLowerCase()
                  );
              })
              .slice(0, this.maxSuggestions); // limit results
          if (suggestions.length === 0) {
            suggestions = [];
            suggestions.push({value: null, text: 'Sorry, no matches'});
          }

          this.suggest(suggestions);
        }
        break;
    }
  }

  _markPreviousElement() {
     debugger;
    if (!this.highlightedEl || !this._highlightedEl.previousElementSibling) {
      return;
    }

    // remove the 'active' class from the currently-active element
    this._highligtedEl.classList.remove('active');
    // set the previous sibling element to be the now-highlighted element
    this._highligtedEl = this._highlightedEl.previousElementSibling;
    this._highlightedEl.classList.add('active');
  }

  _markNextElement() {
     debugger;
    if (!this.highlightedEl || !this._highlightedEl.nextElementSibling) {
      return;
    }

    // remove the 'active' class from the currently-active element
    this._highligtedEl.classList.remove('active');
    // set the next sibling element to be the now-highlighted element
    this._highligtedEl = this._highlightedEl.nextElementSibling;
    this._highlightedEl.classList.add('active');
  }

  _onFocus(ev) {
     debugger;
    this._blur = false;
    // if there are matches, open the dropdown to show them
    this._matches.length && this.open();
  }

  _onBlur(ev) {
     debugger;
    this._blur = true;
    // if the component lost focus and the mouse cursor is not inside the component,
    // close the dropdown
    !this._mouseEnter && this.close();
  }

  _handleItemMouseEnter(ev) {
     debugger;
    this._mouseEnter = true;
  }

  _handleItemMouseLeave(ev) {
     debugger;
    this._mouseEnter = false;
    // if the mouse's cursor leaves the component and doesn't have focus,
    // wait 500 milliseconds and then close the dropdown
    this._blur && setTimeout((_) => this.close(), 500);
  }

  open() {
     debugger;
    console.log('open()');
    // open only if there are matches to show
    if (!this._matches.length) return;
    this.opened = true;
  }

  close() {
     debugger;
    console.log('close()');
    // hide suggesting list dropdown
    this.opened = false;
    // reset the highlighted element to be null
    this._highlightedEl = null;
  }

  suggest(suggestions) {
     debugger;
    console.log('suggest()');
    this._matches = suggestions || {};
    // if there are matches, open the dropdown to show the suggestions. Else, close the dropdown.
    this._matches.length ? this.open() : this.close();
  }

  autocomplete(value, text) {
     debugger;
    // called when selecting a suggestion
    this.contentElement.value = value;
    this.close();

    // propagate the 'selected-autocomplete' event to all subscribers of this event.
    this.dispatchEvent(
      new CustomEvent('selected-autocomplete', {
        detail: {value, text}, // data to pass to subsribers
        composed: true,
        bubbles: true, // so that parent subscribers can catch this event and handle it
      })
    );
  }

  //
  // getters
  //
  get contentElement() {
    //  if the _inputEl node exists
    if (this._inputEl) {
      return this._inputEl;
    }

    let slotInputList = this.shadowRoot
      .getElementById('dropdown-input')
      .assignedNodes()[1];

    this._inputEl = slotInputList
      ? slotInputList
      : this.shadowRoot?.getElementById('defaultInput');

    return this._inputEl;
  }

  // setters
  set fulllist(value) {
    this.items = value;
  }

  //
  //props (they are just like attributes, except that they don't have DOM representation)
  //
  @property()
  name = 'World';
  @property()
  maxSuggestions = MAX_SUGGESTIONS;
  @property()
  opened = false;
  @property({type: Number})
  count = 0;

  override render() {
    // Use lit-html to render the element template
    // we must implement the render method for any component that extends the LitElement base class.
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
        ?hidden=${!this.opened)}
        @mouseenter=${this._handleItemMouseEnter}
        @mouseleave=${this._handleItemMouseLeave}
      >

        ${this._matches.map(item=>{
          return html`
            <li @click=${ev=>{
              this.autocomplete(item.text, item.value ? item.value : null);
            }}>
            ${item.text}
            </li>
          `;
        })}

      </ul>
    `;
    
  }

  debugger;

  window.customElements.define("lit-autocomplete", litAutocomplete);

//   private _onClick() {
//     this.count++;
//     this.dispatchEvent(new CustomEvent('count-changed'));
//   }

//   sayHello(name: string): string {
//     return `Hello, ${name}`;
//   }
// }

// declare global {
//   interface HTMLElementTagNameMap {
//     'my-element': MyElement;
//   }
// }
