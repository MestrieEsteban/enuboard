// === Données de base ===
let clients = JSON.parse(localStorage.getItem("clients")) || [];
const windowState = JSON.parse(localStorage.getItem("windowState")) || {};
const formState = JSON.parse(localStorage.getItem("formState")) || {};
const userParams = JSON.parse(localStorage.getItem("params")) || {
  enutrof: true,
  alertes: false,
};

// === Enutrof ===
const enutrofQuotes = [
  "Encore un client qui va cracher ses kamas.",
  "Pas besoin de PP pour ce genre de loot.",
  "Ils viennent pour l'XP, moi pour les kamas.",
  "Un combat de plus, un pain de moins.",
  "Je les fais marcher dans la salle et dans mon porte-monnaie.",
  "Il est où le drop ? Dans ma bourse.",
  "Le drop c'est surfait, les kamas c'est concret.",
  "Un client de plus, un pain de moins dans le sac.",
  "J'ai une PP de 0, mais un flair pour les pigeons.",
  "Plus de combats ? Plus de kamas !",
];

function talkEnutrof() {
  //   if (!userParams.enutrof) return;
  const bulle = document.getElementById("enutrof-bulle");
  const quote = enutrofQuotes[Math.floor(Math.random() * enutrofQuotes.length)];
  bulle.textContent = quote;
  bulle.classList.add("visible");
  setTimeout(() => bulle.classList.remove("visible"), 2500);
}

// === Fonctions client ===
function saveClients() {
  localStorage.setItem("clients", JSON.stringify(clients));
}

function renderClients() {
  const list = document.getElementById("client-list");
  list.innerHTML = "";

  if (clients.length === 0) {
    list.innerHTML = '<p style="opacity:0.7;">Aucun client pour le moment.</p>';
    return;
  }

  clients.forEach((client, index) => {
    const tr = document.createElement("tr");
    if (client.combats === 0) {
      tr.classList.add("zero-combat");
    }
    tr.innerHTML = `
      <td><strong>${client.name}</strong></td>
      <td>${client.combats}</td>
      <td><button class="btn" onclick="decrementCombat(${index})">-1</button></td>
      <td>
      <button class="btn" onclick="addCombats(${index}, 1)">+1</button>
      <button class="btn" onclick="addCombats(${index}, 5)">+5</button>
      </td>
      <td>
        <button on class="btn" onclick="copyPriceMessage(${index})" title="${getPreviewPrice(
      index
    )}">Tarif</button>
        <button class="btn" onclick="copyEndMessage(${index})" title="${getPreviewEnd(
      index
    )}">Fin</button>
      </td>
      <td><input type="checkbox" ${
        client.paid ? "checked" : ""
      } onchange="togglePaid(${index})" /></td>
      <td><button class="btn danger" onclick="removeClient(${index})">✖</button></td>
    `;
    list.appendChild(tr);
  });
}

function addClient(event) {
  event.preventDefault();
  const name = document.getElementById("client-name").value.trim();
  const combats = parseInt(document.getElementById("client-combats").value);
  const paid = document.getElementById("client-paid").checked;

  if (!name || isNaN(combats) || combats <= 0) return;

  clients.push({ name, combats, paid });
  saveClients();
  renderClients();
  event.target.reset();
  talkEnutrof();
}

function decrementCombat(index) {
  if (clients[index].combats > 0) clients[index].combats--;
  saveClients();
  renderClients();
}

function decrementAllCombats() {
  clients.forEach((client) => {
    if (client.combats > 0) client.combats--;
  });
  saveClients();
  renderClients();
}

function addCombats(index, val) {
  const input = document.getElementById(`add-cbt-${index}`);
  const value = parseInt(val);
  if (!isNaN(value) && value > 0) {
    clients[index].combats += value;
    clients[index].paid = false;
    saveClients();
    renderClients();
  }
}

function togglePaid(index) {
  clients[index].paid = !clients[index].paid;
  saveClients();
}

