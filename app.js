const navigation = document.querySelector("#navigation");
const menu = document.querySelector(".menu");

function setMenu(open) {
  menu.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("open", open);
}

menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") === "false"));
navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menu.focus();
  }
});

const destinations = {
  accra: {
    name: "Accra, Ghana", kind: "Food and city life",
    copy: "Spend a weekend exploring the capital’s history, food and arts, with time to unwind by the sea.",
    ideas: ["Saturday morning: Explore Black Star Square and Kwame Nkrumah Memorial Park", "Saturday afternoon: Try Ga dishes and browse the food stalls", "Sunday: Spend a quiet afternoon at the beach"]
  },
  volta: {
    name: "Volta Region, Ghana", kind: "Nature and hiking",
    copy: "Base yourself near Hohoe for forest walks, waterfalls and views of the green hills along Ghana’s eastern edge.",
    ideas: ["Saturday morning: Walk to the lower falls at Wli", "Saturday afternoon: Explore the countryside around Hohoe", "Sunday: Take a guided hike up Mount Afadja"]
  },
  ghana: {
    name: "Cape Coast, Ghana", kind: "Culture and coast",
    copy: "Make room for a thoughtful visit to the historic coast, then head inland for a change of pace.",
    ideas: ["Saturday morning: Take a guided visit at Cape Coast Castle", "Saturday afternoon: Spend time by the ocean in Elmina", "Sunday: Explore the canopy walk at Kakum"]
  }
};

const placeDialog = document.querySelector("#place-dialog");
const placePhoto = document.querySelector("#place-photo");
const planner = document.querySelector("#planner");
const tripForm = document.querySelector("#trip-form");
const brief = document.querySelector("#brief");
const briefTitle = document.querySelector("#brief-title");
const sendBrief = document.querySelector("#send-brief");
const whatsappContact = document.querySelector("#whatsapp-contact");
const briefStatus = document.querySelector("#brief-status");
let selectedPlace;
let briefText = "";
let plannerReturnTarget;

document.querySelectorAll("[data-place]").forEach(button => {
  button.addEventListener("click", () => {
    const key = button.dataset.place;
    const place = destinations[key];
    selectedPlace = { name: place.name, button };
    placePhoto.className = "dialog-photo " + key;
    document.querySelector("#place-kind").textContent = place.kind;
    document.querySelector("#place-title").textContent = place.name;
    document.querySelector("#place-copy").textContent = place.copy;
    document.querySelector("#place-ideas").replaceChildren(...place.ideas.map(idea => {
      const item = document.createElement("li");
      item.textContent = idea;
      return item;
    }));
    placeDialog.showModal();
  });
});

function openPlanner(trigger, destination) {
  plannerReturnTarget = trigger;
  tripForm.hidden = false;
  brief.hidden = true;
  if (destination) {
    tripForm.elements.destination.value = destination;
    tripForm.elements.destination.setCustomValidity("");
  }
  planner.showModal();
  tripForm.elements.destination.focus();
}

document.querySelectorAll("[data-plan]").forEach(button => {
  button.addEventListener("click", () => openPlanner(button, destinations[button.dataset.plan]?.name));
});

document.querySelector("#plan-destination").addEventListener("click", () => {
  placeDialog.close();
  openPlanner(selectedPlace.button, selectedPlace.name);
});

planner.addEventListener("close", () => plannerReturnTarget?.focus());

tripForm.elements.destination.addEventListener("input", event => event.target.setCustomValidity(""));

tripForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(tripForm);
  const destination = data.get("destination").trim();
  if (!destination) {
    tripForm.elements.destination.setCustomValidity("Enter a destination to continue.");
    tripForm.elements.destination.reportValidity();
    return;
  }

  const entries = [
    ["Departing from", data.get("origin").trim() || "To be decided"],
    ["Destination", destination],
    ["Travel window", data.get("timing").trim() || "Flexible"],
    ["Travelers", data.get("travelers")],
    ["Budget", data.get("budget") ? "GHS " + data.get("budget") : "To be decided"],
    ["Planning help", data.get("service")],
    ["Trip notes", data.get("notes").trim() || "No notes added"]
  ];
  document.querySelector("#brief-details").replaceChildren(...entries.flatMap(([label, value]) => {
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    return [term, description];
  }));
  briefText = "FranCity Travel Consult\nTrip brief\n\n" +
    entries.map(([label, value]) => label + ": " + value).join("\n") + "\n";
  const inquiry = new URL(whatsappContact.href);
  inquiry.searchParams.set("text", "Hello FranCity, I’d like help planning a trip. Here’s my brief:\n\n" + briefText);
  sendBrief.href = inquiry.href;
  tripForm.hidden = true;
  brief.hidden = false;
  briefStatus.textContent = "";
  briefTitle.focus();
});

document.querySelector("#edit").addEventListener("click", () => {
  tripForm.hidden = false;
  brief.hidden = true;
  tripForm.elements.destination.focus();
});

document.querySelector("#download").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([briefText], { type: "text/plain;charset=utf-8" }));
  const download = document.createElement("a");
  download.href = url;
  download.download = "francity-trip-brief.txt";
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

const copyButton = document.querySelector("#copy");
if (navigator.clipboard?.writeText) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(briefText);
      briefStatus.textContent = "Trip brief copied.";
    } catch {
      briefStatus.textContent = "Copying is unavailable. You can download the brief instead.";
    }
  });
}
