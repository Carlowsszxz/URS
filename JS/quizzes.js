// Quiz-specific functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Check locked quizzes and update UI
    await updateLockedQuizzesUI();
    
    // Add event listeners to "Start Quiz" buttons
    document.querySelectorAll('.start-quiz-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const quizId = event.target.getAttribute('data-quiz-id');
            const userId = await getUserId();
            if (userId && window.supabaseClient) {
                try {
                    const { data, error } = await window.supabaseClient
                        .from('user_locked_quizzes')
                        .select('quiz_id')
                        .eq('user_id', userId)
                        .eq('quiz_id', quizId);
                    if (data && data.length > 0) {
                        alert('You have achieved a perfect score on this quiz. Great job!');
                        return;
                    }
                } catch (e) {
                    console.error('Error checking locked quiz:', e);
                }
            }
            
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

// Function to update UI for locked quizzes (perfect scores)
async function updateLockedQuizzesUI() {
    const userId = await getUserId();
    if (!userId || !window.supabaseClient) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('user_locked_quizzes')
            .select('quiz_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Error loading locked quizzes:', error);
            return;
        }

        const lockedQuizzes = data.map(row => row.quiz_id);

        document.querySelectorAll('.quiz-item').forEach(quizItem => {
            const button = quizItem.querySelector('.start-quiz-btn');
            if (button) {
                const quizId = button.getAttribute('data-quiz-id');
                
                if (lockedQuizzes.includes(quizId)) {
                    // Mark quiz as locked (perfect score)
                    quizItem.classList.add('quiz-locked');
                    button.textContent = '✓ Perfect Score';
                    button.disabled = true;
                    button.title = 'You achieved a perfect score on this quiz';
                }
            }
        });
    } catch (e) {
        console.error('Error updating locked quizzes UI:', e);
    }
}

