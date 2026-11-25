const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

class RoseAudio {
  constructor() {
    this.context = null;
    this.effectsEnabled = false;
    this.musicEnabled = false;
    this.musicNodes = [];
    this.effectVolume = 0.06;
    this.musicVolume = 0.025;
  }
  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.effectBus = this.context.createGain();
      this.effectBus.gain.value = this.effectVolume;
      this.effectBus.connect(this.context.destination);
      this.musicBus = this.context.createGain();
      this.musicBus.gain.value = this.musicVolume;
      this.musicBus.connect(this.context.destination);
    }
    if (this.context.state === "suspended") this.context.resume();
  }
  tone(frequency, duration = 0.5, volume = 0.035, type = "sine", delay = 0) {
    if (!this.effectsEnabled) return;
    this.init();
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(this.effectBus);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }
  chime() { this.tone(659.25, .8, .028, "sine"); this.tone(987.77, 1.1, .018, "sine", .09); }
  whisper() { this.tone(392, .55, .018, "triangle"); this.tone(523.25, .7, .012, "sine", .06); }
  reveal() { this.tone(523.25, .7, .022); this.tone(659.25, .9, .018, "sine", .12); this.tone(783.99, 1.1, .014, "sine", .24); }
  paper() { this.tone(185, .18, .018, "triangle"); this.tone(220, .12, .012, "triangle", .12); }
  space() { this.tone(220, 1.2, .018, "sine"); this.tone(329.63, 1.4, .012, "sine", .18); }
  gift() { this.tone(293.66, .4, .02); this.tone(440, .7, .018, "sine", .12); this.tone(587.33, 1, .012, "sine", .25); }
  envelopeChime() { this.tone(523.25, .45, .022); this.tone(783.99, .7, .014, "sine", .08); }
  seal() { this.tone(1046.5, .22, .018, "triangle"); this.tone(659.25, .38, .012, "sine", .06); }
  unfold() { this.tone(196, .25, .012, "triangle"); this.tone(246.94, .35, .012, "triangle", .18); }
  pianoNote() { this.tone(523.25 + Math.random() * 55, .55, .018, "sine"); }
  shake(strong = false) {
    this.tone(strong ? 155 : 185, strong ? .32 : .22, strong ? .028 : .018, "triangle");
    this.tone(strong ? 230 : 210, .18, .012, "triangle", strong ? .11 : .08);
  }
  ribbon() { this.tone(185, .28, .015, "triangle"); this.tone(246.94, .35, .012, "triangle", .12); }
  sparkle() { this.tone(1046.5, .45, .012, "sine"); this.tone(1318.51, .65, .009, "sine", .09); }
  airy() { this.tone(392, 1.4, .012, "sine"); this.tone(587.33, 1.8, .009, "sine", .16); }
  celebration() { this.tone(783.99, .65, .016, "sine"); this.tone(1046.5, .9, .012, "sine", .12); }
  softNote() { this.tone(523.25, 1.1, .01, "triangle"); }
  setEffects(enabled) { this.effectsEnabled = enabled; if (enabled) this.init(); }
  setMusic(enabled) {
    this.musicEnabled = enabled;
    this.init();
    if (!enabled) {
      this.musicNodes.forEach((node) => { try { node.stop(); } catch (_) {} });
      this.musicNodes = [];
      return;
    }
    [261.63, 329.63, 392].forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.018 / (index + 1);
      oscillator.connect(gain).connect(this.musicBus);
      oscillator.start();
      this.musicNodes.push(oscillator);
    });
  }
}

const audio = new RoseAudio();
const welcomeCard = $("#welcomeCard");
const ribbon = $("#ribbon");
const envelope = $("#envelope");
const letter = $("#letter");
const continueButton = $("#continueButton");
const intro = $("#intro");
const universe = $("#universe");
let planetExplored = new Set();
let reasonExplored = new Set();
let surpriseExplored = new Set();
let openedGifts = new Set();
try {
  planetExplored = new Set(JSON.parse(localStorage.getItem("latifaPlanets") || "[]"));
  reasonExplored = new Set(JSON.parse(localStorage.getItem("latifaReasons") || "[]"));
  surpriseExplored = new Set(JSON.parse(localStorage.getItem("latifaSurprises") || "[]"));
  openedGifts = new Set(JSON.parse(localStorage.getItem("latifaGifts") || "[]"));
  giftsUnlocked = openedGifts.size > 0;
} catch (_) {}

