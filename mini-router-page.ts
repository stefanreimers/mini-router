class MiniRouterPage extends HTMLElement {

  #observer: MutationObserver | null = null;

  constructor() {
    super();
  }

  connectedCallback() {

    // Kick off element lifecycle when visible
    this.#observer = new MutationObserver((mutationsList, observer) => {

      for (const mutation of mutationsList) {
        if (mutation.attributeName === "style" && this.style.display !== "none") {
          this.shownCallback()
        } else if (mutation.attributeName === "style" && this.style.display === "none") {
          this.hiddenCallback();
        }
      }

    });
    this.#observer.observe(this, { attributes: true });

  }

  get isVisible() {
    return this.style.display !== 'none'
  }

  shownCallback() { }

  hiddenCallback() { }


  disconnectedCallback() {
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null
    }
  }

  static get observedAttributes() {
    return []
  }

  attributeChangedCallback(attrName: string, oldVal: string, newVal: string) { }

}
