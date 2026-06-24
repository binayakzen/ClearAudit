const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// We use the Service Role Key on the backend so it can bypass RLS (Row Level Security)
// and have full admin access to the database.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };
