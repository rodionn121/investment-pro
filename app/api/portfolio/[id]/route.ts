export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Simula chamada ao backend Python
    const response = await fetch(`${process.env.BACKEND_URL}/api/portfolio/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
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
