// Event2One - Marketing Website JavaScript

// ============================================
// Navigation Scroll Effect
// ============================================
const navbar = document.getElementById('navbar');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ============================================
// Mobile Menu Toggle
// ============================================
mobileMenuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  const isOpen = navLinks.classList.contains('active');
  mobileMenuToggle.textContent = isOpen ? '✕' : '☰';
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    mobileMenuToggle.textContent = '☰';
  });
});

// ============================================
// Carousel Functionality
// ============================================
const slides = document.querySelectorAll('.carousel-slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicatorsContainer = document.getElementById('indicators');

let currentSlide = 0;
const totalSlides = slides.length;

// Create indicators
for (let i = 0; i < totalSlides; i++) {
  const indicator = document.createElement('div');
  indicator.classList.add('indicator');
  if (i === 0) indicator.classList.add('active');
  indicator.addEventListener('click', () => goToSlide(i));
  indicatorsContainer.appendChild(indicator);
}

const indicators = document.querySelectorAll('.indicator');

function updateCarousel() {
  // Update slides
  slides.forEach((slide, index) => {
    slide.classList.remove('active');
    if (index === currentSlide) {
      slide.classList.add('active');
    }
  });
  
  // Update indicators
  indicators.forEach((indicator, index) => {
    indicator.classList.remove('active');
    if (index === currentSlide) {
      indicator.classList.add('active');
    }
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
}

function goToSlide(index) {
  currentSlide = index;
  updateCarousel();
}

// Event listeners for carousel controls
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Auto-advance carousel every 5 seconds
let autoAdvance = setInterval(nextSlide, 5000);

// Pause auto-advance on hover
const carouselContainer = document.querySelector('.carousel-container');
carouselContainer.addEventListener('mouseenter', () => {
  clearInterval(autoAdvance);
});

carouselContainer.addEventListener('mouseleave', () => {
  autoAdvance = setInterval(nextSlide, 5000);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    prevSlide();
    clearInterval(autoAdvance);
    autoAdvance = setInterval(nextSlide, 5000);
  } else if (e.key === 'ArrowRight') {
    nextSlide();
    clearInterval(autoAdvance);
    autoAdvance = setInterval(nextSlide, 5000);
  }
});

// ============================================
// Scroll Animations
// ============================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Observe all fade-in elements
document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// ============================================
// Smooth Scroll for Navigation Links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      const offsetTop = target.offsetTop - 80; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ============================================
// Add Loading Animation
// ============================================
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
});

// ============================================
// Performance: Lazy Load Images
// ============================================
if ('loading' in HTMLImageElement.prototype) {
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    img.src = img.src;
  });
} else {
  // Fallback for browsers that don't support lazy loading
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
  document.body.appendChild(script);
}

// ============================================
// Add Parallax Effect to Hero
// ============================================
const hero = document.querySelector('.hero');
if (hero) {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;
    hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
  });
}

// ============================================
// Console Welcome Message
// ============================================
console.log('%c Event2One ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 20px; padding: 10px 20px; border-radius: 8px;');
console.log('%c Plateforme de gestion d\'événements professionnels ', 'color: #667eea; font-size: 14px;');
console.log('%c Plus de 15 ans d\'expérience à votre service ', 'color: #a0aec0; font-size: 12px;');
