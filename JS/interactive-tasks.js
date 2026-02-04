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

        // Make openTask available globally before TaskManager is defined
        let openTask = (taskId) => {
            if (TaskManager && TaskManager.openTask) {
                TaskManager.openTask(taskId);
            }
        };

        // Task Manager
        const TaskManager = {
            currentTask: null,
            currentScore: 0,
            currentMaxScore: 0,

            tasks: {
                'timeline-cavite': {
                    title: 'Cavite Mutiny Timeline',
                    maxScore: 8,
                    content: `
                        <p style="font-size: 16px; color: #51513E; margin-bottom: 24px; font-weight: 500;"><strong>Arrange these events in the correct chronological order by selecting them:</strong></p>
                        <div style="margin: 20px 0; display: grid; gap: 12px;">
                            <div class="timeline-item" data-order="1" onclick="selectTimelineItem(this)" style="padding: 16px 18px; background: linear-gradient(135deg, #F9F7F4 0%, #FFFFFF 100%); border-radius: 10px; cursor: pointer; border: 2px solid #D6DCE1; transition: all 0.3s ease; display: flex; align-items: center; gap: 12px; hover-scale: 1.02;">
                                <input type="checkbox" class="timeline-check" style="width: 18px; height: 18px; cursor: pointer;"> <span style="color: #51513E; font-weight: 500;">Fort San Felipe Mutiny begins</span>
                            </div>
                            <div class="timeline-item" data-order="2" onclick="selectTimelineItem(this)" style="padding: 16px 18px; background: linear-gradient(135deg, #F9F7F4 0%, #FFFFFF 100%); border-radius: 10px; cursor: pointer; border: 2px solid #D6DCE1; transition: all 0.3s ease; display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" class="timeline-check" style="width: 18px; height: 18px; cursor: pointer;"> <span style="color: #51513E; font-weight: 500;">Execution of GomBurZa</span>
                            </div>
                            <div class="timeline-item" data-order="3" onclick="selectTimelineItem(this)" style="padding: 16px 18px; background: linear-gradient(135deg, #F9F7F4 0%, #FFFFFF 100%); border-radius: 10px; cursor: pointer; border: 2px solid #D6DCE1; transition: all 0.3s ease; display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" class="timeline-check" style="width: 18px; height: 18px; cursor: pointer;"> <span style="color: #51513E; font-weight: 500;">Mutiny suppressed</span>
                            </div>
                            <div class="timeline-item" data-order="4" onclick="selectTimelineItem(this)" style="padding: 16px 18px; background: linear-gradient(135deg, #F9F7F4 0%, #FFFFFF 100%); border-radius: 10px; cursor: pointer; border: 2px solid #D6DCE1; transition: all 0.3s ease; display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" class="timeline-check" style="width: 18px; height: 18px; cursor: pointer;"> <span style="color: #51513E; font-weight: 500;">Spanish reinforcements arrive</span>
                            </div>
                            <div class="timeline-item" data-order="5" onclick="selectTimelineItem(this)" style="padding: 16px 18px; background: linear-gradient(135deg, #F9F7F4 0%, #FFFFFF 100%); border-radius: 10px; cursor: pointer; border: 2px solid #D6DCE1; transition: all 0.3s ease; display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" class="timeline-check" style="width: 18px; height: 18px; cursor: pointer;"> <span style="color: #51513E; font-weight: 500;">Resignation of priests</span>
                            </div>
                            <div class="timeline-item" data-order="6" onclick="selectTimelineItem(this)" style="padding: 16px 18px; background: linear-gradient(135deg, #F9F7F4 0%, #FFFFFF 100%); border-radius: 10px; cursor: pointer; border: 2px solid #D6DCE1; transition: all 0.3s ease; display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" class="timeline-check" style="width: 18px; height: 18px; cursor: pointer;"> <span style="color: #51513E; font-weight: 500;">Outbreak of Filipino nationalism</span>
                            </div>
                            <div class="timeline-item" data-order="7" onclick="selectTimelineItem(this)" style="padding: 16px 18px; background: linear-gradient(135deg, #F9F7F4 0%, #FFFFFF 100%); border-radius: 10px; cursor: pointer; border: 2px solid #D6DCE1; transition: all 0.3s ease; display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" class="timeline-check" style="width: 18px; height: 18px; cursor: pointer;"> <span style="color: #51513E; font-weight: 500;">Discovery of Katipunan</span>
                            </div>
                            <div class="timeline-item" data-order="8" onclick="selectTimelineItem(this)" style="padding: 16px 18px; background: linear-gradient(135deg, #F9F7F4 0%, #FFFFFF 100%); border-radius: 10px; cursor: pointer; border: 2px solid #D6DCE1; transition: all 0.3s ease; display: flex; align-items: center; gap: 12px;">
                                <input type="checkbox" class="timeline-check" style="width: 18px; height: 18px; cursor: pointer;"> <span style="color: #51513E; font-weight: 500;">Suspension of public executions</span>
                            </div>
                        </div>
                        <div id="timeline-feedback" style="margin-top: 20px; padding: 16px; border-radius: 8px; display: none; border-left: 4px solid #28a745;"></div>
                    `,
                    check: function() {
                        // Check if items were selected in correct chronological order
                        if (timelineSelectionOrder.length < 8) {
                            return { score: 0, max: 8 };
                        }

                        const selectedOrder = timelineSelectionOrder.map(item => parseInt(item.getAttribute('data-order')));

                        // Verify they're in ascending chronological order (1,2,3,4,5,6,7,8)
                        let isCorrect = true;
                        for (let i = 0; i < selectedOrder.length; i++) {
                            if (selectedOrder[i] !== i + 1) {
                                isCorrect = false;
                                break;
                            }
                        }

                        return { score: isCorrect ? 8 : 0, max: 8 };
                    }
                },
                'matching-figures': {
                    title: 'Match Historical Figures',
                    maxScore: 4,
                    content: `
                        <p><strong>Select the correct role for each historical figure:</strong></p>
                        <div style="margin: 20px 0; display: grid; gap: 15px;">
                            <div class="matching-item">
                                <strong>Mariano Gómez</strong>
                                <select class="match-answer" data-answer="A" style="width: 100%; padding: 8px; margin-top: 5px;">
                                    <option value="">Select role...</option>
                                    <option value="A">Executed Filipino Priest</option>
                                    <option value="B">Fort Commander</option>
                                    <option value="C">Military General</option>
                                    <option value="D">Governor</option>
                                </select>
                            </div>
                            <div class="matching-item">
                                <strong>José Burgos</strong>
                                <select class="match-answer" data-answer="A" style="width: 100%; padding: 8px; margin-top: 5px;">
                                    <option value="">Select role...</option>
                                    <option value="A">Executed Filipino Priest</option>
                                    <option value="B">Fort Commander</option>
                                    <option value="C">Military General</option>
                                    <option value="D">Governor</option>
                                </select>
                            </div>
                            <div class="matching-item">
                                <strong>Jacinto Zamora</strong>
                                <select class="match-answer" data-answer="A" style="width: 100%; padding: 8px; margin-top: 5px;">
                                    <option value="">Select role...</option>
                                    <option value="A">Executed Filipino Priest</option>
                                    <option value="B">Fort Commander</option>
                                    <option value="C">Military General</option>
                                    <option value="D">Governor</option>
                                </select>
                            </div>
                            <div class="matching-item">
                                <strong>Andrés Bonifacio</strong>
                                <select class="match-answer" data-answer="B" style="width: 100%; padding: 8px; margin-top: 5px;">
                                    <option value="">Select role...</option>
                                    <option value="A">Executed Filipino Priest</option>
                                    <option value="B">Fort Commander</option>
                                    <option value="C">Katipunan Founder</option>
                                    <option value="D">Governor</option>
                                </select>
                            </div>
                        </div>
                        <div id="matching-feedback" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
                    `,
                    check: function() {
                        let score = 0;
                        document.querySelectorAll('.match-answer').forEach((select) => {
                            if (select.value === select.dataset.answer) {
                                score++;
                            }
                        });
                        return { score: score, max: 4 };
                    }
                },
                'fillblank-cavite': {
                    title: 'Complete the Historical Narrative',
                    maxScore: 5,
                    content: `
                        <p><strong>Fill in the missing words to complete this historical account:</strong></p>
                        <div style="margin: 20px 0; line-height: 1.8; color: #555; font-size: 15px;">
                            The Cavite Mutiny occurred in <input type="text" class="blank-input" data-answer="1872" placeholder="[year]" style="width: 80px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;"/> at
                            <input type="text" class="blank-input" data-answer="fort san felipe" placeholder="[location]" style="width: 120px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;"/>. Filipino soldiers, frustrated by
                            <input type="text" class="blank-input" data-answer="discrimination" placeholder="[grievance]" style="width: 140px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;"/>, rebelled against Spanish authority.
                            The Spanish response was swift and brutal, leading to the execution of three <input type="text" class="blank-input" data-answer="priests" placeholder="[occupation]" style="width: 110px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;"/>: Gómez, Burgos, and Zamora, collectively known as the <input type="text" class="blank-input" data-answer="gomburza" placeholder="[term]" style="width: 100px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;"/>.
                        </div>
                        <div id="fillblank-feedback" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
                    `,
                    check: function() {
                        let score = 0;
                        document.querySelectorAll('.blank-input').forEach((input) => {
                            if (input.value.toLowerCase().trim() === input.dataset.answer.toLowerCase()) {
                                score++;
                            }
                        });
                        return { score: score, max: 5 };
                    }
                }
            },

            openTask(taskId) {
                const task = this.tasks[taskId];
                if (!task) return;

                this.currentTask = taskId;
                this.currentMaxScore = task.maxScore;
                document.getElementById('taskTitle').textContent = task.title;
                document.getElementById('taskContent').innerHTML = task.content;
                document.getElementById('taskModal').style.display = 'flex';

                // Make utility functions available globally
                window.selectTimelineItem = selectTimelineItem;

            },

            init() {
                // Filter functionality
                document.querySelectorAll('.filter-chip').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        const filter = e.target.dataset.filter;

                        // Filter tasks based on selection
                        if (filter === 'all') {
                            document.querySelectorAll('.task-card').forEach(card => card.style.display = '');
                        } else {
                            document.querySelectorAll('.task-card').forEach(card => {
                                card.style.display = card.dataset.topic === filter ? '' : 'none';
                            });
                        }
                    });
                });

                // Modal close
                const closeBtn = document.getElementById('closeTaskModal');
                const cancelBtn = document.getElementById('cancelTaskBtn');
                const submitBtn = document.getElementById('submitTaskBtn');
                const modal = document.getElementById('taskModal');

                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                }

                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                }

                if (submitBtn) {
                    submitBtn.addEventListener('click', async () => await this.submitTask());
                }

                // Close modal when clicking outside
                window.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
            },

            async submitTask() {
                const task = this.tasks[this.currentTask];
                if (!task || !task.check) return;

                const result = task.check();
                const percentage = Math.round((result.score / result.max) * 100);

                // Show score result
                const message = `<div style="padding: 20px; background: ${percentage >= 70 ? '#d4edda' : '#fff3cd'}; border: 1px solid ${percentage >= 70 ? '#c3e6cb' : '#ffc107'}; border-radius: 8px; text-align: center;">
                    <h3 style="margin: 0 0 10px 0; color: ${percentage >= 70 ? '#155724' : '#856404'};">You got ${result.score}/${result.max}</h3>
                    <p style="margin: 0; color: ${percentage >= 70 ? '#155724' : '#856404'}; font-size: 14px;">Score: ${percentage}%</p>
                </div>`;

                document.getElementById('taskContent').innerHTML = message;
                document.getElementById('submitTaskBtn').style.display = 'none';

                // Save task progress to Supabase
                try {
                    const supabaseClient = await getSupabaseClient();
                    const { data: { user } } = await supabaseClient.auth.getUser();

                    if (user) {
                        // Check if task already exists
                        const { data: existingTask } = await supabaseClient
                            .from('user_task_progress')
                            .select('id')
                            .eq('user_id', user.id)
                            .eq('task_id', this.currentTask)
                            .single();

                        const taskData = {
                            user_id: user.id,
                            task_id: this.currentTask,
                            score: result.score,
                            max_score: result.max,
                            is_completed: percentage >= 70,
                            completed_at: new Date().toISOString()
                        };

                        if (existingTask) {
                            // Update existing
                            await supabaseClient
                                .from('user_task_progress')
                                .update(taskData)
                                .eq('id', existingTask.id);
                        } else {
                            // Insert new
                            await supabaseClient
                                .from('user_task_progress')
                                .insert([taskData]);
                        }

                        // Refresh stats after saving
                        setTimeout(() => {
                            loadTaskStats();
                        }, 500);
                    }
                } catch (error) {
                    console.error('Error saving task progress:', error);
                }

                // Add close button
                setTimeout(() => {
                    const newBtn = document.createElement('button');
                    newBtn.className = 'btn-cancel';
                    newBtn.textContent = 'Close';
                    newBtn.onclick = () => {
                        document.getElementById('taskModal').style.display = 'none';
                        document.getElementById('submitTaskBtn').style.display = 'block';
                    };
                    document.querySelector('.modal-footer').insertBefore(newBtn, document.getElementById('submitTaskBtn'));
                }, 100);
            }
        };

        // Track selection order globally
        let timelineSelectionOrder = [];

        // Helper function for timeline selection
        function selectTimelineItem(element) {
            const checkbox = element.querySelector('.timeline-check');
            const orderBadge = element.querySelector('.order-badge');

            if (!checkbox.checked) {
                // Adding to selection
                checkbox.checked = true;
                timelineSelectionOrder.push(element);

                element.style.borderColor = '#5C3422';
                element.style.backgroundColor = '#EBE4DC';
                element.style.boxShadow = '0 6px 20px rgba(92, 52, 34, 0.15)';
                element.style.transform = 'translateY(-2px)';

                // Add numbered badge
                const badge = document.createElement('span');
                badge.className = 'order-badge';
                badge.textContent = timelineSelectionOrder.length;
                badge.style.cssText = `
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #5C3422 0%, #7A5B47 100%);
                    color: white;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    min-width: 32px;
                    font-weight: 700;
                    margin-left: 12px;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(92, 52, 34, 0.3);
                    flex-shrink: 0;
                `;
                element.appendChild(badge);
            } else {
                // Removing from selection
                checkbox.checked = false;
                const index = timelineSelectionOrder.indexOf(element);
                if (index > -1) {
                    timelineSelectionOrder.splice(index, 1);
                }

                element.style.borderColor = '#D6DCE1';
                element.style.backgroundColor = 'linear-gradient(135deg, #F9F7F4 0%, #FFFFFF 100%)';
                element.style.boxShadow = 'none';
                element.style.transform = 'translateY(0)';

                // Remove badge
                if (orderBadge) {
                    orderBadge.remove();
                }
            }

            // Update all badges to show correct order
            timelineSelectionOrder.forEach((item, idx) => {
                const badge = item.querySelector('.order-badge');
                if (badge) {
                    badge.textContent = idx + 1;
                }
            });
        }

        // Submit timeline task
        function submitTimelineTask() {
            if (timelineSelectionOrder.length < 8) {
                const feedback = document.getElementById('timeline-feedback');
                feedback.style.display = 'block';
                feedback.style.backgroundColor = '#f8d7da';
                feedback.style.borderLeft = '4px solid #dc3545';
                feedback.innerHTML = '<strong style="color: #721c24;">✗ Incomplete</strong><p style="margin: 5px 0 0 0; color: #721c24;">Please select all 8 events before submitting.</p>';
                return;
            }

            // Check if the order they CLICKED matches the chronological order (1-8)
            // The timelineSelectionOrder array is in the order they clicked
            // We need to verify the actual data-order values are in sequence 1,2,3,4,5,6,7,8
            const selectedOrder = timelineSelectionOrder.map(item => parseInt(item.getAttribute('data-order')));

            // Check if they're in ascending chronological order
            let isCorrect = true;
            for (let i = 0; i < selectedOrder.length; i++) {
                if (selectedOrder[i] !== i + 1) {
                    isCorrect = false;
                    break;
                }
            }

            const feedback = document.getElementById('timeline-feedback');
            feedback.style.display = 'block';

            if (isCorrect) {
                feedback.style.backgroundColor = '#d4edda';
                feedback.style.borderLeft = '4px solid #28a745';
                feedback.innerHTML = '<strong style="color: #155724;">✓ Correct!</strong><p style="margin: 5px 0 0 0; color: #155724;">You arranged all events in the correct chronological order. Excellent!</p>';
            } else {
                feedback.style.backgroundColor = '#f8d7da';
                feedback.style.borderLeft = '4px solid #dc3545';
                feedback.innerHTML = '<strong style="color: #721c24;">✗ Incorrect Order</strong><p style="margin: 5px 0 0 0; color: #721c24;">You selected all 8 events, but not in the correct chronological order. Try again!</p>';
            }
        }

        // Submit matching task
        function submitMatchingTask() {
            let correctCount = 0;
            const matchAnswers = document.querySelectorAll('.match-answer');

            matchAnswers.forEach((select) => {
                if (select.value === select.dataset.answer) {
                    correctCount++;
                }
            });

            const feedback = document.getElementById('matching-feedback');
            feedback.style.display = 'block';

            if (correctCount === 4) {
                feedback.style.backgroundColor = '#d4edda';
                feedback.style.borderLeft = '4px solid #28a745';
                feedback.innerHTML = '<strong style="color: #155724;">✓ Perfect!</strong><p style="margin: 5px 0 0 0; color: #155724;">You matched all historical figures correctly. Excellent work!</p>';
            } else if (correctCount >= 2) {
                feedback.style.backgroundColor = '#fff3cd';
                feedback.style.borderLeft = '4px solid #ffc107';
                feedback.innerHTML = `<strong style="color: #856404;">⚠ Partial</strong><p style="margin: 5px 0 0 0; color: #856404;">You got ${correctCount} out of 4 correct. Try again to get them all!</p>`;
            } else {
                feedback.style.backgroundColor = '#f8d7da';
                feedback.style.borderLeft = '4px solid #dc3545';
                feedback.innerHTML = `<strong style="color: #721c24;">✗ Incorrect</strong><p style="margin: 5px 0 0 0; color: #721c24;">You got ${correctCount} out of 4 correct. Try again!</p>`;
            }
        }

        // Submit fill blanks task
        function submitFillBlanksTask() {
            let correctCount = 0;
            const blankInputs = document.querySelectorAll('.blank-input');

            blankInputs.forEach((input) => {
                if (input.value.toLowerCase().trim() === input.dataset.answer.toLowerCase()) {
                    correctCount++;
                }
            });

            const totalBlanks = blankInputs.length;
            const feedback = document.getElementById('fillblank-feedback');
            feedback.style.display = 'block';

            if (correctCount === totalBlanks) {
                feedback.style.backgroundColor = '#d4edda';
                feedback.style.borderLeft = '4px solid #28a745';
                feedback.innerHTML = '<strong style="color: #155724;">✓ Perfect!</strong><p style="margin: 5px 0 0 0; color: #155724;">You filled in all the blanks correctly. Great job!</p>';
            } else if (correctCount >= Math.ceil(totalBlanks / 2)) {
                feedback.style.backgroundColor = '#fff3cd';
                feedback.style.borderLeft = '4px solid #ffc107';
                feedback.innerHTML = `<strong style="color: #856404;">⚠ Partial</strong><p style="margin: 5px 0 0 0; color: #856404;">You got ${correctCount} out of ${totalBlanks} correct. Try again!</p>`;
            } else {
                feedback.style.backgroundColor = '#f8d7da';
                feedback.style.borderLeft = '4px solid #dc3545';
                feedback.innerHTML = `<strong style="color: #721c24;">✗ Incorrect</strong><p style="margin: 5px 0 0 0; color: #721c24;">You got ${correctCount} out of ${totalBlanks} correct. Try again!</p>`;
            }
        }

        // Setup modal event listeners
        document.addEventListener('DOMContentLoaded', () => {
            const taskModal = document.getElementById('taskModal');
            const closeTaskModal = document.getElementById('closeTaskModal');
            const cancelTaskBtn = document.getElementById('cancelTaskBtn');
            const submitTaskBtn = document.getElementById('submitTaskBtn');
            const taskContent = document.getElementById('taskContent');

            if (closeTaskModal) {
                closeTaskModal.addEventListener('click', () => {
                    taskModal.style.display = 'none';
                });
            }

            if (cancelTaskBtn) {
                cancelTaskBtn.addEventListener('click', () => {
                    taskModal.style.display = 'none';
                });
            }

            if (submitTaskBtn) {
                submitTaskBtn.addEventListener('click', () => {
                    // Check which task is active by looking for specific elements
                    if (taskContent.querySelector('.timeline-item')) {
                        submitTimelineTask();
                    } else if (taskContent.querySelector('.match-answer')) {
                        submitMatchingTask();
                    } else if (taskContent.querySelector('.blank-input')) {
                        submitFillBlanksTask();
                    }
                });
                submitTaskBtn.style.display = 'block';
            }
        });

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', () => {
            TaskManager.init();
            if (window.lucide) {
                lucide.createIcons();
            }
            // Load stats from Supabase
            loadTaskStats();
            // Load user profile
            populateUserProfile();
        });

        // ==================== LOAD TASK STATS ====================
        async function loadTaskStats() {
            try {
                const supabaseClient = await getSupabaseClient();
                const { data: { user } } = await supabaseClient.auth.getUser();

                if (!user) {
                    console.log('No user logged in');
                    return;
                }

                // Fetch all tasks
                const { data: allTasks, error: tasksError } = await supabaseClient
                    .from('user_task_progress')
                    .select('id')
                    .eq('user_id', user.id);

                if (tasksError) throw tasksError;

                // Fetch completed tasks
                const { data: completedTasks, error: completedError } = await supabaseClient
                    .from('user_task_progress')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('is_completed', true);

                if (completedError) throw completedError;

                const totalCount = allTasks?.length || 0;
                const completedCount = completedTasks?.length || 0;
                const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                // Update stats display
                document.getElementById('totalTasks').textContent = totalCount;
                document.getElementById('completedTasks').textContent = completedCount;
                document.getElementById('progressPercent').textContent = progressPercent + '%';
                document.getElementById('progressBar').style.width = progressPercent + '%';

                // Update trend
                document.getElementById('totalTasksTrend').textContent = '→';
                document.getElementById('completedTrend').textContent = completedCount > 0 ? '↑' : '-';

            } catch (error) {
                console.error('Error loading task stats:', error);
            }
        }

        // ==================== PROFILE EDITING SYSTEM ====================
        const taskEditProfileBtn = document.getElementById('editProfileBtn');
        const taskEditProfileModal = document.getElementById('editProfileModal');
        const taskCloseEditModal = document.getElementById('closeEditModal');
        const taskEditAvatarInput = document.getElementById('editAvatar');
        const taskAvatarPreview = document.getElementById('avatarPreview');
        const taskEditNameInput = document.getElementById('editName');
        const taskEditBioInput = document.getElementById('editBio');
        const taskSaveProfileBtn = document.getElementById('saveProfileBtn');
        const taskCancelEditBtn = document.getElementById('cancelEditBtn');

        const taskProfileNameDisplay = document.querySelector('.profile-name');
        const taskProfileEmailDisplay = document.querySelector('.profile-email');
        const taskProfileAvatar = document.querySelector('.profile-avatar');

        // ==================== LOAD PROFILE FROM localStorage ====================
        function loadProfileFromStorage() {
            console.log('🔍 Loading profile from localStorage...');
            const savedName = localStorage.getItem('profileName');
            const savedBio = localStorage.getItem('profileBio');
            const savedAvatar = localStorage.getItem('profileAvatar');

            if (savedName && taskProfileNameDisplay) taskProfileNameDisplay.textContent = savedName;
            if (savedBio && taskProfileEmailDisplay) taskProfileEmailDisplay.textContent = savedBio;
            if (savedAvatar && taskProfileAvatar) taskProfileAvatar.src = savedAvatar;
        }

        // ==================== EDIT PROFILE MODAL MANAGEMENT ====================
        if (taskEditProfileBtn) {
            taskEditProfileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                taskEditProfileModal.style.display = 'flex';
                taskEditNameInput.value = localStorage.getItem('profileName') || '';
                taskEditBioInput.value = localStorage.getItem('profileBio') || '';
                const savedAvatar = localStorage.getItem('profileAvatar');
                if (savedAvatar) taskAvatarPreview.src = savedAvatar;
            });
        }

        if (taskCloseEditModal) {
            taskCloseEditModal.addEventListener('click', function() {
                taskEditProfileModal.style.display = 'none';
            });
        }

        if (taskCancelEditBtn) {
            taskCancelEditBtn.addEventListener('click', function() {
                taskEditProfileModal.style.display = 'none';
            });
        }

        taskEditProfileModal.addEventListener('click', function(e) {
            if (e.target === taskEditProfileModal) {
                taskEditProfileModal.style.display = 'none';
            }
        });

        // ==================== AVATAR FILE UPLOAD ====================
        if (taskEditAvatarInput) {
            taskEditAvatarInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const base64String = event.target.result;
                        taskAvatarPreview.src = base64String;
                        console.log('📝 Avatar preview updated');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // ==================== SAVE PROFILE CHANGES ====================
        if (taskSaveProfileBtn) {
            taskSaveProfileBtn.addEventListener('click', function() {
                alert('To change your profile, please navigate to the Feed page (course.html). Click on your profile picture in the sidebar to edit your profile there.');
                taskEditProfileModal.style.display = 'none';
            });
        }

        // ==================== MUTATIONOBSERVER: RESTORE PROFILE ON CHANGES ====================
        const taskObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target === taskProfileNameDisplay && taskProfileNameDisplay.textContent !== localStorage.getItem('profileName')) {
                    console.log('🔍 Profile Name changed by Supabase, restoring from localStorage...');
                    taskProfileNameDisplay.textContent = localStorage.getItem('profileName') || taskProfileNameDisplay.textContent;
                }
                if (mutation.target === taskProfileEmailDisplay && taskProfileEmailDisplay.textContent !== localStorage.getItem('profileBio')) {
                    console.log('🔍 Profile Bio changed by Supabase, restoring from localStorage...');
                    taskProfileEmailDisplay.textContent = localStorage.getItem('profileBio') || taskProfileEmailDisplay.textContent;
                }
                if (mutation.target === taskProfileAvatar && taskProfileAvatar.src !== localStorage.getItem('profileAvatar')) {
                    console.log('🔍 Profile Avatar changed by Supabase, restoring from localStorage...');
                    taskProfileAvatar.src = localStorage.getItem('profileAvatar') || taskProfileAvatar.src;
                }
            });
        });

        taskObserver.observe(taskProfileNameDisplay, { attributes: true, childList: true, subtree: true });
        taskObserver.observe(taskProfileEmailDisplay, { attributes: true, childList: true, subtree: true });
        taskObserver.observe(taskProfileAvatar, { attributes: true, childList: true, subtree: true });

        // ==================== PERIODIC RESTORATION: Every 1000ms ====================
        setInterval(function() {
            const currentName = taskProfileNameDisplay ? taskProfileNameDisplay.textContent : '';
            const savedName = localStorage.getItem('profileName');
            if (currentName !== savedName && savedName) {
                console.log('🔄 Periodic: Restoring profile name from localStorage');
                if (taskProfileNameDisplay) taskProfileNameDisplay.textContent = savedName;
            }

            const currentBio = taskProfileEmailDisplay ? taskProfileEmailDisplay.textContent : '';
            const savedBio = localStorage.getItem('profileBio');
            if (currentBio !== savedBio && savedBio) {
                console.log('🔄 Periodic: Restoring profile bio from localStorage');
                if (taskProfileEmailDisplay) taskProfileEmailDisplay.textContent = savedBio;
            }

            const currentAvatar = taskProfileAvatar ? taskProfileAvatar.src : '';
            const savedAvatar = localStorage.getItem('profileAvatar');
            if (currentAvatar !== savedAvatar && savedAvatar) {
                console.log('🔄 Periodic: Restoring profile avatar from localStorage');
                if (taskProfileAvatar) taskProfileAvatar.src = savedAvatar;
            }
        }, 1000);

        // ==================== OVERRIDE: SUPABASE populateUserProfile ====================
        const taskCheckForApp = setInterval(function() {
            if (window.app && window.app.populateUserProfile) {
                clearInterval(taskCheckForApp);
                const originalPopulate = window.app.populateUserProfile.bind(window.app);
                window.app.populateUserProfile = function() {
                    console.log('🔴 populateUserProfile called by Supabase');
                    originalPopulate();
                    setTimeout(function() {
                        loadProfileFromStorage();
                        console.log('🟢 Profile restored from localStorage after Supabase call');
                    }, 500);
                };
            }
        }, 100);

        // ==================== STORAGE EVENT LISTENER: Cross-tab Synchronization ====================
        window.addEventListener('storage', function(e) {
            if (e.key === 'profileName' || e.key === 'profileBio' || e.key === 'profileAvatar') {
                console.log('💾 Storage changed in another tab, reloading profile...');
                loadProfileFromStorage();
            }
        });

        // ==================== LOGOUT BUTTON ====================
        const taskLogoutBtn = document.querySelector('.logout-btn');
        if (taskLogoutBtn) {
            taskLogoutBtn.addEventListener('click', async () => {
                try {
                    // Clear all local storage
                    localStorage.clear();
                    sessionStorage.clear();

                    // Sign out from Supabase globally
                    const supabaseClient = await getSupabaseClient();
                    const { error } = await supabaseClient.auth.signOut({ scope: 'global' });
                    if (error) {
                        console.error('Supabase signOut error:', error);
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    // Force redirect to index after clearing everything
                    window.location.href = 'index.html';
                }
            });
        }

        // ==================== LEFT SIDEBAR TOGGLE ====================
        const taskToggleBtn = document.getElementById('interactiveTasksToggleSidebar');
        const taskSidebar = document.getElementById('leftSidebar');

        console.log('taskToggleBtn:', taskToggleBtn);
        console.log('taskSidebar:', taskSidebar);

        if (taskToggleBtn && taskSidebar) {
            taskToggleBtn.addEventListener('click', function() {
                console.log('Button clicked!');
                console.log('Before toggle:', taskSidebar.className);
                taskSidebar.classList.toggle('mobile-open');
                console.log('After toggle:', taskSidebar.className);
                console.log('Computed display:', window.getComputedStyle(taskSidebar).display);
            });
        }

        // ==================== POPULATE USER PROFILE ====================
        async function populateUserProfile() {
            try {
                console.log('🔍 populateUserProfile called');

                // First try to load from localStorage
                const savedName = localStorage.getItem('profileName');
                const savedBio = localStorage.getItem('profileBio');
                const savedAvatar = localStorage.getItem('profileAvatar');

                if (savedName || savedBio || savedAvatar) {
                    console.log('📦 Loading profile from localStorage');
                    if (savedName && document.querySelector('.profile-name')) {
                        document.querySelector('.profile-name').textContent = savedName;
                    }
                    if (savedBio && document.querySelector('.profile-email')) {
                        document.querySelector('.profile-email').textContent = savedBio;
                    }
                    if (savedAvatar && document.querySelector('.profile-avatar')) {
                        document.querySelector('.profile-avatar').src = savedAvatar;
                    }
                    return;
                }

                // If no localStorage data, load from Supabase
                console.log('🔄 No localStorage data, loading from Supabase');
                const supabaseClient = await getSupabaseClient();
                const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

                if (userError || !user) {
                    console.log('No authenticated user');
                    return;
                }

                // Fetch user profile from database
                const { data: profile, error: profileError } = await supabaseClient
                    .from('user_profiles')
                    .select('full_name, bio, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    console.error('Error fetching profile:', profileError);
                    return;
                }

                // Update UI with database data
                if (profile) {
                    console.log('📊 Loading profile from database');
                    if (profile.full_name && document.querySelector('.profile-name')) {
                        document.querySelector('.profile-name').textContent = profile.full_name;
                        localStorage.setItem('profileName', profile.full_name);
                    }
                    if (profile.bio && document.querySelector('.profile-email')) {
                        document.querySelector('.profile-email').textContent = profile.bio;
                        localStorage.setItem('profileBio', profile.bio);
                    }
                    if (profile.avatar_url && document.querySelector('.profile-avatar')) {
                        document.querySelector('.profile-avatar').src = profile.avatar_url;
                        localStorage.setItem('profileAvatar', profile.avatar_url);
                    }
                } else {
                    // No profile in database, use default values
                    console.log('📝 No profile in database, using defaults');
                    const defaultName = user.email ? user.email.split('@')[0] : 'Student';
                    if (document.querySelector('.profile-name')) {
                        document.querySelector('.profile-name').textContent = defaultName;
                        localStorage.setItem('profileName', defaultName);
                    }
                    if (document.querySelector('.profile-email')) {
                        document.querySelector('.profile-email').textContent = user.email || '';
                        localStorage.setItem('profileBio', user.email || '');
                    }
                }

            } catch (error) {
                console.error('Error in populateUserProfile:', error);
            }
        }

        // ==================== COURSE INTERFACE ====================
        // Initialize CourseInterface for shared functionality
        if (window.CourseInterface) {
            window.app = new window.CourseInterface();
        }

        // Check authentication on page load
        checkAuth();