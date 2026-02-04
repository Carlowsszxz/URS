// On index.html load, clear any Supabase session if no userEmail in localStorage
async function clearOrphanedSession() {
    if (!localStorage.getItem('userEmail') && window.supabaseClient) {
        try {
            // Sign out globally to clear any persisted Supabase session
            await window.supabaseClient.auth.signOut({ scope: 'global' });
        } catch (err) {
            console.log('Clear session:', err.message);
        }
    }
}

// Check if user is already logged in (use localStorage as source of truth)
if (localStorage.getItem('userEmail')) {
    // User has valid session in localStorage, redirect to home
    window.location.href = 'home.html';
} else {
    // No valid session, clear any orphaned Supabase session
    clearOrphanedSession();
}

// ==================== FORGOT PASSWORD ====================
const forgotPasswordLink = document.querySelector('.forgot-password');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeForgotPasswordModal = document.getElementById('closeForgotPasswordModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const resetSuccessMessage = document.getElementById('resetSuccessMessage');
const forgotEmailHelper = document.getElementById('forgotEmailHelper');

// Open forgot password modal
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordModal.classList.remove('hidden');
    });
}

// Close forgot password modal
if (closeForgotPasswordModal) {
    closeForgotPasswordModal.addEventListener('click', () => {
        forgotPasswordModal.classList.add('hidden');
        forgotPasswordForm.reset();
        resetSuccessMessage.classList.add('hidden');
    });
}

// Close modal when clicking outside
if (forgotPasswordModal) {
    forgotPasswordModal.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.classList.add('hidden');
            forgotPasswordForm.reset();
            resetSuccessMessage.classList.add('hidden');
        }
    });
}

// Handle forgot password form submission
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value.trim();
        const emailError = document.getElementById('forgotEmailError');

        // Validate email
        if (!email) {
            emailError.textContent = 'Email is required';
            return;
        }

        emailError.textContent = '';

        try {
            // Send password reset email via Supabase
            if (window.supabaseClient) {
                const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password.html`
                });

                if (error) {
                    emailError.textContent = error.message || 'Error sending reset email';
                } else {
                    // Show success message
                    forgotPasswordForm.classList.add('hidden');
                    resetSuccessMessage.classList.remove('hidden');

                    // Auto-close modal after 3 seconds
                    setTimeout(() => {
                        forgotPasswordModal.classList.add('hidden');
                        forgotPasswordForm.classList.remove('hidden');
                        forgotPasswordForm.reset();
                        resetSuccessMessage.classList.add('hidden');
                    }, 3000);
                }
            }
        } catch (error) {
            emailError.textContent = error.message || 'An error occurred';
        }
    });
}

// Show helper message when email is entered
const forgotEmailInput = document.getElementById('forgotEmail');
if (forgotEmailInput && forgotEmailHelper) {
    forgotEmailInput.addEventListener('input', () => {
        const email = forgotEmailInput.value.trim();
        if (email) {
            forgotEmailHelper.textContent = 'Check your email for password reset instructions after submitting.';
        } else {
            forgotEmailHelper.textContent = '';
        }
    });
}
