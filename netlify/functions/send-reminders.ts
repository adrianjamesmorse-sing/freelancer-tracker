export default async () => {
  return new Response(JSON.stringify({ message: "Stub only: send end-date and still-open reminders here." }), {
    status: 202,
    headers: { "content-type": "application/json" }
  });
};