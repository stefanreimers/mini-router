type Nullable<T> = T | null;

class MiniRouter extends HTMLElement {

  private _hash: string;
  private _source: Nullable<string>;


  constructor() {
    super();
    this._hash = '#';
    this._source = null;

  }

  connectedCallback() {

    this.__setupUI();
    this.__setListeners()
  }

  get hash(): string { return this._hash }
  set hash(value: string) { this._hash = value }

  get source() { return this._source || '' }
  set source(value: string) { this._source = value }

  __setupUI() {
    for (var c = this.children.length, i = 0; i < c; i++) {
      (<HTMLElement>this.children[i]).style.display = 'none'
    }
  }

  __setListeners() {
    if (!window) console.warn('window Object missing');
    window.addEventListener('load', this.__handleRouting.bind(this))
    window.addEventListener('hashchange', this.__handleRouting.bind(this))
  }

  __handleRouting(e: HashChangeEvent | Event) {

    e.stopPropagation();
    e.preventDefault();

    //@ts-expect-error
    let url = new URL(e.newURL || window.location.toString());

    // extract route
    var routes = /^#![^\?]+/.exec(url.hash);
    var route = (routes && routes[0]) ? routes[0].substr(this._hash.length) : '*';
    var matched = null;

    // Walk children
    for (var c = this.children.length, i = 0; i < c; i++) {
      let child = (<HTMLElement>this.children[i]);
      let match = false;
      var variables = null;

      // Stop when already matched
      if (matched) {
        child.style.display = 'none'
        continue;
      }


      // Route matching
      let path = this.__getProp(child, 'path');
      let regex = this.__getProp(child, 'regex');
      let pattern = this.__getProp(child, 'pattern');
      if (path && path === route) {
        match = true;
      } else if (regex) {
        if (regex && (new RegExp(regex)).test(route)) match = true;
      } else if (pattern) {

        //Build regex from pattern
        let j, regex = pattern.split('/').map((i: string) => {
          // Pattern without regex
          if (/^:[a-zA-Z0-9]+(@[a-zA-Z0-9]+)?$/.test(i)) return '[^\/]+';

          // Pattern with regex and optional mapping via @
          return (j = i.match(/^:([a-zA-Z0-9]+)\((.+)\)(@([a-zA-Z0-9]+))?$/)) ? j[2] : i
        }).join('/');

        if (regex && (new RegExp(regex)).test(route)) {
          match = true;

          // Build variable map
          let routeparts = route.split('/');
          variables = pattern.split('/').reduce((acc, item, index) => {

            // Pattern with regex
            let key = item.match(/^:([a-zA-Z0-9]+)(\((.+)\))?(@([a-zA-Z0-9]+))?$/);
            if (key != null) {
              //@ts-expect-error
              if (key[1]) acc[key[1]] = routeparts[index];
              if (key[5]) child.setAttribute(key[5], routeparts[index]);
            }
            return acc;
          }, {})

        }

      }

      // Handle match
      if (match === true) {
        child.style.display = 'initial';

        matched = child;

        // Lazy Load custom element
        if (child instanceof HTMLUnknownElement) {
          let sourcePath = this.__getProp(child, 'sourcepath');
          let sourceFile = this.__getProp(child, 'sourcefile');
          let sourceUrl = this.__getProp(child, 'source');
          let source = null;
          if (sourcePath || sourceFile) {
            source = (sourcePath || this.source || '') + '/' + (sourceFile || (child.localName || child.tagName.toLowerCase()) + '.js');
          } else if (sourceUrl) {
            source = sourceUrl;
          } else {
            source = (this.source || '') + '/' + ((child.localName || child.tagName.toLowerCase()) + '.js')
          }

          if (source) {
            let script = document.createElement('script');
            script.type = "text/javascript";
            script.src = source;
            document.body.appendChild(script)
          }
        }

        // Event disposal
        document.body.dispatchEvent(new CustomEvent('page-change', { detail: { route: route, variables: variables } }));

      } else {
        child.style.display = 'none';
      }

    }

    // No matching route
    // All child elements are hidden
    // Any 404 route available?
    if (!matched) {
      let fallback = <HTMLElement>this.querySelector('[data-fallback]');
      if (fallback && fallback.parentNode === this) {
        fallback.style.display = 'initial';
      }
    }

  }

  __getProp(element: HTMLElement, prop: string): string | null {
    return element.dataset[prop] || element.getAttribute(prop);
  }

  static get observedAttributes() {
    return ['hash', 'source'];
  }

  attributeChangedCallback(attr: string, oldValue: Nullable<string>, newValue: Nullable<string>) {

    //@ts-expect-error
    if (oldValue != newValue) this[attr] = newValue;
  }

}
window.customElements.define('mini-router', MiniRouter);

// Set styles
(function (w, d) {
  let style = d.createElement('STYLE');
  style.textContent = `mini-router { display: contents }`;
  d.head.appendChild(style);
})(window, document);