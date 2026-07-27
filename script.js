/* ══ NAVBAR ══ */
        const hamburger = document.getElementById("hamburger");
        const navLinks = document.getElementById("navLinks");
        const navItems = document.querySelectorAll(".nav-item");
        const activeBox = document.querySelector(".active-box");

        const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

        function closeMobileMenu() {
            hamburger.classList.remove("active");
            navLinks.classList.remove("mobile-active");
            hamburger.setAttribute("aria-expanded", "false");
        }

        function syncHamburger() {
            hamburger.style.display = isMobile() ? "flex" : "none";
            if (!isMobile()) closeMobileMenu();
        }

        syncHamburger();
        window.addEventListener("resize", syncHamburger);

        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("mobile-active");
            hamburger.setAttribute("aria-expanded", String(hamburger.classList.contains("active")));
        });

        hamburger.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hamburger.click(); }
        });

        function moveBox(el) {
            if (!activeBox || isMobile()) return;
            activeBox.style.left = el.offsetLeft + "px";
            activeBox.style.width = el.offsetWidth + "px";
        }

        navItems.forEach(item => {
            item.addEventListener("click", function () {
                if (isMobile()) closeMobileMenu();
                navItems.forEach(i => i.classList.remove("active"));
                this.classList.add("active");
                moveBox(this);
            });
        });

        window.addEventListener("load", () => { const a = document.querySelector(".nav-item.active"); if (a) moveBox(a); });
        window.addEventListener("resize", () => { const a = document.querySelector(".nav-item.active"); if (a && !isMobile()) moveBox(a); });

        document.addEventListener("click", e => {
            if (!isMobile()) return;
            if (!e.target.closest("nav") && navLinks.classList.contains("mobile-active")) closeMobileMenu();
        });

        /* ══ TYPING ANIMATION ══ */
        const typingEl = document.getElementById("typing-text");
        const words = ["Web Developer"];
        let wi = 0, ci = 0, deleting = false;

        function typeLoop() {
            const word = words[wi];
            const current = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
            typingEl.textContent = current;

            let delay = deleting ? 60 : 110;

            if (!deleting && ci > word.length) {
                delay = 1800; deleting = true;
            } else if (deleting && ci < 0) {
                deleting = false; ci = 0;
                wi = (wi + 1) % words.length;
                delay = 400;
            }
            setTimeout(typeLoop, delay);
        }
        typeLoop();

        /* ══ SCROLL REVEAL ══ */
        const revealEls = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
        }, { threshold: 0.12 });

        revealEls.forEach(el => observer.observe(el));

        /* ══ PROJECT SLIDER — with touch/swipe & dots ══ */
        (function () {
            const slider = document.getElementById("projectSlider");
            const track = document.getElementById("projectTrack");
            const prevBtn = document.getElementById("slidePrev");
            const nextBtn = document.getElementById("slideNext");
            const dotsWrap = document.getElementById("sliderDots");
            if (!slider || !track) return;

            let index = 0;
            let touchStartX = 0;
            let touchStartY = 0;
            let isDragging = false;
            let dragStartX = 0;
            let dragOffset = 0;

            /* ── helpers ── */
            const slides = () => track.querySelectorAll(".project-slide");
            const total = () => slides().length;
            const gap = () => parseFloat(getComputedStyle(track).gap) || 20;
            const cardW = () => { const c = slides()[0]; return c ? c.offsetWidth + gap() : 320; };

            const maxIndex = () => {
                const maxOffset = Math.max(0, track.scrollWidth - slider.clientWidth);
                return Math.round(maxOffset / cardW());
            };

            /* ── dots ── */
            function buildDots() {
                if (!dotsWrap) return;
                dotsWrap.innerHTML = "";
                const t = total();
                if (t <= 1) return;
                for (let i = 0; i < t; i++) {
                    const d = document.createElement("button");
                    d.className = "slider-dot" + (i === index ? " active" : "");
                    d.setAttribute("aria-label", `Go to slide ${i + 1}`);
                    d.addEventListener("click", () => { index = i; update(); });
                    dotsWrap.appendChild(d);
                }
            }

            function updateDots() {
                if (!dotsWrap) return;
                dotsWrap.querySelectorAll(".slider-dot").forEach((d, i) => {
                    d.classList.toggle("active", i === index);
                });
            }

            /* ── update position ── */
            function update(extraOffset = 0) {
                const max = maxIndex();
                if (index < 0) index = 0;
                if (index > max) index = max;
                const offset = -(index * cardW()) + extraOffset;
                track.style.transform = `translateX(${offset}px)`;
                // btn states
                if (prevBtn) prevBtn.disabled = (index === 0);
                if (nextBtn) nextBtn.disabled = (index >= max);
                updateDots();
            }

            /* ── button nav ── */
            prevBtn && prevBtn.addEventListener("click", () => { index--; update(); });
            nextBtn && nextBtn.addEventListener("click", () => { index++; update(); });

            /* ══ TOUCH / SWIPE ══ */
            slider.addEventListener("touchstart", e => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                dragOffset = 0;
                isDragging = true;
                track.style.transition = "none"; // instant while dragging
            }, { passive: true });

            slider.addEventListener("touchmove", e => {
                if (!isDragging) return;
                const dx = e.touches[0].clientX - touchStartX;
                const dy = e.touches[0].clientY - touchStartY;
                // only handle horizontal swipes
                if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
                    isDragging = false;
                    track.style.transition = "";
                    return;
                }
                dragOffset = dx;
                track.style.transform = `translateX(${-(index * cardW()) + dragOffset}px)`;
            }, { passive: true });

            slider.addEventListener("touchend", e => {
                if (!isDragging) return;
                isDragging = false;
                track.style.transition = ""; // restore smooth transition
                const threshold = slider.clientWidth * 0.22;
                if (dragOffset < -threshold) index++;
                else if (dragOffset > threshold) index--;
                update();
            }, { passive: true });

            /* ══ MOUSE DRAG (desktop) ══ */
            slider.addEventListener("mousedown", e => {
                dragStartX = e.clientX;
                dragOffset = 0;
                isDragging = true;
                track.style.transition = "none";
                slider.style.cursor = "grabbing";
            });
            window.addEventListener("mousemove", e => {
                if (!isDragging) return;
                dragOffset = e.clientX - dragStartX;
                track.style.transform = `translateX(${-(index * cardW()) + dragOffset}px)`;
            });
            window.addEventListener("mouseup", () => {
                if (!isDragging) return;
                isDragging = false;
                track.style.transition = "";
                slider.style.cursor = "";
                const threshold = slider.clientWidth * 0.15;
                if (dragOffset < -threshold) index++;
                else if (dragOffset > threshold) index--;
                update();
            });

            /* ── init ── */
            window.addEventListener("resize", () => {
                buildDots();
                update();
            });
            buildDots();
            update();
        })();

        /* ══ TOGGLE EXPERIENCE / EDUCATION ══ */
        function showExperience() {
            document.getElementById("experience-content").classList.remove("hidden");
            document.getElementById("education-content").classList.add("hidden");
            document.querySelectorAll(".toggle-btns button")[0].classList.add("active");
            document.querySelectorAll(".toggle-btns button")[1].classList.remove("active");
        }
        function showEducation() {
            document.getElementById("education-content").classList.remove("hidden");
            document.getElementById("experience-content").classList.add("hidden");
            document.querySelectorAll(".toggle-btns button")[1].classList.add("active");
            document.querySelectorAll(".toggle-btns button")[0].classList.remove("active");
        }

        /* ══ TOAST NOTIFICATION ══ */
        const toast = document.getElementById("toast");
        let toastTimer;

        function showToast() {
            clearTimeout(toastTimer);
            toast.classList.add("show");
            toastTimer = setTimeout(hideToast, 4000);
        }
        function hideToast() {
            toast.classList.remove("show");
        }

        /* ══ FORM SUBMIT ══ */
        const contactForm = document.getElementById("contactForm");
        if (contactForm) {
            contactForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const btn = contactForm.querySelector("button[type=submit]");
                const origText = btn.textContent;
                btn.textContent = "Sending…";
                btn.disabled = true;

                try {
                    const res = await fetch(contactForm.action, {
                        method: "POST",
                        body: new FormData(contactForm),
                        headers: { "Accept": "application/json" }
                    });
                    if (res.ok) {
                        contactForm.reset();
                        showToast();
                    } else {
                        alert("Oops! Something went wrong. Please try again.");
                    }
                } catch {
                    alert("Network error. Please check your connection.");
                } finally {
                    btn.textContent = origText;
                    btn.disabled = false;
                }
            });
        }