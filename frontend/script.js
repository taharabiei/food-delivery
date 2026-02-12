const API_BASE = "http://localhost:3000";

let cart = [];
let currentUser = "";

function hideAll() {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("register-container").style.display = "none";
  document.getElementById("menu-container").style.display = "none";
  document.getElementById("admin-container").style.display = "none";
}

function showLogin() {
  hideAll();
  document.getElementById("login-container").style.display = "block";
}

function showRegister() {
  hideAll();
  document.getElementById("register-container").style.display = "block";
}

function showRestaurants() {
  hideAll();
  document.getElementById("menu-container").style.display = "block";
  loadFoods();
}


const menuBtn = document.getElementById("menu-btn");
const menuOptions = document.getElementById("menu-options");

menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  menuOptions.style.display = (menuOptions.style.display === "none") ? "block" : "none";
});


document.addEventListener("click", () => {
  menuOptions.style.display = "none";
});

document.getElementById("go-login").addEventListener("click", () => {
  menuOptions.style.display = "none";
  showLogin();
});

document.getElementById("go-register").addEventListener("click", () => {
  menuOptions.style.display = "none";
  showRegister();
});

document.getElementById("go-restaurants").addEventListener("click", () => {
  menuOptions.style.display = "none";
  showRestaurants();
});


document.getElementById("register-link").addEventListener("click", (e) => {
  e.preventDefault();
  showRegister();
});

document.getElementById("login-link").addEventListener("click", (e) => {
  e.preventDefault();
  showLogin();
});


document.getElementById("register-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("register-username").value.trim();
  const password = document.getElementById("register-password").value.trim();

  fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((r) => r.text())
    .then((msg) => {
      alert(msg);
      showLogin();
    })
    .catch(() => alert("Error registering user"));
});


document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    })
    .then((data) => {
      alert("Login successful!");
      currentUser = data.username;

      showRestaurants();


      if (data.role === "admin") {
        document.getElementById("admin-container").style.display = "block";
      } else {
        document.getElementById("admin-container").style.display = "none";
      }

      cart = [];
      renderCart();
    })
    .catch((err) => {
      console.error(err);
      alert("Error logging in");
    });
});


function loadFoods() {
  fetch(`${API_BASE}/menu`)
    .then((r) => r.json())
    .then((foods) => {
     
      const menuList = document.getElementById("menu-list");
      menuList.innerHTML = "";

      foods.forEach((food) => {
        const li = document.createElement("li");
        const left = document.createElement("span");
        left.textContent = `${food.name} - ${food.price}`;

        const addBtn = document.createElement("button");
        addBtn.textContent = "Add to cart";
        addBtn.style.width = "auto";
        addBtn.style.margin = "0";
        addBtn.onclick = () => addToCart(food);

        li.appendChild(left);
        li.appendChild(addBtn);
        menuList.appendChild(li);
      });

   
      const adminVisible = document.getElementById("admin-container").style.display !== "none";
      if (adminVisible) {
        const adminList = document.getElementById("admin-menu-list");
        adminList.innerHTML = "";

        foods.forEach((food) => {
          const li = document.createElement("li");
          li.className = "admin-item";

          const info = document.createElement("span");
          info.textContent = `${food.id}) ${food.name} - ${food.price}`;

          const editBtn = document.createElement("button");
          editBtn.textContent = "Edit";
          editBtn.onclick = () => editFood(food);

          const delBtn = document.createElement("button");
          delBtn.textContent = "Delete";
          delBtn.onclick = () => deleteFood(food.id);

          li.appendChild(info);
          li.appendChild(editBtn);
          li.appendChild(delBtn);
          adminList.appendChild(li);
        });
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Error fetching menu");
    });
}


function addToCart(food) {
  const found = cart.find((item) => item.id === food.id);
  if (found) found.qty += 1;
  else {
    cart.push({
      id: food.id,
      name: food.name,
      price: Number(food.price),
      qty: 1,
    });
  }
  renderCart();
}

function removeFromCart(foodId) {
  cart = cart.filter((item) => item.id !== foodId);
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cart-list");
  const summary = document.getElementById("cart-summary");

  cartList.innerHTML = "";

  if (cart.length === 0) {
    summary.textContent = "Cart is empty.";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.qty;

    const li = document.createElement("li");

    const left = document.createElement("span");
    left.textContent = `${item.name} x${item.qty} - ${(item.price * item.qty).toFixed(2)}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.width = "auto";
    removeBtn.style.margin = "0";
    removeBtn.onclick = () => removeFromCart(item.id);

    li.appendChild(left);
    li.appendChild(removeBtn);
    cartList.appendChild(li);
  });

  summary.textContent = `Total: ${total.toFixed(2)}`;
}


document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  fetch(`${API_BASE}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: currentUser,
      cart: cart,
      total: total,
    }),
  })
    .then((r) => r.text())
    .then((msg) => {
      alert(msg);
      cart = [];
      renderCart();
    })
    .catch((err) => {
      console.error(err);
      alert("Error placing order");
    });
});


document.getElementById("add-food-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("food-name").value.trim();
  const description = document.getElementById("food-description").value.trim();
  const price = document.getElementById("food-price").value;

  fetch(`${API_BASE}/add-food`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, price }),
  })
    .then((r) => r.text())
    .then((msg) => {
      alert(msg);
      document.getElementById("add-food-form").reset();
      loadFoods();
    })
    .catch((err) => {
      console.error(err);
      alert("Error adding food");
    });
});

function deleteFood(foodId) {
  fetch(`${API_BASE}/delete-food/${foodId}`, { method: "DELETE" })
    .then((r) => r.text())
    .then((msg) => {
      alert(msg);
      loadFoods();
    })
    .catch((err) => {
      console.error(err);
      alert("Error deleting food");
    });
}

function editFood(food) {
  const name = prompt("New name:", food.name);
  if (name === null) return;

  const description = prompt("New description:", food.description);
  if (description === null) return;

  const price = prompt("New price:", food.price);
  if (price === null) return;

  fetch(`${API_BASE}/edit-food/${food.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, price }),
  })
    .then((r) => r.text())
    .then((msg) => {
      alert(msg);
      loadFoods();
    })
    .catch((err) => {
      console.error(err);
      alert("Error editing food");
    });
}

hideAll(); 