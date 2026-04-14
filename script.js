// ===== THEME SWITCH =====
const storedTheme = localStorage.getItem('novaether-theme');
const defaultTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const initialTheme = storedTheme || defaultTheme;
document.documentElement.dataset.theme = initialTheme;

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('novaether-theme', theme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.textContent = theme === 'light' ? '🌙' : '☀︎';
    toggle.setAttribute('aria-label', theme === 'light' ? 'Wechsel zu Dunkelmodus' : 'Wechsel zu Hellmodus');
  }
}

// ===== STARFIELD ANIMATION =====
const canvas = document.getElementById('bg-canvas');
if (canvas && canvas.getContext) {
  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  const shapes = [];
  const numShapes = 1200;
  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetMouseX = width / 2;
  let targetMouseY = height / 2;
  const isMobile = window.matchMedia('(pointer: coarse)').matches || /Mobi|Android|iP(hone|ad|od)|Opera Mini|IEMobile/.test(navigator.userAgent);

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    mouseX = targetMouseX = width / 2;
    mouseY = targetMouseY = height / 2;
    if (isMobile) drawFrame();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  if (!isMobile) {
    window.addEventListener('mousemove', (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    });
  }

  class Shape {
    constructor(type) {
      this.type = type;
      this.reset();
    }
    reset() {
      this.x = (Math.random() - 0.5) * width * 2;
      this.y = (Math.random() - 0.5) * height * 2;
      this.z = Math.random() * width;
      this.pz = this.z;
      this.size = Math.random() * 5 + 2;
      this.rotation = Math.random() * Math.PI * 2;
    }
    update() {
      this.pz = this.z;
      this.z -= Math.random() * 4 + 2;
      this.rotation += 0.01;
      if (this.z < 1) this.reset();
    }
    draw() {
      const offsetX = (mouseX - width / 2) * 0.04;
      const offsetY = (mouseY - height / 2) * 0.04;
      const sx = (this.x / this.z) * width + width / 2 + offsetX;
      const sy = (this.y / this.z) * width + height / 2 + offsetY;
      const px = (this.x / this.pz) * width + width / 2 + offsetX;
      const py = (this.y / this.pz) * width + height / 2 + offsetY;
      const opacity = Math.max(0, 1 - this.z / width);
      const size = this.size * (1 - this.z / width);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(sx, sy);
      ctx.rotate(this.rotation);

      if (this.type === 'star') {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(212, 163, 115, ${opacity})`;
        ctx.lineWidth = Math.max(0.4, size / 4);
        ctx.stroke();
      } else if (this.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212, 163, 115, ${opacity})`;
        ctx.lineWidth = Math.max(0.4, size / 4);
        ctx.stroke();
      } else if (this.type === 'square') {
        ctx.strokeStyle = `rgba(212, 163, 115, ${opacity})`;
        ctx.lineWidth = Math.max(0.4, size / 4);
        ctx.strokeRect(-size, -size, size * 2, size * 2);
      } else if (this.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(-size * 0.866, size / 2);
        ctx.lineTo(size * 0.866, size / 2);
        ctx.closePath();
        ctx.strokeStyle = `rgba(212, 163, 115, ${opacity})`;
        ctx.lineWidth = Math.max(0.4, size / 4);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  const shapeTypes = ['star', 'circle', 'square', 'triangle'];
  for (let i = 0; i < numShapes; i++) {
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    shapes.push(new Shape(type));
  }

  function drawFrame() {
    const overlayColor = getComputedStyle(document.documentElement).getPropertyValue('--canvas-overlay').trim() || 'rgba(6, 9, 19, 0.65)';
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, width, height);
    shapes.forEach(s => { s.draw(); });
  }

  function animate() {
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    const overlayColor = getComputedStyle(document.documentElement).getPropertyValue('--canvas-overlay').trim() || 'rgba(6, 9, 19, 0.65)';
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, width, height);
    shapes.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animate);
  }

  if (isMobile) {
    drawFrame();
  } else {
    animate();
  }
}

// ===== HEADER SCROLL =====
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ===== HAMBURGER MENU =====
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const nav = document.querySelector('.nav-links');
  const themeToggle = document.getElementById('theme-toggle');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('active');
      hamburger.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close on nav link click
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      setTheme(nextTheme);
    });
    setTheme(document.documentElement.dataset.theme || initialTheme);
  }

  function reveal() {
    document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 80) {
        el.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', reveal);
  reveal();

  // ===== QUIZ / ANFRAGE =====
  const selections = { goal: null, focus: null };
  let currentStep = 1;
  const totalSteps = 3;

  function showStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`step-${step}`);
    if (target) {
      target.classList.add('active');
      currentStep = step;
      updateProgress(step);
    }
  }

  function updateProgress(step) {
    document.querySelectorAll('.progress-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i < step);
    });
  }

  function updateSummary() {
    const textEl = document.getElementById('summary-text');
    const hiddenEl = document.getElementById('project_details');
    if (textEl && selections.goal && selections.focus) {
      const text = `Ziel: <strong>${selections.goal}</strong> · Fokus: <strong>${selections.focus}</strong>`;
      textEl.innerHTML = text;
      if (hiddenEl) hiddenEl.value = `Ziel: ${selections.goal} | Fokus: ${selections.focus}`;
    }
  }

  const quizOptions = document.querySelectorAll('.quiz-option');
  quizOptions.forEach(button => {
    button.addEventListener('click', () => {
      const step = button.closest('.step').id.split('-')[1];
      const value = button.dataset.value;

      if (step == 1) selections.goal = value;
      if (step == 2) selections.focus = value;

      button.closest('.options').querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
      button.classList.add('selected');

      const nextBtn = button.closest('.step').querySelector('.next-btn');
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        if (currentStep === 2) updateSummary();
        showStep(currentStep + 1);
      }
    });
  });

  document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) showStep(currentStep - 1);
    });
  });

  // ===== SUCCESS MESSAGE =====
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === 'true') {
    const banner = document.createElement('div');
    banner.className = 'success-banner reveal';
    banner.textContent = 'Deine Anfrage wurde erfolgreich abgeschickt. Ich melde mich bald!';
    const section = document.querySelector('#quiz-steps .container');
    if (section) section.prepend(banner);
    setTimeout(() => banner.classList.add('active'), 100);
  }
});