function removeClient(index) {
  clients.splice(index, 1);
  saveClients();
  renderClients();
}

function copyPriceMessage(index) {
  const pseudo = clients[index].name;
  const prix = parseInt(document.getElementById("input-prix")?.value || "0");
  const combats = parseInt(
    document.getElementById("input-combats")?.value || "5"
  );
  const total = combats === 5 ? 200000 : prix * combats;

  const message = `/w ${pseudo} ${prix.toLocaleString(
    "fr-FR"
  )}k/cbt — ${total.toLocaleString("fr-FR")}k/${combats} cbts`;
  navigator.clipboard.writeText(message).then(() => {
    showNotification("✔ Tarif copié pour " + pseudo);
    talkEnutrof();
  });
}

function copyEndMessage(index) {
  const pseudo = clients[index].name;
  const message = `/w ${pseudo} Tu n'as plus de combats restants :)`;
  navigator.clipboard.writeText(message).then(() => {
    showNotification("✔ Message de fin copié");
    talkEnutrof();
  });
}

// === Formulaire donjon/messages ===
function saveFormInputs() {
  formState.donjon = document.getElementById("input-donjon")?.value || "";
  formState.salle = document.getElementById("input-salle")?.value || "";
  formState.prix = document.getElementById("input-prix")?.value || "";
  formState.combats = document.getElementById("input-combats")?.value || "";
  formState.places = document.getElementById("input-places")?.value || "";
  localStorage.setItem("formState", JSON.stringify(formState));
}

function applyFormInputs() {
  document.getElementById("input-donjon").value = formState.donjon || "";
  document.getElementById("input-salle").value = formState.salle || "";
  document.getElementById("input-prix").value = formState.prix || "";
  document.getElementById("input-combats").value = formState.combats || "";
  document.getElementById("input-places").value = formState.places || "";
}

// Fonction pour formater le message de recrutement
function formatRecruitMessage(donjon, salle, prix, combats, places) {
  if (!donjon) return "";

  const prixNum = parseInt(prix) || 0;
  const combatsNum = parseInt(combats) || 5;
  const totalPrix = combatsNum === 5 ? 200000 : prixNum * combatsNum;

  let message = `Recrute PL ${donjon}`;
  if (salle) message += ` ${salle}`;
  message += ` — ${prixNum.toLocaleString(
    "fr-FR"
  )}k/cbt — ${totalPrix.toLocaleString(
    "fr-FR"
  )}k/${combatsNum} cbts me mp :) !`;

  if (places) {
    const placesNum = parseInt(places);
    if (!isNaN(placesNum)) {
      message += ` (${placesNum} place${placesNum > 1 ? "s" : ""})`;
    } else {
      message += ` (${places})`;
    }
  }

  return message;
}

// Fonction pour mettre à jour l'aperçu du message
function updateMessagePreview() {
  const donjon = document.getElementById("input-donjon").value;
  const salle = document.getElementById("input-salle").value;
  const prix = document.getElementById("input-prix").value;
  const combats = document.getElementById("input-combats").value;
  const places = document.getElementById("input-places").value;

  const previewElement = document.getElementById("message-preview-content");
  previewElement.classList.add("updating");

  const message =
    formatRecruitMessage(donjon, salle, prix, combats, places) ||
    "Remplissez les champs pour voir l'aperçu du message...";

  previewElement.textContent = message;

  setTimeout(() => {
    previewElement.classList.remove("updating");
  }, 200);
}

// Ajouter les écouteurs d'événements pour la mise à jour en direct
function setupMessagePreview() {
  const inputs = [
    "input-donjon",
    "input-salle",
    "input-prix",
    "input-combats",
    "input-places",
  ];

  inputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", updateMessagePreview);
    }
  });
}

