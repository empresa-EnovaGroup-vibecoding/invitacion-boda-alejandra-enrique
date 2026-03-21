/* ============================================================
   INVITACIÓN DE BODA — Alejandra & Enrique
   Script principal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initEnvelope();
  initCountdown();
  initRevealAnimations();
  initMusicToggle();
  initRSVPModal();
  buildCalendar();
});

/* ============================================================
   PARTÍCULAS DORADAS (Canvas)
   ============================================================ */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrameId = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 10;
      this.vy = (Math.random() - 0.5) * 10 - 3;
      this.life = 1;
      this.decay = Math.random() * 0.018 + 0.008;
      this.size = Math.random() * 5 + 1.5;
      this.isGold = Math.random() > 0.35;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.15;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.06;
      this.vx *= 0.985;
      this.life -= this.decay;
      this.rotation += this.rotSpeed;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      const hue = this.isGold ? `hsl(${40 + Math.random() * 20}, ${65 + Math.random() * 20}%, ${58 + Math.random() * 18}%)` : '#FDFAF4';
      ctx.fillStyle = hue;
      ctx.beginPath();
      if (this.isGold) {
        // pequeño diamante
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.6, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size * 0.6, 0);
        ctx.closePath();
      } else {
        ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => { p.update(); p.draw(); });

    if (particles.length > 0) {
      animFrameId = requestAnimationFrame(animate);
    } else {
      animFrameId = null;
      canvas.classList.remove('active');
    }
  }

  window.triggerParticleBurst = () => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < 120; i++) {
      particles.push(new Particle(cx, cy));
    }
    // partículas dispersas desde arriba
    for (let i = 0; i < 40; i++) {
      particles.push(new Particle(
        Math.random() * canvas.width,
        Math.random() * canvas.height * 0.4
      ));
    }

    canvas.classList.add('active');
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(animate);
    }
  };
}

/* ============================================================
   PANTALLA DE SOBRE — Animación de apertura
   ============================================================ */
function initEnvelope() {
  const envelopeScreen = document.getElementById('envelope-screen');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const envelope = document.getElementById('envelope');
  const envelopeCta = document.getElementById('envelope-cta');
  const innerCardBadge = document.getElementById('inner-card-badge');
  const invitation = document.getElementById('invitation');

  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    // Quitar CTA
    if (envelopeCta) envelopeCta.style.opacity = '0';

    // Quitar hover del sobre para no interferir con la animación abierta
    envelope.style.cursor = 'default';

    // Shake
    envelope.classList.add('is-opening');

    setTimeout(() => {
      envelope.classList.remove('is-opening');
      // Abrir la solapa y las tarjetas flotantes
      envelope.classList.add('open');

      // Partículas
      window.triggerParticleBurst();
    }, 300);

    // La transición NO es automática; el usuario debe tocar el badge
  }

  function transitionToInvitation() {
    envelopeScreen.classList.add('fade-out');

    setTimeout(() => {
      envelopeScreen.style.display = 'none';
      invitation.classList.remove('hidden');
      document.body.style.overflow = '';

      // Trigger hero reveal
      setTimeout(() => {
        document.querySelectorAll('.hero .reveal').forEach(el => {
          el.classList.add('visible');
        });
      }, 150);

      // Iniciar observer de reveal para el resto
      initRevealAnimations();
    }, 700);
  }

  // El clic en el sobre (cuando está cerrado) lo abre
  envelope.addEventListener('click', (e) => {
    // Si ya está abierto, no volvemos a abrir (el badge es quien transiciona)
    if (opened) return;
    openEnvelope();
  });

  // El badge "VER MÁS DETALLES" es el único que lleva a la invitación
  if (innerCardBadge) {
    innerCardBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!opened) return; // Solo actúa si el sobre ya está abierto
      transitionToInvitation();
    });

    // Soporte de teclado para el badge (role="button")
    innerCardBadge.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && opened) {
        e.preventDefault();
        transitionToInvitation();
      }
    });
  }

  // Bloquear scroll mientras se muestra el sobre
  document.body.style.overflow = 'hidden';
}

/* ============================================================
   CUENTA REGRESIVA
   ============================================================ */
