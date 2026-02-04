// Quiz-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to "Start Quiz" buttons
    document.querySelectorAll('.start-quiz-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const quizId = event.target.getAttribute('data-quiz-id');
            window.location.href = `quiz-template.html?quizId=${quizId}`;
        });
    });

    // ==================== WELCOME STATS NAVIGATION ====================
    // This is specific to quizzes page
    document.querySelectorAll('.stat-item').forEach(item => {
        item.addEventListener('click', () => {
            const text = item.querySelector('.stat-text').textContent;

            switch(text) {
                case 'Lessons':
                    window.location.href = 'first-mass.html';
                    break;
                case 'Activities':
                    window.location.href = 'worksheets.html';
                    break;
                case 'Discussions':
                    document.querySelector('.discussion-section').scrollIntoView({
                        behavior: 'smooth'
                    });
                    break;
            }
        });
    });
});