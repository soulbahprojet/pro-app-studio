import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vuqauasbhkfozehfmkjt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cWF1YXNiaGtmb3plaGZta2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NjIyMDgsImV4cCI6MjA3MTEzODIwOH0.Eyzp2qTGUAGN74hbb35FoohcIRdqWIJ1O4oc9hjZyLU';
export const supabase = createClient(supabaseUrl, supabaseKey);


export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