$("#letterSeal").addEventListener("click", () => audio.chime());
$("#letterSeal").addEventListener("pointerdown", () => {
  welcomeCard.classList.add("is-hidden");
  ribbon.style.opacity = "1";
  ribbon.style.transform = "translateX(-50%) scale(1)";
  audio.seal();
});
$("#letterSeal").addEventListener("pointerenter", () => audio.envelopeChime());

ribbon.addEventListener("click", () => {
  if (ribbon.classList.contains("untying")) return;
  ribbon.classList.add("untying");
  audio.ribbon();
  setTimeout(() => {
    ribbon.style.opacity = "0";
    ribbon.style.pointerEvents = "none";
    envelope.classList.add("visible");
    audio.reveal();
  }, 650);
});

envelope.addEventListener("click", () => {
  if (envelope.classList.contains("opening")) return;
  envelope.classList.add("opening");
  audio.paper();
  setTimeout(() => audio.unfold(), 900);
  setTimeout(() => audio.reveal(), 1450);
  setTimeout(() => {
    envelope.classList.remove("visible");
    letter.classList.add("visible");
    audio.reveal();
  }, 2200);
  setTimeout(() => continueButton.classList.add("visible"), 4200);
});

continueButton.addEventListener("click", () => {
  audio.reveal();
  intro.classList.remove("active");
  activateJourneyStage(getResumeStage());
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const journeyStages = ["planets", "reasons", "surprises", "gifts", "birthdayFinal"];
function getResumeStage() {
  let savedStage = localStorage.getItem("latifaStage");
  if (savedStage === "finale") savedStage = "gifts";
  const stage = journeyStages.includes(savedStage) ? savedStage : "planets";
  const prerequisites = {
    planets: true,
    reasons: planetExplored.size === 6,
    surprises: planetExplored.size === 6 && reasonExplored.size === 10,
    gifts: planetExplored.size === 6 && reasonExplored.size === 10 && surpriseExplored.size === 4,
    birthdayFinal: planetExplored.size === 6 && reasonExplored.size === 10 && surpriseExplored.size === 4 && openedGifts.size === 8
  };
  return prerequisites[stage] ? stage : "planets";
}

function restoreJourneyProgress() {
  $$(".reason").forEach((reason) => {
    if (reasonExplored.has(reason.querySelector(".reason-number").textContent)) reason.classList.add("open");
  });
  $$(".planet").forEach((planet) => {
    if (planetExplored.has(planet.dataset.title)) planet.classList.add("explored");
  });
  const lastSurprise = $$(".surprise").find((item) => surpriseExplored.has(item.dataset.message));
  if (lastSurprise) {
    lastSurprise.classList.add("open");
    $("#surpriseReveal").innerHTML = `<span>✦</span><p>${lastSurprise.dataset.message}</p>`;
  }
  $$(".gift").forEach((gift) => {
    if (openedGifts.has(Number(gift.dataset.gift))) gift.classList.add("gift-opened");
  });
  $("#giftOpenedCount").textContent = openedGifts.size;
  $("#giftRemainingCount").textContent = 8 - openedGifts.size;
}

function activateJourneyStage(stage) {
  const safeStage = journeyStages.includes(stage) ? stage : "planets";
  if (safeStage === "birthdayFinal" && (
    planetExplored.size !== 6 ||
    reasonExplored.size !== 10 ||
    surpriseExplored.size !== 4 ||
    openedGifts.size !== 8
  )) {
    activateJourneyStage(getResumeStage());
    return;
  }
  const universeStage = ["planets", "reasons", "surprises"].includes(safeStage);
  universe.classList.toggle("active", universeStage);
  $("#finale").classList.toggle("active", safeStage === "gifts");
  $("#birthdayFinal").classList.toggle("active", safeStage === "birthdayFinal");
  $$(".universe-panel").forEach((panel) => panel.classList.remove("active"));
  if (universeStage) $(`#${safeStage}`)?.classList.add("active");
  $("#continueUniverse").hidden = safeStage !== "planets" || planetExplored.size < 6;
  $("#continueReasons").hidden = safeStage !== "reasons" || reasonExplored.size < 10;
  $("#continueSurprises").hidden = safeStage !== "surprises" || surpriseExplored.size < 4;
  $("#continueGifts").hidden = safeStage !== "gifts" || openedGifts.size < 8;
  const step = { planets: 1, reasons: 2, surprises: 3, gifts: 4, birthdayFinal: 4 }[safeStage];
  $("#journeyStep").textContent = `Étape ${step} sur 4`;
  localStorage.setItem("latifaStage", safeStage);
  if (safeStage === "birthdayFinal") triggerGrandFinal();
}

function journeyTransition(nextStage, beforeShow) {
  let veil = $(".journey-veil");
  if (!veil) {
    veil = document.createElement("div");
    veil.className = "journey-veil";
    document.body.append(veil);
  }
  const transitions = ["rose-fade", "petals", "sparkles", "zoom"];
  const transition = transitions[journeyTransition.count++ % transitions.length];
  veil.className = `journey-veil ${transition}`;
  void veil.offsetWidth;
  veil.classList.add("play");
  const particleCount = transition === "sparkles" ? 12 : 7;
  for (let i = 0; i < particleCount; i++) {
    const petal = document.createElement("span");
    petal.className = transition === "sparkles" ? "transition-sparkle" : "transition-petal";
    petal.style.top = `${15 + i * 9}%`;
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDelay = `${i * 0.08}s`;
    document.body.append(petal);
    setTimeout(() => petal.remove(), 2100);
  }
  setTimeout(() => {
    beforeShow?.();
    activateJourneyStage(nextStage);
  }, 650);
  setTimeout(() => veil.classList.remove("play"), 1400);
}
journeyTransition.count = 0;

restoreJourneyProgress();

$$(".reason").forEach((reason) => {
  reason.addEventListener("click", () => {
    reason.classList.toggle("open");
    audio.reveal();
    reasonExplored.add(reason.querySelector(".reason-number").textContent);
    localStorage.setItem("latifaReasons", JSON.stringify([...reasonExplored]));
    if (reasonExplored.size === 10) {
      $("#continueReasons").hidden = false;
    }
  });
});

const planetStory = $("#planetStory");
$$(".planet").forEach((planet) => {
  planet.addEventListener("click", () => {
    planetExplored.add(planet.dataset.title);
    $$(".planet").forEach((item) => item.classList.remove("active"));
    planet.classList.add("active");
    $("#planetTitle").textContent = planet.dataset.title;
    $("#planetCopy").textContent = planet.dataset.copy;
    planetStory.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 700 });
    audio.space();
    if (planetExplored.size === 6) {
      $("#continueUniverse").hidden = false;
    }
    localStorage.setItem("latifaPlanets", JSON.stringify([...planetExplored]));
  });
});

