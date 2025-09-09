import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://lhdwtrfowovkpqwbixbg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZHd0cmZvd292a3Bxd2JpeGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTk0MDEsImV4cCI6MjA2NTk3NTQwMX0.LG8wS3JAngPLNowZIPEqQXRZ6xockPQYEXyNdU6b61Y';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };