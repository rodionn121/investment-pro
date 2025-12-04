"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Plus, LogOut, Home, ArrowLeft } from "lucide-react"
import AddAssetModal from "./add-asset-modal"
import AssetDetailModal from "./asset-detail-modal"

interface PortfolioAsset {
  id: number
  ticker: string
  quantity: number
  purchase_price: number
  current_price: number
  total_purchase_value: number
  current_value: number
  gain_loss: number
  gain_loss_percentage: number
}

export default function PortfolioList() {
  const router = useRouter()
  const [assets, setAssets] = useState<PortfolioAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<PortfolioAsset | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (!token || !userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
    loadPortfolio()
  }, [router])

  const loadPortfolio = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/assets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setAssets(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Erro ao carregar portfólio:", err)
      setAssets([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="bg-primary text-primary-foreground rounded-lg p-2">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Minha Carteira</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Todos os Ativos</h2>
            <p className="text-muted-foreground">
              {assets.length} {assets.length === 1 ? "ativo" : "ativos"} na sua carteira
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Ativo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : assets.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Você ainda não possui ativos em sua carteira</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Ativo
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Ticker</th>
                      <th className="text-right py-3 px-4 font-semibold">Quantidade</th>
                      <th className="text-right py-3 px-4 font-semibold">Preço Médio</th>
                      <th className="text-right py-3 px-4 font-semibold">Preço Atual</th>
                      <th className="text-right py-3 px-4 font-semibold">Total Investido</th>
                      <th className="text-right py-3 px-4 font-semibold">Valor Atual</th>
                      <th className="text-right py-3 px-4 font-semibold">Ganho/Perda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr
                        key={asset.id}
                        className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <td className="py-4 px-4">
                          <span className="font-semibold">{asset.ticker}</span>
                        </td>
                        <td className="py-4 px-4 text-right">{asset.quantity}</td>
                        <td className="py-4 px-4 text-right">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(asset.purchase_price)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(asset.current_price)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(asset.total_purchase_value)}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(asset.current_value)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-semibold ${asset.gain_loss >= 0 ? "text-success" : "text-destructive"}`}
                            >
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(asset.gain_loss)}
                            </span>
                            <span
                              className={`text-sm flex items-center gap-1 ${asset.gain_loss >= 0 ? "text-success" : "text-destructive"}`}
                            >
                              {asset.gain_loss >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {asset.gain_loss >= 0 ? "+" : ""}
                              {asset.gain_loss_percentage.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddAssetModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadPortfolio()
          setShowAddModal(false)
        }}
      />

      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          open={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onSuccess={() => {
            loadPortfolio()
            setSelectedAsset(null)
          }}
        />
      )}
    </div>
  )
}
