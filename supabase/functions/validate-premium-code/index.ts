
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { code, userId } = await req.json()

    if (!code || !userId) {
      return new Response(
        JSON.stringify({ error: 'Code and userId are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate and use the premium code
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('premium_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_used', false)
      .single()

    if (codeError || !codeData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or already used premium code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if user already has premium
    const { data: userStatus } = await supabaseAdmin
      .from('user_premium_status')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (userStatus?.is_premium) {
      return new Response(
        JSON.stringify({ error: 'User already has premium access' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Mark code as used
    const { error: updateCodeError } = await supabaseAdmin
      .from('premium_codes')
      .update({
        is_used: true,
        used_by: userId,
        used_at: new Date().toISOString()
      })
      .eq('code', code.trim().toUpperCase())

    if (updateCodeError) {
      return new Response(
        JSON.stringify({ error: 'Failed to activate premium code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update or create user premium status
    const { error: statusError } = await supabaseAdmin
      .from('user_premium_status')
      .upsert({
        user_id: userId,
        is_premium: true,
        premium_code_used: code.trim().toUpperCase(),
        activated_at: new Date().toISOString()
      })

    if (statusError) {
      return new Response(
        JSON.stringify({ error: 'Failed to activate premium status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Premium activated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in validate-premium-code function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
