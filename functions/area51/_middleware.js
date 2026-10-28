export async function onRequest(context) {
  const authHeader = context.request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice("Basic ".length));
    const password = decoded.includes(":") ? decoded.split(":").slice(1).join(":") : decoded;
    if (password === "AA5EX") {
      const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
      const cf = context.request.cf || {};
      console.log(JSON.stringify({
        event: "area51_login",
        ip,
        country: cf.country || "unknown",
        city: cf.city || "unknown",
        region: cf.region || "unknown",
        asn: cf.asn || "unknown",
        asOrg: cf.asOrganization || "unknown",
        time: new Date().toISOString(),
      }));
      return context.next();
    }
  }

  return new Response("Enter the password to access this page.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="RACES Videos — K5ANM"',
      "Content-Type": "text/plain",
    },
  });
}
