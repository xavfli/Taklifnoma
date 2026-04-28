const weddingDate = new Date("2026-09-12T15:00:00+05:00");

const invitation = document.getElementById("invitation");
const revealButton = document.getElementById("revealInvitation");
const revealItems = document.querySelectorAll(".reveal");
const rsvpForm = document.getElementById("rsvpForm");
const formResponse = document.getElementById("formResponse");
const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));
const galleryDots = document.getElementById("galleryDots");
const backgroundMusic = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const musicToggleLabel = document.querySelector(".music-toggle__label");
const envelopeScreen = document.getElementById("envelopeScreen");
const envelopeOpen = document.getElementById("envelopeOpen");
let hasAttemptedAutoplay = false;
let hasOpenedExperience = false;
let hasAudioError = false;

document.body.classList.add("is-locked");

function syncMusicButton(isPlaying) {
  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  if (hasAudioError) {
    musicToggleLabel.textContent = "Music Not Found";
    return;
  }

  musicToggleLabel.textContent = isPlaying ? "Pause Music" : "Play Music";
}

function setAudioError() {
  hasAudioError = true;
  musicToggle.classList.add("is-error");
  musicToggle.classList.remove("is-playing");
  musicToggle.setAttribute("aria-pressed", "false");
  musicToggleLabel.textContent = "Music Not Found";
}

async function playMusic() {
  if (hasAudioError) {
    return;
  }

  try {
    backgroundMusic.volume = 1;
    await backgroundMusic.play();
    syncMusicButton(true);
  } catch (error) {
    syncMusicButton(false);
  }
}

function pauseMusic() {
  backgroundMusic.pause();
  syncMusicButton(false);
}

function unlockInvitation() {
  invitation.classList.remove("invitation--locked");
  revealItems.forEach((item, index) => {
    window.setTimeout(() => {
      item.classList.add("is-visible");
    }, 90 * index);
  });
  invitation.scrollIntoView({ behavior: "smooth", block: "start" });

  if (!hasAttemptedAutoplay) {
    hasAttemptedAutoplay = true;
    playMusic();
  }
}

function openExperience() {
  if (hasOpenedExperience) {
    return;
  }

  hasOpenedExperience = true;
  envelopeOpen.classList.add("is-opening");

  window.setTimeout(() => {
    envelopeScreen.classList.add("is-opened");
    document.body.classList.remove("is-locked");
    unlockInvitation();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 720);
}

revealButton.addEventListener("click", unlockInvitation);
envelopeOpen.addEventListener("click", openExperience);
musicToggle.addEventListener("click", () => {
  if (hasAudioError) {
    return;
  }

  if (backgroundMusic.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
});

window.addEventListener(
  "scroll",
  () => {
    if (!hasOpenedExperience) {
      return;
    }

    if (window.scrollY > 40 && invitation.classList.contains("invitation--locked")) {
      unlockInvitation();
    }
  },
  { passive: true }
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  }
);

revealItems.forEach((item) => observer.observe(item));

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;
  const safeDiff = Math.max(diff, 0);

  const days = Math.floor(safeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safeDiff / (1000 * 60)) % 60);
  const seconds = Math.floor((safeDiff / 1000) % 60);

  document.getElementById("days").textContent = String(days).padStart(3, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

function setActiveGallery(index) {
  galleryCards.forEach((card, cardIndex) => {
    card.classList.toggle("is-active", cardIndex === index);
  });

  Array.from(galleryDots.children).forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });
}

galleryCards.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Show gallery image ${index + 1}`);
  dot.addEventListener("click", () => {
    galleryIndex = index;
    setActiveGallery(galleryIndex);
  });
  galleryDots.appendChild(dot);
});

let galleryIndex = 0;
setActiveGallery(galleryIndex);

window.setInterval(() => {
  galleryIndex = (galleryIndex + 1) % galleryCards.length;
  setActiveGallery(galleryIndex);
}, 3500);

backgroundMusic.addEventListener("play", () => syncMusicButton(true));
backgroundMusic.addEventListener("pause", () => syncMusicButton(false));
backgroundMusic.addEventListener("ended", () => syncMusicButton(false));
backgroundMusic.addEventListener("error", () => setAudioError());

if (!backgroundMusic.querySelector("source")?.getAttribute("src")) {
  setAudioError();
}

rsvpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(rsvpForm);
  const guestName = formData.get("name");
  const attendance = formData.get("attendance");

  const messages = {
    "joyfully-attending": `Rahmat, ${guestName}. Siz bilan bu quvonchli kunni nishonlashni intiqlik bilan kutamiz.`,
    "attending-with-regrets": `Rahmat, ${guestName}. Marosimning bir qismida sizni ko'rish biz uchun mamnuniyat bo'ladi.`,
    "sending-love": `Rahmat, ${guestName}. Ezgu tilaklaringiz biz uchun juda qadrlidir.`,
  };

  formResponse.textContent = messages[attendance] || "Javobingiz uchun rahmat.";
  rsvpForm.reset();
});
