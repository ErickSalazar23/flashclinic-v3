"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.getSupabaseClient = getSupabaseClient;
const supabase_js_1 = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
let supabaseInstance = null;
if (SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)) {
    // Prefer service role key for server-side operations (bypasses RLS)
    // Fall back to anon key for client-side or development
    const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    supabaseInstance = (0, supabase_js_1.createClient)(SUPABASE_URL, key);
}
function getSupabaseClient() {
    if (!supabaseInstance) {
        throw new Error("Supabase client not initialized. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) environment variables.");
    }
    return supabaseInstance;
}
exports.supabase = supabaseInstance;
