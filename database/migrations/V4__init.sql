-- USERS
CREATE TABLE users (
  LIKE template.base_table INCLUDING ALL,
  name TEXT NOT NULL,
  username TEXT UNIQUE CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$'),
  -- E.164 phone number format validation:
  -- ACCEPTED: +1234567890, +441234567890, +33123456789, +8613812345678
  phone TEXT UNIQUE CHECK (phone ~ '^\+[1-9]\d{1,14}$'),
  -- Supabase auth fields
  auth_id UUID UNIQUE,
  email TEXT UNIQUE
);

-- Add comments for Supabase fields
COMMENT ON COLUMN users.auth_id IS 'Supabase auth user ID (UUID)';
COMMENT ON COLUMN users.email IS 'User email address from Supabase auth';
COMMENT ON COLUMN users.username IS 'Unique username for profile routing (3-20 chars, alphanumeric, _, -)';

-- Add indexes for faster lookups
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);

-- ASSETS
CREATE TABLE assets (
  LIKE template.base_table INCLUDING ALL,
  uploaded_by BIGINT REFERENCES users(id),
  type TEXT CHECK (type IN ('photo', 'video', 'voice')),
  url TEXT UNIQUE NOT NULL,
  caption TEXT
);


-- PROFILE DRAFTS
CREATE TABLE profile_drafts (
  LIKE template.base_table INCLUDING ALL,
  subject_user_id BIGINT REFERENCES users(id),
  created_by_user_id BIGINT REFERENCES users(id),
  is_finalized BOOLEAN DEFAULT FALSE
);

-- PROFILE ELEMENTS
CREATE TABLE profile_elements (
  LIKE template.base_table INCLUDING ALL,
  profile_draft_id BIGINT REFERENCES profile_drafts(id) ON DELETE CASCADE,
  position INT NOT NULL,
  type TEXT CHECK (type IN ('photo', 'video', 'prompt_text', 'prompt_voice')),
  asset_id BIGINT REFERENCES assets(id),
  prompt TEXT CHECK (
    (type IN ('prompt_text', 'prompt_voice') AND prompt IS NOT NULL) OR
    (type NOT IN ('prompt_text', 'prompt_voice') AND prompt IS NULL)
  ),
  text_response TEXT,
  sub_responses JSONB,
  UNIQUE(profile_draft_id, position)
);

-- COMMENTS
CREATE TABLE comments (
  LIKE template.base_table INCLUDING ALL,
  profile_draft_id BIGINT REFERENCES profile_drafts(id) ON DELETE CASCADE,
  author_id BIGINT REFERENCES users(id),
  type TEXT CHECK (type IN ('system', 'user')) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB
);