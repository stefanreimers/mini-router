"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _observer;
class MiniRouterPage extends HTMLElement {
    constructor() {
        super();
        _observer.set(this, null);
    }
    connectedCallback() {
        // Kick off element lifecycle when visible
        __classPrivateFieldSet(this, _observer, new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.attributeName === "style" && this.style.display !== "none") {
                    this.shownCallback();
                }
                else if (mutation.attributeName === "style" && this.style.display === "none") {
                    this.hiddenCallback();
                }
            }
        }));
        __classPrivateFieldGet(this, _observer).observe(this, { attributes: true });
    }
    shownCallback() { }
    hiddenCallback() { }
    disconnectedCallback() {
        if (__classPrivateFieldGet(this, _observer)) {
            __classPrivateFieldGet(this, _observer).disconnect();
            __classPrivateFieldSet(this, _observer, null);
        }
    }
    static get observedAttributes() {
        return [];
    }
    attributeChangedCallback(attrName, oldVal, newVal) { }
}
_observer = new WeakMap();
