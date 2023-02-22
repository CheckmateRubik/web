// Load data from CSV file
const loadFoods = async () => {
  const response = await fetch("foods.csv");
  const data = await response.text();

  // Parse CSV data
  const rows = data.split("\n").slice(1);
  let foods = rows.map((row) => {
    const columns = row.split(",");
    const name = columns[0];
    const expiry = parseInt(columns[1], 10);
    return { name, expiry };
  });

  // Load foods from local storage
  const storedFoods = JSON.parse(localStorage.getItem("foods"));
  if (storedFoods) {
    foods = foods.concat(storedFoods);
  }

  return foods;
};

// Format date as dd/mm/yy
const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit"
  });
};

// Get HTML elements
const searchInput = document.getElementById("search");
const suggestionsList = document.getElementById("suggestions");
const itemList = document.getElementById("items");

// Add event listeners to search input
searchInput.addEventListener("input", () => {
  const filter = searchInput.value;
  createSuggestions(foods, filter);
});

let foods = [];
loadFoods().then((data) => {
  foods = data;
});
const addFoodForm = document.getElementById("add-food-form");
const foodNameInput = document.getElementById("food-name-input");
const foodExpiryInput = document.getElementById("food-expiry-input");

addFoodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = foodNameInput.value;
  const expiry = parseInt(foodExpiryInput.value, 10);

  const food = { name, expiry };
  foods.push(food);
  localStorage.setItem("foods", JSON.stringify(foods));

  foodNameInput.value = "";
  foodExpiryInput.value = "";

  alert(`${name} was added to the list with an expiry of ${expiry} days.`);

  // Check if the food is expiring within a day
  const oneDayLater = new Date();
  oneDayLater.setDate(oneDayLater.getDate() + 1);
  const expiryDate = new Date(Date.now() + (expiry * 24 * 60 * 60 * 1000));
  const expiryWithToday = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
  if (expiryWithToday <= oneDayLater) {
    alert(`The food item "${name}" is expiring within 1 day!`);
  }

  // Add food item to suggestions list
  createSuggestions(foods, "");
});
// Create search suggestions based on loaded data
const createSuggestions = (foods, filter) => {
  // Filter foods based on search input
  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Clear previous suggestions
  suggestionsList.innerHTML = "";

// Add filtered food items as suggestions
filteredFoods.forEach((food) => {
  const suggestion = document.createElement("div");
  suggestion.classList.add("suggestion");
  suggestion.innerHTML = `
    <span class="name">${food.name}</span>
    <span class="quantity">1</span>
  `;
  suggestion.addEventListener("click", () => {
    const item = document.createElement("div");
    item.classList.add("item");
    const name = document.createElement("p");
    name.classList.add("name");
    name.innerText = food.name;
    const expiryDate = new Date(Date.now() + (food.expiry * 24 * 60 * 60 * 1000));
    const expiryWithToday = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
    const expiry = document.createElement("p");
    expiry.classList.add("expiry");
    expiry.innerText = `Actual expiry date: ${formatDate(expiryWithToday)}`;
    const quantity = document.createElement("span");
    quantity.classList.add("quantity");
    quantity.innerText = "1";
    const quantityBtn = document.createElement("button");
    quantityBtn.classList.add("quantity-btn");
    quantityBtn.innerText = "+";
    quantityBtn.addEventListener("click", () => {
      const newQuantity = parseInt(quantity.innerText) + 1;
      quantity.innerText = newQuantity;
    });
    item.appendChild(name);
    item.appendChild(quantity);
    item.appendChild(quantityBtn);
    item.appendChild(expiry);
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerText = "X";
    deleteButton.addEventListener("click", () => {
      item.remove();
      saveItems();
    });
    item.appendChild(deleteButton);

    // Add appropriate class based on expiry date
    const today = new Date();
    const oneDayLater = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const expiryDaysLeft = Math.round((expiryWithToday - today) / (24 * 60 * 60 * 1000));
    if (expiryDaysLeft <= 1) {
      item.classList.add("expiring-1-day");
    } else if (expiryDaysLeft <= 3) {
      item.classList.add("expiring-3-day");
    } else if (expiryDaysLeft <= 7) {
      item.classList.add("expiring-7-day");
    }

    itemList.appendChild(item);
    searchInput.value = "";
    suggestionsList.innerHTML = "";
    saveItems();
  });

  suggestionsList.appendChild(suggestion);
});
}

