/* ==========================================================================
   MASYU YAPI İNŞAAT - INTERACTIVITY AND ENGINE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- STICKY GLASS HEADER NAVIGATION ---
    const header = document.querySelector('.main-header');
    
    const handleScrollHeader = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScrollHeader);
    handleScrollHeader(); // Run on init
    

    // --- MOBILE DRAWER NAVIGATION MENU ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    const toggleMobileMenu = () => {
        mobileMenuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden'); // Block page scroll when menu is open
    };
    
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });


    // --- ACTIVE SECTION LINK MONITORING (SCROLLSPY) ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const scrollActive = () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 150;
            const sectionId = current.getAttribute('id');
            
            const correspondingLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);
            
            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                }
            }
        });
        
        // Active Ana Sayfa when at the very top
        if (scrollY < 100) {
            navLinks.forEach(link => link.classList.remove('active'));
            document.querySelector('.nav-menu a[href="#"]').classList.add('active');
        }
    };
    
    window.addEventListener('scroll', scrollActive);
    

    // --- ENTRANCE SCROLL ANIMATION (INTERSECTION OBSERVER) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, observerOptions);
    
    // Register scroll animated elements
    const animElements = document.querySelectorAll('.animate-fade-up, .animate-scroll');
    animElements.forEach(el => animateOnScroll.observe(el));
    

    // --- STATS NUMERICAL COUNT-UP ENGINE ---
    const statsSection = document.querySelector('.stats-section');
    const statNumbers = document.querySelectorAll('.stat-number');
    let animatedStats = false;
    
    const countUp = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const duration = 2000; // 2 seconds duration
        const stepTime = Math.abs(Math.floor(duration / target));
        let current = 0;
        
        const timer = setInterval(() => {
            // Speed up count for large numbers
            if (target > 500) {
                current += Math.ceil(target / 100);
            } else if (target > 100) {
                current += Math.ceil(target / 50);
            } else {
                current += 1;
            }
            
            if (current >= target) {
                element.textContent = target.toLocaleString('tr-TR');
                clearInterval(timer);
            } else {
                element.textContent = current.toLocaleString('tr-TR');
            }
        }, Math.max(stepTime, 15));
    };
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedStats) {
                statNumbers.forEach(num => countUp(num));
                animatedStats = true;
            }
        });
    }, { threshold: 0.3 });
    
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
    

    // --- PORTFOLIO GALLERY CATEGORY FILTER ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Switch active filter tab style
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Card transitions
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95) translateY(10px)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1) translateY(0)';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 400);
            });
        });
    });


    // --- QUALITY STANDARDS TABS SYSTEM ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.standards-tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle button states
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Toggle active content pane
            const targetId = btn.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetId) {
                    content.classList.add('active');
                }
            });
        });
    });


    // --- DYNAMIC PROJECT DETAILS MODAL REGISTRY ---
    const projectDetailsRegistry = {
        'premium-towers': {
            title: 'Kara Premium Towers',
            location: 'Ataşehir, İstanbul',
            image: 'images/hero.png',
            desc: 'İstanbul finans dünyasının parlayan merkezinde yükselen Kara Premium Towers, modern mimarisi ve zengin sosyal alanlarıyla seçkin bir rezidans yaşamı sunmaktadır. 360° kesintisiz İstanbul manzaralı terası, tam kapsamlı akıllı ev sistemleri ve A Plus sosyal kulübüyle kalitenin yeni adresidir.',
            specs: [
                { label: 'Teslim Tarihi', value: 'Aralık 2026' },
                { label: 'Proje Alanı', value: '120.000 m²' },
                { label: 'Daire Tipleri', value: '2+1, 3+1, 4+1, Penthouse' },
                { label: 'Sosyal Alanlar', value: 'Infinity Pool, SPA, Fitness, Cafe, Alışveriş Parkı' },
                { label: 'Güvenlik & Yapı', value: 'Deprem İzolatörlü, C50 Hazır Beton, Radye Temel' }
            ]
        },
        'bodrum-mansions': {
            title: 'Kara Yalıkavak Mansions',
            location: 'Yalıkavak, Bodrum',
            image: 'images/villa.png',
            desc: 'Yalıkavak\'ın en prestijli koylarından birinde denize sıfır olarak inşa edilen Kara Mansions, doğayla iç içe lüks yaşam arayanlar için tasarlandı. Sadece 12 seçkin aileye ev sahipliği yapacak olan projede her malikanenin kendine özel kum plajı, helikopter pisti erişimi, ısıtmalı infinity havuzu ve akıllı enerji yönetim sistemi bulunmaktadır.',
            specs: [
                { label: 'Teslim Tarihi', value: 'Haziran 2027' },
                { label: 'Proje Alanı', value: '25.000 m²' },
                { label: 'Konsept', value: '5+2 & 6+2 Müstakil Malikane' },
                { label: 'Sosyal Alanlar', value: 'Özel Koy, Yat İskelesi, Helikopter Pisti, Tenis Kortu' },
                { label: 'Mimari Özellikler', value: 'Bodrum Taş Mimarisi, Akıllı Otomasyon, Özel Peyzaj' }
            ]
        },
        'cankaya-plaza': {
            title: 'Kara Sarıçam Plaza',
            location: 'Sarıçam, Adana',
            image: 'images/commercial.png',
            desc: 'Adana iş dünyasının yeni parlayan yıldızı Sarıçam\'da, geleceğin çalışma trendlerine göre inşa edilen Kara Plaza. LEED Gold çevre sertifikasına sahip, yenilenebilir güneş enerjisi desteğiyle kendi ortak alan enerjisini üretebilen, 180 modüler ofis ve seçkin markaların yer aldığı lüks alışveriş caddesi ile şirketiniz için kusursuz prestij sağlar.',
            specs: [
                { label: 'Teslim Durumu', value: 'Tamamlandı (Yaşam Başladı)' },
                { label: 'Toplam Alan', value: '85.000 m²' },
                { label: 'Yapı Tipi', value: 'LEED Gold Ofis & Alışveriş Plazası' },
                { label: 'Hizmetler', value: '7/24 Profesyonel Resepsiyon, Toplantı Odaları, Vale' },
                { label: 'Mühendislik', value: 'Sismik Koruma, Merkezi İklimlendirme (Sessiz VRF)' }
            ]
        },
        'forest-valley': {
            title: 'Kara Forest Valley',
            location: 'Göktürk, İstanbul',
            image: 'images/hero.png',
            desc: 'Belgrad Ormanları\'nın büyüleyici atmosferine komşu olan Kara Forest Valley, yatay mimari konseptinin en şık örneğidir. Geniş bahçe dubleksleri ve çatı penthouse seçenekleriyle doğanın huzurunu evinizin içine taşırken, şehrin olanaklarına sadece 10 dakika mesafede kalmanızı sağlar. Proje tamamen çevre dostu A Sınıfı yeşil malzemelerle inşa edilmektedir.',
            specs: [
                { label: 'Teslim Tarihi', value: 'Eylül 2026' },
                { label: 'Proje Alanı', value: '45.000 m²' },
                { label: 'Konut Tipi', value: '1+1 Bahçe Dubleksi - 4+1 Çatı Penthouse' },
                { label: 'Sosyal Alanlar', value: 'Doğal Gölet, Ekolojik Park, Yürüyüş Yolları, Bisiklet Parkuru' },
                { label: 'Sürdürülebilirlik', value: 'Gri Su Geri Dönüşüm, Güneş Paneli, Organik Tarım Alanı' }
            ]
        },
        'marina-villas': {
            title: 'Kara Marina Villas',
            location: 'Alaçatı, İzmir',
            image: 'images/villa.png',
            desc: 'Alaçatı Marina\'da yer alan Kara Marina Villas, deniz tutkunları için benzersiz bir lokasyon avantajı sunuyor. Kendine ait özel tekne iskelesine sahip olan bu 8 taş villa, Alaçatı mimari dokusunu modern, minimalist İtalyan iç tasarımıyla buluşturuyor. Özel şarap kavı, ısıtmalı havuz ve geniş terasıyla hayal ettiğiniz Ege yaşamı burada hayat buluyor.',
            specs: [
                { label: 'Teslim Tarihi', value: 'Nisan 2027' },
                { label: 'Proje Alanı', value: '15.000 m²' },
                { label: 'Villa Sayısı', value: '8 Bağımsız Malikane (4+1 & 5+1)' },
                { label: 'Özellikler', value: 'Özel İskele, Müstakil Havuz, Akıllı Ev, Şarap Mahzeni' },
                { label: 'Yapı Malzemesi', value: 'Doğal Alaçatı Taşı, Deprem Güvenlikli Çelik İskelet' }
            ]
        },
        'sky-hub': {
            title: 'Kara Sky Hub',
            location: 'Levent, İstanbul',
            image: 'images/commercial.png',
            desc: 'İstanbul\'un kalbi Levent Büyükdere caddesinde yükselen Kara Sky Hub, 50 katlı devasa kulesiyle geleceğin çalışma hayatını şekillendiriyor. En gelişmiş HVAC havalandırma sistemleri, sismik damper sönümleme teknolojisi, helikopter pisti ve 360 derece kesintisiz panoramik gözlem terasıyla çok uluslu şirketlerin bir numaralı tercihi olmaya aday bir mühendislik harikasıdır.',
            specs: [
                { label: 'Teslim Durumu', value: 'Tamamlandı (Lansman Özel)' },
                { label: 'Toplam Alan', value: '150.000 m²' },
                { label: 'Yapı Konsepti', value: 'Modern A++ İş Kulesi (50 Kat)' },
                { label: 'Özellikler', value: 'Helikopter Pisti, Executive Lounge, Kongre Merkezi' },
                { label: 'Güvenlik', value: 'Sismik Damper Teknolojisi, Rüzgar Yükü Sönümleyiciler' }
            ]
        }
    };
    
    const projectModal = document.getElementById('project-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');
    const modalContentGrid = document.getElementById('modal-content-grid');
    const openModalButtons = document.querySelectorAll('.btn-open-modal');
    
    const openProjectModal = (projectId) => {
        const data = projectDetailsRegistry[projectId];
        if (!data) return;
        
        // Build Specs Table Rows HTML
        let specsRows = '';
        data.specs.forEach(spec => {
            let iconClass = 'fa-regular fa-circle-dot';
            if (spec.label.includes('Tarih') || spec.label.includes('Durum')) iconClass = 'fa-regular fa-calendar-check';
            if (spec.label.includes('Alan')) iconClass = 'fa-solid fa-maximize';
            if (spec.label.includes('Tip') || spec.label.includes('Konsept')) iconClass = 'fa-solid fa-house';
            if (spec.label.includes('Sosyal') || spec.label.includes('Alanlar')) iconClass = 'fa-solid fa-umbrella-beach';
            if (spec.label.includes('Güvenlik') || spec.label.includes('Mühendislik') || spec.label.includes('Malzeme')) iconClass = 'fa-solid fa-shield-halved';
            
            specsRows += `
                <tr>
                    <td class="specs-label"><i class="${iconClass}"></i> ${spec.label}</td>
                    <td class="specs-value">${spec.value}</td>
                </tr>
            `;
        });
        
        // Inject Content into Grid
        modalContentGrid.innerHTML = `
            <div class="modal-visual-pane" style="background-image: url('${data.image}');">
                <div class="modal-visual-overlay"></div>
            </div>
            <div class="modal-text-pane">
                <span class="modal-loc"><i class="fa-solid fa-location-dot"></i> ${data.location}</span>
                <h2 class="modal-title">${data.title}</h2>
                <p class="modal-desc">${data.desc}</p>
                
                <table class="specs-table">
                    <tbody>
                        ${specsRows}
                    </tbody>
                </table>
                
                <a href="#iletisim" class="btn btn-gold btn-block modal-contact-btn" id="modal-cta-btn">
                    Satış Danışmanı ile Görüş <i class="fa-solid fa-phone"></i>
                </a>
            </div>
        `;
        
        // Open Modal animations
        projectModal.classList.add('active');
        document.body.classList.add('overflow-hidden');
        
        // Connect modal CTA button to close and scroll
        document.getElementById('modal-cta-btn').addEventListener('click', (e) => {
            closeProjectModal();
            // Pre-select the project in the dropdown
            const projectDropdown = document.getElementById('form-project');
            if (projectDropdown) {
                projectDropdown.value = projectId;
            }
        });
    };
    
    const closeProjectModal = () => {
        projectModal.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
    };
    
    openModalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectId = btn.getAttribute('data-project');
            openProjectModal(projectId);
        });
    });
    
    modalClose.addEventListener('click', closeProjectModal);
    modalBackdrop.addEventListener('click', closeProjectModal);
    
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal.classList.contains('active')) {
            closeProjectModal();
        }
    });


    // --- CUSTOM TESTIMONIALS SLIDER ---
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideTimer;
    
    const goToSlide = (n) => {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Slide track positioning
        const track = document.getElementById('testimonial-track');
        if (track) {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
    };
    
    const nextSlide = () => {
        goToSlide(currentSlide + 1);
    };
    
    const startSlideTimer = () => {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, 6000); // Shift every 6 seconds
    };
    
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIdx = parseInt(dot.getAttribute('data-slide'), 10);
            goToSlide(slideIdx);
            startSlideTimer(); // Reset timer on click
        });
    });
    
    // Initialize Slider Carousel
    startSlideTimer();


    // --- PREMIUM FLOATING WHATSAPP CHAT WIDGET ---
    const whatsappBubble = document.getElementById('whatsapp-bubble');
    const whatsappChatBox = document.getElementById('whatsapp-chat-box');
    const chatClose = document.getElementById('chat-close');
    
    whatsappBubble.addEventListener('click', () => {
        whatsappChatBox.classList.add('active');
        // Hide badge notification count
        const badge = whatsappBubble.querySelector('.whatsapp-badge');
        if (badge) badge.style.display = 'none';
    });
    
    chatClose.addEventListener('click', (e) => {
        e.stopPropagation();
        whatsappChatBox.classList.remove('active');
    });
    
    // Close chat box on scroll
    window.addEventListener('scroll', () => {
        if (whatsappChatBox.classList.contains('active') && window.scrollY > 200) {
            whatsappChatBox.classList.remove('active');
        }
    }, { passive: true });


    // --- SCROLL TO TOP ENGINE ---
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollToTopBtn.classList.add('active');
        } else {
            scrollToTopBtn.classList.remove('active');
        }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });


    // --- ADVANCED CONTACT FORM VALIDATION & SUBMISSION ---
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const successModal = document.getElementById('success-modal');
    const successModalClose = document.getElementById('s-modal-close');
    
    // Inline validation checkers
    const validateField = (input, errorEl, checkFn) => {
        const parent = input.closest('.form-group');
        const isValid = checkFn(input.value.trim());
        
        if (!isValid) {
            parent.classList.add('has-error');
        } else {
            parent.classList.remove('has-error');
        }
        return isValid;
    };
    
    const checkName = (val) => val.length >= 3;
    const checkPhone = (val) => {
        // Strip non-numbers
        const digits = val.replace(/\D/g, '');
        return digits.length >= 10;
    };
    const checkEmail = (val) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(val);
    };
    const checkRequired = (val) => val !== '';
    
    const formName = document.getElementById('form-name');
    const formPhone = document.getElementById('form-phone');
    const formEmail = document.getElementById('form-email');
    const formProject = document.getElementById('form-project');
    const formMessage = document.getElementById('form-message');
    
    // Bind Realtime Blur Events
    formName.addEventListener('blur', () => validateField(formName, null, checkName));
    formPhone.addEventListener('blur', () => validateField(formPhone, null, checkPhone));
    formEmail.addEventListener('blur', () => validateField(formEmail, null, checkEmail));
    formProject.addEventListener('change', () => validateField(formProject, null, checkRequired));
    formMessage.addEventListener('blur', () => validateField(formMessage, null, checkRequired));
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Perform overall check
        const isNameValid = validateField(formName, null, checkName);
        const isPhoneValid = validateField(formPhone, null, checkPhone);
        const isEmailValid = validateField(formEmail, null, checkEmail);
        const isProjectValid = validateField(formProject, null, checkRequired);
        const isMessageValid = validateField(formMessage, null, checkRequired);
        
        if (isNameValid && isPhoneValid && isEmailValid && isProjectValid && isMessageValid) {
            // Trigger Button Loading Animation
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            try {
            if (window.CK_CRM) {
                await window.CK_CRM.saveIncomingLead({
                    name: formName.value.trim(),
                    phone: formPhone.value.trim(),
                    email: formEmail.value.trim(),
                    service: formProject.options[formProject.selectedIndex].text,
                    message: formMessage.value.trim()
                });
            }

            } catch(error) { submitBtn.classList.remove('loading'); submitBtn.disabled=false; alert(error.message); return; }
// Confirmed submission
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                // Show Success Pop-up Modal
                successModal.classList.add('active');
                document.body.classList.add('overflow-hidden');
                
                // Reset form values
                form.reset();
                document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('has-error'));
            }, 800);
        } else {
            // Scroll to the first error
            const firstError = document.querySelector('.form-group.has-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
    
    successModalClose.addEventListener('click', () => {
        successModal.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
    });


    // --- NEWSLETTER SUBSCRIPTION ---
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterEmail = document.getElementById('newsletter-email');
    const newsletterSuccess = document.getElementById('news-success');
    
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (checkEmail(newsletterEmail.value.trim())) {
            // Show inline success message
            newsletterSuccess.style.display = 'flex';
            newsletterEmail.value = '';
            newsletterEmail.disabled = true;
            newsletterForm.querySelector('button').disabled = true;
            
            setTimeout(() => {
                newsletterSuccess.style.opacity = '0';
                setTimeout(() => {
                    newsletterSuccess.style.display = 'none';
                    newsletterSuccess.style.opacity = '1';
                    newsletterEmail.disabled = false;
                    newsletterForm.querySelector('button').disabled = false;
                }, 500);
            }, 4000);
        }
    });

});
