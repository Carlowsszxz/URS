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
6. Make it **Public** (so avatars are accessible to all users)
7. Click **Create bucket**

### 2. Update Database Schema

The `posts` table needs an `author_avatar_url` column to store the avatar URL:

**SQL Command:**
```sql
ALTER TABLE posts ADD COLUMN author_avatar_url TEXT;
```

Or if creating a new table:
```sql
CREATE TABLE posts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    topic_id BIGINT,
    content TEXT NOT NULL,
    author_id UUID,
    author_name TEXT,
    author_email TEXT,
    author_avatar_url TEXT,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    image_url TEXT,
    video_url TEXT,
    poll_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Storage Bucket Policies

Make sure the `user-avatars` bucket has public read access:

**Read Policy (Public):**
- Allows anyone to view avatars
- No authentication required for reading

**Write Policy (Authenticated):**
- Allows authenticated users to upload their own avatars
- Users can only write to their own paths

**Example RLS Policy:**
```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars' AND auth.role() = 'authenticated'
    );
```

## How It Works

1. **Profile Upload**: When a user edits their profile and uploads an avatar, it's stored in the `user-avatars` bucket
2. **URL Storage**: The public URL of the avatar is saved to `profileAvatarUrl` in localStorage and the `author_avatar_url` in posts
3. **Display**: When posts are displayed, other users see the uploaded avatar instead of the default avatar

## Features Enabled

✅ Users can upload custom profile pictures
✅ Profile pictures are visible to all other users
✅ Avatar URLs are persisted in the posts table
✅ Fallback to default avatar if upload fails

## Testing

1. Login and edit your profile
2. Upload a profile picture
3. Create a post
4. Open an incognito/private window and view the post
5. Your custom avatar should be visible to other users
