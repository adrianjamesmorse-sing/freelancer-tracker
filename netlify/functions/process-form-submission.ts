export default async (request: Request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ message: "Stub only: map Microsoft Form payload into upserts here." }), {
    status: 202,
    headers: { "content-type": "application/json" }
  });
};