$("#continueUniverse").addEventListener("click", () => {
  journeyTransition("reasons", () => audio.reveal());
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("#continueReasons").addEventListener("click", () => {
  journeyTransition("surprises", () => audio.space());
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$$(".surprise").forEach((surprise) => {
  surprise.addEventListener("click", () => {
    $$(".surprise").forEach((item) => item.classList.remove("open"));
    surprise.classList.add("open");
    const reveal = $("#surpriseReveal");
    reveal.innerHTML = `<span>✦</span><p>${surprise.dataset.message}</p>`;
    reveal.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 700 });
    audio.reveal();
    surpriseExplored.add(surprise.dataset.message);
    localStorage.setItem("latifaSurprises", JSON.stringify([...surpriseExplored]));
    if (surpriseExplored.size === 4) {
      $("#continueSurprises").hidden = false;
    }
  });
});

$("#continueSurprises").addEventListener("click", () => {
  journeyTransition("gifts", () => audio.gift());
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const giftMessages = [
  "Une promesse de beaux jours.",
  "Une lumière pour accompagner tes projets.",
  "Une pause pleine de douceur.",
  "Un sourire à garder précieusement.",
  "Une étincelle pour le chemin à venir.",
  "Une place pour ton imagination.",
  "Un rayon de bonheur inattendu.",
  "Une merveilleuse surprise."
];
const giftModal = $("#giftModal");
$$(".gift").forEach((gift) => {
  let hoverTimer = null;
  let hoverCooldown = false;
  gift.addEventListener("pointerenter", () => {
    if (!window.matchMedia("(pointer:fine)").matches || hoverCooldown) return;
    hoverCooldown = true;
    hoverTimer = setTimeout(() => audio.shake(false), 140);
  });
  gift.addEventListener("pointerleave", () => {
    clearTimeout(hoverTimer);
    setTimeout(() => { hoverCooldown = false; }, 900);
  });
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let shakeCount = 0;
  let suppressClick = false;
  gift.addEventListener("pointerdown", (event) => {
    if (gift.classList.contains("opening")) return;
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    gift.setPointerCapture?.(event.pointerId);
    gift.classList.add("dragging");
  });
  gift.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const distance = Math.abs(dx) + Math.abs(dy);
    gift.style.transform = `translate(${dx * .12}px,${dy * .08}px) rotate(${dx * .08}deg)`;
    if (distance > 20) {
      suppressClick = true;
      shakeCount++;
      if (shakeCount % 3 === 0) audio.shake(shakeCount > 9);
      if (shakeCount === 10) {
        gift.classList.add("final-shake");
        audio.sparkle();
      }
    }
  });
  gift.addEventListener("pointerup", (event) => {
    if (!dragging) return;
    dragging = false;
    gift.releasePointerCapture?.(event.pointerId);
    gift.classList.remove("dragging");
    gift.style.transform = "";
  });
  gift.addEventListener("pointercancel", () => {
    dragging = false;
    gift.classList.remove("dragging");
    gift.style.transform = "";
  });
  gift.addEventListener("click", () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    if (gift.classList.contains("opening")) return;
    gift.classList.add("opening");
    audio.gift();
    setTimeout(() => {
      const number = Number(gift.dataset.gift);
      $("#giftNumber").textContent = number;
      $("#giftModalTitle").textContent = `Un cadeau pour toi`;
      $("#giftModalContent").textContent = giftMessages[number - 1];
      giftModal.classList.add("open");
      openedGifts.add(number);
      localStorage.setItem("latifaGifts", JSON.stringify([...openedGifts]));
      gift.classList.add("gift-opened");
      $("#giftOpenedCount").textContent = openedGifts.size;
      $("#giftRemainingCount").textContent = 8 - openedGifts.size;
      if (openedGifts.size === 8) {
        $("#continueGifts").hidden = false;
      }
    }, 1800);
  });
});
$("#modalClose").addEventListener("click", () => {
  giftModal.classList.remove("open");
  $$(".gift.opening").forEach((gift) => gift.classList.remove("opening"));
  audio.whisper();
});

$("#continueGifts").addEventListener("click", () => {
  journeyTransition("birthdayFinal", () => audio.reveal());
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("#musicToggle").addEventListener("click", (event) => {
  const enabled = event.currentTarget.getAttribute("aria-pressed") !== "true";
  event.currentTarget.setAttribute("aria-pressed", String(enabled));
  event.currentTarget.setAttribute("aria-label", enabled ? "Désactiver la musique" : "Activer la musique");
  event.currentTarget.classList.toggle("on", enabled);
  audio.setMusic(enabled);
});
$("#effectsToggle").addEventListener("click", (event) => {
  const enabled = event.currentTarget.getAttribute("aria-pressed") !== "true";
  event.currentTarget.setAttribute("aria-pressed", String(enabled));
  event.currentTarget.setAttribute("aria-label", enabled ? "Désactiver les effets sonores" : "Activer les effets sonores");
  event.currentTarget.classList.toggle("on", enabled);
  audio.setEffects(enabled);
  if (enabled) audio.chime();
});

let sparkleTimer = null;
function triggerGrandFinal() {
  if (
    planetExplored.size !== 6 ||
    reasonExplored.size !== 10 ||
    surpriseExplored.size !== 4 ||
    openedGifts.size !== 8
  ) return;
  giftModal.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  audio.airy();
  setTimeout(() => audio.chime(), 1050);
  setTimeout(() => { audio.celebration(); startConfetti(); }, 1500);
  setTimeout(() => audio.softNote(), 3200);
  if (sparkleTimer) clearInterval(sparkleTimer);
  sparkleTimer = setInterval(() => {
    if (audio.effectsEnabled) audio.sparkle();
  }, 2200);
}

const confettiCanvas = $("#confetti");
const confettiCtx = confettiCanvas.getContext("2d");
let confettiPieces = [];
let confettiRunning = false;
function resizeConfetti() {
  const dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 600 ? 1.5 : 2);
  confettiCanvas.width = innerWidth * dpr;
  confettiCanvas.height = innerHeight * dpr;
  confettiCanvas.style.width = `${innerWidth}px`;
  confettiCanvas.style.height = `${innerHeight}px`;
  confettiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function addConfettiWave(count = 35, fromEdges = false) {
  const colors = ["#e8b6c4", "#f8d7e1", "#d96491", "#fffaf0", "#efd8a7", "#cba66b"];
  for (let i = 0; i < count; i++) {
    const edge = fromEdges ? (i % 2 ? innerWidth : 0) : Math.random() * innerWidth;
    confettiPieces.push({
      x: edge + (fromEdges ? (i % 2 ? -20 : 20) : 0),
      y: fromEdges ? innerHeight * (.55 + Math.random() * .25) : -20 - Math.random() * innerHeight * .45,
      vx: fromEdges ? (i % 2 ? -1.2 - Math.random() * 3 : 1.2 + Math.random() * 3) : (Math.random() - .5) * 1.1,
      vy: 1.2 + Math.random() * 2.8,
      size: 5 + Math.random() * 8,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - .5) * .18,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.floor(Math.random() * 6)
    });
  }
  if (!confettiRunning && confettiPieces.length) {
    confettiRunning = true;
    requestAnimationFrame(drawConfetti);
  }
}
function drawConfetti() {
  confettiCtx.clearRect(0, 0, innerWidth, innerHeight);
  for (let index = confettiPieces.length - 1; index >= 0; index--) {
    const piece = confettiPieces[index];
    piece.x += piece.vx + Math.sin(piece.y * .018) * .35;
    piece.y += piece.vy;
    piece.angle += piece.spin;
    confettiCtx.save();
    confettiCtx.translate(piece.x, piece.y);
    confettiCtx.rotate(piece.angle);
    confettiCtx.fillStyle = piece.color;
    if (piece.shape === 0) {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, piece.size * .45, 0, Math.PI * 2);
      confettiCtx.fill();
    } else if (piece.shape === 1) {
      confettiCtx.beginPath();
      confettiCtx.moveTo(0, -piece.size);
      confettiCtx.lineTo(piece.size * .75, 0);
      confettiCtx.lineTo(0, piece.size);
      confettiCtx.lineTo(-piece.size * .75, 0);
      confettiCtx.closePath();
      confettiCtx.fill();
    } else if (piece.shape === 2) {
      confettiCtx.font = `${piece.size * 1.8}px serif`;
      confettiCtx.fillText("♥", -piece.size * .5, piece.size * .5);
    } else if (piece.shape === 3) {
      confettiCtx.beginPath();
      confettiCtx.ellipse(0, 0, piece.size * .55, piece.size, .2, 0, Math.PI * 2);
      confettiCtx.fill();
    } else if (piece.shape === 4) {
      confettiCtx.fillRect(-piece.size * .55, -piece.size * .25, piece.size * 1.1, piece.size * .5);
    } else {
      confettiCtx.beginPath();
      confettiCtx.moveTo(0, -piece.size);
      confettiCtx.bezierCurveTo(piece.size * 1.2, -piece.size * .45, piece.size * .65, piece.size * .85, 0, piece.size);
      confettiCtx.bezierCurveTo(-piece.size * .65, piece.size * .85, -piece.size * 1.2, -piece.size * .45, 0, -piece.size);
      confettiCtx.fill();
    }
    confettiCtx.restore();
    if (piece.y > innerHeight + 30) confettiPieces.splice(index, 1);
  }
  if (confettiRunning && confettiPieces.length) requestAnimationFrame(drawConfetti);
  else confettiRunning = false;
}
function startConfetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    resizeConfetti();
    confettiPieces = [];
    confettiRunning = true;
    addConfettiWave(24);
    drawConfetti();
    setTimeout(() => { confettiRunning = false; }, 700);
    return;
  }
  resizeConfetti();
  confettiRunning = true;
  confettiPieces = [];
  addConfettiWave(innerWidth < 600 ? 55 : 90);
  setTimeout(() => addConfettiWave(innerWidth < 600 ? 45 : 70), 700);
  setTimeout(() => addConfettiWave(24, true), 1300);
  setTimeout(() => addConfettiWave(24, true), 2200);
  drawConfetti();
}
addEventListener("resize", resizeConfetti);
$("#replayCelebration").addEventListener("click", () => {
  confettiRunning = false;
  confettiPieces = [];
  startConfetti();
  audio.sparkle();
});

