export async function GET(request: Request, { params }: { params: { ticker: string } }) {
  try {
    const response = await fetch(`https://database-investpro.onrender.com/api/brapi/quote/${params.ticker}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ message: data.detail || "Erro ao buscar cotação" }, { status: response.status })
    }

    return Response.json(data)
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}
