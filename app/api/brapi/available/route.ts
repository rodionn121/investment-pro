export async function GET() {
  try {
    const response = await fetch("https://brapi.dev/api/available", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ message: data.message || "Erro ao buscar lista de ativos" }, { status: response.status })
    }

    return Response.json(data)
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}
