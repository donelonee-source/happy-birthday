/* =====================================================
   DATA & STATE
   ===================================================== */
const BALLOON_COLORS = ['#ff8fb1', '#ffc2d6', '#a78bfa', '#ffd98e', '#f38ba8', '#b4a0ff'];
const THEMES = ['default', 'sunset', 'ocean', 'forest'];

const $ = (id) => document.getElementById(id);

const loader = $('loader');
const loaderFill = $('loaderFill');
const screens = { intro: $('screenIntro'), countdown: $('screenCountdown'), main: $('screenMain') };
const openBtn = $('openBtn');
const countdownNumber = $('countdownNumber');
const themeBtn = $('themeBtn');
const cake = $('cake');
const cakeHint = $('cakeHint');
const cakeProgress = $('cakeProgress');
const cakeProgressLabel = $('cakeProgressLabel');
const candles = document.querySelectorAll('.candle');
const smoke = $('smoke');
const toast = $('toast');
const confettiCanvas = $('confettiCanvas');
const footerYear = $('footerYear');
const shootingStarsBox = $('shootingStars');

let currentScreen = 'intro';
let candlesBlown = 0;
let confettiActive = false;
let audioCtx = null;
let currentTheme = 0;

/* =====================================================
   LOADER
   ===================================================== */
let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 15 + 5;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadInterval);
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
  loaderFill.style.width = loadProgress + '%';
}, 120);

/* =====================================================
   LATAR: BINTANG & HATI & KELOPAK & BINTANG JATUH
   ===================================================== */
(function createStars() {
  const box = $('stars');
  for (let i = 0; i < 100; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.4 + 1;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 3 + 's';
    s.style.animationDuration = (2 + Math.random() * 3) + 's';
    box.appendChild(s);
  }
})();

// Bintang Jatuh Acak
setInterval(() => {
  if (Math.random() > 0.6) {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = (Math.random() * 80 + 20) + '%';
    star.style.top = (Math.random() * 40) + '%';
    shootingStarsBox.appendChild(star);
    setTimeout(() => star.remove(), 3000);
  }
}, 3000);

(function initHearts() {
  const box = $('hearts');
  const chars = ['♥', '❤', '♡', '❥'];
  function createHeart() {
    const h = document.createElement('div');
    h.className = 'heart';
    h.textContent = chars[Math.floor(Math.random() * chars.length)];
    h.style.left = Math.random() * 100 + '%';
    h.style.fontSize = (12 + Math.random() * 22) + 'px';
    h.style.animationDuration = (9 + Math.random() * 9) + 's';
    h.style.opacity = (0.2 + Math.random() * 0.5).toString();
    box.appendChild(h);
    setTimeout(() => h.remove(), 19000);
  }
  setInterval(createHeart, 900);
})();

(function initPetals() {
  const box = $('petals');
  function createPetal() {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (10 + Math.random() * 10) + 's';
    p.style.animationDelay = Math.random() * 5 + 's';
    p.style.opacity = (0.3 + Math.random() * 0.5).toString();
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    box.appendChild(p);
    setTimeout(() => p.remove(), 22000);
  }
  setInterval(createPetal, 1200);
})();

/* =====================================================
   EFEK KLIK KURSOR (SPARKLE)
   ===================================================== */
document.addEventListener('mousedown', function(e) {
  createSparkles(e.clientX, e.clientY);
});
document.addEventListener('touchstart', function(e) {
  const touch = e.touches[0];
  createSparkles(touch.clientX, touch.clientY);
});

function createSparkles(x, y) {
  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 40 + 20;
    sparkle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
    sparkle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
    
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
  }
}

/* =====================================================
   SCREEN & INTRO
   ===================================================== */
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  currentScreen = name;
  if (name === 'main') screens.main.scrollTop = 0;
}

openBtn.addEventListener('click', () => {
  playClickSound();
  showScreen('countdown');
  runCountdown();
});

function runCountdown() {
  let count = 3;
  countdownNumber.textContent = count;
  restartAnim(countdownNumber, 'countPop 1s ease-in-out');

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownNumber.textContent = count;
      restartAnim(countdownNumber, 'countPop 1s ease-in-out');
      playTickSound();
    } else {
      clearInterval(interval);
      countdownNumber.textContent = '🎂';
      playSuccessSound();
      setTimeout(() => {
        showScreen('main');
        initBalloons();
        initFooter();
        setTimeout(() => launchConfetti(2.5), 400);
        showToast('Selamat ulang tahun! 🎉');
      }, 700);
    }
  }, 1000);
}

