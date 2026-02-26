const API_URL = 'https://api.leadexpert.pl/products/cfqkvujb/';

async function fetchWidgetData() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP Error! status: ${res.status}`);
        const data = await res.json();
        renderWidget(data);
    } catch (e) {
        console.error('Failed to load widget data:', e);
        document.getElementById('widget-app').innerHTML = '<p style="text-align:center; padding: 40px; color: #666;">Nie udało się załadować produktów.</p>';
    }
}

function renderWidget(data) {
    const app = document.getElementById('widget-app');

    const headerBg = 'https://static.im-g.pl/i/hp/logo/gazeta.png'; // Logo Gazeta.pl

    let cardsHtml = '';

    data.items.forEach(item => {
        const photoHash = item.photos && item.photos[0] ? item.photos[0] : '';
        const photoUrl = photoHash ? `https://e-moda24.pl/photos/${photoHash}.jpg` : 'https://via.placeholder.com/200';

        const currentPriceRaw = item.price || 0;
        const currentPrice = currentPriceRaw.toFixed(2).replace('.', ',') + ' zł';

        const oldPriceRaw = currentPriceRaw * 1.3;
        const oldPrice = oldPriceRaw.toFixed(2).replace('.', ',') + ' zł';

        cardsHtml += `
            <div class="product-card">
                <a href="${item.url}" target="_blank" class="product-card-inner">
                    <div class="product-image-container">
                        <img src="${photoUrl}" alt="${item.name}" class="product-image" onerror="this.src='https://via.placeholder.com/200?text=Brak+Zdj%C4%99cia'">
                    </div>
                    <div class="product-brand">${item.partnerName}</div>
                    <div class="product-name" title="${item.name}">${item.name}</div>

                    <div class="btn-buy">KUP TERAZ &gt;</div>
                </a>
            </div>
        `;
    });

    const widgetHtml = `
        <div class="widget-container">
            <div class="carousel-wrapper">
                <button class="nav-btn nav-prev" aria-label="Poprzednie">
                    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                
                <div class="carousel-viewport">
                    <div class="carousel-track" id="carousel-track">
                        ${cardsHtml}
                    </div>
                </div>
                
                <button class="nav-btn nav-next" aria-label="Następne">
                    <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                
                <div class="pagination" id="carousel-pagination"></div>
            </div>
        </div>
    `;

    app.innerHTML = widgetHtml;
    initCarousel(data.items.length);
}

function initCarousel(totalItems) {
    const track = document.getElementById('carousel-track');
    const prevBtn = document.querySelector('.nav-prev');
    const nextBtn = document.querySelector('.nav-next');
    const pagination = document.getElementById('carousel-pagination');

    let currentIndex = 0;

    const getItemsPerView = () => {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 768) return 2;
        return 3;
    };

    let itemsPerView = getItemsPerView();
    let maxIndex = Math.max(0, totalItems - itemsPerView);

    // Render Dots
    const renderDots = () => {
        pagination.innerHTML = '';
        const dotsCount = maxIndex + 1;
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.className = `dot ${i === currentIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
            });
            pagination.appendChild(dot);
        }
    };

    const updateCarousel = () => {
        const cardWidth = 100 / itemsPerView;
        track.style.transform = `translateX(-${currentIndex * cardWidth}%)`;

        const dots = pagination.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === currentIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
        prevBtn.style.cursor = currentIndex === 0 ? 'default' : 'pointer';

        nextBtn.style.opacity = currentIndex === maxIndex ? '0.3' : '1';
        nextBtn.style.cursor = currentIndex === maxIndex ? 'default' : 'pointer';
    };

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = maxIndex; // zapętl w lewo
        }
        updateCarousel();
        resetAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
            currentIndex++;
        } else {
            currentIndex = 0; // zapętl w prawo
        }
        updateCarousel();
        resetAutoPlay();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newItemsPerView = getItemsPerView();
            if (newItemsPerView !== itemsPerView) {
                itemsPerView = newItemsPerView;
                maxIndex = Math.max(0, totalItems - itemsPerView);
                if (currentIndex > maxIndex) currentIndex = maxIndex;
                renderDots();
                updateCarousel();
            }
        }, 150);
    });

    let touchStartX = 0;
    let touchEndX = 0;

    const trackContainer = document.querySelector('.carousel-viewport');
    trackContainer.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    trackContainer.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50;
        if (touchStartX - touchEndX > threshold) {
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0; // zapętl na swipe jeśli to koniec
            }
            updateCarousel();
            resetAutoPlay();
        }
        if (touchEndX - touchStartX > threshold) {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = maxIndex;
            }
            updateCarousel();
            resetAutoPlay();
        }
    }

    // AUTO-PLAY
    let autoPlayInterval;
    const startAutoPlay = () => {
        autoPlayInterval = setInterval(() => {
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0; // zapętl na początek
            }
            updateCarousel();
        }, 4000); // przesuwa się co 4 sekundy
    };

    const stopAutoPlay = () => {
        clearInterval(autoPlayInterval);
    };

    const resetAutoPlay = () => {
        stopAutoPlay();
        startAutoPlay();
    };

    // Zatrzymaj jak ktoś najeżdża kursorem, wznow jak zjedzie
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
    carouselWrapper.addEventListener('mouseleave', startAutoPlay);

    renderDots();
    updateCarousel();
    startAutoPlay();
}

document.addEventListener('DOMContentLoaded', fetchWidgetData);
