# Supabase Setup Instructions for Profile Avatars

## Required Supabase Configuration

### 1. Create Storage Bucket for User Avatars

To enable users to upload and share profile pictures, you need to create a storage bucket in Supabase:

**Steps:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **Create a new bucket**
5. Name it: `user-avatars`
6. **IMPORTANT: Make it PUBLIC** (toggle the "Public bucket" option ON)
7. Click **Create bucket**

### 2. Configure Storage Bucket Policies (RLS)

Go to the bucket you created and set up access policies:

**Steps:**
1. Click on the `user-avatars` bucket
2. Go to the **Policies** tab
3. Create the following policies:

**Policy 1: Public Read Access**
- Click **New Policy** → **For queries only**
- Name: `Allow public read access`
- For: `SELECT`
- USING expression: `true`
- Click **Review** then **Save policy**

**Policy 2: Authenticated Users Upload**
- Click **New Policy** → **For full access**
- Name: `Allow authenticated users to upload`
- Allowed operation: Check only `INSERT`
- USING expression: `auth.role() = 'authenticated'`
- Click **Review** then **Save policy**

**Policy 3: Users Delete Own Files**
- Click **New Policy** → **For full access**
- Name: `Allow users to delete own files`
- Allowed operation: Check only `DELETE`
- USING expression: `(storage.foldername(name))[1] = auth.jwt() ->> 'email'`
- Click **Review** then **Save policy**

### 3. Update Database Schema

Create a `user_profiles` table to store user profile data (including avatar URLs) that syncs across all devices:

**SQL Command (run in SQL Editor):**
```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    user_email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles (public)
CREATE POLICY "Allow public read" ON user_profiles
    FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

**Note:** The `author_avatar_url` column already exists in the posts table, so no additional migration is needed.

### 4. Enable CORS (if needed)

If you're getting CORS errors, update Storage CORS settings:

**Steps:**
1. Go to **Project Settings** (bottom left) → **Storage**
2. Scroll to **CORS Configuration**
3. Add or update allowed origins to include your domain:
```json
["http://localhost:3000", "https://yourdomain.com", "*"]
```

## How It Works

1. **Profile Upload**: When a user edits their profile and uploads an avatar:
   - File is uploaded to `user-avatars` bucket in Supabase Storage
   - Public URL is generated automatically
   - URL is saved to `profileAvatarUrl` in localStorage
   
2. **Post Creation**: When creating a post:
   - Avatar URL from localStorage is included in post data
   - Stored in `author_avatar_url` column in posts table
   
3. **Display**: When posts are displayed:
   - All users see the uploaded avatar from the database
   - Fallback to default avatar if URL is missing

## Troubleshooting

### "Error uploading avatar: Storage bucket not found"
- Solution: Create the `user-avatars` bucket (see Step 1)
- Check the bucket name is exactly `user-avatars` (lowercase, hyphen)

### "Error uploading avatar: 403 - Forbidden"
- Solution: Check bucket policies are set correctly
- Make sure bucket is marked as **PUBLIC**
- Verify RLS policies allow INSERT for authenticated users

### "Error uploading avatar: 413 - Payload too large"
- Solution: Image is too large
- Compress the image before uploading
- Maximum suggested size: 5MB

### "Error uploading avatar: CORS error"
- Solution: Update CORS settings in Project Settings → Storage
- Allow your domain or use "*" for development

### Avatar shows in editor but not on posts
- Solution: Make sure `author_avatar_url` column exists in posts table
- Verify avatar URL was saved to localStorage
- Check browser console for detailed error messages

## Testing

1. **Open Browser Developer Tools** (F12)
2. **Go to Application tab** → **LocalStorage** → check for:
   - `profileAvatarUrl` - should contain a Supabase URL
3. **Look at Console** for logs like:
   - `✅ Avatar uploaded successfully`
   - `🔗 Public URL: [url]`
4. **Test with another account**:
   - Open incognito window
   - View posts from first user
   - You should see their custom avatar

## Features Enabled

✅ Users can upload custom profile pictures
✅ Profile pictures are visible to all other users  
✅ Avatar URLs are persisted in posts table
✅ Fallback to default avatar if upload fails
✅ Detailed error messages for troubleshooting
