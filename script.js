/* ============================================================
   PORTFOLIO LÉVY CINQ-VAL — Script principal
   Fusion : Ocean Theme (navbar, animations, vagues) × TP R1 (burger, validation)
   ============================================================ */

'use strict';

/* ---- Année dans le footer ---- */
const anneeEl = document.getElementById('annee');
if (anneeEl) anneeEl.textContent = new Date().getFullYear();

/* ---- Thème (dark / light) ---- */
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

// Charger le thème sauvegardé (défaut : dark)
const savedTheme = localStorage.getItem('theme') || 'dark';
root.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const current  = root.getAttribute('data-theme');
    const next     = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});

/* ---- Navbar : effet scroll ---- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });

/* ---- Menu mobile (burger) ---- */
const mobileToggle = document.getElementById('mobileToggle');
const navMenu      = document.getElementById('navMenu');

function openMenu(force) {
    const open = force ?? !navMenu.classList.contains('active');
    navMenu.classList.toggle('active', open);
    mobileToggle.classList.toggle('active', open);
    mobileToggle.setAttribute('aria-expanded', String(open));
}

mobileToggle.addEventListener('click', () => openMenu());

// Fermeture avec Échap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') openMenu(false);
});

// Fermeture au clic sur un lien
navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => openMenu(false));
});

/* ---- Toggle burger : style ---- */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .mobile-toggle.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 6px); }
    .mobile-toggle.active span:nth-child(2) { opacity: 0; }
    .mobile-toggle.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -6px); }
`;
document.head.appendChild(styleSheet);

/* ---- Smooth scroll sur les ancres ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* ---- Parallax Hero ---- */
const heroBg = document.querySelector('.hero-background');
window.addEventListener('scroll', () => {
    if (heroBg) {
        heroBg.style.transform = `translateY(${window.pageYOffset * 0.4}px)`;
    }
}, { passive: true });

/* ---- Vague de transition entre sections ---- */
function createWave() {
    const wave = Object.assign(document.createElement('div'), {
        style: `
            position:fixed; bottom:0; left:0; width:100%; height:3px;
            background:linear-gradient(90deg,transparent,#66ccff,transparent);
            transform:translateX(-100%); transition:transform 0.5s ease;
            pointer-events:none; z-index:9999;
        `
    });
    document.body.appendChild(wave);
    requestAnimationFrame(() => {
        setTimeout(() => { wave.style.transform = 'translateX(100%)'; }, 10);
        setTimeout(() => { wave.remove(); }, 600);
    });
}

let currentSection = '';
window.addEventListener('scroll', () => {
    document.querySelectorAll('section').forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100 && section.id !== currentSection) {
            currentSection = section.id;
            createWave();
        }
    });
}, { passive: true });

/* ---- Intersection Observer : fade-in des sections ---- */
const observerOpts = { threshold: 0.08, rootMargin: '0px 0px -40px 0px' };
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOpts);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(25px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    sectionObserver.observe(section);
});

/* ---- Compteur de caractères (textarea message) ---- */
const msgTextarea = document.getElementById('message');
const restantEl   = document.getElementById('restant');

if (msgTextarea && restantEl) {
    msgTextarea.addEventListener('input', () => {
        const max = parseInt(msgTextarea.maxLength, 10) || 280;
        restantEl.textContent = max - msgTextarea.value.length;
    });
}

/* ---- Validation du formulaire de contact ---- */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Nettoyer les erreurs précédentes
        contactForm.querySelectorAll('.field-error').forEach(el => el.remove());
        contactForm.querySelectorAll('[aria-invalid]').forEach(el =>
            el.setAttribute('aria-invalid', 'false')
        );

        const nom     = contactForm.querySelector('#nom');
        const email   = contactForm.querySelector('#email');
        const message = contactForm.querySelector('#message');
        let valid = true;

        function showError(field, msg) {
            field.setAttribute('aria-invalid', 'true');
            const err = document.createElement('p');
            err.className = 'field-error';
            err.setAttribute('role', 'alert');
            err.textContent = msg;
            field.insertAdjacentElement('afterend', err);
            valid = false;
        }

        if (!nom.value.trim()) {
            showError(nom, 'Le nom est requis.');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            showError(email, 'Adresse e-mail invalide.');
        }

        if (message.value.trim().length < 10) {
            showError(message, 'Le message doit contenir au moins 10 caractères.');
        }

        if (valid) {
            const btn = contactForm.querySelector('.form-submit');
            btn.textContent = '✓ Message envoyé !';
            btn.disabled = true;
            btn.style.background = 'linear-gradient(to right, #2ecc71, #27ae60)';
            setTimeout(() => {
                contactForm.reset();
                btn.textContent = 'Envoyer le message';
                btn.disabled = false;
                btn.style.background = '';
                if (restantEl) restantEl.textContent = '280';
            }, 3000);
        }
    });
}

console.log('🌊 Portfolio Lévy CINQ-VAL — chargé avec succès !');
