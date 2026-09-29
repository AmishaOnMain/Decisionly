-- Decisionly Database Schema (PostgreSQL 14+)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS personal_context_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL CHECK (entry_type IN (
        'profile', 'goal', 'circumstance', 'preference',
        'constraint', 'responsibility', 'note'
    )),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    duration_type TEXT NOT NULL DEFAULT 'long_term'
        CHECK (duration_type IN ('long_term', 'temporary')),
    review_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    custom_category TEXT,
    desired_outcome TEXT,
    deadline DATE,
    constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
    assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'ready', 'analyzed', 'archived')),
    chosen_alternative_id UUID,
    chosen_at TIMESTAMPTZ,
    outcome_reflection TEXT,
    outcome_recorded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS alternatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    values JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (decision_id, name)
);

CREATE TABLE IF NOT EXISTS criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    criterion_type TEXT NOT NULL CHECK (criterion_type IN ('numeric', 'qualitative')),
    direction TEXT NOT NULL CHECK (direction IN ('higher_better', 'lower_better', 'judgment')),
    weight NUMERIC(8,4) NOT NULL CHECK (weight > 0),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (decision_id, name)
);

CREATE TABLE IF NOT EXISTS decision_context_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context_entries JSONB NOT NULL DEFAULT '[]'::jsonb,
    decision_specific_context JSONB NOT NULL DEFAULT '[]'::jsonb,
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context_snapshot_id UUID REFERENCES decision_context_snapshots(id) ON DELETE SET NULL,
    input_snapshot JSONB NOT NULL,
    deterministic_results JSONB NOT NULL,
    ai_analysis JSONB NOT NULL,
    model_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS decision_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    scenario_inputs JSONB NOT NULL,
    deterministic_results JSONB NOT NULL,
    ai_explanation JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS personal_context_user_idx ON personal_context_entries(user_id);
CREATE INDEX IF NOT EXISTS decisions_user_updated_idx ON decisions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS alternatives_decision_idx ON alternatives(decision_id, sort_order);
CREATE INDEX IF NOT EXISTS criteria_decision_idx ON criteria(decision_id, sort_order);
CREATE INDEX IF NOT EXISTS snapshots_decision_idx ON decision_context_snapshots(decision_id, created_at DESC);
CREATE INDEX IF NOT EXISTS analyses_decision_idx ON analyses(decision_id, created_at DESC);
CREATE INDEX IF NOT EXISTS scenarios_decision_idx ON decision_scenarios(decision_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON user_sessions(user_id);
