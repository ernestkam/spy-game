// Component initialization and management
const Components = {
    initProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        progressBar.innerHTML = `
            <div class="progress-line"></div>
            <div class="progress-step" data-step="setup">
                <div class="step-circle">1</div>
                <div class="step-label">設置</div>
            </div>
            <div class="progress-step" data-step="distribution">
                <div class="step-circle">2</div>
                <div class="step-label">發牌</div>
            </div>
            <div class="progress-step" data-step="results">
                <div class="step-circle">3</div>
                <div class="step-label">結果</div>
            </div>
        `;
        
        // Initialize with setup step active
        this.updateProgressBar('setup');
    },

    initSetupBoxes() {
        const spySetup = document.getElementById('spySetup');
        const civilianSetup = document.getElementById('civilianSetup');

        spySetup.innerHTML = this.createSetupBox('臥底', 'spy', 2);
        civilianSetup.innerHTML = this.createSetupBox('平民', 'civilian', 3);
    },

    createSetupBox(title, prefix, defaultCount) {
        return `
            <h2>${title}</h2>
            <div class="number-selector-container">
                <div class="number-selector" id="${prefix}Selector">
                    <div class="number-strip" id="${prefix}Strip">
                        ${this.createNumberOptions(10)}
                    </div>
                </div>
                <input type="hidden" 
                    id="${prefix}Count" 
                    value="${defaultCount}">
            </div>
            <div class="word-input-container">
                <label for="${prefix}Word">詞語</label>
                <div class="word-input-wrapper">
                    <input type="text" 
                        id="${prefix}Word" 
                        placeholder="輸入詞語"
                        onchange="Components.validateSetup()"
                        oninput="Components.handleWordInput(this)">
                </div>
            </div>
        `;
    },

    createNumberOptions(max) {
        return Array.from({ length: max + 1 }, (_, i) => `
            <div class="number-option" data-value="${i}" onclick="Components.selectNumberByClick(this)">${i}</div>
        `).join('');
    },

    selectNumber(button) {
        const selector = button.closest('.number-selector');
        const prefix = selector.id.replace('Selector', '');
        const value = parseInt(button.dataset.value);
        
        // Update active state
        selector.querySelectorAll('.number-option').forEach(opt => {
            opt.classList.toggle('active', opt === button);
        });
        
        // Update hidden input
        document.getElementById(`${prefix}Count`).value = value;
        this.validateSetup();
    },

    selectNumberByClick(option) {
        const strip = option.parentElement;
        const selector = strip.parentElement;
        const prefix = selector.id.replace('Selector', '');
        const value = parseInt(option.dataset.value);
        const optionWidth = 40;
        
        // Update the strip's current position
        strip.currentX = -value * optionWidth;
        
        // Update position
        const translateX = (120/2) - (value * optionWidth) - optionWidth/2;
        strip.style.transform = `translateX(${translateX}px)`;
        
        // Update visual states
        strip.querySelectorAll('.number-option').forEach((opt, index) => {
            const isActive = parseInt(opt.dataset.value) === value;
            opt.classList.toggle('active', isActive);
            
            const distance = Math.abs(index - value);
            const scale = isActive ? 1.2 : Math.max(0.7, 1 - distance * 0.15);
            const opacity = isActive ? 1 : Math.max(0.3, 1 - distance * 0.2);
            opt.style.transform = `scale(${scale})`;
            opt.style.opacity = opacity;
        });
        
        // Update hidden input
        document.getElementById(`${prefix}Count`).value = value;
        this.validateSetup();
    },

    initNumberSelectors() {
        document.querySelectorAll('.number-selector').forEach(selector => {
            const strip = selector.querySelector('.number-strip');
            const input = document.getElementById(selector.id.replace('Selector', 'Count'));
            
            // Store the current state in the strip element
            strip.currentX = -(parseInt(input.value) * 40);
            
            const updateValue = (offset) => {
                const optionWidth = 40;
                const value = Math.round((-offset - optionWidth/2) / optionWidth);
                const boundedValue = Math.max(0, Math.min(value, 10));
                
                const translateX = (120/2) - (boundedValue * optionWidth) - optionWidth/2;
                strip.style.transform = `translateX(${translateX}px)`;
                input.value = boundedValue;
                strip.currentX = -boundedValue * optionWidth;
                
                strip.querySelectorAll('.number-option').forEach((option, index) => {
                    const isActive = parseInt(option.dataset.value) === boundedValue;
                    option.classList.toggle('active', isActive);
                    
                    const distance = Math.abs(index - boundedValue);
                    const scale = isActive ? 1.2 : Math.max(0.7, 1 - distance * 0.15);
                    const opacity = isActive ? 1 : Math.max(0.3, 1 - distance * 0.2);
                    option.style.transform = `scale(${scale})`;
                    option.style.opacity = opacity;
                });
                
                this.validateSetup();
            };

            // Touch/Mouse events setup
            let startX = 0;
            let isDragging = false;

            strip.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX - strip.currentX;
                isDragging = true;
                strip.style.transition = 'none';
            }, { passive: false });

            strip.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                strip.currentX = e.touches[0].clientX - startX;
                requestAnimationFrame(() => updateValue(strip.currentX));
            }, { passive: false });

            strip.addEventListener('mousedown', (e) => {
                startX = e.clientX - strip.currentX;
                isDragging = true;
                strip.style.transition = 'none';
            });

            strip.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                strip.currentX = e.clientX - startX;
                requestAnimationFrame(() => updateValue(strip.currentX));
            });

            const endDrag = () => {
                if (!isDragging) return;
                isDragging = false;
                strip.style.transition = 'transform 0.3s ease';
                const optionWidth = 40;
                const snapValue = Math.round(-strip.currentX / optionWidth);
                strip.currentX = -snapValue * optionWidth;
                updateValue(strip.currentX);
            };

            strip.addEventListener('touchend', endDrag);
            strip.addEventListener('mouseup', endDrag);
            strip.addEventListener('mouseleave', endDrag);

            // Set initial position
            updateValue(strip.currentX);
        });
    },

    initPresets() {
        const presets = document.querySelectorAll('.preset-button');
        presets.forEach(preset => {
            preset.addEventListener('click', () => {
                const players = parseInt(preset.dataset.players);
                const spies = parseInt(preset.dataset.spies);
                
                // Update spy count
                const spyInput = document.getElementById('spyCount');
                spyInput.value = spies;
                this.updateNumberSelector('spy', spies);
                
                // Update civilian count
                const civilianInput = document.getElementById('civilianCount');
                civilianInput.value = players - spies;
                this.updateNumberSelector('civilian', players - spies);
                
                this.validateSetup();
                
                // Update active state
                presets.forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
            });
        });
    },

    updateNumberSelector(prefix, value) {
        const selector = document.getElementById(`${prefix}Selector`);
        const strip = selector.querySelector('.number-strip');
        const optionWidth = 40;
        
        // Update the strip's current position
        strip.currentX = -value * optionWidth;
        
        // Calculate the transform to center the selected number
        const translateX = (120/2) - (value * optionWidth) - optionWidth/2;
        strip.style.transform = `translateX(${translateX}px)`;
        
        // Update visual states
        strip.querySelectorAll('.number-option').forEach((option, index) => {
            const isActive = parseInt(option.dataset.value) === value;
            option.classList.toggle('active', isActive);
            
            const distance = Math.abs(index - value);
            const scale = isActive ? 1.2 : Math.max(0.7, 1 - distance * 0.15);
            const opacity = isActive ? 1 : Math.max(0.3, 1 - distance * 0.2);
            option.style.transform = `scale(${scale})`;
            option.style.opacity = opacity;
        });
    },

    adjustCount(prefix, delta) {
        const input = document.getElementById(`${prefix}Count`);
        const newValue = parseInt(input.value) + delta;
        if (newValue >= 0) {
            input.value = newValue;
            this.validateSetup();
        }
    },

    validateSetup() {
        const spyCount = parseInt(document.getElementById('spyCount').value);
        const civilianCount = parseInt(document.getElementById('civilianCount').value);
        const totalPlayers = spyCount + civilianCount;
        const startButton = document.getElementById('startButton');
        const validationMessage = document.querySelector('.validation-message');
        
        let isValid = true;
        let message = '';

        if (totalPlayers < 3) {
            isValid = false;
            message = '至少需要3名玩家';
        } else if (spyCount === 0) {
            isValid = false;
            message = '至少需要1名臥底';
        } else if (spyCount >= civilianCount) {
            isValid = false;
            message = '平民人數必須多於臥底';
        }

        validationMessage.textContent = message;
        validationMessage.style.color = isValid ? 'green' : '#ff6b6b';
        startButton.disabled = !isValid;
        
        return isValid;
    },

    initCard() {
        const card = document.getElementById('card');
        if (card) {
            this.resetCard();
        } else {
            console.error('Card element not found');
        }
    },

    resetCard() {
        const card = document.getElementById('card');
        const nextButton = document.getElementById('nextButton');
        
        if (card) {
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <span>點擊查看<br>你的詞語</span>
                    </div>
                    <div class="card-back">
                        <span id="cardContent"></span>
                    </div>
                </div>
            `;
            card.classList.remove('revealed');
            card.style.pointerEvents = 'auto';
            
            nextButton.classList.remove('visible');
            nextButton.classList.add('hidden');
        }
    },

    showCardContent(content) {
        const card = document.getElementById('card');
        const cardContent = document.getElementById('cardContent');
        const nextButton = document.getElementById('nextButton');
        
        if (card && cardContent) {
            cardContent.textContent = content;
            card.classList.add('revealed');
            card.style.pointerEvents = 'none';
            
            // Show next button with animation
            setTimeout(() => {
                nextButton.classList.remove('hidden');
                requestAnimationFrame(() => {
                    nextButton.classList.add('visible');
                });
            }, 400);
        }
    },

    updateProgressBar(currentStep) {
        const steps = ['setup', 'distribution', 'results'];
        const progressSteps = document.querySelectorAll('.progress-step');
        const progressLine = document.querySelector('.progress-line');
        const currentIndex = steps.indexOf(currentStep);
        
        // Calculate the total width between first and last circles
        const firstStep = progressSteps[0];
        const lastStep = progressSteps[progressSteps.length - 1];
        const totalWidth = lastStep.offsetLeft - firstStep.offsetLeft;
        
        // Calculate progress width based on current step
        let width = 0;
        if (currentIndex > 0) {
            const currentStep = progressSteps[currentIndex];
            width = currentStep.offsetLeft - firstStep.offsetLeft;
        }
        
        progressLine.style.width = `${width}px`;
        
        steps.forEach((step, index) => {
            const stepElement = progressSteps[index];
            if (step === currentStep) {
                stepElement.classList.add('active');
                stepElement.classList.remove('completed');
            } else if (steps.indexOf(step) < steps.indexOf(currentStep)) {
                stepElement.classList.add('completed');
                stepElement.classList.remove('active');
            } else {
                stepElement.classList.remove('active', 'completed');
            }
        });
    },

    togglePresets() {
        const presets = document.querySelector('.presets');
        const toggle = document.querySelector('.presets-toggle');
        presets.classList.toggle('expanded');
        toggle.classList.toggle('collapsed');
    },

    handleWordInput(input) {
        const container = input.closest('.word-input-container');
        container.classList.toggle('has-value', input.value.length > 0);
        this.validateSetup();
    }
}; 