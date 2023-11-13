const container = document.getElementById("product-container");
const searchInput = document.getElementById("search-input");
const search = document.getElementById("search");
const productPage = document.getElementById("products-page");
const cartPage = document.getElementById("cart-page");
const productBlock = document.getElementById("products-block");
const cartBlock = document.getElementById("cart-block");
const cartProducts = document.getElementById("cart-poducts");
const totalAmmount = document.getElementById("total");
const showFilter = document.getElementById("show-filter");
var checkedBoxes = document.querySelectorAll("input[name=mycheckboxes]");

const url =
  "https://geektrust.s3.ap-southeast-1.amazonaws.com/coding-problems/shopping-cart/catalogue.json";
let searchVal = "";
let data = [];
let filteredData = [];
let cartArray = [];
let cart = [];
let total = 0;

async function fetchUsers(url) {
  const response = await fetch(url);
  data = await response.json();
  searchData(data, searchVal);
}
fetchUsers(url);

function searchData(userData, search) {
  filteredData = userData.filter(
    (user) =>
      user.name.toLowerCase().includes(search) ||
      user.type.toLowerCase().includes(search) ||
      user.color.toLowerCase().includes(search)
  );
  addData(filteredData);
}
search.addEventListener("click", () => {
  searchVal = searchInput.value.trim().toLowerCase();
  filterAndDisplay();
});

function addData(data) {
  if (data.length == 0) {
    container.innerHTML = "<div>No Data</div>";
  } else {
    container.innerHTML = "";
    data.map((item) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
                  <img class="image" src=${item.imageURL} />
                  <div class="name">Name: <span>${item.name}</span></div>
                  <div class="details">
                      <div>Price: <span>${
                        item.currency == "INR" ? "Rs." : "$"
                      }${item.price}</span></div>
                      <span>Quantity: ${item.quantity}</span>
                  </div>
              `;
      const btn = document.createElement("button");
      btn.disabled = item.quantity > 0 ? false : true;
      btn.className = item.quantity == 0 ? "disabled" : "";
      btn.innerHTML = item.quantity == 0 ? "Out Of Stock" : "Add To Cart";
      btn.addEventListener("click", () => addToCart({ ...item }));
      div.appendChild(btn);
      container.appendChild(div);
    });
  }
}

function addToCart(selected) {
  if (cartArray.includes(selected.id)) {
    cart.map((item) => {
      if (item.id == selected.id) {
        item.quantity = item.quantity + 1;
      }
    });
  } else {
    cart.push(selected);
    selected.quantity = 1;
    cartArray.push(selected.id);
  }
  data.map((item) => {
    if (item.id == selected.id) {
      item.quantity = item.quantity - 1;
    }
  });
  searchData(filteredData, searchVal);
}

function displayCartProducts() {
  total = 0;
  if (cart.length == 0) {
    cartProducts.innerHTML = "<div>No Item Selected</div>";
  } else {
    cartProducts.innerHTML = "";
    cart.map((item) => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
                <img src=${item.imageURL} >
                <div class="details">
                    <span>${item.name}</span>
                    <span>${item.currency == "INR" ? "Rs." : "$"}${
        item.price
      }</span>
                </div>
            `;

      const quantity = document.createElement("div");
      quantity.setAttribute("class", "quantity");
      quantity.innerHTML = `<div>Quantity: ${item.quantity}</div>`;

      const plusIcon = document.createElement("i");
      plusIcon.setAttribute("class", "fa-solid fa-plus icon");
      plusIcon.addEventListener("click", () => incrementCount(item));

      const minusIcon = document.createElement("i");
      minusIcon.setAttribute("class", "fa-solid fa-minus icon");
      minusIcon.addEventListener("click", () => decrementCount(item));

      quantity.appendChild(plusIcon);
      quantity.appendChild(minusIcon);
      div.appendChild(quantity);

      const btn = document.createElement("button");
      btn.innerHTML = "Delete";
      btn.addEventListener("click", () => removeItem(item));
      div.appendChild(btn);

      cartProducts.appendChild(div);
      total = total + Math.floor(Number(item.price) * Number(item.quantity));
    });
  }
  totalAmmount.innerHTML = `Rs. ${total}`;
}

function removeItem(selected) {
  cart = cart.filter((item) => item.id != selected.id);
  data.map((item) => {
    if (item.id == selected.id) {
      item.quantity = item.quantity + selected.quantity;
    }
  });
  cartArray = cartArray.filter((item) => item != selected.id);
  showToast("Item removed from cart!");
  displayCartProducts();
}

function incrementCount(selected) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].id == selected.id) {
      if (data[i].quantity > 0) {
        cart.map((change) => {
          if (change.id == selected.id) {
            change.quantity = change.quantity + 1;
          }
        });
        data[i].quantity = data[i].quantity - 1;
      } else {
        showToast("Maximum count reached!");
      }
      displayCartProducts();
      break;
    }
  }
}

