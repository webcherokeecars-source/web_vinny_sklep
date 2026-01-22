/**
 * HUŠEK Wine Cellar - Main Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Hušek scripts initialized");

    const liquid = document.getElementById('wine-liquid');
    const nav = document.querySelector('.main-nav');
    const cards = document.querySelectorAll('.card');

    /* --- Scroll & Navigation Sync --- */
    const updateBottleAndNav = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / scrollHeight);

        // Liquid Level (90% to 5%)
        if (liquid) {
            const level = 90 - (scrollPercent * 85);
            liquid.style.height = `${Math.max(5, Math.min(90, level))}%`;
        }

        // Navigation Style
        if (nav) {
            if (scrollTop > 80) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    };

    /* --- Mouse Interaction (Flashlight & Cards) --- */
    const glow = document.createElement('div');
    glow.className = 'mouse-glow';
    document.body.appendChild(glow);

    let curX = 0, curY = 0;
    let glowX = 0, glowY = 0;

    window.addEventListener('mousemove', (e) => {
        curX = e.clientX;
        curY = e.clientY;

        // Local mouse position for cards
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (e.clientX > rect.left && e.clientX < rect.right && e.clientY > rect.top && e.clientY < rect.bottom) {
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
            }
        });
    });

    const animateGlow = () => {
        glowX += (curX - glowX) * 0.08;
        glowY += (curY - glowY) * 0.08;
        glow.style.left = `${glowX}px`;
        glow.style.top = `${glowY}px`;
        requestAnimationFrame(animateGlow);
    };
    animateGlow();

    /* --- Scroll Reveal Observer --- */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* --- Gallery Logic --- */
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.nav-prev');
    const nextBtn = document.querySelector('.nav-next');
    let currentSlide = 0;
    let slideTimer;

    const showSlide = (index) => {
        if (!slides.length) return;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    };

    const nextSlideFunc = () => {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    };

    const prevSlideFunc = () => {
        let prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    };

    const startSlider = () => {
        if (slides.length > 0) {
            slideTimer = setInterval(nextSlideFunc, 8000);
        }
    };

    if (slides.length > 0) {
        startSlider();
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                showSlide(idx);
                clearInterval(slideTimer);
                startSlider();
            });
        });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlideFunc(); clearInterval(slideTimer); startSlider(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlideFunc(); clearInterval(slideTimer); startSlider(); });

        /* --- Touch Swipe Support for Mobile --- */
        const galleryContainer = document.querySelector('.gallery-carousel');
        let touchStartX = 0;
        let touchEndX = 0;

        if (galleryContainer) {
            galleryContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            galleryContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        }

        const handleSwipe = () => {
            const swipeThreshold = 50; // min distance
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe Left -> Next
                nextSlideFunc();
                clearInterval(slideTimer);
                startSlider();
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe Right -> Prev
                prevSlideFunc();
                clearInterval(slideTimer);
                startSlider();
            }
        };
    }

    /* --- Mobile Menu Toggle (Dedicated Overlay) --- */
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');

    if (mobileBtn && mobileOverlay) {
        console.log("Mobile menu initialized with dedicated overlay");

        const toggleMenu = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            console.log("Toggling menu...");
            mobileBtn.classList.toggle('active');
            mobileOverlay.classList.toggle('open');
            document.body.classList.toggle('menu-open');
        };

        const closeMenu = () => {
            mobileBtn.classList.remove('active');
            mobileOverlay.classList.remove('open');
            document.body.classList.remove('menu-open');
        };

        // Toggle button click
        mobileBtn.addEventListener('click', toggleMenu);

        // Close when clicking links
        mobileOverlay.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close when clicking outside of the menu content
        /* Note: Since it's full screen, 'outside' is less relevant, 
           but typically we might close if clicking on a transparent area?
           However, the whole overlay is opaque now. We can add this for robustness. */
        document.addEventListener('click', (e) => {
            if (mobileOverlay.classList.contains('open') &&
                !mobileOverlay.contains(e.target) &&
                !mobileBtn.contains(e.target)) {
                closeMenu();
            }
        });
    } else {
        console.error("Mobile menu elements missing (overlay mode)");
    }

    /* --- Preloader Logic --- */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('loaded');
                // Allow scroll after load if we were blocking it
                document.body.style.overflow = 'visible';
            }, 1000); // 1s delay for cinematic feel
        });
    }

    /* --- Contact Form Handling --- */
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            // Optional: If you want to use AJAX instead of redirect
            // For now, we keep the direct form submit as configured for FormSubmit.co
            // but we can add validation or loading state here.
            const btn = this.querySelector('.submit-btn');
            if (btn) {
                btn.textContent = 'Odesílání...';
                btn.style.opacity = '0.7';
            }
        });
    }

    /* --- Active Navigation State --- */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');

    const activeLinkObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                if (id) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    }, { threshold: 0.5, rootMargin: "-10% 0px -50% 0px" }); // Activate when 50% visible or entering focus zone

    sections.forEach(section => {
        activeLinkObserver.observe(section);
    });

    /* --- Cookie Consent Logic --- */
    const cookieBannerHTML = `
    <div class="cookie-banner" id="cookie-banner">
        <div class="container">
            <div class="cookie-content">
                <div class="cookie-text">
                    <h4>Soukromí a Cookies</h4>
                    <p>Pro správné fungování mapy a analýzu návštěvnosti používáme soubory cookies.</p>
                </div>
                <div class="cookie-buttons">
                    <button class="btn-secondary" id="cookie-reject">Jen nezbytné</button>
                    <button class="btn-primary" id="cookie-accept">Povolit vše</button>
                </div>
            </div>
        </div>
    </div>`;

    // Insert Banner
    document.body.insertAdjacentHTML('beforeend', cookieBannerHTML);

    const cookieBanner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('cookie-accept');
    const btnReject = document.getElementById('cookie-reject');
    const mapContainer = document.getElementById('google-map-container');
    const mapIframe = document.getElementById('google-map-iframe');
    const btnConsentMap = document.getElementById('consent-map-btn');

    const loadGoogleMap = () => {
        if (mapContainer && mapIframe) {
            const dataSrc = mapIframe.getAttribute('data-src');
            if (dataSrc) {
                mapIframe.setAttribute('src', dataSrc);
                mapIframe.removeAttribute('data-src'); // clean up
                mapContainer.classList.add('loaded'); // Hides placeholder via CSS
            }
        }
    };

    // Check Status
    const consentStatus = localStorage.getItem('cookieConsent');

    if (consentStatus === 'true') {
        loadGoogleMap();
    } else if (consentStatus === 'false') {
        // Do nothing, map remains placeholder
    } else {
        // No choice yet -> Show Banner
        setTimeout(() => {
            cookieBanner.classList.add('visible');
        }, 2000); // Delay for better UX
    }

    // Handlers
    if (btnAccept) {
        btnAccept.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            cookieBanner.classList.remove('visible');
            loadGoogleMap();
        });
    }

    if (btnReject) {
        btnReject.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'false');
            cookieBanner.classList.remove('visible');
        });
    }

    // Specific Map Button Handler
    if (btnConsentMap) {
        btnConsentMap.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true'); // Implicit consent for map functionality
            loadGoogleMap();
            if (cookieBanner) cookieBanner.classList.remove('visible');
        });
    }

    /* --- Initializers --- */
    window.addEventListener('scroll', updateBottleAndNav, { passive: true });
    updateBottleAndNav();
});
