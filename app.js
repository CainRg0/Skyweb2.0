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
    if (!this.audio || this.audio.error) {
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

  const bg = document.getElementById("bgMusic");
  const troll = document.getElementById("trollAudio");
  const uiError = document.getElementById("audioError");

  if (!btn || !dialog || !closeBtn || !bg || !troll) return;

  let bgWasPlaying = false;
  let bgResumeTime = 0;
  let autoCloseTimer = null;

  btn.addEventListener("click", async () => {
    bgWasPlaying = !bg.paused;
    bgResumeTime = bg.currentTime || 0;

    bg.pause();
    bg.currentTime = bgResumeTime;

    try { dialog.showModal(); } catch { dialog.setAttribute("open", ""); }

    troll.currentTime = 0;
    troll.volume = 0.9;

    try {
      await troll.play();
      uiError?.classList.remove("show");
    } catch {
      if (uiError) {
        uiError.textContent = "Cannot play audio";
        uiError.classList.add("show");
      }
    }

    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
      try { dialog.close(); } catch {}
    }, 10000);
  });

  troll.addEventListener("ended", () => { // chiude quando finisce [web:229]
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    try { dialog.close(); } catch {}
  });

  closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (e) => {
    const rect = dialog.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });

  dialog.addEventListener("close", async () => { // ripristino [web:179]
    if (autoCloseTimer) clearTimeout(autoCloseTimer);

    troll.pause();

    if (bgWasPlaying) {
      try {
        bg.currentTime = bgResumeTime;
        await bg.play();
      } catch {}
    }

    const musicBtn = document.getElementById("musicBtn");
    if (musicBtn) {
      musicBtn.setAttribute("aria-pressed", String(!bg.paused));
      const dot = musicBtn.querySelector(".music-dot");
      const label = musicBtn.querySelector(".music-label");
      if (dot && label) {
        if (!bg.paused) {
          label.textContent = "Music: On";
          dot.style.background = "rgba(255,215,0,0.75)";
          dot.style.boxShadow = "0 0 14px rgba(255,215,0,0.45)";
        } else {
          label.textContent = "Music: Off";
          dot.style.background = "rgba(255,68,68,0.55)";
          dot.style.boxShadow = "0 0 12px rgba(255,68,68,0.35)";
        }
      }
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
