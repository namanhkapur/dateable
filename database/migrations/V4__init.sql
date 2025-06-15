-- USERS
CREATE TABLE users (
  LIKE template.base_table INCLUDING ALL,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL
);

-- ASSETS
CREATE TABLE assets (
  LIKE template.base_table INCLUDING ALL,
  uploaded_by BIGINT REFERENCES users(id),
  type TEXT CHECK (type IN ('photo', 'video', 'voice')),
  url TEXT NOT NULL,
  caption TEXT
);

-- PROMPTS
CREATE TABLE prompts (
  LIKE template.base_table INCLUDING ALL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'voice', 'multi'))
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
  type TEXT CHECK (type IN ('photo', 'video', 'prompt_text', 'prompt_voice', 'two_truths_lie')),
  asset_id BIGINT REFERENCES assets(id),
  prompt_id BIGINT REFERENCES prompts(id),
  text_response TEXT,
  sub_responses JSONB
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