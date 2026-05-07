export default async () => {
  return new Response(JSON.stringify({ ok: true, service: "freelancer-tracker" }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};