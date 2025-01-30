export async function GET(req) {
  try {
    const response = await fetch("https://api.jsonserve.com/Uw5CrX", {
      mode: "no-cors",
    });
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
}
