// DinnerModel.js

class DinnerModel { // Keeps track of number of guests, as well as all the dishes related attributes.
  constructor() {
    this.guests = 2; // Default value.
    this.dishes = []; // Empty array.
  }

  setNumberOfGuests(n) { // Updates the number of guests.
    if (!Number.isInteger(n) || n <= 0) { // Number has to be a positive integer.
      throw new Error("number of guests not a positive integer"); // Otherwise throws this error.
    }
    this.guests = n; // Updates.
  }

  getNumberOfGuests() { // Returns number of guests.
    return this.guests;
  } 

  addToMenu(dish) { // Add a dish to the menu. If a dish with the same 'type' or 'id' exists, it gets replaced.
    function notSameDishCB(d) { 
      return d.type !== dish.type && String(d.id) !== String(dish.id); // Only dishes that are neither the same type nor the same id are kept.
    }
    this.dishes = [...this.dishes.filter(notSameDishCB), dish]; // Spread replaces concat. New array = filtered dishes + new dish.
  }

  removeFromMenu(dishId) { // Removes a dish by its Id. dishId can be either a number or a string.
    function removeDishCB(d) {
      return String(d.id) !== String(dishId && dishId.id !== undefined ? dishId.id : dishId); // Makes sure we don’t crash if dishId is not an object. If dishId is an object with an id field, it uses dishId.id. Otherwise, it just uses dishId itself.
    }
    this.dishes = this.dishes.filter(removeDishCB);
  }

  getDishOfType(type) { // Returns first dish with given type.
    function matchTypeCB(d) {
      return d.type === type; // Checks for a string that has the same type.
    }
    return this.dishes.find(matchTypeCB); // '.find' goes left to right in the array and retuns if callback is True.
  }

  getMenu() {
    return [...this.dishes]; // Spread replaces slice. Returns a shallow copy that can’t be modified directly.
  }

  getIngredients() {  // Collects all ingredients from all dishes in the menu. Duplicates are merged (quantities summed up). Each ingredient object is cloned to avoid accidental mutation.
    function cloneIngredientCB(ing) { // Clone an ingredient object so we don’t directly use the reference from dishes.
      return { name: ing.name, quantity: ing.quantity, unit: ing.unit, price: ing.price }; // Same format.
    }

    function concatIngredientsCB(acc, dish) { // Create array of all ingredients.
      return [...acc, ...dish.ingredients.map(cloneIngredientCB)]; // Spread replaces concat. Merge accumulator with cloned dish ingredients.
    }

    function aggregateCB(acc, ing) { // Removes duplicate ingredient tags and connect them with a quantity instead.
      return [
        ...acc.map(function updateCB(i) {  // If ingredient name matches, increase the quantity.
          return i.name === ing.name // Is the ingredient name the same? If so add to the quantity and update acc-array.
            ? { name: i.name, quantity: i.quantity + ing.quantity, unit: i.unit, price: i.price } // 'name', 'unit' and 'price' are unchanged. We create a new object instead of modifying a current one.
            : i; // If names doesn't match return unchanged values.
        }),
        ...(acc.some(function existsCB(i) { // When ingredient doesn't exist yet, add it to the array. '.some' stops when the argument is fulfilled.
          return i.name === ing.name; }) 
            ? [] // Ingredient already exists? ,do nothing. 
            : [ing]) // Ingredient doesn't exist?, add it using spread.
      ];
    }

    return this.dishes.reduce(concatIngredientsCB, []).reduce(aggregateCB, []); // Function chain.
  }

  getDinnerPrice() {
    function sumDishesCB(sum, dish) {
      return sum + DishSource.getDishPrice(dish) * this.guests;
    }
    return this.dishes.reduce(sumDishesCB.bind(this), 0);
  }
}

class DishSource { // Helps user search for dishes, providing details and prices.
  static getDishDetails(id) { // Look up a dish by its id in the global dishesConst array.
    function matchIdCB(d) {
      return String(d.id) === String(id);
    }
    return dishesConst.find(matchIdCB);
  }

  static getDishPrice(dish) { // Calculate the price of a dish, quantity × price.
    function sumIngredientsCB(sum, ing) {
      return sum + ing.quantity * ing.price;
    }
    return dish.ingredients.reduce(sumIngredientsCB, 0);
  }

  static searchDishes(options) { // Search through dishesConst with optional filters:                                                   
    function matchTypeCB(dish) {
      return !options?.type || dish.type === options.type; // Only match dishes of this type. If options is undefined or doesn’t have a type, it evaluates as undefined.
    }

    function matchNameCB(dish) {
      return !options?.query || dish.name.toLowerCase().includes(options.query.toLowerCase()); // Only match dishes whose name includes the query string. Also makes both name and query lower case.
    }

    return dishesConst.filter(matchTypeCB).filter(matchNameCB); // Function chain.
  }

  getDishDetails(id) { // Instance method wrapper around the static version. Allows DishSource to be used both statically and as an instance.
    return DishSource.getDishDetails(id);
  }

  searchDishes(options) { // Same wrapper for searching dishes.
    return DishSource.searchDishes(options);
  }
}

window.DinnerModel = DinnerModel;
window.DishSource = DishSource;