const createDashboard = async () => {
  // Filter foods that are expiring within a week
  const today = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);

  const suggestedFoods = [];
  foods.forEach((food) => {
    const expiryDate = new Date(Date.now() + (food.expiry * 24 * 60 * 60 * 1000));
    const expiryWithToday = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
    const daysDiff = Math.floor((expiryWithToday - today) / (24 * 60 * 60 * 1000));

    if (expiryWithToday > today && expiryWithToday <= oneWeekLater) {
      suggestedFoods.push({ name: food.name, expiry: expiryWithToday, daysDiff });
    }

    // Check for foods that will expire in one day and show a notification
    const oneDayLater = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    if (expiryWithToday >= oneDayLater && expiryWithToday < today) {
      showNotification(`The ${food.name} will expire tomorrow!`);
    }
  });

  // Clear previous dashboard
  suggestedFoodsList.innerHTML = "";

  const createDashboard = async () => {
    // Filter foods that are expiring within a week
    const today = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(today.getDate() + 7);
  
    const suggestedFoods = [];
    foods.forEach((food) => {
      const expiryDate = new Date(Date.now() + (food.expiry * 24 * 60 * 60 * 1000));
      const daysDiff = Math.round((expiryDate - today) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        suggestedFoods.push({ name: food.name, expiry: expiryDate, daysDiff: daysDiff, className: "expiring-1-day" });
      } else if (daysDiff <= 3) {
        suggestedFoods.push({ name: food.name, expiry: expiryDate, daysDiff: daysDiff, className: "expiring-3-day" });
      } else if (daysDiff <= 7) {
        suggestedFoods.push({ name: food.name, expiry: expiryDate, daysDiff: daysDiff, className: "expiring-7-day" });
      } else {
        suggestedFoods.push({ name: food.name, expiry: expiryDate, daysDiff: daysDiff, className: "" });
      }
  
      // Check for foods that will expire in one day and show a notification
      const oneDayLater = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      if (expiryDate >= oneDayLater && expiryDate < today) {
        showNotification(`The ${food.name} will expire tomorrow!`);
      }
    });
  
    // Clear previous dashboard
    suggestedFoodsList.innerHTML = "";
  
    // Add suggested foods to dashboard
    suggestedFoods.forEach((food) => {
      const suggestion = document.createElement("li");
      suggestion.classList.add("suggestion-item");
      suggestion.classList.add(food.className);
      suggestion.innerText = `${food.name} (${formatDate(food.expiry)})`;
      suggestion.addEventListener("click", () => {
        const item = document.createElement("div");
        item.classList.add("item");
        const name = document.createElement("p");
        name.classList.add("name");
        name.innerText = food.name;
  
        const expiry = document.createElement("p");
        expiry.classList.add("expiry");
        expiry.innerText = `Actual expiry date: ${formatDate(food.expiry)}`;
        const quantity = document.createElement("span");
        quantity.classList.add("quantity");
        quantity.innerText = "1";
        const quantityBtn = document.createElement("button");
        quantityBtn.classList.add("quantity-btn");
        quantityBtn.innerText = "+";
        quantityBtn.addEventListener("click", () => {
          const newQuantity = parseInt(quantity.innerText) + 1;
          quantity.innerText = newQuantity;
        });
        item.appendChild(name);
        item.appendChild(quantity);
        item.appendChild(quantityBtn);
        item.appendChild(expiry);
        itemList.appendChild(item);
        saveItems();
      });
      suggestedFoodsList.appendChild(suggestion);
    });
  }

  // Hide dashboard if there are no suggested foods
  if (suggestedFoods.length === 0) {
    dashboard.style.display = "none";
  } else {
    dashboard.style.display = "block";
  }
};


