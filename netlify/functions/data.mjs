import { getStore } from "@netlify/blobs";

export default async (req) => {
  // Optional passphrase: set LIFTS_KEY in Netlify env vars to lock the API
  const secret = Netlify.env.get("LIFTS_KEY");
  if (secret && req.headers.get("x-lifts-key") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const store = getStore("lifts");

  if (req.method === "GET") {
    const data = await store.get("state", { type: "json" });
    return Response.json(data ?? null);
  }

  if (req.method === "PUT") {
    const body = await req.text();
    if (body.length > 2_000_000) return new Response("Too large", { status: 413 });
    try { JSON.parse(body); } catch { return new Response("Bad JSON", { status: 400 }); }
    await store.set("state", body);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/data" };
