import { css, html, LitElement } from "lit";
import { addStylesheetsToElement } from "./style";

export class MealEventForm extends LitElement {
  static properties = {
    _otherFood: { type: String, state: true },
    _foodType: { type: String, state: true },
  };

  constructor() {
    super();
    this.quantity = "";
    this._foodType = "BreastMilk";
    this._otherFood = "";
  }

  connectedCallback() {
    super.connectedCallback();
    addStylesheetsToElement(this.shadowRoot);
  }

  static styles = css`
    /* Add any styles you want here */
  `;

  quantityHtml() {
    return html`
        <label>
          Quantity (ml or g): 
          <input 
            type="number" 
            .value=${this.quantity} 
            @input=${(e) => (this.quantity = e.target.value)}
            placeholder="Enter quantity"
          />
        </label>
    `
  }

  foodTypeSelectInput() {
    return html`
        <select .value=${this._foodType} @change=${this.foodTypeChanged}>
          <!-- List the FoodType enum options here -->
          <option value="BreastMilk">Breast Milk</option>
          <option value="Formula">Formula</option>
          <option value="Other">Other</option>
          <!-- Add other food types as per your enum -->
        </select>
    `
  }

  optionalOtherFoodTypeInput() {
    return this._foodType === "Other"
            ? html`<input
                    type="text"
                    .value=${this._otherFood}
                    @input=${this.otherFoodChanged}
                    placeholder="Specify other food"
                    />`
            : ""
  }

  foodTypeHtml() {
    return html`
        <label>
          Food Type: 
          <div class="grid">
            ${this.foodTypeSelectInput()}
            ${this.optionalOtherFoodTypeInput()}
          </div>
        </label>
      `
  }

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        ${this.foodTypeHtml()}
        ${this.quantityHtml()}
        <button type="submit">Create Meal Event</button>
      </form>
    `;
  }

  foodTypeChanged(event) {
    this._foodType = event.target.value;
    console.log("This: ", this);
    console.log("FoodType: ", this._foodType);
  }

  otherFoodChanged(event) {
    this._otherFood = event.target.value;
  }

  handleSubmit(event) {
    event.preventDefault();

    const foodType = this._foodType === "Other"
      ? { Other: this._otherFood }
      : this._foodType;

    // Form the object structure for Meal event and emit a custom event with the detail
    const eventDetail = {
      event_type: {
        "Meal": {
          quantity: this.quantity ? parseFloat(this.quantity) : null,
          food_type: foodType,
        },
      },
    };

    this.dispatchEvent(
      new CustomEvent("meal-event-created", { detail: eventDetail }),
    );
  }
}

customElements.define("meal-event-form", MealEventForm);
