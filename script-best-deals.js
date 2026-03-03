document.addEventListener('DOMContentLoaded', () => {
    // Pobierz wszystkie kontenery z klasą img-wrapper na stronie
    const containers = document.querySelectorAll('.best-deals-img-wrapper');
    if (containers.length === 0) return;

    let ticking = false;

    function updateParallax() {
        const windowHeight = window.innerHeight;

        containers.forEach(container => {
            const image = container.querySelector('.best-deals-image');
            if (!image) return;

            const rect = container.getBoundingClientRect();

            // Sprawdź czy kontener zdjęcia jest widoczny na ekranie
            if (rect.top <= windowHeight && rect.bottom >= 0) {
                // Oblicz postęp przewijania dla elementu (od 0 do 1)
                // 0 - element właśnie pojawia się na dole ekranu
                // 1 - element właśnie znika na górze ekranu
                const totalDistance = windowHeight + rect.height;
                const currentPosition = windowHeight - rect.top;
                const progress = currentPosition / totalDistance;

                // Przelicz postęp na wartość przesunięcia (w procentach)
                // Przyjmujemy od -15% do +15% poziomego przesunięcia zdjęcia
                const maxMovement = 15;
                // Żeby auto przemieszczało się z lewej strony na prawą podczas przewijania:
                const xMove = (progress - 0.5) * (maxMovement * 2);

                // Aplikuj pozycję za pomocą zmiennej CSS
                image.style.setProperty('--parallax-x', `${xMove}%`);
            }
        });

        ticking = false;
    }

    // Pierwsze wywołanie dla zainicjowania odpowiedniej pozycji na start
    updateParallax();

    // Nasłuchiwanie na event scrolla
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax();
            });
            ticking = true;
        }
    });
});
