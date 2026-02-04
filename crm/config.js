/**
 * Flash Clinic CRM - Configuration
 * Environment variables for the live system
 */

const CONFIG = {
    // Supabase Configuration
    // Replace these with your actual keys from Supabase Settings > API
    SUPABASE_URL: "https://yrlxpabmxezbcftxqivs.supabase.co",
    SUPABASE_ANON_KEY: "your-anon-key-here", // REPLACE THIS with your actual anon key
    
    // Feature Flags
    USE_SUPABASE: true,
    DEBUG_MODE: true,
    
    // API Endpoints
    WEBHOOK_ONBOARDING: "https://your-webhook-url.com/onboarding",
    
    // Aesthetic Settings
    THEME: "cyber-medicine"
};

// Export for browser
if (typeof window !== 'undefined') {
    window.FLASH_CONFIG = CONFIG;
}