// Fonction pour copier le message de recrutement
function copyMessage(type) {
  const donjon = document.getElementById("input-donjon").value;
  const salle = document.getElementById("input-salle").value;
  const prix = document.getElementById("input-prix").value;
  const combats = document.getElementById("input-combats").value;
  const places = document.getElementById("input-places").value;

  let message = "";

  if (type === "recrutement") {
    message = formatRecruitMessage(donjon, salle, prix, combats, places);
  } else if (type === "go") {
    message = `Go ${donjon}${salle ? ` ${salle}` : ""} !`;
  } else if (type === "info") {
    message = `Mode créa - F1 - Attention aux challs`;
  }

  if (message) {
    navigator.clipboard.writeText(message).then(() => {
      showNotification("✔ Message copié");
      talkEnutrof();
      saveFormInputs();
    });
  }
}

// Initialiser la prévisualisation au chargement
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("kamas-start").value =
    localStorage.getItem("kamasStart") || "";
  document.getElementById("kamas-end").value =
    localStorage.getItem("kamasEnd") || "";
    document.addEventListener("input", (e) => {
      if (e.target.id === "kamas-start") localStorage.setItem("kamasStart", e.target.value);
      if (e.target.id === "kamas-end") localStorage.setItem("kamasEnd", e.target.value);
    });

    
  updateKamasProfit(); // Mise à jour affichage
  setupMessagePreview();
  updateMessagePreview(); // Afficher l'état initial
});

// === Notifications ===
function showNotification(text) {
  const notif = document.createElement("div");
  notif.className = "notif-toast";
  notif.textContent = text;
  document.body.appendChild(notif);

  setTimeout(() => notif.classList.add("visible"), 50);
  setTimeout(() => {
    notif.classList.remove("visible");
    setTimeout(() => notif.remove(), 300);
  }, 1800);
}

// === Paramètres ===
function saveParams() {
  userParams.enutrof = document.getElementById("param-enutrof")?.checked;
  userParams.alertes = document.getElementById("param-alertes")?.checked;
  localStorage.setItem("params", JSON.stringify(userParams));
}

function applyParamsUI() {
  document.getElementById("param-enutrof").checked = userParams.enutrof;
  document.getElementById("param-alertes").checked = userParams.alertes;
}

// === Sauvegarde / export ===
function exportData() {
  const data = {
    clients,
    formState,
    windowState,
    memoText: localStorage.getItem("memoText") || "",
    params: userParams,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dashboard-pl-dofus-backup.json";
  a.click();
  URL.revokeObjectURL(url);
  talkEnutrof();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data.clients))
        throw new Error("Données clients manquantes");

      clients = data.clients;
      if (typeof data.formState === "object")
        Object.assign(formState, data.formState);
      if (typeof data.windowState === "object")
        Object.assign(windowState, data.windowState);
      if (typeof data.memoText === "string")
        localStorage.setItem("memoText", data.memoText);
      if (typeof data.params === "object") {
        Object.assign(userParams, data.params);
        localStorage.setItem("params", JSON.stringify(userParams));
      }

      saveClients();
      saveFormInputs();
      Object.keys(windowState).forEach(saveWindowState);
      renderClients();
      applyFormInputs();
      applyParamsUI();
      loadMemo();
      talkEnutrof();
      showNotification("✔ Sauvegarde importée !");
    } catch (e) {
      alert("❌ Erreur : " + e.message);
      console.error(e);
    }
  };
  reader.readAsText(file);
}

function resetDashboard() {
  if (!confirm("⚠️ Tout réinitialiser ?")) return;
  localStorage.clear();
  location.reload();
}

// === Mémo ===
function saveMemo() {
  const text = document.getElementById("memo-text")?.value || "";
  localStorage.setItem("memoText", text);
}

function loadMemo() {
  const saved = localStorage.getItem("memoText");
  if (saved && document.getElementById("memo-text")) {
    document.getElementById("memo-text").value = saved;
  }
}

