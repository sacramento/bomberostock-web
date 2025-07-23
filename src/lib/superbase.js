// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pztmzivnqsspeeqlwmrc.supabase.co'  // ← Pegá tu URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dG16aXZucXNzcGVlcWx3bXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTc5NjcsImV4cCI6MjA2ODg3Mzk2N30.488YVIY4hs3gyxIt__f4rJA3Ce-TrxCaTAotE9Ot3yk'  // ← Pegá tu Anon Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)