// Show notification function
const showNotification = (message) => {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerText = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 5000);
};

const loadItems = () => {
  const savedItems = JSON.parse(localStorage.getItem("items"));
  if (savedItems) {
    savedItems.forEach((item) => {
      const itemElem = document.createElement("div");
      itemElem.classList.add("item");
      itemElem.classList.add(item.color); // Set the color class of the item
      const nameElem = document.createElement("p");
      nameElem.classList.add("name");
      nameElem.innerText = item.name;
      const expiryElem = document.createElement("p");
      expiryElem.classList.add("expiry");
      expiryElem.innerText = item.expiry;
      const quantity = document.createElement("span");
      quantity.classList.add("quantity");
      quantity.innerText = item.quantity;
      const quantityBtn = document.createElement("div");
      quantityBtn.classList.add("quantity-btn");
      const plusBtn = document.createElement("button");
      plusBtn.innerText = "+";
      plusBtn.addEventListener("click", () => {
        const newQuantity = parseInt(quantity.innerText) + 1;
        quantity.innerText = newQuantity;
        saveItems();
      });
      const minusBtn = document.createElement("button");
      minusBtn.innerText = "-";
      minusBtn.addEventListener("click", () => {
        const newQuantity = parseInt(quantity.innerText) - 1;
        if (newQuantity >= 0) {
          quantity.innerText = newQuantity;
          saveItems();
        }
      });
      quantityBtn.appendChild(minusBtn);
      quantityBtn.appendChild(quantity);
      quantityBtn.appendChild(plusBtn);
      itemElem.appendChild(nameElem);
      itemElem.appendChild(quantityBtn);
      itemElem.appendChild(expiryElem);
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-button");
      deleteButton.innerText = "X";
      deleteButton.addEventListener("click", () => {
        itemElem.remove();
        saveItems();
      });
      itemElem.appendChild(deleteButton);
      itemList.appendChild(itemElem);
    });
  }
};

const saveItems = () => {
  const items = [];
  itemList.childNodes.forEach((item) => {
    const name = item.querySelector(".name").innerText;
    const expiry = item.querySelector(".expiry").innerText;
    const quantity = item.querySelector(".quantity").innerText;
    const color = item.classList[1]; // Get the second class (the color)
    items.push({ name, expiry, quantity, color });
  });
  localStorage.setItem("items", JSON.stringify(items));
};



loadItems();

// Update expiry dates for saved items
itemList.childNodes.forEach((item) => {
  const expiryElem = item.querySelector(".expiry");
  const expiryText = expiryElem.innerText;
  const expiry = new Date(expiryText.slice(19));
  expiryElem.innerText = `Actual expiry date: ${formatDate(expiry)}`;
});

// Add event listeners to search input and expiry input
searchInput.addEventListener("input", () => {
  const filter = searchInput.value;
  createSuggestions(foods, filter);
});

foodExpiryInput.addEventListener("input", () => {
  const expiry = parseInt(foodExpiryInput.value, 10);
  if (isNaN(expiry) || expiry <= 0) {
    expiryError.innerText = "Expiry must be a positive number.";
  } else {
    const expiryDate = new Date(Date.now() + (expiry * 24 * 60 * 60 * 1000));
    expiryError.innerText = `Item will expire on ${formatDate(expiryDate)}.`;
  }
});
// Add event listener to add food button
addFoodButton.addEventListener("click", () => {
  addFoodForm.style.display = "block";
});

// Add event listener to close form button
closeFormButton.addEventListener("click", () => {
  addFoodForm.style.display = "none";
  foodNameInput.value = "";
  foodExpiryInput.value = "";
});

// Add event listener to clear all items button
clearAllButton.addEventListener("click", () => {
  itemList.innerHTML = "";
  saveItems();
});

// Add event listener to reset suggestions button
resetSuggestionsButton.addEventListener("click", () => {
  localStorage.removeItem("foods");
  location.reload();
});






// Initialize dashboard and suggestions
createDashboard();
createSuggestions(foods, "");

