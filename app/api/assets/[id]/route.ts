export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const response = await fetch(`https://database-investpro.onrender.com/api/assets/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ message: data.detail || "Erro ao buscar ativo" }, { status: response.status })
    }

    return Response.json(data)
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const response = await fetch(`https://database-investpro.onrender.com/api/assets/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const response = await fetch(`https://database-investpro.onrender.com/api/assets/${params.id}`, {
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

    return new Response(null, { status: 204 })
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}
