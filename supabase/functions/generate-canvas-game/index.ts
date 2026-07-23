import { aiFetch } from "../_shared/aiFetch.ts";
import { requireAuth } from "../_shared/authGuard.ts";

// generate-canvas-game — AI Level Designer for Coordinate Canvas slides.
// Returns { instruction, instruction_audio, background_image?, elements: CanvasElement[] }
// Uses Lovable AI Gateway with tool-calling for structured output.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ReqBody {
  prompt: string;
  hub: 'playground' | 'academy' | 'success';
  mode?: 'drag' | 'reveal' | 'mixed';
  target_vocab?: string[];
  interests?: string;
  specific_needs?: string;
}

const HUB_DIRECTIVES: Record<string, string> = {
  playground:
    'Audience: kids 4-10. Use simple vocabulary, large items (width 14-22%), playful background. 4-6 elements max.',
  academy:
    'Audience: teens. Use moderate vocabulary, medium items (width 8-14%). 5-8 elements.',
  success:
    'Audience: adult professionals. Business / scenario context, clean items (width 6-12%). 6-10 elements.',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const _auth = await requireAuth(req, { allowedRoles: ["admin","content_creator","teacher"] });
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = (await req.json()) as ReqBody;
    if (!body?.prompt) {
      return json({ error: 'prompt is required' }, 400);
    }
    const hub = body.hub || 'playground';
    const mode = body.mode || 'drag';
    const anchor = [
      body.interests ? `🎯 CREATIVE ANCHOR — bias element themes toward student interests: ${body.interests}.` : '',
      body.specific_needs ? `🛠 SPECIFIC NEEDS: ${body.specific_needs}.` : '',
    ].filter(Boolean).join('\n');

    const system = `You are a Level Designer for an ESL educational game canvas.
The canvas is a 16:9 box; ALL coordinates are PERCENTAGES from 0 to 100.
Layout rules:
- Place draggable items along the bottom edge: y between 75 and 92.
- Place targets (drop zones) in the upper half: y between 20 and 50.
- For each draggable, set target_x/target_y to land it onto its matching target, and snap_tolerance: 10.
- For reveal slides, place the "hider" element at the same x/y as the hidden element below it, and give the hider a HIGHER z_index.
- Never let elements overlap each other unless one is intentionally hiding another (reveal mode).
- Element width should be 8-22% of canvas; height auto.
- Provide an "instruction" sentence the student will hear.
${HUB_DIRECTIVES[hub]}
${anchor}
Mode: ${mode}.
Return ONLY valid structured data via the tool call.`;

    const tool = {
      type: 'function',
      function: {
        name: 'design_canvas_game',
        description: 'Return the JSON for a coordinate-based canvas game.',
        parameters: {
          type: 'object',
          properties: {
            instruction: { type: 'string' },
            background_image: { type: 'string' },
            elements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string', enum: ['image', 'text', 'shape'] },
                  src: { type: 'string', description: 'image URL — leave empty if not available' },
                  text: { type: 'string' },
                  color: { type: 'string' },
                  x: { type: 'number' },
                  y: { type: 'number' },
                  width: { type: 'number' },
                  z_index: { type: 'number' },
                  interaction: { type: 'string', enum: ['none', 'draggable', 'reveal', 'target'] },
                  target_x: { type: 'number' },
                  target_y: { type: 'number' },
                  snap_tolerance: { type: 'number' },
                  success_sfx: { type: 'string' },
                  reveal_anim: { type: 'string', enum: ['fade', 'lift', 'shrink', 'fly'] },
                  reveal_sfx: { type: 'string' },
                },
                required: ['id', 'type', 'x', 'y', 'width', 'interaction'],
              },
            },
          },
          required: ['instruction', 'elements'],
        },
      },
    };

    const aiResp = await aiFetch('https://ai-gateway.internal/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Design a ${mode} canvas game for: ${body.prompt}${body.target_vocab?.length ? `\nTarget vocabulary: ${body.target_vocab.join(', ')}` : ''}` },
        ],
        tools: [tool],
        tool_choice: { type: 'function', function: { name: 'design_canvas_game' } },
      }),
    });

    if (aiResp.status === 429) return json({ error: 'Rate limited, try again shortly' }, 429);
    if (aiResp.status === 402) return json({ error: 'Add credits to your Lovable AI workspace' }, 402);
    if (!aiResp.ok) return json({ error: `AI gateway error ${aiResp.status}` }, 500);

    const data = await aiResp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) return json({ error: 'No tool call returned' }, 500);
    const args = JSON.parse(call.function.arguments || '{}');

    const elements = sanitize(args.elements || []);
    if (!elements.length) {
      return json({
        elements: fallback(mode),
        instruction: args.instruction || 'Drag the items into the right place!',
        instruction_audio: args.instruction || 'Drag the items into the right place!',
      });
    }

    return json({
      elements,
      instruction: args.instruction,
      instruction_audio: args.instruction,
      background_image: args.background_image,
    });
  } catch (e) {
    console.error('generate-canvas-game error', e);
    return json({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function clamp(n: number, lo: number, hi: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

function sanitize(raw: any[]): any[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r, i) => {
    const interaction = ['draggable', 'reveal', 'target', 'none'].includes(r?.interaction) ? r.interaction : 'none';
    const out: any = {
      id: String(r?.id ?? `el_${i}`),
      type: ['image', 'text', 'shape'].includes(r?.type) ? r.type : 'image',
      src: r?.src,
      text: r?.text,
      color: r?.color,
      x: clamp(Number(r?.x), 0, 100),
      y: clamp(Number(r?.y), 0, 100),
      width: clamp(Number(r?.width), 4, 60),
      z_index: r?.z_index ?? 1,
      interaction,
    };
    if (interaction === 'draggable') {
      out.target_x = clamp(Number(r?.target_x ?? out.x), 0, 100);
      out.target_y = clamp(Number(r?.target_y ?? out.y), 0, 100);
      out.snap_tolerance = r?.snap_tolerance ?? 10;
      out.success_sfx = r?.success_sfx || 'Correct!';
    }
    if (interaction === 'reveal') {
      out.reveal_anim = ['fade', 'lift', 'shrink', 'fly'].includes(r?.reveal_anim) ? r.reveal_anim : 'lift';
      out.reveal_sfx = r?.reveal_sfx || '';
    }
    return out;
  }).filter(e => e.x >= 0 && e.y >= 0);
}

function fallback(mode: string) {
  if (mode === 'reveal') {
    return [
      { id: 'hidden', type: 'text', text: '🌞', x: 50, y: 40, width: 18, z_index: 1, interaction: 'none', color: '#fde68a' },
      { id: 'hider', type: 'text', text: '☁️', x: 50, y: 40, width: 22, z_index: 5, interaction: 'reveal', reveal_anim: 'fly', reveal_sfx: 'The sun is shining!' },
    ];
  }
  return [
    { id: 'basket', type: 'shape', x: 70, y: 35, width: 18, z_index: 1, interaction: 'target', color: '#a7f3d0', text: 'BASKET' },
    { id: 'apple', type: 'text', text: '🍎', x: 15, y: 80, width: 12, z_index: 3, interaction: 'draggable', target_x: 70, target_y: 35, snap_tolerance: 12, success_sfx: 'Apple in the basket!' },
    { id: 'banana', type: 'text', text: '🍌', x: 35, y: 80, width: 12, z_index: 3, interaction: 'draggable', target_x: 70, target_y: 35, snap_tolerance: 12, success_sfx: 'Banana in the basket!' },
  ];
}
