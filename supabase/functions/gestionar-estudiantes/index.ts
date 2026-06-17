import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'No autorizado' }, 401)

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: profile, error: profileError } = await userClient
    .from('profiles')
    .select('role')
    .single()

  if (profileError || profile?.role !== 'teacher') {
    return json({ error: 'Acceso denegado' }, 403)
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const body = await req.json()
  const { action } = body

  if (action === 'create') {
    const { email, password, fullName } = body

    if (!email || !password || !fullName) {
      return json({ error: 'Faltan campos: email, password, fullName' }, 400)
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      user_metadata: { role: 'student', full_name: fullName },
      email_confirm: true,
    })

    if (error) return json({ error: error.message }, 400)
    return json({ user: data.user }, 201)
  }

  if (action === 'delete') {
    const { userId } = body

    if (!userId) return json({ error: 'Falta userId' }, 400)

    const { data: target, error: targetError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (targetError) return json({ error: 'Estudiante no encontrado' }, 404)
    if (target.role !== 'student') return json({ error: 'Solo se pueden eliminar estudiantes' }, 400)

    const { error } = await adminClient.auth.admin.deleteUser(userId)
    if (error) return json({ error: error.message }, 400)

    return json({ success: true })
  }

  return json({ error: 'Acción inválida. Usa create o delete' }, 400)
})