// === Gestion des fenêtres ===
function saveWindowState(id) {
  const el = document.getElementById(`window-${id}`);
  if (!el) return;

  // Ne sauvegarde pas les dimensions si la fenêtre est masquée
  const isVisible = el.style.display !== "none";
  if (isVisible) {
    windowState[id] = {
      top: el.offsetTop,
      left: el.offsetLeft,
      width: el.offsetWidth,
      height: el.offsetHeight,
      visible: true,
    };
  } else {
    // Juste enregistrer l'état visible = false
    if (!windowState[id]) windowState[id] = {};
    windowState[id].visible = false;
  }

  localStorage.setItem("windowState", JSON.stringify(windowState));
}

let windowOffset = 0; // compteur de décalage

function applyWindowState(id) {
  const el = document.getElementById(`window-${id}`);
  const state = windowState[id];

  if (!el) return;

  if (!state) {
    // Pas de sauvegarde → tailles + position décalées
    const offset = windowOffset * 20;
    el.style.display = "block";
    el.style.top = 100 + offset + "px";
    el.style.left = 100 + offset + "px";
    el.style.width = "500px";
    el.style.height = "400px";
    windowOffset++;
    return;
  }

  // Sinon appliquer la sauvegarde
  el.style.top = state.top + "px";
  el.style.left = state.left + "px";
  el.style.width = state.width + "px";
  el.style.height = state.height + "px";
  el.style.display = state.visible ? "block" : "none";
}

function openWindow(id) {
  const el = document.getElementById(`window-${id}`);
  if (el) {
    el.style.display = "block";
    el.style.zIndex = Date.now();
    saveWindowState(id);
  }
}

function closeWindow(id) {
  const el = document.getElementById(`window-${id}`);
  // if(id == "welcome")
  // {
  //   openWindow("messages");
  //   openWindow("clients");
  // }
  if (el) {
    el.style.display = "none";
    saveWindowState(id);
  }
}

function minimizeWindow(id) {
  closeWindow(id);
}

// === Drag & Resize ===
let draggingWindow = null;
let offsetX = 0;
let offsetY = 0;
let resizingWindow = null;
let resizeStartX = 0;
let resizeStartY = 0;
let initialWidth = 0;
let initialHeight = 0;

function startDrag(event, id) {
  const el = document.getElementById(`window-${id}`);
  if (!el) return;
  draggingWindow = el;
  draggingWindow.dataset.id = id;
  offsetX = event.clientX - el.offsetLeft;
  offsetY = event.clientY - el.offsetTop;
}

function startResize(event, id) {
  const el = document.getElementById(`window-${id}`);
  if (!el) return;
  resizingWindow = el;
  resizingWindow.dataset.id = id;
  resizeStartX = event.clientX;
  resizeStartY = event.clientY;
  initialWidth = el.offsetWidth;
  initialHeight = el.offsetHeight;
  event.preventDefault();
  event.stopPropagation();
}

document.addEventListener("mousemove", (event) => {
  if (draggingWindow) {
    draggingWindow.style.left = event.clientX - offsetX + "px";
    draggingWindow.style.top = event.clientY - offsetY + "px";
  } else if (resizingWindow) {
    const width = initialWidth + (event.clientX - resizeStartX);
    const height = initialHeight + (event.clientY - resizeStartY);
    resizingWindow.style.width = width + "px";
    resizingWindow.style.height = height + "px";
  }
});

document.addEventListener("mouseup", () => {
  if (draggingWindow) {
    saveWindowState(draggingWindow.dataset.id);
    draggingWindow = null;
  }
  if (resizingWindow) {
    saveWindowState(resizingWindow.dataset.id);
    resizingWindow = null;
  }
});

// === Init ===
window.addEventListener("DOMContentLoaded", () => {
  //start site la !
  ["messages", "clients", "memo", "kamas", "welcome"].forEach(
    applyWindowState
  );
  applyFormInputs();
  renderClients();
  loadMemo();
  applyParamsUI();
  setupMessagePreview();
  updateMessagePreview(); // Mettre à jour l'aperçu au chargement
});

