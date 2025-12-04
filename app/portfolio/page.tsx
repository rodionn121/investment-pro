"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { type Asset, getAssets } from "@/lib/portfolio"
import { useAuth } from "@/components/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { AssetsTable } from "@/components/assets-table"
import { Button } from "@/components/ui/button"
import { AddAssetModal } from "@/components/add-asset-modal"
import { LogOut, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PortfolioPage() {
  const { token, user, logout } = useAuth()
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (token) {
      loadAssets()
    }
  }, [token])

  async function loadAssets() {
    try {
      setIsLoading(true)
      const data = await getAssets(token!)
      setAssets(data)
    } catch (err) {
      console.error("Error loading assets:", err)
    } finally {
      setIsLoading(false)
    }
  }

  function handleLogout() {
    logout()
    router.push("/login")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border sticky top-0 z-50 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Todos os Ativos</h1>
                  <p className="text-sm text-muted-foreground">
                    {assets.length} ativo{assets.length !== 1 ? "s" : ""} na sua carteira
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-right">
                  <p className="text-muted-foreground">Bem-vindo,</p>
                  <p className="font-semibold">{user?.name}</p>
                </div>
                <Button variant="outline" size="icon" onClick={handleLogout} title="Sair">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-end">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Ativo
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : (
            <>
              <div className="bg-card rounded-lg border border-border p-6 mb-6">
                <h2 className="font-semibold mb-4 text-lg">Lista de Ativos</h2>
                <AssetsTable assets={assets} onAssetUpdate={loadAssets} />
              </div>
            </>
          )}
        </main>

        <AddAssetModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={loadAssets} />
      </div>
    </ProtectedRoute>
  )
}
