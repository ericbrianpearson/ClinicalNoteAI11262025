import { db } from './db';
import { sql } from 'drizzle-orm';

export async function createAITables() {
  try {
    // Create ai_insights table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ai_insights (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        priority TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        recommendation TEXT,
        metrics JSONB,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        is_actionable BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create workflow_tasks table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workflow_tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        encounter_id INTEGER,
        task_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        priority INTEGER NOT NULL DEFAULT 5,
        title TEXT NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        automation_rules JSONB,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (encounter_id) REFERENCES encounters(id)
      )
    `);

    // Create smart_suggestions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS smart_suggestions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        encounter_id INTEGER,
        category TEXT NOT NULL,
        suggestion TEXT NOT NULL,
        confidence INTEGER NOT NULL,
        reasoning TEXT NOT NULL,
        references TEXT[],
        is_accepted BOOLEAN,
        is_rejected BOOLEAN,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (encounter_id) REFERENCES encounters(id)
      )
    `);

    console.log('AI Assistant tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating AI tables:', error);
    return false;
  }
}

// Auto-execute migration
createAITables();