function decrementCount(selected) {
  if (selected.quantity == 1) {
    removeItem(selected);
  }
  if (selected.quantity > 1) {
    cart.map((item) => {
      if (item.id == selected.id) {
        item.quantity = item.quantity - 1;
      }
    });
    data.map((item) => {
      if (item.id == selected.id) {
        item.quantity = item.quantity + 1;
      }
    });
    displayCartProducts();
  }
}

productPage.addEventListener("click", () => {
  document
    .getElementById("product-active")
    .setAttribute("class", "line active");
  document.getElementById("cart-active").setAttribute("class", "line");
  for (let i = 0; i < checkedBoxes.length; i++) {
    checkedBoxes[i].checked = false;
  }
  searchData(data, "");
  cartBlock.style.display = "none";
  productBlock.style.display = "flex";
});

cartPage.addEventListener("click", () => {
  document.getElementById("product-active").setAttribute("class", "line");
  document.getElementById("cart-active").setAttribute("class", "line active");
  productBlock.style.display = "none";
  cartBlock.style.display = "block";
  displayCartProducts();
});

function displayFilter() {
  const aside = document.querySelector("aside");
  if (aside.className.includes("hide-filter-box")) {
    aside.className = "filter-box show-filter-box";
  } else {
    aside.className = "filter-box hide-filter-box";
  }
}
showFilter.addEventListener("click", displayFilter);

function filterByColor(tempData, filterCategory) {
  if (tempData.length == 0) {
    return data.filter((item) =>
      filterCategory.toString().includes(item.color.toLowerCase())
    );
  } else {
    return tempData.filter((item) =>
      filterCategory.toString().includes(item.color.toLowerCase())
    );
  }
}

function filterByGender(tempData, filterCategory) {
  if (tempData.length == 0) {
    if (
      filterCategory.toString().includes("man") &&
      filterCategory.toString().includes("women")
    ) {
      //no filter
    } else if (filterCategory.toString().includes("man")) {
      return data.filter((item) => item.gender.toLowerCase() == "men");
    } else if (filterCategory.toString().includes("women")) {
      return data.filter((item) => item.gender.toLowerCase() == "women");
    }
  } else {
    if (
      filterCategory.toString().includes("man") &&
      filterCategory.toString().includes("women")
    ) {
      //no filter
    } else if (filterCategory.toString().includes("man")) {
      return tempData.filter((item) => item.gender.toLowerCase() == "men");
    } else if (filterCategory.toString().includes("women")) {
      return tempData.filter((item) => item.gender.toLowerCase() == "women");
    }
  }
}

function filterByPrice(tempData, filterCategory) {
  let newData = [];
  if (tempData.length == 0) {
    data.filter((item) => {
      if (filterCategory.toString().includes("0-250")) {
        if (item.price > 0 && item.price <= 250) {
          newData.push(item);
        }
      }
      if (filterCategory.toString().includes("250-450")) {
        if (item.price > 250 && item.price <= 450) {
          newData.push(item);
        }
      }
      if (filterCategory.toString().includes(">450")) {
        if (item.price > 450) {
          newData.push(item);
        }
      }
    });
    return newData;
  } else {
    tempData.filter((item) => {
      if (filterCategory.toString().includes("0-250")) {
        if (item.price > 0 && item.price <= 250) {
          newData.push(item);
        }
      }
      if (filterCategory.toString().includes("250-450")) {
        if (item.price > 250 && item.price <= 450) {
          newData.push(item);
        }
      }
      if (filterCategory.toString().includes(">450")) {
        if (item.price > 450) {
          newData.push(item);
        }
      }
    });
    return newData;
  }
}

function filterByType(tempData, filterCategory) {
  if (tempData.length == 0) {
    return data.filter((item) =>
      filterCategory.toString().includes(item.type.toLowerCase())
    );
  } else {
    return tempData.filter((item) =>
      filterCategory.toString().includes(item.type.toLowerCase())
    );
  }
}

function filterAndDisplay() {
  let filterCategory = Array.from(checkedBoxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  let tempData = [];
  if (
    filterCategory.toString().includes("red") ||
    filterCategory.toString().includes("blue") ||
    filterCategory.toString().includes("green")
  ) {
    tempData = filterByColor(tempData, filterCategory);
  }
  if (
    filterCategory.toString().includes("man") ||
    filterCategory.toString().includes("women")
  ) {
    tempData = filterByGender(tempData, filterCategory);
  }
  if (
    filterCategory.toString().includes("0-250") ||
    filterCategory.toString().includes("250-450") ||
    filterCategory.toString().includes(">450")
  ) {
    tempData = filterByPrice(tempData, filterCategory);
  }
  if (
    filterCategory.toString().includes("round") ||
    filterCategory.toString().includes("hoodie") ||
    filterCategory.toString().includes("polo")
  ) {
    tempData = filterByType(tempData, filterCategory);
  }

  if (filterCategory.length == 0) {
    filteredData = data;
    searchData(data, searchVal);
  } else {
    filteredData = tempData;
    searchData(tempData, searchVal);
  }
}
for (let i = 0; i < checkedBoxes.length; i++) {
  checkedBoxes[i].addEventListener("change", filterAndDisplay);
}


function showToast(text) {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");
  x.innerHTML = text;

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}