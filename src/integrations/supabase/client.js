import { createClient } from '@supabase/supabase-js';

// Configuration Supabase pour 224Solutions (version Node.js)
const SUPABASE_URL = 'https://vuqauasbhkfozehfmkjt.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cWF1YXNiaGtmb3plaGZta2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NjIyMDgsImV4cCI6MjA3MTEzODIwOH0.Eyzp2qTGUAGN74hbb35FoohcIRdqWIJ1O4oc9hjZyLU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
