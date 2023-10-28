import { css, html, LitElement } from "lit";

export class ThemeToggle extends LitElement {
  static properties = {
    currentTheme: { type: String, state: true },
  };

  static styles = css`
    button {
      background-color: transparent;
      cursor: pointer;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      border: none;
      transition: background-color 0.3s;
    }

    button:hover {
      background-color: transparent !important;
    }

    img {
      height: 2rem;
      filter: invert(48%) sepia(65%) saturate(447%) hue-rotate(73deg) brightness(96%) contrast(86%);
    }
  
    button:hover {
      background-color: var(--primary-hover);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.currentTheme = prefersDarkScheme ? 'dark' : 'light';
    document.documentElement.setAttribute("data-theme", this.currentTheme);
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", this.currentTheme);
  }

  render() {
    const [icon, alt] = this.currentTheme === "light"
      ? ["moon.svg", "Dark mode"]
      : ["sun.svg", "Light mode"];
    return html`
      <button @click="${this.toggleTheme}">
        <img src="/static/${icon}" alt=${alt} />
      </button>
    `;
  }
}

customElements.define("theme-toggle", ThemeToggle);
