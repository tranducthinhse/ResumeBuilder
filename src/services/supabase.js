import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ptyvzzfjpmjcqsixrcyo.supabase.co' // Lấy từ Dashboard
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eXZ6emZqcG1qY3FzaXhyY3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNDU5MDcsImV4cCI6MjA3OTYyMTkwN30.1xh152zn2mVNAgQu5jaeTTLp6F5qW00X9idP4kID0yo' // Lấy từ Dashboard

export const supabase = createClient(supabaseUrl, supabaseKey)