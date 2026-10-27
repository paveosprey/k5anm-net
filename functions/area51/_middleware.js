export async function onRequest(context) {
  const authHeader = context.request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice("Basic ".length));
    const password = decoded.includes(":") ? decoded.split(":").slice(1).join(":") : decoded;
    if (password === "AA5EX") {
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
