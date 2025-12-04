export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const { ticker, quantity, purchase_price } = body

    const response = await fetch("https://database-investpro.onrender.com/api/assets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ticker, quantity, purchase_price }),
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ message: data.detail || "Erro ao adicionar ativo" }, { status: response.status })
    }

    return Response.json(data, { status: 201 })
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const response = await fetch("https://database-investpro.onrender.com/api/assets", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ message: data.detail || "Erro ao buscar ativos" }, { status: response.status })
    }

    return Response.json(data)
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}
