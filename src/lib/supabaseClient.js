import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xcereebvfbcehcphbayc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZXJlZWJ2ZmJjZWhjcGhiYXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTA2MzAsImV4cCI6MjA3NDIyNjYzMH0.EEbYd0xOsxR6JUz1c70iEjDH1Y98JiUYBxuIVX0KlC8';
export const supabase = createClient(supabaseUrl, supabaseKey);


export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
