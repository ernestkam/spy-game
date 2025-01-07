const Game = {
    state: {
        cardColors: [],
        currentPlayer: 0,
        revealed: false,
        currentStep: 'setup'
    },

    start() {
        const spyCount = parseInt(document.getElementById('spyCount').value);
        const civilianCount = parseInt(document.getElementById('civilianCount').value);
        const spyWord = document.getElementById('spyWord').value;
        const civilianWord = document.getElementById('civilianWord').value;

        this.state.cardColors = Array(spyCount).fill(spyWord)
            .concat(Array(civilianCount).fill(civilianWord));

        // Shuffle the cards
        for (let i = this.state.cardColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.state.cardColors[i], this.state.cardColors[j]] = 
            [this.state.cardColors[j], this.state.cardColors[i]];
        }

        this.state.currentStep = 'distribution';
        this.state.currentPlayer = -1; // Reset player counter
        Components.updateProgressBar(this.state.currentStep);
        this.transitionSection('admin', 'prePlayer');
    },

    startPlayerTurns() {
        if (document.getElementById('prePlayer').classList.contains('hidden')) {
            // We're already in player turns mode
            this.nextPlayer();
        } else {
            // Starting player turns for the first time
            this.transitionSection('prePlayer', 'player');
            this.nextPlayer();
        }
    },

    nextPlayer() {
        if (this.state.currentPlayer < this.state.cardColors.length - 1) {
            this.state.currentPlayer++;
            this.state.revealed = false;
            
            // Show pass screen and hide footer
            const passOverlay = document.querySelector('.pass-overlay');
            const gameFooter = document.querySelector('.game-footer');
            passOverlay.classList.add('active');
            gameFooter.classList.add('empty'); // Use class instead of display none
            
            // Hide pass screen after delay and show next card
            setTimeout(() => {
                passOverlay.classList.remove('active');
                gameFooter.classList.remove('empty'); // Show footer again
                Components.resetCard();
                document.getElementById('playerNumber').textContent = `玩家 ${this.state.currentPlayer + 1}`;
            }, 1500);
        } else {
            this.transitionSection('player', 'buffer');
        }
    },

    revealCard() {
        if (!this.state.revealed) {
            const currentCard = this.state.cardColors[this.state.currentPlayer];
            Components.showCardContent(currentCard);
            this.state.revealed = true;
            // Show next button after card is revealed
            this.updateFooterButton('player');
        }
    },

    showResults() {
        this.state.currentStep = 'results';
        Components.updateProgressBar(this.state.currentStep);
        this.transitionSection('buffer', 'result');

        const resultTable = document.getElementById('resultsTable');
        resultTable.innerHTML = `
            <tr>
                <th>玩家</th>
                <th>身份</th>
                <th>詞語</th>
            </tr>
            ${this.state.cardColors.map((word, index) => {
                const isSpy = word === document.getElementById('spyWord').value;
                const roleClass = isSpy ? 'role-spy' : 'role-civilian';
                const roleText = isSpy ? '臥底' : '平民';
                const delay = index * 0.1; // Stagger animation

                return `
                    <tr class="result-row" style="animation-delay: ${delay}s">
                        <td>玩家 ${index + 1}</td>
                        <td>
                            <div class="result-role">
                                <span class="role-indicator ${roleClass}"></span>
                                ${roleText}
                            </div>
                        </td>
                        <td>${word}</td>
                    </tr>
                `;
            }).join('')}
        `;
    },

    startOver() {
        this.state.cardColors = [];
        this.state.currentPlayer = 0;
        this.state.revealed = false;
        this.state.currentStep = 'setup';
        Components.updateProgressBar(this.state.currentStep);
        document.getElementById('resultsTable').innerHTML = '';
        this.transitionSection('result', 'admin');
    },

    transitionSection(hideId, showId) {
        // Disable all buttons during transition
        document.querySelectorAll('.button-primary').forEach(button => {
            button.disabled = true;
        });

        const hideSection = document.getElementById(hideId);
        const showSection = document.getElementById(showId);
        
        hideSection.classList.add('hidden');
        
        setTimeout(() => {
            hideSection.style.display = 'none';
            showSection.style.display = 'flex';
            showSection.offsetHeight;
            showSection.classList.remove('hidden');
            
            // Update footer button when section changes
            this.updateFooterButton(showId);

            // Re-enable buttons after transition
            document.querySelectorAll('.button-primary').forEach(button => {
                button.disabled = false;
            });
        }, 300);
    },

    updatePlayerLabel(playerNumber) {
        const playerLabel = document.getElementById('playerNumber');
        playerLabel.textContent = `玩家 ${playerNumber}`;
    },

    // Update button visibility based on current section
    updateFooterButton(sectionId) {
        const footer = document.querySelector('.game-footer');
        const buttons = document.querySelectorAll('.footer-button');
        
        // First hide all buttons
        buttons.forEach(button => button.classList.add('hidden'));

        // Track if we're showing any buttons
        let showingButton = false;

        // Show the appropriate button based on section
        switch(sectionId) {
            case 'admin':
                document.getElementById('startButton').classList.remove('hidden');
                showingButton = true;
                break;
            case 'prePlayer':
                document.getElementById('startDealingButton').classList.remove('hidden');
                showingButton = true;
                break;
            case 'player':
                if (this.state.revealed) {
                    document.getElementById('nextButton').classList.remove('hidden');
                    showingButton = true;
                }
                break;
            case 'buffer':
                document.getElementById('showResultsButton').classList.remove('hidden');
                showingButton = true;
                break;
            case 'result':
                document.getElementById('startOverButton').classList.remove('hidden');
                showingButton = true;
                break;
        }

        // Completely hide footer when no buttons are shown
        if (showingButton) {
            footer.classList.remove('empty');
            // Also update content padding when footer is visible
            document.querySelector('.content-wrapper').classList.add('has-footer');
        } else {
            footer.classList.add('empty');
            // Remove extra padding when footer is hidden
            document.querySelector('.content-wrapper').classList.remove('has-footer');
        }
    }
}; 

// Update the button visibility logic
function updateButton(visible) {
    const footer = document.querySelector('.game-footer');
    const button = footer.querySelector('.button-primary');
    if (visible) {
        button.classList.remove('hidden');
    } else {
        button.classList.add('hidden');
    }
} 