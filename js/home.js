/**
 * [Your_Name] — Homepage Module
 * Scroll reveal animations, counter animation, smooth scroll
 */

// ============================================
// Scroll Reveal (IntersectionObserver)
// ============================================
function initScrollReveal() {
  var revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        // Apply animation delay from inline style if present
        var delay = entry.target.style.animationDelay;
        if (delay) {
          var ms = parseFloat(delay) * 1000;
          setTimeout(function() {
            entry.target.classList.add('visible');
          }, ms);
        } else {
          entry.target.classList.add('visible');
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(function(el) {
    observer.observe(el);
  });
}

// ============================================
// Counter Animation
// ============================================
function animateCounter(el, target, duration) {
  var start = 0;
  var startTime = null;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var easedProgress = easeOutExpo(progress);
    var current = Math.round(easedProgress * target);

    // Format with dots for thousands (Indonesian style)
    el.textContent = current.toLocaleString('id-ID');

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function initCounters() {
  var counterEls = document.querySelectorAll('[data-count]');
  if (!counterEls.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var target = parseInt(entry.target.getAttribute('data-count'), 10);
        if (!isNaN(target)) {
          animateCounter(entry.target, target, 1800);
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });

  counterEls.forEach(function(el) {
    observer.observe(el);
  });
}

// ============================================
// Smooth Scroll for anchor links
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        var headerHeight = document.querySelector('.topbar').offsetHeight;
        var top = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
}

// ============================================
// Hero ticker initial animation
// ============================================
function initHeroTicker() {
  var tickerNums = document.querySelectorAll('.hero-ticker-num[data-count]');
  tickerNums.forEach(function(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (!isNaN(target)) {
      setTimeout(function() {
        animateCounter(el, target, 1200);
      }, 600);
    }
  });
}

// ============================================
// Initialize Homepage
// ============================================
function initHomepage() {
  initScrollReveal();
  initCounters();
  initSmoothScroll();
  initHeroTicker();
}

// Run when DOM is ready (called from app.js)
