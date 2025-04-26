import { createClient } from '@supabase/supabase-js'
import { getEnvVariable } from '../envUtil'

// Initialize the Supabase client
const supabaseUrl = getEnvVariable('VUE_APP_SUPABASE_URL')
const supabaseAnonKey = getEnvVariable('VUE_APP_SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
