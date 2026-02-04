// ==================== AUTHENTICATION CHECK ====================
// Check if user is logged in via Supabase session
async function checkAuth() {
    try {
        // If userEmail not in localStorage, user is logged out
        if (!localStorage.getItem('userEmail')) {
            console.log('No user email in localStorage, redirecting to login');
            window.location.href = 'index.html';
            return;
        }

        // Wait a bit to ensure Supabase is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!window.supabaseClient) {
            console.error('Supabase client not initialized');
            window.location.href = 'index.html';
            return;
        }

        const { data: { session } } = await window.supabaseClient.auth.getSession();

        if (!session) {
            console.log('No active session, redirecting to login');
            window.location.href = 'index.html';
            return;
        }

        console.log('User authenticated:', session.user.email);
    } catch (error) {
        console.error('Auth check error:', error);
        // If error checking auth, redirect to login to be safe
        window.location.href = 'index.html';
    }
}

// Initialize dropdown menus
document.addEventListener('DOMContentLoaded', () => {
    const dropdownToggles = document.querySelectorAll('.nav-item-dropdown .nav-item');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const dropdown = toggle.closest('.nav-item-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('open');
            }
        });
    });
});

// ==================== PROFILE LOADING ====================
async function populateUserProfile() {
    try {
        const nameEl = document.getElementById('caviteProfileName');
        const emailEl = document.getElementById('caviteProfileEmail');
        const avatarEl = document.getElementById('caviteProfileAvatar');

        // Try to fetch profile from database first
        try {
            const supabaseClient = await window.supabaseClient || getSupabaseClient();
            const { data: session } = await supabaseClient.auth.getSession();

            if (session?.session?.user) {
                const userId = session.session.user.id;
                const { data: profileData, error } = await supabaseClient
                    .from('user_profiles')
                    .select('full_name, bio, avatar_url')
                    .eq('id', userId)
                    .single();

                if (!error && profileData) {
                    // Use database data
                    const name = profileData.full_name || session.session.user.user_metadata?.full_name || session.session.user.email?.split('@')[0] || 'User';
                    const email = profileData.bio || session.session.user.email || '';
                    const avatarUrl = profileData.avatar_url || `https://i.pravatar.cc/80?u=${session.session.user.id || 'guest'}`;

                    // Update profile sidebar
                    if (nameEl) nameEl.textContent = name;
                    if (emailEl) emailEl.textContent = email;
                    if (avatarEl) avatarEl.src = avatarUrl;

                    // Store in localStorage for consistency
                    localStorage.setItem('profileName', name);
                    localStorage.setItem('profileBio', email);
                    if (profileData.avatar_url) localStorage.setItem('profileAvatar', profileData.avatar_url);

                    return;
                }
            }
        } catch (err) {
            console.error('Database profile fetch error:', err);
        }

        // Fallback to session data
        try {
            const supabaseClient = await window.supabaseClient || getSupabaseClient();
            const { data: session } = await supabaseClient.auth.getSession();

            if (session?.session?.user) {
                const name = session.session.user.user_metadata?.full_name || session.session.user.email.split('@')[0];
                const email = session.session.user.email;
                const avatarUrl = `https://i.pravatar.cc/80?u=${session.session.user.id}`;

                // Update profile sidebar
                if (nameEl) nameEl.textContent = name;
                if (emailEl) emailEl.textContent = email;
                if (avatarEl) avatarEl.src = avatarUrl;
            }
        } catch (err) {
            console.error('Session profile fetch error:', err);
        }
    } catch (error) {
        console.error('Error populating profile:', error);
    }
}

// Initialize user profile with debugging
async function initializeProfile() {
    console.log('=== PROFILE INIT START ===');
    console.log('1. Checking supabaseClient:', !!window.supabaseClient);

    try {
        if (!window.supabaseClient) {
            console.log('ERROR: Supabase client not available');
            return;
        }

        console.log('2. Getting session...');
        const { data: { session } } = await window.supabaseClient.auth.getSession();

        console.log('3. Session result:', session);
        console.log('4. User data:', session?.user);

        if (session && session.user) {
            console.log('5. User found, populating profile...');
            const user = session.user;
            const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
            const email = user.email || 'Not available';

            console.log('Name:', name);
            console.log('Email:', email);

            const nameEl = document.getElementById('profileName');
            const emailEl = document.getElementById('profileEmail');
            const avatarEl = document.getElementById('profileAvatar');

            console.log('DOM elements found:', { nameEl: !!nameEl, emailEl: !!emailEl, avatarEl: !!avatarEl });

            if (nameEl) {
                nameEl.textContent = name;
                console.log('✓ Name updated');
            }
            if (emailEl) {
                emailEl.textContent = email;
                console.log('✓ Email updated');
            }
            if (avatarEl) {
                avatarEl.src = `https://i.pravatar.cc/80?u=${user.id}`;
                console.log('✓ Avatar updated');
            }
        } else {
            console.log('6. No session found - user not logged in');
        }
    } catch (error) {
        console.error('ERROR in initializeProfile:', error);
    }
    console.log('=== PROFILE INIT END ===');
}