function restartAnim(el, anim) {
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = anim;
}

/* =====================================================
   MAIN & BALON & KUE
   ===================================================== */
function initBalloons() {
  const box = $('balloons');
  box.innerHTML = '';
  for (let i = 0; i < 14; i++) {
    const b = document.createElement('div');
    b.className = 'balloon';
    b.style.left = Math.random() * 100 + '%';
    b.style.background = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    b.style.animationDuration = (12 + Math.random() * 10) + 's';
    b.style.animationDelay = Math.random() * 8 + 's';
    const scale = 0.7 + Math.random() * 0.8;
    b.style.transform = `scale(${scale})`;
    box.appendChild(b);
  }
}

candles.forEach((candle) => {
  candle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (candle.classList.contains('out')) return;
    candle.classList.add('out');
    candlesBlown++;
    updateCakeProgress();
    spawnSmoke(candle);
    playBlowSound();
    if (candlesBlown === candles.length) {
      cakeHint.textContent = '🎉 Semua lilin sudah ditiup! Semoga semua harapan terkabul.';
      playSuccessSound();
      launchConfetti(3);
      showToast('Harapanmu sudah terkirim ke langit ✨');
    } else {
      cakeHint.textContent = `🕯️ ${candles.length - candlesBlown} lilin lagi...`;
    }
  });
});

cake.addEventListener('click', () => {
  if (candlesBlown >= candles.length) return;
  const next = Array.from(candles).find(c => !c.classList.contains('out'));
  if (next) next.click();
});

function updateCakeProgress() {
  const percent = (candlesBlown / candles.length) * 100;
  cakeProgress.style.width = percent + '%';
  cakeProgressLabel.textContent = `${candlesBlown} / ${candles.length} lilin`;
}

function spawnSmoke(candle) {
  const rect = candle.getBoundingClientRect();
  const wrapRect = cake.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    const p = document.createElement('div');
    p.className = 'smoke-particle';
    p.style.left = (rect.left - wrapRect.left + 4) + 'px';
    p.style.top = (rect.top - wrapRect.top - 16) + 'px';
    p.style.animationDelay = (i * 0.1) + 's';
    smoke.appendChild(p);
    setTimeout(() => p.remove(), 2200);
  }
}

/* =====================================================
   THEME & FOOTER
   ===================================================== */
themeBtn.addEventListener('click', () => {
  currentTheme = (currentTheme + 1) % THEMES.length;
  const t = THEMES[currentTheme];
  if (t === 'default') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  showToast(`Tema: ${t}`);
  playClickSound();
});

function initFooter() {
  const year = new Date().getFullYear();
  footerYear.textContent = `© ${year} — untukmu`;
}

/* =====================================================
   CONFETTI
   ===================================================== */
let confettiParticles = [];
let confettiFrame = null;

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); 

function launchConfetti(duration = 3) {
  confettiActive = true;
  const ctx = confettiCanvas.getContext('2d');
  const endTime = Date.now() + duration * 1000;

  function spawn() {
    if (!confettiActive || Date.now() > endTime) return;
    const colors = ['#ff8fb1', '#ffc2d6', '#ffd98e', '#a78bfa', '#fff', '#f38ba8'];
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      life: 1,
    });
    if (Math.random() > 0.4) requestAnimationFrame(spawn);
  }
  spawn();
  if (!confettiFrame) animateConfetti();
  setTimeout(() => { confettiActive = false; }, duration * 1000);
}

function animateConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach((p, i) => {
    p.vy += 0.05;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 0.003;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;

    if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();

    if (p.y > confettiCanvas.height + 40 || p.life <= 0) confettiParticles.splice(i, 1);
  });

  if (confettiParticles.length > 0) confettiFrame = requestAnimationFrame(animateConfetti);
  else { confettiFrame = null; ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); }
}

/* =====================================================
   TOAST & AUDIO (Efek Suara)
   ===================================================== */
let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, dur = 0.15, type = 'sine', vol = 0.08) {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (e) {}
}

function playClickSound() { playTone(660, 0.08, 'sine', 0.06); }
function playTickSound() { playTone(880, 0.1, 'triangle', 0.07); }
function playSuccessSound() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.07), i * 110));
}
function playBlowSound() {
  playTone(300, 0.3, 'sawtooth', 0.04);
  setTimeout(() => playTone(200, 0.4, 'sawtooth', 0.03), 100);
}

/* =====================================================
   KEYBOARD SHORTCUT & INIT
   ===================================================== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && currentScreen === 'intro') openBtn.click();
});

updateCakeProgress();