document.addEventListener('DOMContentLoaded', function () {
    // --- Carousel Logic ---
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const totalSlides = slides.length;
    let currentSlide = 0;

    window.moveSlide = function (direction) {
        currentSlide += direction;
        if (currentSlide < 0) currentSlide = 0;
        if (currentSlide >= totalSlides) currentSlide = totalSlides - 1;
        updateCarousel();
    };

    window.goToSlide = function (index) {
        currentSlide = index;
        updateCarousel();
    };

    function updateCarousel() {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update arrows
        const prevArrow = document.querySelector('.prev-arrow');
        const nextArrow = document.querySelector('.next-arrow');
        if (prevArrow) {
            prevArrow.style.opacity = currentSlide === 0 ? '0.3' : '1';
            prevArrow.disabled = currentSlide === 0;
        }
        if (nextArrow) {
            nextArrow.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '1';
            nextArrow.disabled = currentSlide === totalSlides - 1;
        }

        // Update indicators
        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === currentSlide);
        });

        // Update Top Navigation
        const navItems = document.querySelectorAll('.nav-item');
        if (navItems.length > 0) {
            navItems.forEach((item, i) => {
                item.classList.toggle('active', i === currentSlide);
            });
        }
    }
    updateCarousel();

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (document.getElementById('survey-quest').classList.contains('hidden')) {
            if (e.key === 'ArrowRight') moveSlide(1);
            if (e.key === 'ArrowLeft') moveSlide(-1);
        }
    });

    // --- Mouse Bubbling Notes Logic ---
    let isMoving = false;

    document.addEventListener('mousemove', function (e) {
        if (!isMoving) {
            isMoving = true;
            createBubbleNote(e.clientX, e.clientY);
            setTimeout(() => { isMoving = false; }, 50); // Create note every 50ms max
        }
    });

    function createBubbleNote(x, y) {
        const symbols = ['♪', '♫', '♩', '♬', '♭', '♯', '𝄞'];
        const note = document.createElement('div');
        note.classList.add('bubble-note');
        note.innerText = symbols[Math.floor(Math.random() * symbols.length)];

        // Random slight offset
        const offsetX = (Math.random() - 0.5) * 40;

        note.style.left = (x + offsetX) + 'px';
        note.style.top = y + 'px';
        note.style.fontSize = (Math.random() * 1.5 + 1.5) + 'rem'; // 1.5rem ~ 3rem

        // Dynamic color (purple shades)
        const hue = 260 + Math.random() * 40; // 260 ~ 300
        note.style.color = `hsl(${hue}, 70%, 65%)`;

        document.body.appendChild(note);

        // Remove after animation (1s)
        setTimeout(() => {
            note.remove();
        }, 1000);
    }

    // --- Survey Logic ---
    const surveyOverlay = document.getElementById('survey-quest');
    const completionModal = document.getElementById('completion-modal');
    const qSlides = document.querySelectorAll('.question-slide');
    const totalSteps = qSlides.length;
    let currentStep = 0;

    // GOOGLE SHEETS WEB APP URL - Replace with your actual deployed URL
    // (Created with account: deus1110111@gmail.com)
    const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

    // Button Listener
    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            startSurvey();
        });
    }

    window.startSurvey = function () {
        if (!surveyOverlay) return;
        surveyOverlay.classList.remove('hidden');
        surveyOverlay.style.display = 'flex';
        currentStep = 0;
        updateSurveyUI();
    };

    window.closeSurvey = function () {
        if (confirm('작성을 취소하시겠습니까?')) {
            surveyOverlay.style.opacity = '0';
            setTimeout(() => {
                surveyOverlay.classList.add('hidden');
                surveyOverlay.style.display = 'none';
                surveyOverlay.style.opacity = '1';
            }, 300);
        }
    };

    window.nextStep = function () {
        if (currentStep < totalSteps - 1) {
            currentStep++;
            updateSurveyUI();
        } else {
            finishSurvey();
        }
    };

    window.prevStep = function () {
        if (currentStep > 0) {
            currentStep--;
            updateSurveyUI();
        }
    };

    window.autoNext = function (delaySeconds = 0.5) {
        setTimeout(() => {
            nextStep();
        }, delaySeconds * 1000);
    };

    function updateSurveyUI() {
        qSlides.forEach(s => s.classList.remove('active'));
        const activeSlide = document.querySelector(`.question-slide[data-step="${currentStep}"]`);
        if (activeSlide) activeSlide.classList.add('active');

        const levelSpan = document.getElementById('current-level');
        if (levelSpan) levelSpan.textContent = currentStep + 1;

        const progFill = document.getElementById('quest-progress-fill');
        if (progFill) progFill.style.width = `${((currentStep + 1) / totalSteps) * 100}%`;

        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) prevBtn.disabled = (currentStep === 0);
        if (nextBtn) {
            if (currentStep === totalSteps - 1) {
                nextBtn.innerHTML = '제출하기 <i class="fas fa-paper-plane"></i>';
                nextBtn.classList.add('success');
            } else {
                nextBtn.innerHTML = '다음 <i class="fas fa-chevron-right"></i>';
                nextBtn.classList.remove('success');
            }
        }
    }

    function collectFormData() {
        const form = document.getElementById('questForm');
        const formData = new FormData(form);
        const data = {};

        // Student info
        data.grade = formData.get('grade') || '';
        data.class = formData.get('class') || '';
        data.number = formData.get('number') || '';
        data.name = formData.get('name') || '';

        // Q1
        data.q1 = formData.get('q1') || '';
        data.q1_reason = formData.get('q1_reason') || '';

        // Q2
        data.q2 = formData.get('q2') || '';

        // Q3
        data.q3 = formData.get('q3') || '';

        // Q4
        data.q4_inst = formData.get('q4_inst') || '';
        data.q4_detail = formData.get('q4_detail') || '';

        // Q5
        data.q5_genre = formData.get('q5_genre') || '';
        data.q5_reason = formData.get('q5_reason') || '';

        // Q6
        data.q6_title = formData.get('q6_title') || '';
        data.q6_reason = formData.get('q6_reason') || '';

        // Q7
        data.q7_title = formData.get('q7_title') || '';
        data.q7_reason = formData.get('q7_reason') || '';

        // Q8
        data.q8 = formData.get('q8') || '';

        // Q9
        data.q9 = formData.get('q9') || '';

        // Q10
        data.q10 = formData.get('q10') || '';

        // Timestamp
        data.timestamp = new Date().toLocaleString('ko-KR');

        return data;
    }

    async function submitToGoogleSheets(data) {
        if (GOOGLE_SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            console.log('Google Sheets URL not configured. Form data:', data);
            return true; // Continue anyway for demo
        }

        try {
            const response = await fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            console.log('Data submitted to Google Sheets');
            return true;
        } catch (error) {
            console.error('Error submitting to Google Sheets:', error);
            return false;
        }
    }

    async function finishSurvey() {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.innerHTML = '제출 중...';

        // Collect form data
        const data = collectFormData();

        // Submit to Google Sheets
        await submitToGoogleSheets(data);

        setTimeout(() => {
            surveyOverlay.style.display = 'none';
            if (completionModal) completionModal.classList.remove('hidden');
        }, 1000);
    }
});
