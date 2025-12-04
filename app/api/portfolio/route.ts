export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const response = await fetch("https://database-investpro.onrender.com/api/portfolio", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ message: data.detail || "Erro ao buscar portfólio" }, { status: response.status })
    }

    return Response.json(data)
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, ticker, quantity, purchase_price } = body

    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const response = await fetch("https://database-investpro.onrender.com/api/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id, ticker, quantity, purchase_price }),
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ message: data.detail || "Erro ao adicionar ativo" }, { status: response.status })
    }

    return Response.json(data)
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get("asset_id")

    if (!assetId) {
      return Response.json({ message: "ID do ativo é obrigatório" }, { status: 400 })
    }

    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const response = await fetch(`https://database-investpro.onrender.com/api/portfolio/${assetId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      return Response.json({ message: data.detail || "Erro ao remover ativo" }, { status: response.status })
    }

    return Response.json({ message: "Ativo removido com sucesso" })
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { asset_id, quantity, purchase_price } = body

    if (!asset_id) {
      return Response.json({ message: "ID do ativo é obrigatório" }, { status: 400 })
    }

    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const response = await fetch(`https://database-investpro.onrender.com/api/portfolio/${asset_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity, purchase_price }),
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ message: data.detail || "Erro ao atualizar ativo" }, { status: response.status })
    }

    return Response.json(data)
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}
