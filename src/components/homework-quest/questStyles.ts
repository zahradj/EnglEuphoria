/** Styles for <HomeworkQuest />. Scoped under `.hq`; the quest's world sets
 *  --hq-accent / --hq-accent2. Deliberately one look per world (night castle
 *  or daylight), not tied to the app's light/dark mode — it's a game world. */
export const QUEST_CSS = `
.hq { --gold:#f5c542; --ember:#fe6a2f; --mint:#34d399; --rose:#fb7185; --parchment:#fff6df; --ink:#2a1459; height:100dvh; overflow:hidden; display:flex; flex-direction:column; font-family:"Lexend",system-ui,-apple-system,"Segoe UI",sans-serif; color:#f4efff; }
.hq { position:relative; }
.hq-forest { position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:0; }
.hq-forest::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,.14); }
.hq.night .hq-forest::after { background:rgba(20,8,50,.62); }
.hq-wrap { position:relative; z-index:1; }
.hq.night { background: radial-gradient(ellipse at 50% 0%, #2b1760, #140b2e 65%); }
.hq.day { background: radial-gradient(ellipse at 50% 0%, #fff3d6, #ffe0b8 40%, #f7b98a 100%); color:#3a1f0d; --parchment:#ffffff; }
.hq * { box-sizing:border-box; }
.hq button { font:inherit; cursor:pointer; border:0; color:inherit; background:none; }
.hq button:focus-visible { outline:3px solid var(--hq-accent); outline-offset:3px; }
.hq-wrap { flex:1; min-height:0; width:100%; max-width:1280px; margin:0 auto; padding:8px 14px calc(10px + env(safe-area-inset-bottom,0px)); display:flex; flex-direction:column; gap:8px; }
.hq-play { flex:1; min-height:0; display:flex; flex-direction:column; gap:8px; }
.hq-stagebox { flex:1; min-height:0; width:100%; display:flex; align-items:center; justify-content:center; }
.hq-hud { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.hq-brand { display:flex; align-items:center; gap:10px; margin-right:auto; min-width:0; }
.hq-brand img { width:44px; height:44px; object-fit:contain; animation:hq-bob 3s ease-in-out infinite; filter:drop-shadow(0 4px 10px rgba(0,0,0,.4)); }
.hq-brand h1 { font-family:"Grandstander","Trebuchet MS",system-ui,sans-serif; font-weight:900; font-size:clamp(20px,3vw,28px); margin:0; line-height:1; }
.hq-brand small { display:block; opacity:.75; font-size:12px; letter-spacing:.08em; text-transform:uppercase; margin-top:4px; }
.hq-pill { display:inline-flex; align-items:center; gap:6px; padding:7px 12px; border-radius:999px; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); font-weight:700; font-variant-numeric:tabular-nums; }
.hq.day .hq-pill { background:rgba(255,255,255,.7); border-color:rgba(0,0,0,.08); }
.hq-pill.gold { color:var(--hq-accent); }
.hq.day .hq-pill.gold { color:#b45309; }
.hq-icon { width:40px; height:40px; border-radius:12px; background:rgba(255,255,255,.12)!important; border:1px solid rgba(255,255,255,.2)!important; font-size:18px; }
.hq-bar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.hq-bar.center { justify-content:center; }
.hq-bar h2 { font-family:"Grandstander","Trebuchet MS",system-ui,sans-serif; font-weight:800; margin:0 auto 0 0; font-size:clamp(19px,2.8vw,25px); color:var(--hq-accent); }
.hq.day .hq-bar h2 { color:#c2410c; }
.hq-dots { display:flex; gap:5px; } .hq-dots i { width:9px; height:9px; border-radius:50%; background:rgba(127,127,127,.35); } .hq-dots i.on { background:var(--hq-accent); box-shadow:0 0 8px var(--hq-accent); }
.hq-btn { background:var(--ember)!important; color:#fff!important; font-weight:700; padding:12px 22px; border-radius:999px; box-shadow:0 6px 0 #b8410f; font-size:16px; }
.hq-btn.ghost { background:rgba(255,255,255,.14)!important; color:inherit!important; box-shadow:none; border:1px solid rgba(127,127,127,.35)!important; padding:9px 16px; font-size:14px; }
.hq-btn.violet { background:var(--hq-accent2)!important; box-shadow:0 6px 0 rgba(0,0,0,.35); }
.hq-btn[disabled] { opacity:.45; cursor:not-allowed; }
.hq-stage { container-type:inline-size; position:relative; flex:none; max-width:100%; border-radius:22px; overflow:hidden; border:3px solid var(--hq-accent); box-shadow:0 24px 60px rgba(0,0,0,.35); background:#0d0624; }
.hq-art { position:absolute; inset:0; background-size:cover; background-position:center; }
.hq-art.still { animation:none; }
.hq-night { position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse at 50% 40%, rgba(124,58,237,.16), rgba(20,8,50,.6) 80%); }
.hq-twinkle { position:absolute; width:5px; height:5px; border-radius:50%; background:#fff3c4; box-shadow:0 0 8px 2px rgba(255,235,170,.9); animation:hq-tw 2s ease-in-out infinite; }
.hq-path { position:absolute; inset:0; width:100%; height:100%; z-index:3; }
.hq-hear { position:absolute; left:12px; top:12px; z-index:6; background:var(--parchment)!important; color:var(--ink)!important; font-weight:800; border-radius:999px; padding:9px 14px; box-shadow:0 6px 0 rgba(0,0,0,.25); }
.hq-hear.bottom { top:auto; bottom:12px; }
.hq-caption { position:absolute; left:50%; bottom:12px; transform:translateX(-50%); z-index:6; background:rgba(20,8,50,.8); color:#fff; border:1px solid var(--hq-accent); padding:8px 14px; border-radius:14px; font-weight:700; max-width:92%; text-align:center; }
.hq-caption.hq-corner { top:12px; bottom:auto; left:auto; right:12px; transform:none; }
.hq-caption b { color:var(--gold); }
.hq-foot { opacity:.75; font-size:12.5px; text-align:center; margin:0; }
.hq-slot { position:absolute; z-index:3; border:3px dashed var(--hq-accent); background:repeating-linear-gradient(45deg,#1d1044 0 12px,#241452 12px 24px); display:grid; place-items:center; font-family:"Grandstander",system-ui,sans-serif; font-size:clamp(22px,4vw,40px); color:var(--hq-accent); transition:opacity .5s; }
.hq-slot.hover { background:rgba(245,197,66,.25); }
.hq-slot.filled { opacity:0; pointer-events:none; }
.hq-slot.now { border-style:solid; box-shadow:inset 0 0 0 3px var(--hq-accent), 0 0 24px rgba(245,197,66,.6); }
.hq-num { display:grid; place-items:center; width:clamp(34px,6vw,58px); height:clamp(34px,6vw,58px); border-radius:50%; background:var(--hq-accent); color:var(--ink); font-weight:900; box-shadow:0 4px 0 rgba(0,0,0,.35); }
.hq-slot.now .hq-num { animation:hq-pulse 1s ease-in-out infinite; }
.hq-tray { flex:none; display:flex; gap:10px; justify-content:center; flex-wrap:wrap; min-height:min(14vh,96px); padding:8px; border-radius:18px; background:rgba(127,127,127,.12); }
.hq-piece { width:clamp(80px,min(16vw,20vh),150px); border-radius:12px; border:4px solid #fff; box-shadow:0 8px 18px rgba(0,0,0,.45); background-repeat:no-repeat; touch-action:none; user-select:none; cursor:grab; animation:hq-wobble 3s ease-in-out infinite; }
.hq-sticker { width:clamp(64px,min(13vw,15vh),124px); height:clamp(64px,min(13vw,15vh),124px); padding:6px; touch-action:none; user-select:none; cursor:grab; filter:drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 8px 10px rgba(0,0,0,.4)); animation:hq-wobble 2.6s ease-in-out infinite; }
.hq-sticker:nth-child(2n){animation-delay:-.8s} .hq-sticker:nth-child(3n){animation-delay:-1.5s}
.hq-sticker img { width:100%; height:100%; object-fit:contain; pointer-events:none; }
.hq-dragging { z-index:90!important; cursor:grabbing; animation:none!important; position:relative; }
.hq-placed { position:absolute; z-index:5; transform:translate(-50%,-78%); height:auto; filter:drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 10px 8px rgba(0,0,0,.4)); animation:hq-land .5s cubic-bezier(.3,1.6,.5,1) both; pointer-events:none; }
.hq-zone { position:absolute; z-index:2; border-radius:16px; transition:background .2s, box-shadow .2s; }
.hq-zone.hover { background:rgba(245,197,66,.18); box-shadow:inset 0 0 0 4px var(--hq-accent); }
.hq-char { position:absolute; z-index:5; transform:translate(-50%,-88%); width:clamp(60px,10vw,110px); pointer-events:none; animation:hq-land .5s cubic-bezier(.3,1.6,.5,1) both; filter:drop-shadow(0 8px 10px rgba(0,0,0,.5)); }
.hq-char.walker { width:clamp(44px,7vw,80px); animation:hq-bob 2.2s ease-in-out infinite; transition:left .8s, top .8s; }
.hq-hot { position:absolute; z-index:4; border-radius:12px; }
.hq-hot:hover { background:rgba(255,255,255,.12)!important; }
.hq-hot.wrong { background:rgba(251,113,133,.35)!important; animation:hq-shake .45s; }
.hq-hot.right { background:rgba(52,211,153,.3)!important; box-shadow:inset 0 0 0 4px var(--mint); }
.hq-answers { flex:none; display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
.hq-big { min-width:150px; padding:clamp(10px,2vh,16px) 22px; border-radius:20px; font-family:"Grandstander",system-ui,sans-serif; font-weight:900; font-size:26px; color:#fff!important; box-shadow:0 8px 0 rgba(0,0,0,.3); }
/* The answer blocks live INSIDE the scene frame, along its bottom edge, sized from the frame's own width. */
.hq-dock { position:absolute; left:0; right:0; bottom:0; z-index:7; display:flex; gap:2.2cqw; justify-content:center; align-items:flex-end; flex-wrap:nowrap; padding:7cqw 3cqw 2.4cqw; background:linear-gradient(180deg,rgba(13,6,36,0),rgba(13,6,36,.6) 55%); }
.hq-dock .hq-card { flex:0 1 auto; width:clamp(64px,19cqw,170px); padding:1.4cqw; border-radius:2.6cqw; box-shadow:0 .9cqw 0 #b98a2e; }
.hq-dock .hq-card .em { font-size:clamp(30px,8cqw,72px); }
.hq-dock .hq-orb { width:clamp(56px,12cqw,110px); height:clamp(56px,12cqw,110px); font-size:clamp(22px,4.6cqw,40px); }
.hq-dock .hq-big { min-width:clamp(96px,20cqw,190px); padding:clamp(8px,1.6cqw,16px) clamp(12px,2.4cqw,22px); font-size:clamp(16px,3.4cqw,26px); border-radius:3cqw; }
.hq-stage:has(.hq-dock) .hq-caption:not(.hq-corner) { bottom:auto; top:12px; }
/* On a phone the wide picture is only a thin strip: give the frame more height so the blocks never cover the scene. */
@media (max-width:560px) { .hq-stage:has(.hq-dock) { aspect-ratio:4/3 !important; height:auto !important; } }
/* Word blocks / answer lines live in the frame too: a column dock (built line above the word bank). */
.hq-dock-words { flex-direction:column; align-items:center; gap:1.6cqw; padding-top:9cqw; }
.hq-dock-words .hq-built { min-height:0; padding:1.2cqw 2.4cqw; border-radius:2.4cqw; font-size:clamp(14px,2.6cqw,24px); box-shadow:0 .6cqw 0 rgba(0,0,0,.25); max-width:94%; }
.hq-dock-words .hq-built .hq-w { font-size:clamp(14px,2.8cqw,26px); padding:.2em .4em; }
.hq-dock-words .hq-words { gap:1.4cqw; max-width:96%; }
.hq-dock-words .hq-words .hq-w { font-size:clamp(14px,2.8cqw,26px); padding:.45em .8em; border-radius:2cqw; background:var(--parchment)!important; color:var(--ink)!important; border:2px solid var(--hq-accent)!important; box-shadow:0 .7cqw 0 #b98a2e; }
.hq-dock-words .hq-potions { gap:2.4cqw; }
.hq-dock-words .hq-potion { color:#fff; text-shadow:0 1px 3px rgba(0,0,0,.6); }
.hq-dock-words .hq-bar { margin:0; }
.hq-dock-opts { flex-wrap:wrap; align-items:stretch; padding-top:9cqw; }
.hq-dock-opts .hq-opt { flex:1 1 22cqw; max-width:44cqw; font-size:clamp(14px,2.8cqw,24px); padding:clamp(8px,1.6cqw,16px); border-radius:2.4cqw; box-shadow:0 .7cqw 0 #b98a2e; }
.hq-stage:has(.hq-dock-opts) .hq-book { inset:64px 6% auto 6%; }
@media (max-width:560px) { .hq-stage:has(.hq-dock-words), .hq-stage:has(.hq-dock-opts) { aspect-ratio:1/1 !important; } }
/* The frame never grows taller than the window (minus header and the bar/tray under it), so nothing slides below the fold. */
.hq-stage { max-width:min(100%, max(300px, calc((100dvh - 330px) * var(--ar, 1.79)))); margin-inline:auto; }
.hq-stage:has(.hq-dock) { max-width:min(100%, max(300px, calc((100dvh - 230px) * var(--ar, 1.79)))); }
@media (max-width:560px) { .hq-stage, .hq-stage:has(.hq-dock) { max-width:100%; } }
.hq-answers { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
.hq-big { min-width:150px; padding:16px 22px; border-radius:20px; font-family:"Grandstander",system-ui,sans-serif; font-weight:900; font-size:26px; color:#fff!important; box-shadow:0 8px 0 rgba(0,0,0,.3); }
.hq-big.t { background:linear-gradient(180deg,#6ee7b7,#059669)!important; } .hq-big.f { background:linear-gradient(180deg,#fda4af,#e11d48)!important; }
.hq-orb { width:clamp(70px,14vh,110px); height:clamp(70px,14vh,110px); border-radius:50%; font-family:"Grandstander",system-ui,sans-serif; font-weight:900; font-size:40px; color:#fff!important; }
.hq-orb.o0 { background:radial-gradient(circle at 35% 30%,#a78bfa,#6d28d9 70%)!important; box-shadow:0 8px 0 #3b0f8c,0 0 26px rgba(167,139,250,.6); }
.hq-orb.o1 { background:radial-gradient(circle at 35% 30%,#7dd3fc,#0369a1 70%)!important; box-shadow:0 8px 0 #0c4a6e,0 0 26px rgba(125,211,252,.55); }
.hq-orb.o2 { background:radial-gradient(circle at 35% 30%,#fcd34d,#d97706 70%)!important; box-shadow:0 8px 0 #92400e,0 0 26px rgba(252,211,77,.5); }
.hq-orb.hq-dim { filter:grayscale(.7) brightness(.9); }
.hq-orb.hq-lit { filter:none; transform:translateY(-4px); }
.hq-orb.hq-blend { background:radial-gradient(circle at 35% 30%,#fb923c,#db2777 70%)!important; box-shadow:0 8px 0 #9d174d,0 0 26px rgba(251,146,60,.6); font-size:clamp(14px,2.4cqw,22px); line-height:1.1; }
.hq-orb.hq-blend:disabled { opacity:.4; }
.hq-cards { flex:none; display:flex; justify-content:center; gap:clamp(10px,2vw,22px); flex-wrap:wrap; }
.hq-card { width:clamp(84px,min(22vw,21vh),190px); background:linear-gradient(180deg,#fffaf0,#f6e7c4)!important; border-radius:22px; padding:10px; aspect-ratio:1; transition:transform .15s; display:grid; place-items:center; box-shadow:0 10px 0 #b98a2e; }
.hq-card:hover { transform:translateY(-6px) rotate(-2deg); } .hq-card img { width:85%; height:85%; object-fit:contain; } .hq-card .em { font-size:clamp(40px,9vh,72px); }
.hq-card.ok { background:linear-gradient(180deg,#d1fae5,#86efac)!important; box-shadow:0 10px 0 #059669; animation:hq-land .4s both; }
.hq-words { flex:none; display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
.hq-w { font-family:"Grandstander",system-ui,sans-serif; font-weight:800; font-size:clamp(18px,2.6vw,26px); padding:8px 14px; border-radius:14px; background:rgba(127,127,127,.18)!important; border:2px solid rgba(127,127,127,.35)!important; }
.hq-w b { color:var(--hq-accent); text-decoration:underline; text-underline-offset:5px; }
.hq-w.ink, .hq-built .hq-w { background:transparent!important; border:0!important; color:var(--ink); animation:hq-land .35s both; }
.hq-w.ink b, .hq-built .hq-w b { color:var(--hq-accent2); }
.hq-built { flex:none; min-height:min(9vh,64px); display:flex; flex-wrap:wrap; gap:8px; justify-content:center; align-items:center; padding:10px; border-radius:18px; background:var(--parchment); color:var(--ink); }
.hq-built .ph { color:#9a8bc7; font-weight:600; }
.hq-book { position:absolute; inset:7% 10%; z-index:5; background:linear-gradient(180deg,#fff8e7,#f6e3b4); color:var(--ink); border-radius:18px; border:4px solid var(--hq-accent); box-shadow:0 0 50px rgba(124,58,237,.5); padding:clamp(12px,2.5vw,26px); overflow:auto; }
.hq-book p { margin:0 0 .45em; font-family:"Grandstander",system-ui,sans-serif; font-weight:700; font-size:clamp(16px,2.4vw,24px); line-height:1.35; }
.hq-book p b { color:var(--hq-accent2); }
.hq-book .big { font-size:clamp(20px,3vw,30px); } .hq-book .hint { font-size:14px; font-family:"Lexend",system-ui,sans-serif; color:#6b5aa0; }
.hq-opts { flex:none; display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:10px; }
.hq-opt { background:var(--parchment)!important; color:var(--ink)!important; font-weight:800; padding:14px; border-radius:16px; box-shadow:0 6px 0 #b98a2e; }
.hq-opt.ok { background:#bbf7d0!important; }
.hq-potions { display:flex; justify-content:center; gap:22px; flex-wrap:wrap; }
.hq-potion { display:flex; flex-direction:column; align-items:center; gap:4px; font-weight:700; font-size:13px; opacity:.7; } .hq-potion.on { opacity:1; color:var(--hq-accent); }
.hq-flask { width:50px; height:64px; border-radius:12px 12px 24px 24px; border:3px solid rgba(255,255,255,.7); position:relative; overflow:hidden; }
.hq-flask::after { content:""; position:absolute; inset:auto 0 0; height:var(--fill,0%); background:linear-gradient(180deg,#c084fc,#7c3aed); transition:height .8s cubic-bezier(.3,1.4,.5,1); }
.hq-chest { position:absolute; left:50%; top:56%; transform:translate(-50%,-50%); width:clamp(140px,26%,300px); z-index:5; --glow:0; animation:hq-wobble 2.6s ease-in-out infinite; }
.hq-chest img { width:100%; height:auto; display:block; position:relative; filter:drop-shadow(0 14px 14px rgba(0,0,0,.45)); pointer-events:none; }
.hq-chest .glow { position:absolute; inset:-18%; border-radius:50%; background:radial-gradient(circle,rgba(255,226,120,.95),rgba(255,200,60,0) 65%); opacity:calc(.15 + var(--glow) * .85); transition:opacity .3s; pointer-events:none; }
.hq-chest.open { animation:hq-land .6s cubic-bezier(.3,1.6,.5,1) both; } .hq-chest.open .glow { opacity:1; animation:hq-pulse 1.4s ease-in-out infinite; }
.hq-coin { position:absolute; left:50%; top:35%; font-size:30px; pointer-events:none; animation:hq-coin 1.1s cubic-bezier(.2,.8,.4,1) both; }
.hq-node { position:absolute; z-index:4; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:4px; }
.hq-node .gem { position:relative; width:clamp(54px,min(9vw,13vh),96px); height:clamp(54px,min(9vw,13vh),96px); border-radius:50%; display:grid; place-items:center; font-size:clamp(24px,min(4.4vw,6vh),44px); background:radial-gradient(circle at 35% 30%,#ffffff,#ffe9a8 45%,var(--hq-accent) 100%); border:4px solid #fff; box-shadow:0 7px 0 rgba(0,0,0,.35),0 10px 22px rgba(0,0,0,.35); }
.hq-node .gem img { border-radius:50%; }
.hq-node .num { position:absolute; top:-6px; left:-6px; width:26px; height:26px; border-radius:50%; background:var(--hq-accent2); color:#fff; font-style:normal; font-weight:900; font-size:14px; display:grid; place-items:center; border:2px solid #fff; }
.hq-node .play { font-weight:900; font-size:13px; color:#fff; background:var(--ember); padding:3px 10px; border-radius:999px; box-shadow:0 3px 0 #b8410f; animation:hq-pulse 1s ease-in-out infinite; }
.hq-node .got { display:flex; gap:1px; font-size:15px; line-height:1; } .hq-node .got b { color:rgba(255,255,255,.55); text-shadow:0 1px 2px rgba(0,0,0,.6); } .hq-node .got b.on { color:var(--gold); }
.hq-node .lbl { font-weight:800; font-size:12px; background:rgba(20,8,50,.82); color:#fff; padding:3px 8px; border-radius:999px; white-space:nowrap; }
.hq-node.next .gem { animation:hq-glow 1.6s ease-in-out infinite, hq-hop 1.6s ease-in-out infinite; } .hq-node.done .gem { border-color:var(--mint); } .hq-node.locked .gem { filter:grayscale(1) brightness(.85); } .hq-node.locked { opacity:.8; }
.hq-trail { stroke-width:7px; stroke-dasharray:2 2.2; animation:hq-march 1.6s linear infinite; filter:drop-shadow(0 2px 2px rgba(0,0,0,.45)); }
.hq-go { font-size:18px!important; padding:14px 28px!important; animation:hq-pulse 1.4s ease-in-out infinite; }
.hq-combo { background:linear-gradient(180deg,#fdba74,#f97316)!important; color:#fff!important; border:0!important; animation:hq-land .35s cubic-bezier(.3,1.6,.5,1) both; }
.hq-splash { position:fixed; inset:0; z-index:98; display:grid; place-items:center; background:radial-gradient(circle,rgba(20,8,50,.55),rgba(20,8,50,.85)); animation:hq-fade .2s both; }
.hq-splash-card { display:flex; flex-direction:column; align-items:center; gap:clamp(4px,1.4vh,12px); padding:clamp(16px,4vh,34px) clamp(26px,6vw,60px); border-radius:28px; background:linear-gradient(180deg,#fff8e7,#ffe2a6); color:#3a1f0d; border:5px solid #fff; box-shadow:0 14px 0 rgba(0,0,0,.25),0 30px 60px rgba(0,0,0,.45); animation:hq-zoom .45s cubic-bezier(.3,1.6,.5,1) both; }
.hq-splash-card .lv { font-family:"Grandstander",system-ui,sans-serif; font-weight:900; font-size:clamp(20px,4vh,30px); color:var(--hq-accent2); letter-spacing:.06em; }
.hq-splash-card .ic { width:clamp(70px,16vh,130px); height:clamp(70px,16vh,130px); border-radius:50%; display:grid; place-items:center; font-size:clamp(40px,10vh,80px); background:radial-gradient(circle at 35% 30%,#fff,var(--hq-accent)); border:4px solid #fff; box-shadow:0 8px 0 rgba(0,0,0,.2); }
.hq-splash-card .nm { font-family:"Grandstander",system-ui,sans-serif; font-weight:900; font-size:clamp(22px,5vh,40px); }
.hq-splash-card .go { font-family:"Grandstander",system-ui,sans-serif; font-weight:900; font-size:clamp(30px,7vh,56px); color:#fff; background:var(--ember); padding:2px 26px; border-radius:999px; box-shadow:0 6px 0 #b8410f; animation:hq-pulse .6s ease-in-out infinite; }
.hq-splash-card .go.small { font-size:clamp(16px,3vh,22px); padding:8px 20px; animation:none; }
.hq-splash-card .stars { display:flex; gap:10px; font-size:clamp(46px,11vh,90px); line-height:1; }
.hq-splash-card .stars b { color:#d6d3d1; animation:hq-zoom .45s cubic-bezier(.3,1.6,.5,1) both; } .hq-splash-card .stars b.on { color:var(--gold); text-shadow:0 0 18px rgba(245,197,66,.9),0 4px 0 #b45309; }
.hq-toast { position:fixed; left:50%; bottom:calc(22px + env(safe-area-inset-bottom,0px)); transform:translateX(-50%); background:var(--parchment); color:var(--ink); padding:11px 18px; border-radius:16px; font-weight:800; box-shadow:0 16px 40px rgba(0,0,0,.4); z-index:95; animation:hq-land .3s both; }
.hq-flystar { position:fixed; z-index:96; font-size:28px; pointer-events:none; transition:transform .8s cubic-bezier(.5,-.3,.6,1), opacity .8s; }
.hq-bad { animation:hq-shake .45s!important; }
@keyframes hq-march { to { stroke-dashoffset:-8.4; } }
@keyframes hq-hop { 0%,100% { translate:0 0; } 50% { translate:0 -8px; } }
@keyframes hq-zoom { 0% { opacity:0; scale:.4; } 100% { opacity:1; scale:1; } }
@keyframes hq-fade { from { opacity:0; } to { opacity:1; } }
@keyframes hq-bob { 50% { transform:translateY(-6px); } }
@keyframes hq-wobble { 0%,100% { transform:rotate(-4deg); } 50% { transform:rotate(4deg) translateY(-5px); } }
@keyframes hq-land { 0% { opacity:0; scale:.3; } 100% { opacity:1; scale:1; } }
@keyframes hq-shake { 20%,60% { translate:-8px 0; } 40%,80% { translate:8px 0; } }
@keyframes hq-tw { 50% { opacity:.15; } }
@keyframes hq-glow { 50% { box-shadow:0 6px 0 rgba(0,0,0,.4), 0 0 28px 6px rgba(245,197,66,.6); } }
@keyframes hq-pulse { 50% { transform:scale(1.06); } }
@keyframes hq-coin { from { transform:translate(-50%,0) scale(.4); opacity:1; } to { transform:translate(calc(-50% + var(--dx)), var(--dy)) scale(1.1) rotate(360deg); opacity:0; } }
@media (prefers-reduced-motion: reduce) { .hq *, .hq *::before, .hq *::after { animation:none!important; transition:none!important; } }

/* The quest's own world, blurred, fills the screen behind the game (not a web page). */
.hq { position:relative; isolation:isolate; }
.hq::before { content:""; position:absolute; inset:-30px; z-index:-1; background:var(--hq-world) center/cover no-repeat; filter:blur(18px) saturate(1.2) brightness(.8); }
.hq::after { content:""; position:absolute; inset:0; z-index:-1; background:radial-gradient(ellipse at 50% 40%, rgba(255,255,255,.08), rgba(0,0,0,.45)); }
.hq.day { color:#fff; }
.hq.day .hq-brand h1, .hq.day .hq-bar h2 { color:#fff; text-shadow:0 2px 0 rgba(0,0,0,.35), 0 0 12px rgba(0,0,0,.35); }
.hq.day .hq-brand small { color:#fff; opacity:.9; text-shadow:0 1px 2px rgba(0,0,0,.5); }
.hq.day .hq-pill { color:#3a1f0d; }
.hq.day .hq-btn.ghost { background:rgba(255,255,255,.85)!important; color:#3a1f0d!important; }
.hq .hq-foot { color:#fff; text-shadow:0 1px 2px rgba(0,0,0,.6); }
.hq-stage { border:5px solid #fff; }
/* Short screens (phone held sideways): a slim HUD so the picture stays big. */
@media (max-height:520px) {
  .hq-wrap { padding-top:4px; gap:4px; }
  .hq-brand img { width:30px; height:30px; } .hq-brand h1 { font-size:17px; } .hq-brand small { display:none; }
  .hq-bar h2 { font-size:16px; } .hq-pill { padding:4px 9px; } .hq-icon { width:32px; height:32px; }
  .hq-btn { padding:8px 16px; font-size:14px; } .hq-go { font-size:15px!important; padding:9px 18px!important; }
  .hq-node .lbl { display:none; }
}
`;
