export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || searchParams.get("query")

    if (!query) {
      return Response.json({ message: "Query é obrigatória" }, { status: 400 })
    }

    const response = await fetch(
      `https://database-investpro.onrender.com/api/brapi/search?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    )

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ message: data.detail || "Erro ao buscar tickers" }, { status: response.status })
    }

    return Response.json(data)
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}
