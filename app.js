class ParticleBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.last = performance.now();

    this.resizeCanvas();
    this.initParticles();

    window.addEventListener("resize", () => {
      this.resizeCanvas();
      this.initParticles();
    });

    requestAnimationFrame((t) => this.animate(t));
  }

  resizeCanvas() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.floor(window.innerWidth * dpr);
    this.canvas.height = Math.floor(window.innerHeight * dpr);
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  initParticles() {
    this.particles = [];
    const area = window.innerWidth * window.innerHeight;
    const count = Math.min(60, Math.max(18, Math.floor(area / 24000)));

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.2 + 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        rgb: Math.random() > 0.5 ? [255, 215, 0] : [255, 68, 68],
        a: Math.random() * 0.45 + 0.12,
      });
    }
  }

  animate(now) {
    const dt = Math.min(32, now - this.last);
    this.last = now;

    this.ctx.fillStyle = "rgba(10,10,10,0.08)";
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of this.particles) {
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);

      if (p.x < -10) p.x = window.innerWidth + 10;
      if (p.x > window.innerWidth + 10) p.x = -10;
      if (p.y < -10) p.y = window.innerHeight + 10;
      if (p.y > window.innerHeight + 10) p.y = -10;

      this.ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${p.a})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fill();
    }

    requestAnimationFrame((t) => this.animate(t));
  }
}

class MusicPlayer {
  constructor() {
    this.audio = document.getElementById("bgMusic");
    this.btn = document.getElementById("musicBtn");
    this.errorMsg = document.getElementById("audioError");
    this.dot = this.btn?.querySelector(".music-dot");
    this.label = this.btn?.querySelector(".music-label");
    this.isPlaying = false;

    if (!this.audio || !this.btn || !this.dot || !this.label) return;

    this.audio.volume = 0.35;

    this.btn.addEventListener("click", () => this.toggle());

    this.audio.addEventListener("error", () => {
      this.setError("Music file not found / unsupported");
      this.btn.disabled = true;
    });
  }

  setError(msg) {
    if (!this.errorMsg) return;
    this.errorMsg.textContent = msg;
    this.errorMsg.classList.add("show");
  }

  async toggle() {
    if (!this.audio.src || this.audio.error) {
      this.setError("Music file not found / unsupported");
      return;
    }

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      this.updateUI();
      return;
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      this.updateUI();
      this.errorMsg?.classList.remove("show");
    } catch {
      this.setError("Cannot play audio");
      this.isPlaying = false;
      this.updateUI();
    }
  }

  updateUI() {
    this.btn.setAttribute("aria-pressed", String(this.isPlaying));

    if (this.isPlaying) {
      this.label.textContent = "Music: On";
      this.dot.style.background = "rgba(255,215,0,0.75)";
      this.dot.style.boxShadow = "0 0 14px rgba(255,215,0,0.45)";
    } else {
      this.label.textContent = "Music: Off";
      this.dot.style.background = "rgba(255,68,68,0.55)";
      this.dot.style.boxShadow = "0 0 12px rgba(255,68,68,0.35)";
    }
  }
}

function setupMouseParallax() {
  if (window.innerWidth <= 768) return;
  const tracker = document.querySelector(".mouse-tracker");
  if (!tracker) return;

  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;

    tracker.style.background = `radial-gradient(circle at ${50 + x * 0.5}% ${50 + y * 0.5}%,
      rgba(255,215,0,0.10) 0%,
      transparent 55%)`;
  });
}

function setupCardAnimations() {
  const cards = document.querySelectorAll(".link-card");
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.animation = "staggerIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards";
    card.style.animationDelay = `${0.2 + index * 0.1}s`;
  });
}

function setupOF() {
  const btn = document.getElementById("ofBtn");
  const dialog = document.getElementById("catDialog");
  const closeBtn = document.getElementById("catClose");
  const catImg = dialog?.querySelector(".cat-img");

  const bg = document.getElementById("bgMusic");
  const troll = document.getElementById("trollAudio");
  const uiError = document.getElementById("audioError");

  if (!btn || !dialog || !closeBtn || !bg || !troll || !catImg) return;

  let bgWasPlaying = false;
  let bgResumeTime = 0;

  catImg.addEventListener("error", () => {
    if (uiError) {
      uiError.textContent = "gatto.jpg not found";
      uiError.classList.add("show");
    }
  });

  troll.addEventListener("error", () => {
    if (uiError) {
      uiError.textContent = "troll.mp3 not found / unsupported";
      uiError.classList.add("show");
    }
  });

  btn.addEventListener("click", async () => {
    // pausa musica normale e salva posizione
    bgWasPlaying = !bg.paused;
    bgResumeTime = bg.currentTime || 0; // [web:186]
    bg.pause(); // [web:183]

    // apri popup
    try {
      dialog.showModal();
    } catch {
      dialog.setAttribute("open", "");
    }

    // play troll
    troll.currentTime = 0; // [web:186]
    troll.volume = 0.9;
    try {
      await troll.play(); // spesso ok perché dentro click [web:53]
      uiError?.classList.remove("show");
    } catch {
      if (uiError) {
        uiError.textContent = "Cannot play audio";
        uiError.classList.add("show");
      }
    }
  });

  closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (e) => {
    const rect = dialog.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });

  dialog.addEventListener("close", async () => { // [web:179]
    troll.pause(); // [web:183]
    if (bgWasPlaying) {
      try {
        bg.currentTime = bgResumeTime; // [web:186]
        await bg.play(); // [web:53]
      } catch {}
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("animatedBg");
  if (canvas && canvas.getContext) new ParticleBackground(canvas);

  new MusicPlayer();
  setupOF();
  setupMouseParallax();
  setupCardAnimations();
});