function initCountdown() {
  // 9 de Mayo 2026 — Hora de inicio de la ceremonia aprox. 4pm
  const weddingDate = new Date('2026-05-09T16:00:00').getTime();

  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!daysEl) return;

  function pad(n) {
    return n.toString().padStart(2, '0');
  }

  function update() {
    const now = Date.now();
    const diff = weddingDate - now;

    if (diff <= 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent    = days.toString();
    hoursEl.textContent   = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  update();
  setInterval(update, 1000);
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initRevealAnimations() {
  const elements = document.querySelectorAll('.reveal:not(.visible)');

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Delay escalonado según posición entre hermanos
          const siblings = [...(entry.target.parentElement?.children || [])];
          const index = siblings.filter(s => s.classList.contains('reveal')).indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(index * 0.08, 0.3)}s`;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => {
    if (!el.closest('#envelope-screen')) {
      observer.observe(el);
    }
  });
}

/* ============================================================
   BOTÓN DE MÚSICA
   ============================================================ */
function initMusicToggle() {
  const btn = document.getElementById('music-toggle');
  if (!btn) return;

  let isPlaying = false;
  // Para activar música: const audio = new Audio('assets/cancion.mp3'); audio.loop = true;

  btn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    btn.classList.toggle('playing', isPlaying);
    btn.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Activar música');
    // audio.paused ? audio.play() : audio.pause();
  });
}

/* ============================================================
   MODAL DE CONFIRMACIÓN (RSVP)
   ============================================================ */
function initRSVPModal() {
  const openBtn   = document.getElementById('open-rsvp-modal');
  const closeBtn  = document.getElementById('close-rsvp-modal');
  const overlay   = document.getElementById('rsvp-modal-overlay');
  const form      = document.getElementById('rsvp-form');
  const success   = document.getElementById('rsvp-success');

  if (!openBtn || !overlay) return;

  function openModal() {
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Focus en el primer campo
    setTimeout(() => {
      const firstInput = overlay.querySelector('input, textarea, button');
      if (firstInput) firstInput.focus();
    }, 100);
  }

  function closeModal() {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  // Cerrar al hacer clic en el overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Envío del formulario
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name       = document.getElementById('guest-name')?.value?.trim() || '';
      const attendance = form.querySelector('input[name="attendance"]:checked')?.value || '';
      const message    = document.getElementById('guest-message')?.value?.trim() || '';

      if (!name) {
        document.getElementById('guest-name')?.focus();
        return;
      }

      if (!attendance) {
        form.querySelector('input[name="attendance"]')?.focus();
        return;
      }

      // Construir mensaje de WhatsApp
      const attendText = attendance === 'yes'
        ? 'Sí asistiré con alegría'
        : 'Lamentablemente no podré asistir';

      const waText = encodeURIComponent(
        `Hola Alejandra y Enrique! 💛\n` +
        `Confirmo mi asistencia a su boda.\n\n` +
        `Nombre(s): ${name}\n` +
        `Asistencia: ${attendText}\n` +
        (message ? `Mensaje: ${message}\n` : '') +
        `\n09 de Mayo de 2026 - Hotel Guadalupe, La Puerta, Trujillo`
      );

      // Mostrar éxito primero (luego se puede abrir WhatsApp)
      form.classList.add('hidden');
      success.classList.remove('hidden');

      // Opcional: abrir WhatsApp con el número de los novios
      // Reemplazar XXXXXXXXXXXX con el número real (incluir código de país, sin +)
      // window.open(`https://wa.me/XXXXXXXXXXXX?text=${waText}`, '_blank');

      // Guardar en consola para desarrollo
      console.info('RSVP recibido:', { name, attendance, message });
    });
  }
}

/* ============================================================
   CALENDARIO DE MAYO 2026
   ============================================================ */
function buildCalendar() {
  const wrapper = document.getElementById('calendar-wrapper');
  if (!wrapper) return;

  const YEAR         = 2026;
  const MONTH        = 4;     // 0-indexed: 4 = Mayo
  const WEDDING_DAY  = 9;
  const MONTH_NAME   = 'Mayo';
  const DAY_NAMES    = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Primer día de la semana del mes (0=Dom ... 6=Sáb)
  const firstDayOfWeek = new Date(YEAR, MONTH, 1).getDay();
  // Total de días en Mayo 2026
  const totalDays = new Date(YEAR, MONTH + 1, 0).getDate();

  const header = document.createElement('div');
  header.className = 'cal-header';
  header.innerHTML = `
    <p class="cal-month-name">${MONTH_NAME}</p>
    <p class="cal-year">${YEAR}</p>
  `;

  const grid = document.createElement('div');
  grid.className = 'cal-grid';

  // Nombres de días
  DAY_NAMES.forEach(name => {
    const dayName = document.createElement('div');
    dayName.className = 'cal-day-name';
    dayName.textContent = name;
    grid.appendChild(dayName);
  });

  // Celdas vacías al inicio
  for (let i = 0; i < firstDayOfWeek; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    empty.setAttribute('aria-hidden', 'true');
    grid.appendChild(empty);
  }

  // Días del mes
  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    cell.textContent = day;

    if (day === WEDDING_DAY) {
      cell.classList.add('wedding-day');
      cell.setAttribute('aria-label', `${day} de ${MONTH_NAME} — Día de la boda`);
      cell.setAttribute('title', '¡Nuestra boda!');
    }

    grid.appendChild(cell);
  }

  wrapper.appendChild(header);
  wrapper.appendChild(grid);
}