const canvas = $("#petals");
const ctx = canvas.getContext("2d");
let petals = [];
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function makePetal(initial = false) {
  return { x: Math.random()*innerWidth, y: initial ? Math.random()*innerHeight : -30, size: 5+Math.random()*9, speed: .35+Math.random()*1.1, sway: Math.random()*2, angle: Math.random()*Math.PI, spin: (Math.random()-0.5)*.018 };
}
function drawPetals() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const maxPetals = innerWidth < 600 ? 8 : 14;
  if (petals.length < maxPetals && Math.random() < .025) petals.push(makePetal());
  petals.forEach((petal, index) => {
    petal.y += petal.speed;
    petal.x += Math.sin(petal.y*.012+petal.sway)*.28;
    petal.angle += petal.spin;
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.angle);
    ctx.fillStyle = "rgba(224,158,178,.34)";
    ctx.beginPath();
    ctx.ellipse(0, 0, petal.size*.7, petal.size, 0.2, Math.PI*2);
    ctx.fill();
    ctx.restore();
    if (petal.y > innerHeight + 30) petals[index] = makePetal();
  });
  requestAnimationFrame(drawPetals);
}
addEventListener("resize", resizeCanvas);
resizeCanvas();
for (let i=0;i<10;i++) petals.push(makePetal(true));
drawPetals();
