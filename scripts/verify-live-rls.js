const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

let envConfig = {};
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        envConfig[k] = v;
      }
    }
  });
} catch (_) {}

const url = envConfig.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = envConfig.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const client = createClient(url, key);

async function runVerification() {
  console.log('1. Checking connection to Supabase...');
  console.log('URL:', url);

  // Check unauthenticated access
  const { data: unauthData, error: unauthError } = await client
    .from('saved_items')
    .select('*');

  if (unauthError) {
    console.log('Unauthenticated access blocked/error as expected:', unauthError.message);
  } else {
    console.log('Unauthenticated select returned rows:', unauthData.length);
    if (unauthData.length === 0) {
      console.log('PASS: RLS prevents unauthenticated users from reading items.');
    }
  }

  // Attempt unauthenticated insert (must fail under RLS)
  const { error: insertError } = await client
    .from('saved_items')
    .insert({
      type: 'note',
      title: 'Hacker item',
      content: 'Should fail',
    });

  if (insertError) {
    console.log('PASS: Unauthenticated insert rejected by RLS:', insertError.message);
  } else {
    console.warn('WARNING: Unauthenticated insert succeeded!');
  }

  console.log('\nRLS Verification completed.');
}

runVerification().catch(console.error);
