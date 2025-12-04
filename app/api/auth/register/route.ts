export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    const response = await fetch("https://database-investpro.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ message: data.detail || "Erro ao criar conta" }, { status: response.status })
    }

    return Response.json({ user: data }, { status: 201 })
  } catch (error) {
    return Response.json({ message: "Erro ao conectar ao servidor" }, { status: 500 })
  }
}
