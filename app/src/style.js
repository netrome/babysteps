export function addStylesheetToElement(element, url) {
  const linkElem = document.createElement("link");
  linkElem.rel = "stylesheet";
  linkElem.href = url; // Access the URL via the `url` property
  element.appendChild(linkElem);
}

export function addStylesheetsToElement(element) {
  addStylesheetToElement(element, "static/pico.min.css");
  addStylesheetToElement(element, "static/style.css");
}

export function addStylesheetsToRoot() {
  addStylesheetsToElement(document.head);
}