console.log('Profile script loaded');

// Try after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM Ready - initializing profile');
        setTimeout(initializeProfile, 500);
    });
} else {
    console.log('DOM already ready - initializing profile');
    setTimeout(initializeProfile, 500);
}

// Also set up listener for auth changes
setTimeout(() => {
    console.log('Setting up auth listener');
    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, 'Session:', !!session);
            if (session && session.user) {
                console.log('User logged in via listener:', session.user.email);
                initializeProfile();
            }
        });
    }
}, 1000);

// ==================== SLIDESHOW FUNCTIONALITY ====================
let currentSlideIndex = 0;
let autoSlideTimer = null;
const SLIDE_INTERVAL = 5000; // 5 seconds

// Initialize slideshow
function initSlideshow() {
    // Display first slide
    displaySlide(0);

    // Start auto-rotation
    startAutoSlide();

    // Set up modal event listener
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            // Only close if clicking directly on the overlay, not the image or close button
            if (e.target === modal) {
                closeImageModal();
            }
        });
    } else {
        console.warn('Modal element not found');
    }

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('imageModal');
        const isModalOpen = modal && modal.classList.contains('active');

        if (e.key === 'Escape') {
            if (isModalOpen) {
                closeImageModal();
                return;
            }
        }

        // Only handle arrow keys if modal is NOT open
        if (!isModalOpen) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                changeSlide(-1);
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                changeSlide(1);
            }
        }
    });

    // Add touch/swipe support
    const container = document.querySelector('.slideshow-container');
    if (container) {
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            clearTimeout(autoSlideTimer);
        }, false);

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoSlide();
        }, false);

        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) {
                // Swiped left - next slide
                changeSlide(1);
            } else if (touchEndX - touchStartX > swipeThreshold) {
                // Swiped right - previous slide
                changeSlide(-1);
            }
        }
    }
}

// Display a specific slide
function displaySlide(n) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    if (!slides.length) return;

    // Wrap around
    if (n >= slides.length) {
        currentSlideIndex = 0;
    } else if (n < 0) {
        currentSlideIndex = slides.length - 1;
    } else {
        currentSlideIndex = n;
    }

    // Hide all slides
    slides.forEach(slide => slide.style.display = 'none');
    // Remove active class from all dots
    dots.forEach(dot => dot.classList.remove('active'));

    // Show current slide
    slides[currentSlideIndex].style.display = 'block';
    if (dots.length > 0) {
        dots[currentSlideIndex].classList.add('active');
    }

    // Update slide counter
    document.getElementById('slideNumber').textContent = currentSlideIndex + 1;

    // Update slide description
    const description = slides[currentSlideIndex].getAttribute('data-description');
    if (description) {
        document.getElementById('slideDescription').textContent = description;
    }
}

// Change slide by offset
function changeSlide(n) {
    clearTimeout(autoSlideTimer);
    displaySlide(currentSlideIndex + n);
    startAutoSlide();
}

// Jump to specific slide
function currentSlide(n) {
    clearTimeout(autoSlideTimer);
    displaySlide(n);
    startAutoSlide();
}

// Auto-advance slides
function startAutoSlide() {
    clearTimeout(autoSlideTimer);
    autoSlideTimer = setTimeout(() => {
        displaySlide(currentSlideIndex + 1);
        startAutoSlide();
    }, SLIDE_INTERVAL);
}

function initLucideIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initSlideshow();
        setTimeout(initLucideIcons, 100);
    });
} else {
    initSlideshow();
    setTimeout(initLucideIcons, 100);
}

window.addEventListener('load', initLucideIcons);

// ==================== LEFT SIDEBAR TOGGLE ====================
const caviteMutinyToggleBtn = document.getElementById('caviteMutinyToggleSidebar');
const caviteMutinySidebar = document.getElementById('leftSidebar');

if (caviteMutinyToggleBtn && caviteMutinySidebar) {
    caviteMutinyToggleBtn.addEventListener('click', function() {
        caviteMutinySidebar.classList.toggle('mobile-open');
    });
}

// Check authentication on page load
checkAuth();

// Populate user profile after auth check
populateUserProfile();