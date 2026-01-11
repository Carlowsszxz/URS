// Supabase Configuration
// Initialize Supabase client - replace these with your actual credentials
const SUPABASE_URL = 'https://fpgatsvmogyjiziilmhy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZ2F0c3Ztb2d5aml6aWlsbWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTc5NTgsImV4cCI6MjA4MzMzMzk1OH0.2SVARvmYbbxs7SoLw7bACUVn9b9k2qxEsnVILh7H578';

// Initialize Supabase client
if (!window.supabaseClient && window.supabase) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Helper function to get current user session
async function getCurrentSession() {
    if (!window.supabaseClient) return null;
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    return session;
}

// Helper function to get current user
async function getCurrentUser() {
    const session = await getCurrentSession();
    return session?.user || null;
}

// Helper function to get user ID
async function getUserId() {
    const user = await getCurrentUser();
    return user?.id || null;
}

// Helper to handle auth redirects
async function checkAuthAndRedirect(redirectUrl = 'course.html') {
    const session = await getCurrentSession();
    if (!session) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Listen for auth changes
if (window.supabaseClient) {
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Store session info for easy access
        if (session) {
            window.currentUser = session.user;
            localStorage.setItem('userEmail', session.user.email);
        } else {
            window.currentUser = null;
            localStorage.removeItem('userEmail');
            // Don't redirect on signOut - let the logout button handler do it
        }
    });
}

console.log('Supabase initialized:', SUPABASE_URL);