document.addEventListener("input", (e) => {
  if (
    [
      "input-donjon",
      "input-salle",
      "input-prix",
      "input-combats",
      "input-places",
    ].includes(e.target.id)
  ) {
    saveFormInputs();
  }
  if (e.target.id === "memo-text") saveMemo();
  if (e.target.id.startsWith("param-")) saveParams();
});

function getPreviewPrice(index) {
  const pseudo = clients[index].name;
  const prix = parseInt(document.getElementById("input-prix")?.value || "0");
  const combats = parseInt(
    document.getElementById("input-combats")?.value || "5"
  );
  const total = combats === 5 ? 200000 : prix * combats;
  return `/w ${pseudo} ${prix.toLocaleString(
    "fr-FR"
  )}k/cbt — ${total.toLocaleString("fr-FR")}k/${combats} cbts`;
}

function getPreviewEnd(index) {
  return `/w ${clients[index].name} Tu n'as plus de combats restants :)`;
}

function copyInfoMessage() {
  alert("test");
  const dungeonName = document.getElementById("dungeon-name").value;
  const dungeonLevel = document.getElementById("dungeon-level").value;
  const message = `${dungeonName} ${dungeonLevel}`;

  navigator.clipboard
    .writeText(message)
    .then(() => {
      showNotification("Message copié !");
    })
    .catch((err) => {
      console.error("Erreur lors de la copie:", err);
      showNotification("Erreur lors de la copie du message", "error");
    });
}

let kamasLog = JSON.parse(localStorage.getItem("kamasLog")) || [];

function updateKamasProfit() {
  const start = parseInt(document.getElementById("kamas-start").value) || 0;
  const end = parseInt(document.getElementById("kamas-end").value) || 0;
  const profit = end - start;
  document.getElementById("kamas-profit").textContent =
    profit.toLocaleString("fr-FR");
}

function saveKamasDay() {
  const start = parseInt(document.getElementById("kamas-start").value);
  const end = parseInt(document.getElementById("kamas-end").value);

  if (isNaN(start) || isNaN(end)) {
    alert("Veuillez remplir les deux champs de kamas.");
    return;
  }

  const profit = end - start;
  const date = new Date().toISOString().split("T")[0];

  kamasLog.push({ date, profit });
  localStorage.setItem("kamasLog", JSON.stringify(kamasLog));
  renderKamasHistory();
  showNotification("✔ Journée enregistrée !");
  renderKamasChart();
}

function renderKamasHistory(index) {
  const tbody = document.getElementById("kamas-history");
  if (!tbody) return;
  tbody.innerHTML = "";

  [...kamasLog].reverse().forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
  <td>${entry.date}</td>
  <td>${entry.profit.toLocaleString("fr-FR")}k</td>
  <td><button class="btn danger" onclick="deleteKamasEntry(${
    kamasLog.length - 1 - index
  })">✖</button></td>
`;
    tbody.appendChild(tr);
  });
  renderKamasChart();
}

function deleteKamasEntry(index) {
  kamasLog.splice(index, 1);
  localStorage.setItem("kamasLog", JSON.stringify(kamasLog));
  renderKamasHistory(index);
  showNotification("🗑️ Journée supprimée !");
}

let kamasChart;

function renderKamasChart() {
  const ctx = document.getElementById("kamasChart")?.getContext("2d");
  if (!ctx) return;

  const labels = kamasLog.map((entry) => entry.date);
  const data = kamasLog.map((entry) => entry.profit);

  if (kamasChart) kamasChart.destroy(); // pour éviter les doublons

  kamasChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Bénéfice quotidien (kamas)",
          data,
          borderColor: "#c2a76d",
          backgroundColor: "rgba(194, 167, 109, 0.2)",
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val) => val.toLocaleString("fr-FR") + "k",
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

document.addEventListener("input", (e) => {
  if (["kamas-start", "kamas-end"].includes(e.target.id)) {
    updateKamasProfit();
  }
});

renderKamasChart();
renderKamasHistory();


