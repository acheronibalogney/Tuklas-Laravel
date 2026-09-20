<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }} — Tuklas</title>
    <style>
        :root { color-scheme: light; --page:#e9efeb; --ink:#17242b; --muted:#65716e; --line:#b9c5bc; --mint:#2b726b; --coral:#b9583f; --surface:#f4f7f4; }
        * { box-sizing:border-box; }
        body { margin:0; min-height:100vh; background:var(--page); color:var(--ink); font-family:Georgia, 'Times New Roman', serif; }
        .error-shell { min-height:100vh; display:flex; flex-direction:column; padding:24px clamp(20px, 5vw, 72px); }
        .error-nav { display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--ink); padding-bottom:18px; font:700 12px/1.2 'Courier New', monospace; letter-spacing:.18em; text-transform:uppercase; }
        .brand { color:var(--ink); font:bold 32px/1 Georgia, serif; letter-spacing:-.06em; text-decoration:none; text-transform:none; }
        .brand span { color:var(--coral); }
        .edition { color:var(--muted); }
        .error-main { flex:1; display:grid; grid-template-columns:minmax(80px, .25fr) 1fr; align-items:center; max-width:1180px; width:100%; margin:0 auto; }
        .index { align-self:stretch; border-right:1px solid var(--line); padding-top:clamp(40px, 10vh, 120px); font:700 14px/1.5 'Courier New', monospace; color:var(--mint); letter-spacing:.12em; }
        .copy { padding:clamp(40px, 8vw, 120px); }
        .eyebrow { color:var(--mint); font:700 12px/1.4 'Courier New', monospace; letter-spacing:.16em; text-transform:uppercase; }
        h1 { margin:18px 0 16px; font-size:clamp(72px, 15vw, 190px); line-height:.85; letter-spacing:-.08em; color:var(--ink); }
        h2 { margin:0 0 18px; font-size:clamp(28px, 4vw, 52px); line-height:1; letter-spacing:-.04em; }
        p { max-width:560px; color:var(--muted); font-size:17px; line-height:1.65; }
        .actions { display:flex; flex-wrap:wrap; gap:12px; margin-top:32px; }
        .button { display:inline-block; padding:14px 20px; border:1px solid var(--ink); color:var(--ink); text-decoration:none; font:700 12px/1 'Courier New', monospace; letter-spacing:.1em; text-transform:uppercase; }
        .button.primary { background:var(--mint); border-color:var(--mint); color:#f4f7f4; }
        .error-footer { border-top:1px solid var(--line); padding-top:18px; color:var(--muted); font:12px/1.4 'Courier New', monospace; letter-spacing:.08em; text-transform:uppercase; }
        @media (max-width:640px) { .error-main { grid-template-columns:1fr; } .index { border-right:0; padding-top:48px; } .copy { padding:42px 0 64px; } .edition { display:none; } }
    </style>
</head>
<body>
    <div class="error-shell">
        <nav class="error-nav"><a class="brand" href="{{ url('/') }}">Tuklas<span>.</span></a><span class="edition">Career intelligence / Philippines</span></nav>
        <main class="error-main">
            <div class="index">SYSTEM<br>NOTICE</div>
            <section class="copy">
                <div class="eyebrow">{{ $eyebrow }}</div>
                <h1>{{ $code }}</h1>
                <h2>{{ $title }}</h2>
                <p>{{ $message }}</p>
                @if(config('app.debug') && isset($exception) && $exception?->getMessage())
                    <p style="font:12px/1.5 'Courier New',monospace;color:var(--coral);word-break:break-word">{{ $exception->getMessage() }}</p>
                @endif
                <div class="actions"><a class="button primary" href="{{ url('/') }}">Back to home</a><a class="button" href="javascript:history.back()">Go back</a></div>
            </section>
        </main>
        <footer class="error-footer">Tuklas / A practical guide to what comes next / Est. 2026</footer>
    </div>
</body>
</html>
