document.addEventListener('DOMContentLoaded', () => {
    const sliderTrack = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const dotsContainer = document.querySelector('.slider-dots');

    if (!sliderTrack || slides.length === 0 || !prevBtn || !nextBtn || !dotsContainer) {
        console.warn("Elemente necesare pentru slider nu au fost găsite. Slider-ul nu va funcționa.");
        return;
    }

    let currentIndex = 0;
    const slideWidth = slides[0].offsetWidth;
    const totalSlides = slides.length;
    let autoSlideInterval;

    //puncte de navigație
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
        dot.addEventListener('click', () => goToSlide(i));
    }
    const dots = document.querySelectorAll('.dot');

    // Funcție pentru a actualiza afișajul slider-ului
    function updateSlider() {
        sliderTrack.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        // Actualizează clasele active pentru puncte
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Funcție pentru a merge la un anumit slide
    function goToSlide(index) {
        currentIndex = index;
        updateSlider();
    }

    // Funcție pentru a merge la slide-ul următor
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    }

    // Funcție pentru a merge la slide-ul anterior
    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    }

    // Event listeners pentru butoane
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
    });

    // Funcție pentru auto-slide
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000); 
    }

    // Funcție pentru a reseta auto-slide-ul după interacțiunea manuală
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // Inițializare: afișează primul slide și pornește auto-slide
    updateSlider();
    startAutoSlide();

    // Ajustează lățimea slide-urilor la redimensionarea ferestrei
    window.addEventListener('resize', () => {
        const newSlideWidth = slides[0].offsetWidth;
        sliderTrack.style.transform = `translateX(-${currentIndex * newSlideWidth}px)`;
    });
});