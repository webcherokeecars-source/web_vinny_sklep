/**
 * Apartmán nad sklípkem - Main Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Apartmán nad sklípkem scripts initialized");

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
    // Optimization: Only enable on desktop to save resources on mobile
    if (window.innerWidth > 968) {
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
    }

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
    const thumbs = document.querySelectorAll('.gallery-thumb');
    const prevBtn = document.querySelector('.nav-prev');
    const nextBtn = document.querySelector('.nav-next');
    let currentSlide = 0;
    let slideTimer;

    const showSlide = (index) => {
        if (!slides.length) return;
        slides.forEach(s => s.classList.remove('active'));
        slides[index].classList.add('active');
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
        // Only auto-slide on desktop where we use the Fade effect
        if (slides.length > 0 && window.innerWidth > 968) {
            // Clear existing to avoid duplicates
            if (slideTimer) clearInterval(slideTimer);
            slideTimer = setInterval(nextSlideFunc, 6000);
        }
    };

    if (slides.length > 0) {
        startSlider();

        // Handle resize to switch modes
        window.addEventListener('resize', () => {
            startSlider();
        });

        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlideFunc(); startSlider(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlideFunc(); startSlider(); });

        // Touch swipe JS logic removed - replaced by native CSS Scroll Snap in components.css
        // This provides a much smoother, native "1:1" feel on mobile devices.

        /* --- Parallax Effect --- */
        const parallaxElements = document.querySelectorAll('.parallax');
        if (parallaxElements.length > 0 && window.innerWidth > 968) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                parallaxElements.forEach(el => {
                    const speed = el.getAttribute('data-speed') || 0.5;
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                });
            });
        }

        /* --- Lightbox --- */
        const lightbox = document.getElementById('gallery-lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCounter = document.getElementById('lightbox-counter');
        const lightboxClose = document.querySelector('.lightbox-close');
        const lightboxPrev = document.querySelector('.lightbox-prev');
        const lightboxNext = document.querySelector('.lightbox-next');
        const fullscreenBtn = document.querySelector('.gallery-fullscreen-btn');
        let lightboxIndex = 0;

        const galleryImages = Array.from(slides).map(s => s.querySelector('img')?.src).filter(Boolean);

        const openLightbox = (index) => {
            if (!lightbox || !galleryImages.length) return;
            if (slideTimer) clearInterval(slideTimer); // Pause slider
            lightboxIndex = index;
            lightboxImg.src = galleryImages[lightboxIndex];
            lightboxCounter.textContent = `${lightboxIndex + 1} / ${galleryImages.length}`;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            if (!lightbox) return;
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            
            // Sync background gallery with currently viewed image
            if (slides[lightboxIndex]) {
                showSlide(lightboxIndex);
                if (window.innerWidth > 968) {
                    startSlider(); // Resume slider
                } else {
                    // Sync native scroll position for mobile
                    slides[lightboxIndex].scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
                }
            }
        };

        const lightboxPrevFunc = () => {
            lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
            lightboxImg.src = galleryImages[lightboxIndex];
            lightboxCounter.textContent = `${lightboxIndex + 1} / ${galleryImages.length}`;
        };

        const lightboxNextFunc = () => {
            lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
            lightboxImg.src = galleryImages[lightboxIndex];
            lightboxCounter.textContent = `${lightboxIndex + 1} / ${galleryImages.length}`;
        };

        if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => openLightbox(currentSlide));
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', lightboxPrevFunc);
        if (lightboxNext) lightboxNext.addEventListener('click', lightboxNextFunc);

        // Click on slide image to open lightbox
        slides.forEach((slide, idx) => {
            slide.style.cursor = 'pointer';
            slide.addEventListener('click', () => openLightbox(idx));
        });

        // Close on background click
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox || !lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lightboxPrevFunc();
            if (e.key === 'ArrowRight') lightboxNextFunc();
        });
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
            const btn = this.querySelector('button[type="submit"]');
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

    /* --- Availability Calendar Navigator --- */
    /* --- Custom Native Calendar Engine --- */
    const calendarContainer = document.getElementById('customCalendarContainer');
    const monthLabel = document.getElementById('calendarMonth');
    const yearLabel = document.getElementById('calendarYear');
    const calPrevBtn = document.getElementById('prevMonth');
    const calNextBtn = document.getElementById('nextMonth');

    if (calendarContainer) {
        let calendarData = []; // Store parsed months
        let currentIndex = 0;
        const objectId = '1757';
        const months = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];

        const fetchCalendarData = async () => {
            try {
                // Switching to a more stable proxy and adding cache-busting
                const targetUrl = `https://obsazenost.e-chalupy.cz/kalendar.php?id=${objectId}&pocetMesicu=12&legenda=ne&jednotky=ne&_t=${Date.now()}`;
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error('Proxy response not ok');
                const htmlString = await response.text();

                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, 'text/html');
                const tables = doc.querySelectorAll('table.month');

                calendarData = Array.from(tables).map(table => {
                    const name = table.querySelector('.month-name')?.textContent || '';
                    const [monthName, year] = name.split(' ');

                    const rows = Array.from(table.querySelectorAll('tr')).slice(2); // Skip header and day names
                    const days = [];

                    rows.forEach(row => {
                        const cells = Array.from(row.querySelectorAll('td'));
                        cells.forEach(cell => {
                            const className = cell.className;
                            const dayNum = cell.textContent.trim();
                            let status = 'empty';

                            // Logic to map e-chalupy classes to our custom ones
                            if (className.includes('day-free')) status = 'free';
                            if (className.includes('day-full')) status = 'full';

                            // Special cases for arrival/departure (z/k classes)
                            if (className.includes('day-full') && className.includes('z')) status = 'arrival';
                            if (className.includes('day-full') && className.includes('k')) status = 'departure';

                            // If it's a 'shdw' day (from prev/next month), treat as empty
                            if (className.includes('day-shdw')) status = 'empty';

                            days.push({ day: dayNum, status: status });
                        });
                    });

                    return { month: monthName, year: year, days: days };
                });

                renderCalendar(0);
            } catch (error) {
                console.error("CALENDAR ERROR:", error);
                calendarContainer.innerHTML = '<p class="error">Nepodařilo se načíst data kalendáře.</p>';
            }
        };

        const renderCalendar = (index) => {
            if (!calendarData[index]) return;
            const data = calendarData[index];

            // 1. Update Labels
            if (monthLabel) monthLabel.textContent = data.month;
            if (yearLabel) yearLabel.textContent = data.year;

            // 2. Build Table
            let html = `
                <table class="calendar-table">
                    <thead>
                        <tr>
                            <th>Po</th><th>Út</th><th>St</th><th>Čt</th><th>Pá</th><th>So</th><th>Ne</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            for (let i = 0; i < data.days.length; i += 7) {
                html += '<tr>';
                for (let j = 0; j < 7; j++) {
                    const dayObj = data.days[i + j];
                    if (!dayObj) continue; // Safety check

                    const cellClass = `cal-${dayObj.status}`;
                    // Only Free and Departure days are selectable for check-in
                    const isSelectable = ['free', 'departure'].includes(dayObj.status) && dayObj.day;

                    // Add click handler for selectable days
                    let clickAttr = '';
                    if (isSelectable) {
                        const monthNum = months.indexOf(data.month) + 1;
                        const formattedMonth = monthNum < 10 ? `0${monthNum}` : monthNum;
                        const formattedDay = parseInt(dayObj.day) < 10 ? `0${dayObj.day}` : dayObj.day;
                        const isoDate = `${data.year}-${formattedMonth}-${formattedDay}`;
                        clickAttr = `onclick="selectCalendarDate('${isoDate}')" style="cursor: pointer"`;
                    }

                    html += `<td class="${cellClass}" ${clickAttr}>${dayObj.day}</td>`;
                }
                html += '</tr>';
            }

            html += '</tbody></table>';
            calendarContainer.innerHTML = html;

            // 3. Update Nav Buttons
            if (calPrevBtn) {
                calPrevBtn.style.opacity = index === 0 ? '0.2' : '1';
                calPrevBtn.style.pointerEvents = index === 0 ? 'none' : 'auto';
            }
            if (calNextBtn) {
                const isLimit = index >= 6; // User wants 6 months limit
                calNextBtn.style.opacity = isLimit ? '0.2' : '1';
                calNextBtn.style.pointerEvents = isLimit ? 'none' : 'auto';
            }
        };

        // Global helper for the onclick attribute
        window.selectCalendarDate = (dateString) => {
            const checkinInput = document.getElementById('checkin');
            const contactSection = document.getElementById('contact');

            if (checkinInput) {
                checkinInput.value = dateString;
                // Add a small highlight effect to the input
                checkinInput.style.backgroundColor = 'rgba(158, 122, 46, 0.1)';
                setTimeout(() => {
                    checkinInput.style.backgroundColor = 'transparent';
                }, 1000);
            }

            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        };


        if (calPrevBtn) {
            calPrevBtn.onclick = (e) => {
                e.preventDefault();
                if (currentIndex > 0) {
                    currentIndex--;
                    renderCalendar(currentIndex);
                }
            };
        }

        if (calNextBtn) {
            calNextBtn.onclick = (e) => {
                e.preventDefault();
                if (currentIndex < 6) {
                    currentIndex++;
                    renderCalendar(currentIndex);
                }
            };
        }

        fetchCalendarData();
    }

    /* --- Initializers --- */
    window.addEventListener('scroll', updateBottleAndNav, { passive: true });
    updateBottleAndNav();

    /* --- Custom Cursor Logic --- */
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    // Only activate on non-touch devices
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth follow loop
        const animateCursor = () => {
            // Linear interpolation for "magnetic" delay
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;

            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;

            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Hover effect for interactive elements
        const hoverElements = document.querySelectorAll('a, button, .card, input, textarea, label, .gallery-nav, .lightbox-nav');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
    }
});
