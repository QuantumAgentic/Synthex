#!/usr/bin/env node

/**
 * Synthex Setup Script
 * Initializes the database and downloads initial data
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Synthex Setup\n');

// Step 1: Create directories
console.log('📁 Creating directories...');
const dirs = [
  join(rootDir, 'data'),
  join(rootDir, 'backend/data'),
];

for (const dir of dirs) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`   ✓ Created ${dir}`);
  } else {
    console.log(`   ✓ ${dir} exists`);
  }
}
console.log('');

// Step 2: Create .env files if they don't exist
console.log('📝 Creating environment files...');

const backendEnvPath = join(rootDir, 'backend/.env');
if (!existsSync(backendEnvPath)) {
  const backendEnvContent = `# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./data/synthex.db

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Embedding Model
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
EMBEDDING_DIMENSIONS=384

# Cache Settings
CACHE_SEARCH_TTL=900
CACHE_EMBEDDING_TTL=3600

# Data Polling (optional - set to 0 to disable)
POLLING_INTERVAL_MINUTES=15
`;
  writeFileSync(backendEnvPath, backendEnvContent);
  console.log('   ✓ Created backend/.env');
} else {
  console.log('   ✓ backend/.env exists');
}

const frontendEnvPath = join(rootDir, 'frontend/.env');
if (!existsSync(frontendEnvPath)) {
  const frontendEnvContent = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
`;
  writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('   ✓ Created frontend/.env');
} else {
  console.log('   ✓ frontend/.env exists');
}
console.log('');

// Step 3: Install dependencies
console.log('📦 Installing dependencies...');
console.log('   This may take a few minutes...\n');

async function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

try {
  console.log('   Installing backend dependencies...');
  await runCommand('npm', ['install'], join(rootDir, 'backend'));
  console.log('   ✓ Backend dependencies installed\n');

  console.log('   Installing frontend dependencies...');
  await runCommand('npm', ['install'], join(rootDir, 'frontend'));
  console.log('   ✓ Frontend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 4: Initialize database
console.log('🗄️  Initializing database...');
console.log('   This will fetch services from Bazaar and generate embeddings...');
console.log('   This may take 5-10 minutes depending on your internet and CPU.\n');

try {
  await runCommand('node', ['scripts/init-database.js'], rootDir);
  console.log('   ✓ Database initialized\n');
} catch (error) {
  console.error('❌ Failed to initialize database:', error.message);
  console.log('\nYou can initialize the database later by running:');
  console.log('   node scripts/init-database.js\n');
}

// Done!
console.log('✅ Setup complete!\n');
console.log('To start Synthex, run:');
console.log('   npm run dev\n');
console.log('Or start backend and frontend separately:');
console.log('   npm run dev:backend');
console.log('   npm run dev:frontend\n');
