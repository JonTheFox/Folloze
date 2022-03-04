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
    this._eventReferences = {};
    this._matches = [];
    this.items = [];
    this.opened = false;
    this.maxSuggestions = MAX_MATCHES;
  }

  // called after the element's DOM has been updated the first time,
  // immediately before the "updated" method is called.
  firstUpdated() {
    this.suggestionEl = this.shadowRoot?.getElementById('suggestions');
    this.suggestionEl.style.width =
      this.contentElements.getBoundingClientRect().width + 'px';

    // add our event handlers, found in the _eventReferences field, to keyboard events
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
    // if the dropdown is open and we have a list of suggestions
    if (
      changed.has('opened') &&
      this.opened &&
      this._suggestionEl.childElementCount
    ) {
      // remove the 'active' class from the suggestions (they might have been reviously-assigned this class)
      for (let item of this._suggestionEl.children) {
        item.classList.remove('active');
      }
      // add the 'active' class to the first suggested item
      this._highlightedEl = this._suggestionEl.children[0];
      this._highlightedEl.classList.add('active');
    }
  }

  // getters
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
    return html`
      <h1>${this.sayHello(this.name)}!</h1>
      <button @click=${this._onClick} part="button">
        Click Count: ${this.count}
      </button>
      <slot></slot>
    `;
  }

  private _onClick() {
    this.count++;
    this.dispatchEvent(new CustomEvent('count-changed'));
  }

  sayHello(name: string): string {
    return `Hello, ${name}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
