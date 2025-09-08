// DinnerModel.js

class DinnerModel {
  constructor() {
    this.guests = 2;
    this.dishes = [];
  }

  setNumberOfGuests(n) {
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("number of guests not a positive integer");
    }
    this.guests = n;
  }

  getNumberOfGuests() {
    return this.guests;
  }

  addToMenu(dish) {
    function notSameDishCB(d) {
      return d.type !== dish.type && String(d.id) !== String(dish.id);
    }
    this.dishes = this.dishes.filter(notSameDishCB).concat([dish]);
  }

  removeFromMenu(dishId) {
    function removeDishCB(d) {
      return String(d.id) !== String(dishId && dishId.id !== undefined ? dishId.id : dishId);
    }
    this.dishes = this.dishes.filter(removeDishCB);
  }

  getDishOfType(type) {
    function matchTypeCB(d) {
      return d.type === type;
    }
    return this.dishes.find(matchTypeCB);
  }

  getMenu() {
    return this.dishes.slice();
  }

  getIngredients() {
    function cloneIngredientCB(ing) {
      return { name: ing.name, quantity: ing.quantity, unit: ing.unit, price: ing.price };
    }

    function concatIngredientsCB(acc, dish) {
      return acc.concat(dish.ingredients.map(cloneIngredientCB));
    }

    function aggregateCB(acc, ing) {
      return acc
        .map(function updateCB(i) {
          return i.name === ing.name
            ? { name: i.name, quantity: i.quantity + ing.quantity, unit: i.unit, price: i.price }
            : i;
        })
        .concat(acc.some(function existsCB(i) { return i.name === ing.name; }) ? [] : [ing]);
    }

    return this.dishes.reduce(concatIngredientsCB, []).reduce(aggregateCB, []);
  }

  getDinnerPrice() {
    function sumDishesCB(sum, dish) {
      return sum + DishSource.getDishPrice(dish) * this.guests;
    }
    return this.dishes.reduce(sumDishesCB.bind(this), 0);
  }
}

class DishSource {
  static getDishDetails(id) {
    function matchIdCB(d) {
      return String(d.id) === String(id);
    }
    return dishesConst.find(matchIdCB);
  }

  static getDishPrice(dish) {
    function sumIngredientsCB(sum, ing) {
      return sum + ing.quantity * ing.price;
    }
    return dish.ingredients.reduce(sumIngredientsCB, 0);
  }

  static searchDishes(options) {
    function matchTypeCB(dish) {
      return !options?.type || dish.type === options.type;
    }

    function matchNameCB(dish) {
      return !options?.query || dish.name.toLowerCase().includes(options.query.toLowerCase());
    }

    return dishesConst.filter(matchTypeCB).filter(matchNameCB);
  }

  getDishDetails(id) {
    return DishSource.getDishDetails(id);
  }

  searchDishes(options) {
    return DishSource.searchDishes(options);
  }
}

window.DinnerModel = DinnerModel;
window.DishSource = DishSource;
