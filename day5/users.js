const USERS_URL = "https://jsonplaceholder.typicode.com/users";

const loadBtn = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusEl = document.getElementById("status");
const usersList = document.getElementById("users-list");

// All users from the server. The filter works on this array,
// so typing never makes a new request.
let allUsers = [];

function showStatus(message) {
  statusEl.textContent = message;
}

// Draws any array of users (all of them, or a filtered list).
function renderUsers(list) {
  usersList.replaceChildren();

  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users match your filter.";
    usersList.appendChild(li);
    return;
  }

  list.forEach((user) => {
    const li = document.createElement("li");

    const name = document.createElement("strong");
    name.textContent = user.name;

    const details = document.createElement("div");
    details.textContent = `Email: ${user.email}`;

    const city = document.createElement("div");
    city.textContent = `City: ${user.address.city}`;

    const company = document.createElement("div");
    company.textContent = `Company: ${user.company.name}`;

    li.append(name, details, city, company);
    usersList.appendChild(li);
  });
}

async function loadUsers() {
  showStatus("Loading users...");
  loadBtn.disabled = true;

  try {
    const response = await fetch(USERS_URL);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    allUsers = await response.json();
    filterInput.value = "";
    renderUsers(allUsers);
    showStatus(`Loaded ${allUsers.length} users.`);
  } catch (error) {
    console.error(error);
    showStatus("Sorry, we couldn't load the users. Please try again.");
  } finally {
    loadBtn.disabled = false;
  }
}

// Filter the stored array (case-insensitive) without a new request.
function filterUsers() {
  if (allUsers.length === 0) return; // nothing loaded yet

  const text = filterInput.value.trim().toLowerCase();
  const matches = allUsers.filter((user) =>
    user.name.toLowerCase().includes(text)
  );
  renderUsers(matches);
}

loadBtn.addEventListener("click", loadUsers);
filterInput.addEventListener("input", filterUsers);
