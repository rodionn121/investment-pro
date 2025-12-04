"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Wallet, PieChart, Plus, LogOut, BarChart3 } from "lucide-react"
import AddAssetModal from "./add-asset-modal"
import PortfolioChart from "./portfolio-chart"

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

export default function DashboardOverview() {
  const router = useRouter()
  const [assets, setAssets] = useState<PortfolioAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
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

  const totalInvested = assets.reduce((sum, asset) => {
    const invested = Number.parseFloat(String(asset.total_purchase_value)) || 0
    return sum + invested
  }, 0)

  const currentValue = assets.reduce((sum, asset) => {
    const value = Number.parseFloat(String(asset.current_value)) || 0
    return sum + value
  }, 0)

  const totalGainLoss = currentValue - totalInvested
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground rounded-lg p-2">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">InvestPro</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/portfolio")}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Todos os Ativos
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral da sua carteira de investimentos</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Investido</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalInvested)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Valor total aplicado</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor Atual</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(currentValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cotação atual do mercado</p>
            </CardContent>
          </Card>

          <Card
            className={`border-2 ${totalGainLoss >= 0 ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ganho/Perda</CardTitle>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${totalGainLoss >= 0 ? "text-success" : "text-destructive"}`}>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalGainLoss)}
              </div>
              <p className={`text-xs font-medium mt-1 ${totalGainLoss >= 0 ? "text-success" : "text-destructive"}`}>
                {totalGainLoss >= 0 ? "+" : ""}
                {totalGainLossPercentage.toFixed(2)}% no período
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ações Rápidas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowAddModal(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Ativo
              </Button>
              <Button variant="outline" onClick={() => router.push("/portfolio")} size="lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Carteira Completa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Ativos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : assets.length === 0 ? (
              <div className="text-center py-12">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Você ainda não possui ativos em sua carteira</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Ativo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {assets.slice(0, 5).map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push("/portfolio")}
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{asset.ticker}</p>
                      <p className="text-sm text-muted-foreground">{asset.quantity} ações</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(asset.current_value)}
                      </p>
                      <p
                        className={`text-sm font-medium ${asset.gain_loss >= 0 ? "text-success" : "text-destructive"}`}
                      >
                        {asset.gain_loss >= 0 ? "+" : ""}
                        {asset.gain_loss_percentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {assets.length > 0 && (
          <div className="mt-8">
            <PortfolioChart assets={assets} />
          </div>
        )}
      </main>

      <AddAssetModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadPortfolio()
          setShowAddModal(false)
        }}
      />
    </div>
  )
}
