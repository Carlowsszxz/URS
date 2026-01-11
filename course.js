class CourseInterface {
    constructor() {
        this.currentUser = null;
        this.actionCooldowns = {
            like: 500,      // 500ms between likes
            comment: 1000,  // 1 second between comments
            share: 2000     // 2 seconds between shares
        };
        this.lastActions = {};
        this.selectedImages = [];
        this.selectedVideoUrl = null;
        this.selectedPoll = null;
        this.init();
    }

    async init() {
        // Check if user is authenticated
        await this.checkAuthentication();
        this.populateUserProfile();
        this.setupEventListeners();
        
        // Only load posts from database if on the home page (course.html)
        if (this.isHomePage()) {
            this.loadPostsFromDatabase();
        }
    }

    isHomePage() {
        // Check if current page is course.html
        const currentPage = window.location.pathname.split('/').pop() || 'course.html';
        return currentPage === 'course.html' || currentPage === '';
    }

    reinitializeLucideIcons() {
        // Reinitialize Lucide icons after DOM updates
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    async checkAuthentication() {
        // Skip auth for educational content pages
        const educationalPages = ['cry-of-rebellion', 'first-mass', 'cavite-mutiny', 'retraction-of-rizal', 'games', 'interactive-tasks', 'videos'];
        const currentPage = window.location.pathname.toLowerCase();
        const isEducationalPage = educationalPages.some(page => currentPage.includes(page));
        
        if (isEducationalPage) {
            // Allow access to educational pages without auth, but try to load user data if available
            console.log('Educational page - loading user data if available');
            try {
                const session = await getCurrentSession();
                if (session) {
                    this.currentUser = session.user;
                    console.log('Loaded user data:', this.currentUser.email);
                } else {
                    // Set default guest user for educational pages
                    this.currentUser = {
                        id: 'guest',
                        email: 'guest@example.com',
                        user_metadata: { full_name: 'Guest User' }
                    };
                    console.log('Using guest user for educational page');
                }
            } catch (error) {
                console.log('Could not load session, using guest user');
                this.currentUser = {
                    id: 'guest',
                    email: 'guest@example.com',
                    user_metadata: { full_name: 'Guest User' }
                };
            }
            return;
        }
        
        try {
            const session = await getCurrentSession();
            if (!session) {
                // Redirect to login if not authenticated
                window.location.href = 'index.html';
                return;
            }
            this.currentUser = session.user;
            console.log('Authenticated as:', this.currentUser.email);
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'index.html';
        }
    }

    populateUserProfile() {
        try {
            const nameEl = document.getElementById('profileName');
            const emailEl = document.getElementById('profileEmail');
            const avatarEl = document.getElementById('profileAvatar');
            
            // Also update create post section
            const createPostNameEl = document.getElementById('createPostName');
            const createPostAvatarEl = document.getElementById('createPostAvatar');

            if (this.currentUser) {
                // Extract name from email or use user metadata
                const name = this.currentUser.user_metadata?.full_name || this.currentUser.email.split('@')[0];
                const email = this.currentUser.email;
                const avatarUrl = `https://i.pravatar.cc/80?u=${this.currentUser.id}`;
                const smallAvatarUrl = `https://i.pravatar.cc/40?u=${this.currentUser.id}`;

                // Update profile sidebar
                if (nameEl) nameEl.textContent = name;
                if (emailEl) emailEl.textContent = email;
                if (avatarEl) avatarEl.src = avatarUrl;
                
                // Update create post section
                if (createPostNameEl) createPostNameEl.textContent = name;
                if (createPostAvatarEl) createPostAvatarEl.src = smallAvatarUrl;
            }
        } catch (error) {
            console.error('Error populating profile:', error);
        }
    }

    setupEventListeners() {
        // Menu toggle for mobile
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleMenu());
        }

        // Right sidebar toggle for mobile
        const sidebarToggleRight = document.getElementById('sidebarToggleRight');
        if (sidebarToggleRight) {
            sidebarToggleRight.addEventListener('click', () => this.toggleRightSidebar());
        }

        // COMPLETELY NEW DROPDOWN LOGIC - Using inline styles
        const dropdownToggles = document.querySelectorAll('.nav-item-dropdown .nav-item');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const dropdown = toggle.closest('.nav-item-dropdown');
                const menu = dropdown.querySelector('.dropdown-menu');
                
                // Toggle menu visibility
                const isVisible = menu.style.display === 'flex';
                
                // Close all other menus
                document.querySelectorAll('.dropdown-menu').forEach(otherMenu => {
                    otherMenu.style.display = 'none';
                });
                
                // Toggle current menu
                menu.style.display = isVisible ? 'none' : 'flex';
            });
        });
        
        // Auto-open Topic dropdown on specific pages
        const currentPage = window.location.pathname.toLowerCase();
        if (currentPage.includes('cavite-mutiny') || currentPage.includes('cry-of-rebellion') || 
            currentPage.includes('first-mass') || currentPage.includes('retraction-of-rizal')) {
            dropdownToggles.forEach(toggle => {
                if (toggle.textContent.trim() === 'Topic') {
                    const dropdown = toggle.closest('.nav-item-dropdown');
                    const menu = dropdown.querySelector('.dropdown-menu');
                    menu.style.display = 'flex';
                }
            });
        }
        
        // Auto-open Activities dropdown on activity pages
        if (currentPage.includes('interactive-tasks') || currentPage.includes('games')) {
            dropdownToggles.forEach(toggle => {
                if (toggle.textContent.trim() === 'Activities') {
                    const dropdown = toggle.closest('.nav-item-dropdown');
                    const menu = dropdown.querySelector('.dropdown-menu');
                    menu.style.display = 'flex';
                }
            });
        }
        
        // Close all menus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item-dropdown')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
            }
        });
        
        // Close dropdowns when clicking elsewhere
        document.addEventListener('click', (e) => {
            console.log('📍 Document click detected');
            if (!e.target.closest('.nav-item-dropdown')) {
                console.log('   - Click was outside dropdowns, closing all');
                document.querySelectorAll('.nav-item-dropdown.open').forEach(dropdown => {
                    dropdown.classList.remove('open');
                });
            } else {
                console.log('   - Click was inside dropdown area');
            }
        });

        // Navigation items (for regular links only, not dropdown toggles)
        document.querySelectorAll('.nav-item').forEach(item => {
            // Skip dropdown toggles
            if (item.closest('.nav-item-dropdown .nav-item')) {
                return;
            }
            item.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Post input
        const postInput = document.querySelector('.post-input');
        if (postInput) {
            postInput.addEventListener('focus', () => {
                postInput.style.borderColor = '#1e5a96';
            });
            postInput.addEventListener('blur', () => {
                postInput.style.borderColor = '#dfe6ec';
            });
        }

        // Send button
        const sendBtn = document.querySelector('.send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handlePostSubmit());
        }

        // Image upload
        const imageInput = document.getElementById('imageInput');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
        }

        // Video URL button
        const videoUrlBtn = document.getElementById('videoUrlBtn');
        if (videoUrlBtn) {
            videoUrlBtn.addEventListener('click', () => this.handleVideoUrlPrompt());
        }

        // Poll button
        const pollBtn = document.getElementById('pollBtn');
        if (pollBtn) {
            pollBtn.addEventListener('click', () => this.handlePollCreation());
        }

        // Play button
        const playBtn = document.querySelector('.play-button');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playVideo());
        }

        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAction(e));
        });

        // Todo checkboxes
        document.querySelectorAll('.todo-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleTodoToggle(e));
        });

        // Idea cards
        document.querySelectorAll('.idea-card').forEach(card => {
            card.addEventListener('click', (e) => this.openIdea(e));
        });

        // Join button
        const joinBtn = document.querySelector('.join-button');
        if (joinBtn) {
            joinBtn.addEventListener('click', () => this.joinClass());
        }

        // Notification button
        const notifBtn = document.querySelector('.notification-btn');
        if (notifBtn) {
            notifBtn.addEventListener('click', () => this.showNotifications());
        }

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Sidebar collapse button (only on desktop)
        const collapseBtn = document.getElementById('sidebarCollapseBtn');
        const mainLayout = document.querySelector('.main-layout');
        const leftSidebar = document.getElementById('leftSidebar');
        if (collapseBtn && mainLayout && leftSidebar) {
            collapseBtn.addEventListener('click', () => {
                // Only collapse on desktop (window width > 1024px)
                if (window.innerWidth > 1024) {
                    mainLayout.classList.toggle('sidebar-collapsed');
                    leftSidebar.classList.toggle('collapsed');
                    // Save preference to localStorage
                    const isCollapsed = mainLayout.classList.contains('sidebar-collapsed');
                    localStorage.setItem('sidebarCollapsed', isCollapsed);
                }
            });
            // Load saved preference only on desktop
            if (window.innerWidth > 1024) {
                const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
                if (wasCollapsed) {
                    mainLayout.classList.add('sidebar-collapsed');
                    leftSidebar.classList.add('collapsed');
                }
            }
        }

        // Edit profile button
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.openEditProfileModal());
        }

        // Edit profile modal controls
        const closeEditModal = document.getElementById('closeEditModal');
        if (closeEditModal) {
            closeEditModal.addEventListener('click', () => this.closeEditProfileModal());
        }

        const cancelEditBtn = document.getElementById('cancelEditBtn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.closeEditProfileModal());
        }

        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => this.saveProfileChanges());
        }

        // Close modal when clicking outside
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeEditProfileModal();
            });
        }

        // Video URL modal controls
        const closeVideoModal = document.getElementById('closeVideoModal');
        if (closeVideoModal) {
            closeVideoModal.addEventListener('click', () => this.closeVideoUrlModal());
        }

        const cancelVideoBtn = document.getElementById('cancelVideoBtn');
        if (cancelVideoBtn) {
            cancelVideoBtn.addEventListener('click', () => this.closeVideoUrlModal());
        }

        const confirmVideoBtn = document.getElementById('confirmVideoBtn');
        if (confirmVideoBtn) {
            confirmVideoBtn.addEventListener('click', () => this.submitVideoUrl());
        }

        const videoUrlInput = document.getElementById('videoUrlInput');
        if (videoUrlInput) {
            videoUrlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitVideoUrl();
                }
            });
        }

        // Close video modal when clicking outside
        const videoModal = document.getElementById('videoUrlModal');
        if (videoModal) {
            videoModal.addEventListener('click', (e) => {
                if (e.target === videoModal) this.closeVideoUrlModal();
            });
        }

        // Poll modal controls
        const closePollModal = document.getElementById('closePollModal');
        if (closePollModal) {
            closePollModal.addEventListener('click', () => this.closePollModal());
        }

        const cancelPollBtn = document.getElementById('cancelPollBtn');
        if (cancelPollBtn) {
            cancelPollBtn.addEventListener('click', () => this.closePollModal());
        }

        const confirmPollBtn = document.getElementById('confirmPollBtn');
        if (confirmPollBtn) {
            confirmPollBtn.addEventListener('click', () => this.submitPoll());
        }

        const addOptionBtn = document.getElementById('addOptionBtn');
        if (addOptionBtn) {
            addOptionBtn.addEventListener('click', () => this.addPollOption());
        }

        // Close poll modal when clicking outside
        const pollModal = document.getElementById('pollModal');
        if (pollModal) {
            pollModal.addEventListener('click', (e) => {
                if (e.target === pollModal) this.closePollModal();
            });
        }

        // Forum functionality
        this.setupForumListeners();
    }

    setupForumListeners() {
        const forumSubmitBtn = document.getElementById('forumSubmitBtn');
        const forumInputField = document.getElementById('forumInputField');
        const forumAvatarInput = document.getElementById('forumAvatarInput');

        if (forumSubmitBtn && forumInputField) {
            forumSubmitBtn.addEventListener('click', () => this.handleForumSubmit());
            
            forumInputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleForumSubmit();
                }
            });
        }

        // Update forum avatar
        if (forumAvatarInput && this.currentUser) {
            const avatarUrl = `https://i.pravatar.cc/40?u=${this.currentUser.id}`;
            forumAvatarInput.src = avatarUrl;
        }

        // Load forum posts
        this.loadForumPosts();
    }

    async handleForumSubmit() {
        const forumInputField = document.getElementById('forumInputField');
        if (!forumInputField || !forumInputField.value.trim()) {
            this.showNotification('Please enter a message', 'error');
            return;
        }

        const content = forumInputField.value.trim();
        const currentPage = window.location.pathname.split('/').pop() || 'course.html';
        
        // Determine topic ID based on current page
        let topicId = null;
        if (currentPage === 'cavite-mutiny.html') topicId = 1;
        else if (currentPage === 'retraction-of-rizal.html') topicId = 2;

        try {
            const { data, error } = await window.supabaseClient
                .from('forum_posts')
                .insert({
                    topic_id: topicId,
                    author_id: this.currentUser.id,
                    author_name: this.currentUser.user_metadata?.full_name || this.currentUser.email.split('@')[0],
                    author_email: this.currentUser.email,
                    content: content,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.error('Error posting forum message:', error);
                this.showNotification('Failed to post message', 'error');
                return;
            }

            forumInputField.value = '';
            this.showNotification('Message posted successfully', 'success');
            this.loadForumPosts();
        } catch (error) {
            console.error('Forum submission error:', error);
            this.showNotification('Error posting message', 'error');
        }
    }

    async loadForumPosts() {
        const forumContainer = document.getElementById('forumPostsContainer');
        if (!forumContainer) return;

        const currentPage = window.location.pathname.split('/').pop() || 'course.html';
        
        // Determine topic ID
        let topicId = null;
        if (currentPage === 'cavite-mutiny.html') topicId = 1;
        else if (currentPage === 'retraction-of-rizal.html') topicId = 2;

        if (!topicId) return;

        try {
            const { data: posts, error } = await window.supabaseClient
                .from('forum_posts')
                .select('*')
                .eq('topic_id', topicId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading forum posts:', error);
                return;
            }

            forumContainer.innerHTML = '';

            if (!posts || posts.length === 0) {
                forumContainer.innerHTML = '<p style="text-align: center; color: #95a5a6; padding: 20px;">No discussions yet. Be the first to share!</p>';
                return;
            }

            // Create all post elements asynchronously
            for (const post of posts) {
                const postElement = await this.createForumPostElement(post);
                forumContainer.appendChild(postElement);
            }
            
            console.warn('✅✅✅ Created', posts.length, 'post elements ✅✅✅');
        } catch (error) {
            console.error('Failed to load forum posts:', error);
        }
    }

    async createForumPostElement(post) {
        console.log('🏗️ createForumPostElement called for post:', post.author_name);
        const postDiv = document.createElement('div');
        postDiv.className = 'forum-post';
        
        const timeAgo = this.getTimeAgo(new Date(post.created_at));
        
        // Check if this post is from current user and use localStorage avatar if available
        let avatarSrc = `https://i.pravatar.cc/36?u=${post.author_id}`;
        const currentUserEmail = this.currentUser?.email;
        const savedAvatar = localStorage.getItem('profileAvatar');
        let displayName = post.author_name; // Default to stored name
        
        // Determine if this post is from the current user
        let isCurrentUserPost = false;
        
        console.log('🔎 Post author_id:', post.author_id, 'Current user:', currentUserEmail);
        
        if (currentUserEmail && post.author_id === currentUserEmail) {
            isCurrentUserPost = true;
            console.log('✅ Post from current user detected');
            if (savedAvatar) {
                console.log('🎨 Using saved avatar for current user post');
                avatarSrc = savedAvatar;
            }
        } else {
            // For other users, fetch the latest name from database BEFORE rendering
            try {
                const supabaseClient = await getSupabaseClient();
                const { data: profileData, error } = await supabaseClient
                    .from('user_profiles')
                    .select('full_name, avatar_url')
                    .eq('user_email', post.author_id)
                    .single();
                
                if (!error && profileData) {
                    console.log('📝 Fetched latest name from database:', profileData.full_name);
                    displayName = profileData.full_name;
                    if (profileData.avatar_url) {
                        avatarSrc = profileData.avatar_url;
                    }
                }
            } catch (err) {
                console.log('Could not fetch latest name, using stored name:', err);
            }
        }
        
        postDiv.innerHTML = `
            <div class="forum-post-header">
                <img src="${avatarSrc}" alt="${displayName}" class="avatar" />
                <div class="forum-post-info">
                    <div class="forum-post-author">${this.escapeHtml(displayName)}</div>
                    <div class="forum-post-time">${timeAgo}</div>
                </div>
            </div>
            <div class="forum-post-content">${this.escapeHtml(post.content)}</div>
        `;
        
        return postDiv;
    }

    getTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleMenu() {
        const sidebar = document.getElementById('leftSidebar');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
    }

    toggleRightSidebar() {
        const rightSidebar = document.querySelector('.right-sidebar');
        if (rightSidebar) {
            rightSidebar.classList.toggle('mobile-open');
        }
    }

    handleImageSelect(e) {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                this.showNotification('Only image files are allowed', 'error');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                this.showNotification('Image size must be less than 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const imageObj = {
                    file: file,
                    preview: event.target.result
                };
                this.selectedImages.push(imageObj);
                this.renderImagePreviews();
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        e.target.value = '';
    }

    renderImagePreviews() {
        const container = document.getElementById('imagePreviewContainer');
        container.innerHTML = '';

        this.selectedImages.forEach((imageObj, index) => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'image-preview';
            previewDiv.innerHTML = `
                <img src="${imageObj.preview}" alt="Preview ${index}" />
                <button class="remove-image" data-index="${index}">×</button>
            `;

            const removeBtn = previewDiv.querySelector('.remove-image');
            removeBtn.addEventListener('click', () => {
                this.selectedImages.splice(index, 1);
                this.renderImagePreviews();
            });

            container.appendChild(previewDiv);
        });
    }

    handleVideoUrlPrompt() {
        this.openVideoUrlModal();
    }

    openVideoUrlModal() {
        const modal = document.getElementById('videoUrlModal');
        const input = document.getElementById('videoUrlInput');
        if (modal) {
            modal.classList.add('show');
            if (input) {
                input.value = '';
                input.focus();
            }
        }
    }

    closeVideoUrlModal() {
        const modal = document.getElementById('videoUrlModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    submitVideoUrl() {
        const input = document.getElementById('videoUrlInput');
        if (!input) return;

        const url = input.value.trim();
        if (!url) {
            this.showNotification('Please enter a YouTube URL', 'error');
            return;
        }

        // Extract video ID from YouTube URL
        const videoId = this.extractYouTubeId(url);
        if (!videoId) {
            this.showNotification('Invalid YouTube URL. Please try again.', 'error');
            return;
        }

        this.selectedVideoUrl = videoId;
        this.renderVideoPreview();
        this.closeVideoUrlModal();
        this.showNotification('Video added! ✓', 'success');
    }

    renderVideoPreview() {
        const container = document.getElementById('videoPreviewContainer');
        if (!container) return;

        container.innerHTML = '';

        if (this.selectedVideoUrl) {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'video-preview';
            previewDiv.innerHTML = `
                <div class="video-preview-item">
                    <img src="https://img.youtube.com/vi/${this.selectedVideoUrl}/maxresdefault.jpg" alt="Video preview" class="video-thumbnail" />
                    <button class="remove-video" title="Remove video">×</button>
                    <div class="video-preview-overlay">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                    </div>
                </div>
            `;

            const removeBtn = previewDiv.querySelector('.remove-video');
            removeBtn.addEventListener('click', () => {
                this.selectedVideoUrl = null;
                this.renderVideoPreview();
                this.showNotification('Video removed', 'info');
            });

            container.appendChild(previewDiv);
        }
    }

    handlePollCreation() {
        this.openPollModal();
    }

    openPollModal() {
        const modal = document.getElementById('pollModal');
        if (modal) {
            modal.classList.add('show');
            // Clear previous inputs
            document.getElementById('pollOption1').value = '';
            document.getElementById('pollOption2').value = '';
            document.getElementById('pollOption3').value = '';
            document.getElementById('pollOption4').value = '';
            
            // Remove any extra options added previously
            const container = document.getElementById('pollOptionsContainer');
            const extraOptions = container.querySelectorAll('.dynamic-poll-option');
            extraOptions.forEach(opt => opt.remove());
            
            // Reset counter
            this.pollOptionCount = 4;
            
            // Focus on first input
            document.getElementById('pollOption1').focus();
        }
    }

    closePollModal() {
        const modal = document.getElementById('pollModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    addPollOption() {
        const container = document.getElementById('pollOptionsContainer');
        if (!container) return;

        this.pollOptionCount = (this.pollOptionCount || 4) + 1;
        const optionNum = this.pollOptionCount;

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group dynamic-poll-option';
        formGroup.innerHTML = `
            <label for="pollOption${optionNum}">Option ${optionNum} (Optional)</label>
            <div style="display: flex; gap: 8px;">
                <input type="text" id="pollOption${optionNum}" placeholder="Enter poll option" style="flex: 1;" />
                <button type="button" class="remove-option-btn" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 18px; padding: 0; width: 30px;">×</button>
            </div>
        `;

        const removeBtn = formGroup.querySelector('.remove-option-btn');
        removeBtn.addEventListener('click', () => {
            formGroup.remove();
        });

        container.appendChild(formGroup);
        
        // Focus on the new input
        document.getElementById(`pollOption${optionNum}`).focus();
    }

    submitPoll() {
        const option1 = document.getElementById('pollOption1').value.trim();
        const option2 = document.getElementById('pollOption2').value.trim();

        if (!option1) {
            this.showNotification('Please enter the first poll option', 'error');
            document.getElementById('pollOption1').focus();
            return;
        }

        if (!option2) {
            this.showNotification('Please enter the second poll option', 'error');
            document.getElementById('pollOption2').focus();
            return;
        }

        const options = [option1, option2];
        
        // Collect all optional options (both static and dynamic)
        const container = document.getElementById('pollOptionsContainer');
        const optionInputs = container.querySelectorAll('input[type="text"]');
        optionInputs.forEach((input, idx) => {
            const value = input.value.trim();
            if (value) {
                options.push(value);
            }
        });

        this.selectedPoll = {
            question: 'Poll',
            options: options,
            votes: options.map(() => 0)
        };

        this.renderPollPreview();
        this.closePollModal();
        this.showNotification(`Poll created with ${options.length} options!`, 'success');
    }

    renderPollPreview() {
        const container = document.getElementById('pollPreviewContainer');
        if (!container) return;

        container.innerHTML = '';

        if (this.selectedPoll) {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'poll-preview';
            previewDiv.innerHTML = `
                <div class="poll-preview-item">
                    <div class="poll-preview-header">📊 Poll</div>
                    <div class="poll-options-preview">
                        ${this.selectedPoll.options.map((opt, idx) => `
                            <div class="poll-option-preview">${idx + 1}. ${this.escapeHtml(opt)}</div>
                        `).join('')}
                    </div>
                    <button class="remove-poll" title="Remove poll">×</button>
                </div>
            `;

            const removeBtn = previewDiv.querySelector('.remove-poll');
            removeBtn.addEventListener('click', () => {
                this.selectedPoll = null;
                this.renderPollPreview();
                this.showNotification('Poll removed', 'info');
            });

            container.appendChild(previewDiv);
        }
    }

    extractYouTubeId(url) {
        // Handle various YouTube URL formats
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }

    async handleLogout() {
        this.showNotification('Logging out...', 'info');
        try {
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) throw error;
            
            // Clear stored data
            localStorage.removeItem('userEmail');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Logout failed', 'error');
        }
    }

    handleNavClick(e) {
        // Remove active from all items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        // Add active to clicked item
        e.currentTarget.classList.add('active');
    }

    async handlePostSubmit() {
        const input = document.querySelector('.post-input');
        if (!input || (!input.value.trim() && this.selectedImages.length === 0)) {
            this.showNotification('Please write something or add an image before posting', 'info');
            return;
        }

        const content = input.value.trim();
        const topicId = 1; // Default topic ID

        try {
            // Disable button and show loading
            const sendBtn = document.querySelector('.send-btn');
            if (sendBtn) sendBtn.disabled = true;
            
            this.showNotification('Posting...', 'info');

            // Get author name
            const authorName = this.currentUser.user_metadata?.full_name || 
                              this.currentUser.email.split('@')[0];

            // Get author avatar URL from database or localStorage
            let authorAvatarUrl = localStorage.getItem('profileAvatarUrl') || localStorage.getItem('profileAvatar');
            
            // Try to fetch from user_profiles table in Supabase (with error handling)
            try {
                const { data: profileDataArray, error } = await window.supabaseClient
                    .from('user_profiles')
                    .select('avatar_url')
                    .eq('user_email', this.currentUser.email);
                
                if (!error && profileDataArray && profileDataArray.length > 0) {
                    const profileData = profileDataArray[0];
                    if (profileData?.avatar_url) {
                        authorAvatarUrl = profileData.avatar_url;
                        console.log('✅ Fetched avatar URL from database:', authorAvatarUrl);
                    }
                }
            } catch (err) {
                console.log('ℹ️ Using localStorage avatar URL');
            }
            
            if (!authorAvatarUrl) {
                authorAvatarUrl = `https://i.pravatar.cc/40?u=${this.currentUser.id}`;
            }

            // Upload images and get URLs
            let imageUrls = [];
            if (this.selectedImages.length > 0) {
                imageUrls = await this.uploadImagesToStorage();
            }

            // Save to Supabase
            const { data, error } = await window.supabaseClient
                .from('posts')
                .insert([
                    {
                        topic_id: topicId,
                        content: content,
                        author_id: this.currentUser.id,
                        author_name: authorName,
                        author_email: this.currentUser.email,
                        author_avatar_url: authorAvatarUrl,
                        likes_count: 0,
                        comments_count: 0,
                        shares_count: 0,
                        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
                        video_url: this.selectedVideoUrl || null,
                        poll_data: this.selectedPoll ? JSON.stringify(this.selectedPoll) : null
                    }
                ])
                .select();

            if (error) {
                console.error('Supabase error:', error);
                throw new Error(error.message || 'Failed to save post');
            }

            this.showNotification('Post published! ✓', 'success');
            input.value = '';
            this.selectedImages = [];
            this.selectedVideoUrl = null;
            this.selectedPoll = null;
            this.renderImagePreviews();
            this.renderVideoPreview();
            this.renderPollPreview();
            
            // Re-enable button
            if (sendBtn) sendBtn.disabled = false;
            
            // Reload posts to show the new one
            this.loadPostsFromDatabase();
            
        } catch (error) {
            console.error('Post submission error:', error);
            this.showNotification('Error: ' + (error.message || 'Failed to post'), 'error');
            
            // Re-enable button on error
            const sendBtn = document.querySelector('.send-btn');
            if (sendBtn) sendBtn.disabled = false;
        }
    }

    async uploadImagesToStorage() {
        const imageUrls = [];
        
        // Debug: Check authentication status
        const session = await window.supabaseClient.auth.getSession();
        console.log('DEBUG: Session exists?', !!session.data.session);
        console.log('DEBUG: User ID:', session.data.session?.user?.id);
        
        for (const imageObj of this.selectedImages) {
            try {
                const fileName = `posts/${Date.now()}-${Math.random().toString(36).substring(7)}-${imageObj.file.name}`;
                
                console.log('DEBUG: Attempting upload to:', fileName);
                console.log('DEBUG: File size:', imageObj.file.size);
                console.log('DEBUG: File type:', imageObj.file.type);
                
                // Upload with explicit auth
                const { data, error } = await window.supabaseClient.storage
                    .from('post-images')
                    .upload(fileName, imageObj.file, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: imageObj.file.type
                    });

                if (error) {
                    console.error('Upload error:', error);
                    console.error('Error status:', error.status);
                    console.error('Error message:', error.message);
                    throw error;
                }

                // Get public URL
                const { data: urlData } = window.supabaseClient.storage
                    .from('post-images')
                    .getPublicUrl(fileName);

                console.log('DEBUG: Upload successful, URL:', urlData.publicUrl);
                imageUrls.push(urlData.publicUrl);
            } catch (error) {
                console.error('Failed to upload image:', error);
                throw new Error('Failed to upload image: ' + error.message);
            }
        }

        return imageUrls;
    }

    async loadPostsFromDatabase() {
        try {
            // Fetch posts from Supabase
            const { data: posts, error } = await window.supabaseClient
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error loading posts:', error);
                return;
            }

            if (!posts || posts.length === 0) {
                console.log('No posts found');
                return;
            }

            // Fetch current user's likes
            const { data: userLikes, error: likesError } = await window.supabaseClient
                .from('post_likes')
                .select('post_id')
                .eq('user_id', this.currentUser.id);

            const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);

            // Get the discussion section
            const discussionSection = document.querySelector('.discussion-section');
            if (!discussionSection) return;

            // Find or create posts container (after create-post)
            let postsContainer = document.getElementById('posts-container');
            if (!postsContainer) {
                postsContainer = document.createElement('div');
                postsContainer.id = 'posts-container';
                const createPost = discussionSection.querySelector('.create-post');
                if (createPost && createPost.nextSibling) {
                    createPost.parentNode.insertBefore(postsContainer, createPost.nextSibling);
                } else {
                    discussionSection.appendChild(postsContainer);
                }
            }

            // Clear existing posts (except create-post and sample posts)
            const existingDbPosts = postsContainer.querySelectorAll('.post-card[data-post-id]');
            existingDbPosts.forEach(post => post.remove());

            // Render each post
            for (const post of posts) {
                const postElement = this.createPostElement(post, likedPostIds.has(post.id));
                postsContainer.appendChild(postElement);
            }

            // Reinitialize Lucide icons for dynamically loaded content
            this.reinitializeLucideIcons();

            console.log(`Loaded ${posts.length} posts from database`);
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    }

    renderPollInPost(pollDataJson, postId) {
        try {
            const pollData = typeof pollDataJson === 'string' ? JSON.parse(pollDataJson) : pollDataJson;
            const totalVotes = pollData.votes.reduce((sum, v) => sum + v, 0);

            return `
                <div class="post-poll" data-post-id="${postId}">
                    <div class="poll-title">📊 Poll</div>
                    <div class="poll-options">
                        ${pollData.options.map((opt, idx) => {
                            const votes = pollData.votes[idx] || 0;
                            const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                            return `
                                <button class="poll-option" data-option-index="${idx}" data-post-id="${postId}">
                                    <div class="poll-option-label">
                                        <span>${this.escapeHtml(opt)}</span>
                                        <span class="poll-percentage">${percentage}%</span>
                                    </div>
                                    <div class="poll-option-bar">
                                        <div class="poll-option-fill" style="width: ${percentage}%"></div>
                                    </div>
                                    <div class="poll-votes" class="poll-vote-count">${votes} vote${votes !== 1 ? 's' : ''}</div>
                                </button>
                            `;
                        }).join('')}
                    </div>
                    <div class="poll-total">${totalVotes} total vote${totalVotes !== 1 ? 's' : ''}</div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering poll:', error);
            return '';
        }
    }

    async loadPollVotes(postCard, pollDataJson, postId) {
        try {
            const pollData = typeof pollDataJson === 'string' ? JSON.parse(pollDataJson) : pollDataJson;
            
            // Fetch actual vote counts from database
            const { data: votes, error } = await window.supabaseClient
                .from('polls_votes')
                .select('option_index')
                .eq('post_id', postId);

            if (error) {
                console.error('Error loading votes:', error);
                return;
            }

            if (!votes || votes.length === 0) {
                return; // No votes yet, keep defaults
            }

            // Count votes for each option
            const voteCounts = Array(pollData.options.length).fill(0);
            votes.forEach(vote => {
                if (vote.option_index < voteCounts.length) {
                    voteCounts[vote.option_index]++;
                }
            });

            const totalVotes = voteCounts.reduce((sum, v) => sum + v, 0);

            // Update poll display with vote counts
            const pollElement = postCard.querySelector('.post-poll');
            if (!pollElement) return;

            const pollOptions = pollElement.querySelectorAll('.poll-option');
            pollOptions.forEach((option, idx) => {
                const percentage = totalVotes > 0 ? Math.round((voteCounts[idx] / totalVotes) * 100) : 0;
                const fill = option.querySelector('.poll-option-fill');
                const voteCount = option.querySelector('.poll-vote-count');
                const percentageSpan = option.querySelector('.poll-percentage');

                if (fill) fill.style.width = percentage + '%';
                if (voteCount) voteCount.textContent = `${voteCounts[idx]} vote${voteCounts[idx] !== 1 ? 's' : ''}`;
                if (percentageSpan) percentageSpan.textContent = percentage + '%';
            });

            const totalDisplay = pollElement.querySelector('.poll-total');
            if (totalDisplay) {
                totalDisplay.textContent = `${totalVotes} total vote${totalVotes !== 1 ? 's' : ''}`;
            }

        } catch (error) {
            console.error('Error updating poll votes:', error);
        }
    }

    createPostElement(postData, isLiked = false) {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.setAttribute('data-post-id', postData.id);

        // Check if this is a shared post
        const isSharedPost = postData.shared_by_id && postData.shared_by_name;

        if (isSharedPost) {
            // Facebook-style shared post: sharer info at top, original post inside
            const originalPost = this.createOriginalPostContent(postData, isLiked);
            
            postCard.innerHTML = `
                <div class="share-header" style="padding: 12px 16px; background: #f8f9fa; border-bottom: 1px solid #ecf0f1;">
                    <div style="font-size: 12px; color: #65676b; display: flex; align-items: center; gap: 8px;">
                        <span>↗️</span>
                        <strong>${this.escapeHtml(postData.shared_by_name)}</strong>
                        <span>shared</span>
                    </div>
                </div>
                <div class="shared-post-content" style="margin: 12px; padding: 12px; border: 1px solid #ecf0f1; border-radius: 8px;">
                    ${originalPost}
                </div>
            `;
        } else {
            // Regular post
            let authorName = postData.author_name || 'Unknown User';
            const authorEmail = postData.author_email || 'user@example.com';
            // Use author_avatar_url from database if available, otherwise fallback to default
            let authorAvatar = postData.author_avatar_url || `https://i.pravatar.cc/40?u=${postData.author_id}`;
            const authorHandle = authorEmail.split('@')[0];
            const postTime = this.formatTimeAgo(postData.created_at);
            const isAuthor = postData.author_id === this.currentUser.id;
            
            // If this is the current user's post, use the current name from localStorage
            if (isAuthor) {
                const savedName = localStorage.getItem('profileName');
                if (savedName) {
                    authorName = savedName;
                    console.log('📝 Using current profile name for post display:', authorName);
                }
                const savedAvatar = localStorage.getItem('profileAvatar');
                if (savedAvatar) {
                    authorAvatar = savedAvatar;
                    console.log('🎨 Using current profile avatar for post display');
                }
            } else {
                // For other users' posts, fetch the latest name from database
                (async () => {
                    try {
                        const { data: profileData, error } = await window.supabaseClient
                            .from('user_profiles')
                            .select('full_name, avatar_url')
                            .eq('user_email', postData.author_email)
                            .single();
                        
                        if (!error && profileData) {
                            console.log('📝 Fetched latest name from database:', profileData.full_name);
                            const nameEl = postCard.querySelector('.post-meta strong');
                            if (nameEl) {
                                nameEl.textContent = profileData.full_name;
                            }
                            if (profileData.avatar_url) {
                                const avatarImg = postCard.querySelector('.avatar');
                                if (avatarImg) {
                                    avatarImg.src = profileData.avatar_url;
                                }
                            }
                        }
                    } catch (err) {
                        console.log('Could not fetch latest name from database');
                    }
                })();
            }
            
            // Try to fetch the current avatar from user_profiles for dynamic updates
            (async () => {
                try {
                    const { data: profileDataArray, error } = await window.supabaseClient
                        .from('user_profiles')
                        .select('avatar_url')
                        .eq('user_email', authorEmail);
                    
                    if (!error && profileDataArray && profileDataArray.length > 0) {
                        const profileData = profileDataArray[0];
                        if (profileData?.avatar_url) {
                            const avatarImg = postCard.querySelector('.avatar');
                            if (avatarImg) {
                                avatarImg.src = profileData.avatar_url;
                                console.log('✅ Updated post avatar from user_profiles:', profileData.avatar_url);
                            }
                        }
                    }
                } catch (err) {
                    // Silently fail - use the stored avatar
                }
            })();

            postCard.innerHTML = `
                <div class="post-header">
                    <img src="${authorAvatar}" alt="Author" class="avatar" />
                    <div class="post-meta">
                        <strong>${authorName}</strong>
                        <span class="post-time">• ${postTime}</span>
                    </div>
                    ${isAuthor ? `<button class="delete-post-btn" data-post-id="${postData.id}" title="Delete post">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"></path>
                            <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>` : ''}
                </div>

                <div class="post-content">
                    <p>${this.escapeHtml(postData.content)}</p>
                </div>

                ${postData.image_url ? `<div class="post-image"><img src="${postData.image_url}" alt="Post image" /></div>` : ''}
                ${postData.video_url ? `<div class="post-video"><iframe width="100%" height="315" src="https://www.youtube.com/embed/${postData.video_url}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>` : ''}
                ${postData.poll_data ? this.renderPollInPost(postData.poll_data, postData.id) : ''}

                <div class="post-actions">
                    <button class="action-btn comment-btn" data-post-id="${postData.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>${postData.comments_count || 0}</span>
                    </button>
                    <button class="action-btn share-btn" data-post-id="${postData.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                        <span>${postData.shares_count || 0}</span>
                    </button>
                    <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${postData.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="${isLiked ? '#f39c12' : 'none'}" stroke="${isLiked ? '#f39c12' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="10" r="6"></circle>
                            <path d="M12 16v3"></path>
                            <path d="M10 19h4"></path>
                        </svg>
                        <span>${postData.likes_count || 0}</span>
                    </button>
                </div>
            `;
        }

        // Add event listeners for buttons
        const commentBtn = postCard.querySelector('.comment-btn');
        const shareBtn = postCard.querySelector('.share-btn');
        const likeBtn = postCard.querySelector('.like-btn');
        const deleteBtn = postCard.querySelector('.delete-post-btn');

        if (commentBtn) {
            commentBtn.addEventListener('click', (e) => this.handleCommentClick(e, postData));
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => this.handleShareClick(e, postData));
        }

        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => this.handleLikeClick(e, postData));
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => this.handleDeletePost(e, postData));
        }

        // Also find delete buttons in shared post content (nested)
        const nestedDeleteBtn = postCard.querySelector('.shared-post-content .delete-post-btn');
        if (nestedDeleteBtn) {
            nestedDeleteBtn.addEventListener('click', (e) => this.handleDeletePost(e, postData));
        }

        // Add poll voting listeners
        const pollOptions = postCard.querySelectorAll('.poll-option');
        pollOptions.forEach(option => {
            option.addEventListener('click', (e) => this.handlePollVote(e, postData.id));
        });

        // Load poll votes if poll exists
        if (postData.poll_data) {
            this.loadPollVotes(postCard, postData.poll_data, postData.id);
        }

        return postCard;
    }

    createOriginalPostContent(postData, isLiked = false) {
        let authorName = postData.author_name || 'Unknown User';
        const authorEmail = postData.author_email || 'user@example.com';
        // Use author_avatar_url from database if available, otherwise fallback to default
        let authorAvatar = postData.author_avatar_url || `https://i.pravatar.cc/40?u=${postData.author_id}`;
        const authorHandle = authorEmail.split('@')[0];
        
        // If this is the current user's post, use the current name from localStorage
        const isAuthor = postData.author_id === this.currentUser.id;
        if (isAuthor) {
            const savedName = localStorage.getItem('profileName');
            if (savedName) {
                authorName = savedName;
            }
            const savedAvatar = localStorage.getItem('profileAvatar');
            if (savedAvatar) {
                authorAvatar = savedAvatar;
            }
        } else {
            // For other users, fetch the latest name from database
            (async () => {
                try {
                    const { data: profileData, error } = await window.supabaseClient
                        .from('user_profiles')
                        .select('full_name, avatar_url')
                        .eq('user_email', authorEmail)
                        .single();
                    
                    if (!error && profileData) {
                        // Update the DOM with the latest name
                        const nameElements = document.querySelectorAll(`[data-post-id="${postData.id}"] .post-meta strong, [data-post-id="${postData.id}"] strong:first-of-type`);
                        nameElements.forEach(el => {
                            if (el.textContent === authorName) {
                                el.textContent = profileData.full_name;
                            }
                        });
                        if (profileData.avatar_url) {
                            const avatarImgs = document.querySelectorAll(`[data-post-id="${postData.id}"] .avatar`);
                            avatarImgs.forEach(img => {
                                img.src = profileData.avatar_url;
                            });
                        }
                    }
                } catch (err) {
                    console.log('Could not fetch latest name from database');
                }
            })();
        }
        const postTime = this.formatTimeAgo(postData.created_at);

        return `
            <div class="post-header">
                <img src="${authorAvatar}" alt="Author" class="avatar" />
                <div class="post-meta">
                    <strong>${authorName}</strong>
                    <span class="post-handle">@${authorHandle}</span>
                    <span class="post-time">• ${postTime}</span>
                </div>
                ${isAuthor ? `<button class="delete-post-btn" data-post-id="${postData.id}" title="Delete post">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"></path>
                        <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>` : ''}
            </div>

            <div class="post-content">
                <p>${this.escapeHtml(postData.content)}</p>
            </div>

            ${postData.image_url ? `<div class="post-image"><img src="${postData.image_url}" alt="Post image" /></div>` : ''}
            ${postData.video_url ? `<div class="post-video"><iframe width="100%" height="315" src="https://www.youtube.com/embed/${postData.video_url}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>` : ''}
            ${postData.poll_data ? this.renderPollInPost(postData.poll_data, postData.id) : ''}

            <div class="post-actions">
                <button class="action-btn comment-btn" data-post-id="${postData.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>${postData.comments_count || 0}</span>
                </button>
                <button class="action-btn share-btn" data-post-id="${postData.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span>${postData.shares_count || 0}</span>
                </button>
                <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${postData.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="${isLiked ? '#f39c12' : 'none'}" stroke="${isLiked ? '#f39c12' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="10" r="6"></circle>
                        <path d="M12 16v3"></path>
                        <path d="M10 19h4"></path>
                    </svg>
                    <span>${postData.likes_count || 0}</span>
                </button>
            </div>
        `;
    }

    handleCommentClick(e, postData) {
        e.preventDefault();
        const btn = e.currentTarget;
        btn.style.transform = 'scale(1.1)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
        this.openCommentsModal(postData);
    }

    handleDeletePost(e, postData) {
        e.preventDefault();
        const confirmed = confirm('Are you sure you want to delete this post?');
        if (!confirmed) return;

        const btn = e.currentTarget;
        btn.disabled = true;
        this.showNotification('Deleting post...', 'info');

        this.deletePostFromDatabase(postData.id);
    }

    async handlePollVote(e, postId) {
        e.preventDefault();
        if (!this.currentUser) {
            this.showNotification('Please log in to vote', 'error');
            return;
        }

        const optionBtn = e.currentTarget;
        const optionIndex = parseInt(optionBtn.getAttribute('data-option-index'));
        
        try {
            // Insert or update vote
            const { error } = await window.supabaseClient
                .from('polls_votes')
                .upsert({
                    post_id: postId,
                    user_id: this.currentUser.id,
                    option_index: optionIndex
                });

            if (error) {
                throw error;
            }

            this.showNotification('Vote recorded! ✓', 'success');
            
            // Reload posts to update the poll
            this.loadPostsFromDatabase();
            
        } catch (error) {
            console.error('Vote error:', error);
            this.showNotification('Failed to record vote', 'error');
        }
    }

    async deletePostFromDatabase(postId) {
        try {
            // Delete the post
            const { error } = await window.supabaseClient
                .from('posts')
                .delete()
                .eq('id', postId);

            if (error) {
                throw error;
            }

            this.showNotification('Post deleted ✓', 'success');
            
            // Reload posts to update the feed
            await this.loadPostsFromDatabase();
        } catch (error) {
            console.error('Failed to delete post:', error);
            this.showNotification('Error deleting post', 'error');
        }
    }

    isSpamAction(actionType, postId) {
        const key = `${actionType}_${postId}`;
        const now = Date.now();
        const lastAction = this.lastActions[key];
        
        if (lastAction && (now - lastAction) < this.actionCooldowns[actionType]) {
            return true;
        }
        
        this.lastActions[key] = now;
        return false;
    }

    handleShareClick(e, postData) {
        e.preventDefault();
        
        // Spam check
        if (this.isSpamAction('share', postData.id)) {
            this.showNotification('Please wait before sharing again', 'error');
            return;
        }
        
        const btn = e.currentTarget;
        btn.style.transform = 'scale(1.1)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
        
        const userName = this.currentUser.user_metadata?.full_name || this.currentUser.email.split('@')[0];
        this.showNotification(`Shared by ${userName} ✓`, 'success');
        
        // Update share count visually
        const span = btn.querySelector('span');
        let shareCount = parseInt(span.textContent) || 0;
        shareCount++;
        span.textContent = shareCount;
        
        // Add to database with sharer info and reload feed
        this.addShareToDatabase(postData.id, userName).then(() => {
            this.loadPostsFromDatabase();
        });
    }

    async addShareToDatabase(postId, sharedByName) {
        try {
            // Get current share count
            const { data: post } = await window.supabaseClient
                .from('posts')
                .select('shares_count')
                .eq('id', postId)
                .single();

            const newShareCount = (post?.shares_count || 0) + 1;

            // Update with incremented count and sharer info
            await window.supabaseClient
                .from('posts')
                .update({ 
                    shares_count: newShareCount,
                    shared_by_id: this.currentUser.id,
                    shared_by_name: sharedByName
                })
                .eq('id', postId);
        } catch (error) {
            console.error('Failed to add share:', error);
        }
    }

    handleLikeClick(e, postData) {
        e.preventDefault();
        
        // Spam check
        if (this.isSpamAction('like', postData.id)) {
            this.showNotification('Please wait before reacting again', 'error');
            return;
        }
        
        const btn = e.currentTarget;
        const svg = btn.querySelector('svg');
        const span = btn.querySelector('span');
        let likeCount = parseInt(span.textContent);

        const isLiking = !btn.classList.contains('liked');
        const originalState = {
            hasLiked: btn.classList.contains('liked'),
            likeCount: likeCount,
            fillColor: svg.style.fill,
            strokeColor: svg.style.stroke
        };

        // Update UI immediately (optimistic update)
        if (isLiking) {
            btn.classList.add('liked');
            svg.style.fill = '#f39c12';
            svg.style.stroke = '#f39c12';
            likeCount++;
            this.showNotification('Liked! ❤️ (Undo in 5s)', 'success');
        } else {
            btn.classList.remove('liked');
            svg.style.fill = 'none';
            svg.style.stroke = 'currentColor';
            likeCount--;
            this.showNotification('Unliked (Undo in 5s)', 'info');
        }

        span.textContent = likeCount;
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);

        // Allow undo for 5 seconds
        let undoTimeout;
        let isUndone = false;

        const undoLike = () => {
            if (isUndone) return;
            isUndone = true;
            clearTimeout(undoTimeout);
            
            // Revert UI to original state
            btn.classList.toggle('liked', originalState.hasLiked);
            svg.style.fill = originalState.fillColor;
            svg.style.stroke = originalState.strokeColor;
            span.textContent = originalState.likeCount;
            
            this.showNotification('Reaction undone', 'info');
            btn.removeEventListener('contextmenu', handleUndo);
        };

        const handleUndo = (e) => {
            e.preventDefault();
            undoLike();
        };

        // Add right-click to undo
        btn.addEventListener('contextmenu', handleUndo);

        // After 5 seconds, commit to database and remove undo option
        undoTimeout = setTimeout(() => {
            btn.removeEventListener('contextmenu', handleUndo);
            if (!isUndone) {
                // Commit to database
                if (isLiking) {
                    this.addLikeToDatabase(postData.id);
                } else {
                    this.removeLikeFromDatabase(postData.id);
                }
            }
        }, 5000);
    }

    async addLikeToDatabase(postId) {
        try {
            // Insert into post_likes table
            const { error: insertError } = await window.supabaseClient
                .from('post_likes')
                .insert([{
                    post_id: postId,
                    user_id: this.currentUser.id
                }]);

            if (insertError) {
                console.error('Error adding like:', insertError);
                return;
            }

            // Update likes_count in posts table
            const { data: post } = await window.supabaseClient
                .from('posts')
                .select('likes_count')
                .eq('id', postId)
                .single();

            const newLikeCount = (post?.likes_count || 0) + 1;

            await window.supabaseClient
                .from('posts')
                .update({ likes_count: newLikeCount })
                .eq('id', postId);
        } catch (error) {
            console.error('Failed to add like:', error);
        }
    }

    async removeLikeFromDatabase(postId) {
        try {
            // Delete from post_likes table
            const { error: deleteError } = await window.supabaseClient
                .from('post_likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', this.currentUser.id);

            if (deleteError) {
                console.error('Error removing like:', deleteError);
                return;
            }

            // Update likes_count in posts table
            const { data: post } = await window.supabaseClient
                .from('posts')
                .select('likes_count')
                .eq('id', postId)
                .single();

            const newLikeCount = Math.max(0, (post?.likes_count || 0) - 1);

            await window.supabaseClient
                .from('posts')
                .update({ likes_count: newLikeCount })
                .eq('id', postId);
        } catch (error) {
            console.error('Failed to remove like:', error);
        }
    }

    async openCommentsModal(postData) {
        try {
            // Create modal if it doesn't exist
            let modal = document.getElementById('commentsModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'commentsModal';
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content comments-modal-content">
                        <div class="modal-header">
                            <h2>Comments</h2>
                            <button class="close-modal" id="closeCommentsModal">&times;</button>
                        </div>
                        <div id="commentsList" class="comments-list"></div>
                        <div class="comment-input-section">
                            <textarea id="commentInput" placeholder="Add a comment..." class="comment-input"></textarea>
                            <button id="submitCommentBtn" class="submit-comment-btn">Post Comment</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                // Close modal
                document.getElementById('closeCommentsModal').addEventListener('click', () => {
                    modal.classList.remove('show');
                });

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.classList.remove('show');
                });
            }

            // Store current post ID for submission
            this.currentPostForComment = postData;

            // Load and display comments
            await this.loadCommentsForPost(postData.id);

            // Set up comment submission
            const submitBtn = document.getElementById('submitCommentBtn');
            const commentInput = document.getElementById('commentInput');

            submitBtn.onclick = () => this.submitComment(postData);
            commentInput.onkeypress = (e) => {
                if (e.key === 'Enter' && e.ctrlKey) this.submitComment(postData);
            };

            // Show modal
            modal.classList.add('show');
        } catch (error) {
            console.error('Error opening comments modal:', error);
            this.showNotification('Failed to open comments', 'error');
        }
    }

    async loadCommentsForPost(postId) {
        try {
            const { data: comments, error } = await window.supabaseClient
                .from('comments')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error loading comments:', error);
                return;
            }

            const commentsList = document.getElementById('commentsList');
            commentsList.innerHTML = '';

            if (!comments || comments.length === 0) {
                commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
                return;
            }

            comments.forEach(comment => {
                const commentEl = this.createCommentElement(comment);
                commentsList.appendChild(commentEl);
            });
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    }

    createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';

        const authorHandle = comment.author_email?.split('@')[0] || 'Unknown';
        let authorAvatar = `https://i.pravatar.cc/32?u=${comment.author_id}`;
        let commentAuthorName = comment.author_name || 'Unknown User';
        const timeAgo = this.formatTimeAgo(comment.created_at);
        
        // If this is the current user's comment, use the current name from localStorage
        const isCurrentUserComment = comment.author_id === this.currentUser.id;
        if (isCurrentUserComment) {
            const savedName = localStorage.getItem('profileName');
            if (savedName) {
                commentAuthorName = savedName;
            }
            const savedAvatar = localStorage.getItem('profileAvatar');
            if (savedAvatar) {
                authorAvatar = savedAvatar;
            }
        } else {
            // For other users' comments, fetch the latest name from database
            (async () => {
                try {
                    const { data: profileData, error } = await window.supabaseClient
                        .from('user_profiles')
                        .select('full_name, avatar_url')
                        .eq('user_email', comment.author_email)
                        .single();
                    
                    if (!error && profileData) {
                        const nameEl = commentDiv.querySelector('.comment-header strong');
                        if (nameEl) {
                            nameEl.textContent = profileData.full_name;
                        }
                        if (profileData.avatar_url) {
                            const avatarImg = commentDiv.querySelector('.comment-avatar');
                            if (avatarImg) {
                                avatarImg.src = profileData.avatar_url;
                            }
                        }
                    }
                } catch (err) {
                    console.log('Could not fetch latest name from database');
                }
            })();
        }

        commentDiv.innerHTML = `
            <img src="${authorAvatar}" alt="Author" class="comment-avatar" />
            <div class="comment-content">
                <div class="comment-header">
                    <strong>${commentAuthorName}</strong>
                    <span class="comment-handle">@${authorHandle}</span>
                    <span class="comment-time">• ${timeAgo}</span>
                </div>
                <p class="comment-text">${this.escapeHtml(comment.content)}</p>
            </div>
        `;

        return commentDiv;
    }

    async submitComment(postData) {
        const commentInput = document.getElementById('commentInput');
        const content = commentInput.value.trim();

        if (!content) {
            this.showNotification('Comment cannot be empty', 'error');
            return;
        }

        // Spam check
        if (this.isSpamAction('comment', postData.id)) {
            this.showNotification('Please wait before commenting again', 'error');
            return;
        }

        try {
            const submitBtn = document.getElementById('submitCommentBtn');
            submitBtn.disabled = true;
            this.showNotification('Posting comment...', 'info');

            // Add comment to database
            const { data, error } = await window.supabaseClient
                .from('comments')
                .insert([{
                    post_id: postData.id,
                    content: content,
                    author_id: this.currentUser.id,
                    author_name: this.currentUser.user_metadata?.full_name || 
                               this.currentUser.email.split('@')[0],
                    author_email: this.currentUser.email
                }])
                .select();

            if (error) {
                throw error;
            }

            // Update post comments count
            await window.supabaseClient
                .from('posts')
                .update({ comments_count: (postData.comments_count || 0) + 1 })
                .eq('id', postData.id);

            this.showNotification('Comment posted! ✓', 'success');
            commentInput.value = '';
            submitBtn.disabled = false;

            // Reload comments
            await this.loadCommentsForPost(postData.id);
            
            // Reload all posts to update comment count in feed
            await this.loadPostsFromDatabase();
        } catch (error) {
            console.error('Failed to submit comment:', error);
            this.showNotification('Error posting comment', 'error');
            const submitBtn = document.getElementById('submitCommentBtn');
            submitBtn.disabled = false;
        }
    }

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'just now';
        
        // Handle different timestamp formats
        let date;
        if (typeof timestamp === 'string') {
            // Remove 'Z' and parse the timestamp
            const cleanTimestamp = timestamp.replace('Z', '+00:00');
            date = new Date(cleanTimestamp);
        } else {
            date = new Date(timestamp);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid timestamp:', timestamp);
            return 'just now';
        }
        
        // Convert to Philippine Time (UTC+8)
        const phTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
        
        // Format as readable date/time: "Jan 11, 2:30 PM"
        const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
        return phTime.toLocaleDateString('en-US', options);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    playVideo() {
        this.showNotification('Playing video...', 'info');
    }

    handleAction(e) {
        const btn = e.currentTarget;
        const actionType = btn.querySelector('svg').nextSibling?.textContent || 'action';
        
        if (actionType.includes('Comment')) {
            this.showNotification('Opening comments...', 'info');
        } else if (actionType.includes('Share')) {
            this.showNotification('Sharing post...', 'info');
        } else if (actionType.includes('Like')) {
            btn.style.color = '#f39c12';
            this.showNotification('Liked!', 'success');
        }
    }

    handleTodoToggle(e) {
        const label = e.currentTarget.nextElementSibling;
        if (e.currentTarget.checked) {
            label.style.textDecoration = 'line-through';
            label.style.color = '#95a5a6';
        } else {
            label.style.textDecoration = 'none';
            label.style.color = '#2c3e50';
        }
    }

    openIdea(e) {
        const idea = e.currentTarget;
        const name = idea.querySelector('strong').textContent;
        this.showNotification(`Opening idea by ${name}...`, 'info');
    }

    joinClass() {
        this.showNotification('You have joined the class!', 'success');
    }

    showNotifications() {
        this.showNotification('You have 2 new notifications', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            ${type === 'success' ? 'background: #27ae60; color: white;' : 'background: #1e5a96; color: white;'}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    openEditProfileModal() {
        try {
            if (!this.currentUser) {
                this.showNotification('User not loaded yet', 'error');
                return;
            }

            const nameEl = document.getElementById('editName');
            const bioEl = document.getElementById('editBio');

            if (nameEl) {
                const currentName = this.currentUser.user_metadata?.full_name || 
                                   this.currentUser.email.split('@')[0];
                nameEl.value = currentName;
            }

            if (bioEl) {
                const currentBio = this.currentUser.user_metadata?.bio || '';
                bioEl.value = currentBio;
            }

            const modal = document.getElementById('editProfileModal');
            if (modal) {
                modal.classList.add('show');
            }
        } catch (error) {
            console.error('Error opening edit profile modal:', error);
            this.showNotification('Error opening profile editor', 'error');
        }
    }

    closeEditProfileModal() {
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    async saveProfileChanges() {
        try {
            const nameEl = document.getElementById('editName');
            const bioEl = document.getElementById('editBio');
            const saveBtn = document.getElementById('saveProfileBtn');

            const newName = nameEl ? nameEl.value.trim() : '';
            const newBio = bioEl ? bioEl.value.trim() : '';

            if (!newName) {
                this.showNotification('Name cannot be empty', 'error');
                return;
            }

            if (saveBtn) saveBtn.disabled = true;
            this.showNotification('Saving changes...', 'info');

            // Check authentication before proceeding
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (!session) {
                throw new Error('You must be logged in to save your profile. Please refresh the page and log in again.');
            }

            console.log('✅ User authenticated:', session.user.email);

            // Save to localStorage for games
            localStorage.setItem('userName', newName);
            localStorage.setItem('profileName', newName);
            localStorage.setItem('profileBio', newBio);

            // Update local state
            if (this.currentUser.user_metadata) {
                this.currentUser.user_metadata.full_name = newName;
                this.currentUser.user_metadata.bio = newBio;
            } else {
                this.currentUser.user_metadata = {
                    full_name: newName,
                    bio: newBio
                };
            }

            // Try to save to user_profiles table in Supabase
            try {
                const avatarUrl = localStorage.getItem('profileAvatarUrl') || localStorage.getItem('profileAvatar');
                const { data, error } = await window.supabaseClient
                    .from('user_profiles')
                    .upsert({
                        id: session.user.id,
                        user_email: session.user.email,
                        full_name: newName,
                        bio: newBio,
                        avatar_url: avatarUrl
                    });

                if (error) {
                    console.warn('⚠️ Could not sync to database:', error.message);
                } else {
                    console.log('✅ Profile saved to database');
                }
            } catch (dbErr) {
                console.warn('⚠️ Database sync failed:', dbErr.message);
            }

            // Update profile display
            this.populateUserProfile();

            this.showNotification('Profile updated successfully! ✓', 'success');
            this.closeEditProfileModal();

            if (saveBtn) saveBtn.disabled = false;
        } catch (error) {
            console.error('Profile save error:', error);
            this.showNotification('Error: ' + (error.message || 'Failed to save profile'), 'error');
            const saveBtn = document.getElementById('saveProfileBtn');
            if (saveBtn) saveBtn.disabled = false;
        }
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize Lucide Icons
function initLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Try to initialize immediately
setTimeout(initLucideIcons, 100);

// Also initialize on window load
window.addEventListener('load', initLucideIcons);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new CourseInterface();
    // Initialize icons on DOM ready
    initLucideIcons();
});
