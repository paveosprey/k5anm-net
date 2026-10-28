export async function onRequest(context) {
  // Same password gate
  const authHeader = context.request.headers.get("Authorization");
  let authed = false;
  if (authHeader && authHeader.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice("Basic ".length));
    const password = decoded.includes(":") ? decoded.split(":").slice(1).join(":") : decoded;
    if (password === "AA5EX") authed = true;
  }
  if (!authed) {
    return new Response("Enter the password to view logs.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="RACES Logs — K5ANM"',
        "Content-Type": "text/plain",
      },
    });
  }

  // Load entries from KV
  const entries = [];
  if (context.env.AREA51_LOGS) {
    const list = await context.env.AREA51_LOGS.list({ prefix: "login:" });
    for (const key of list.keys) {
      const val = await context.env.AREA51_LOGS.get(key.name);
      if (val) {
        try { entries.push(JSON.parse(val)); } catch {}
      }
    }
  }
  entries.sort((a, b) => b.time.localeCompare(a.time));

  const rows = entries.length
    ? entries.map(e => `
        <tr>
          <td>${e.time.replace("T", " ").replace("Z", " UTC")}</td>
          <td>${e.ip}</td>
          <td>${e.city}, ${e.region}, ${e.country}</td>
          <td>${e.asOrg}</td>
          <td class="ua">${e.ua}</td>
        </tr>`).join("")
    : `<tr><td colspan="5" class="empty">No logins recorded yet.</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Area 51 Login Log — K5ANM</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
           background: #1a1a2e; color: #e0e0e0; min-height: 100vh; padding: 2rem 1rem; }
    h1 { color: #f0a500; font-size: 1.4rem; margin-bottom: 0.3rem; }
    p.sub { color: #666; font-size: 0.82rem; margin-bottom: 1.5rem; }
    .count { color: #f0a500; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
    th { background: #0d0d1a; color: #f0a500; text-align: left;
         padding: 0.6rem 0.75rem; border-bottom: 2px solid #2a2a3e; white-space: nowrap; }
    td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #1e1e30; vertical-align: top; }
    tr:hover td { background: #1e1e30; }
    td.ua { color: #555; font-size: 0.75rem; max-width: 280px; overflow: hidden;
             text-overflow: ellipsis; white-space: nowrap; }
    td.empty { text-align: center; color: #444; padding: 2rem; }
    footer { margin-top: 2rem; font-size: 0.78rem; color: #444; }
    footer a { color: #666; text-decoration: none; }
    footer a:hover { color: #888; }
    @media (max-width: 600px) { td.ua { display: none; } th:last-child { display: none; } }
  </style>
</head>
<body>
  <h1>Area 51 — Login Log</h1>
  <p class="sub"><span class="count">${entries.length}</span> login${entries.length !== 1 ? "s" : ""} recorded &bull; entries expire after 90 days</p>
  <table>
    <thead><tr><th>Time (UTC)</th><th>IP</th><th>Location</th><th>ISP / Org</th><th>User Agent</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <footer><a href="/">&#8592; Back to K5ANM</a></footer>
</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
