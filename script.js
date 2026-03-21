/* ========================================
   WEDDING INVITATION - Alejandra & Enrique
   Interactive Script
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initEnvelope();
  initCountdown();
  initRevealAnimations();
  initRSVP();
  initShareButton();
  initParticles();
});

/* ========================================
   ENVELOPE OPENING
   ======================================== */
function initEnvelope() {
  const seal = document.getElementById('wax-seal');
  const envelopeScreen = document.getElementById('envelope-screen');
  const invitation = document.getElementById('invitation');
  const canvas = document.getElementById('particles-canvas');

  seal.addEventListener('click', () => {
    // Trigger golden particles burst
    canvas.classList.add('active');
    triggerParticleBurst();

    // Animate envelope away
    envelopeScreen.classList.add('opening');

    setTimeout(() => {
      envelopeScreen.style.display = 'none';
      invitation.classList.remove('hidden');
      canvas.classList.remove('active');

      // Trigger hero animations
      setTimeout(() => {
        document.querySelectorAll('.hero .reveal').forEach((el) => {
          el.classList.add('visible');
        });
      }, 200);
    }, 800);
  });
}

/* ========================================
   COUNTDOWN TIMER
   ======================================== */
function initCountdown() {
  const weddingDate = new Date('2026-05-09T00:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      document.getElementById('days').textContent = '0';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days.toString();
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ========================================
   SCROLL REVEAL ANIMATIONS
   ======================================== */
function initRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  // Observe all elements with .reveal class (except hero ones, they trigger on open)
  document.querySelectorAll('.reveal').forEach((el) => {
    if (!el.closest('.hero')) {
      observer.observe(el);
    }
  });
}

/* ========================================
   RSVP FORM
   ======================================== */
function initRSVP() {
  const form = document.getElementById('rsvp-form');
  const success = document.getElementById('rsvp-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('guest-name').value;
    const count = document.getElementById('guest-count').value;
    const attendance = document.getElementById('attendance').value;
    const message = document.getElementById('guest-message').value;

    // Build WhatsApp message
    const attendText = attendance === 'yes' ? 'SI asistire' : 'NO podre asistir';
    const whatsappMsg = encodeURIComponent(
      `Hola! Soy ${name}.\n` +
      `Confirmo que ${attendText} a la boda de Alejandra y Enrique.\n` +
      `Personas: ${count}\n` +
      (message ? `Mensaje: ${message}` : '')
    );

    // Open WhatsApp (replace number with actual number later)
    // For now, show success message
    form.classList.add('hidden');
    success.classList.remove('hidden');

    // Uncomment and add phone number to enable WhatsApp:
    // window.open(`https://wa.me/NUMERODETELEFONO?text=${whatsappMsg}`, '_blank');
  });
}

/* ========================================
   SHARE BUTTON
   ======================================== */
function initShareButton() {
  const shareBtn = document.getElementById('share-btn');

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: 'Boda de Alejandra & Enrique',
      text: 'Estas invitado a la boda de Alejandra y Enrique! 09 de Mayo de 2026 - Hotel Guadalupe, La Puerta, Trujillo',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        shareBtn.textContent = 'Link copiado!';
        setTimeout(() => {
          shareBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Compartir Invitacion
          `;
        }, 2000);
      }
    } catch {
      // User cancelled share
    }
  });
}

/* ========================================
   GOLDEN PARTICLES (Canvas)
   ======================================== */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

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
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = (Math.random() - 0.5) * 8 - 2;
      this.life = 1;
      this.decay = Math.random() * 0.02 + 0.008;
      this.size = Math.random() * 4 + 1;
      this.gold = Math.random() > 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.05; // gravity
      this.life -= this.decay;
      this.vx *= 0.99;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.fillStyle = this.gold
        ? `hsl(43, ${60 + Math.random() * 20}%, ${55 + Math.random() * 20}%)`
        : '#FDF9F3';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter((p) => p.life > 0);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    if (particles.length > 0) {
      animationId = requestAnimationFrame(animate);
    }
  }

  // Expose burst function
  window.triggerParticleBurst = () => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < 100; i++) {
      particles.push(new Particle(cx, cy));
    }

    // Add some from edges
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height * 0.5));
    }

    if (!animationId) {
      animate();
    }
  };
}

/* ========================================
   MUSIC TOGGLE (placeholder)
   ======================================== */
const musicBtn = document.getElementById('music-toggle');
let isPlaying = false;

musicBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  musicBtn.classList.toggle('playing', isPlaying);

  // To add music later, create an Audio element:
  // const audio = new Audio('assets/song.mp3');
  // isPlaying ? audio.play() : audio.pause();
});
