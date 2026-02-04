        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

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

        // ==================== PROFILE LOADING ====================
        async function populateUserProfile() {
            try {
                const nameEl = document.getElementById('profileName');
                const emailEl = document.getElementById('profileEmail');
                const avatarEl = document.getElementById('profileAvatar');

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

        // Check authentication on page load
        checkAuth();

        // Populate profile like in firstmass.html
        populateUserProfile();

        // Instantiate CourseInterface to populate profile like in firstmass.html
        new CourseInterface();