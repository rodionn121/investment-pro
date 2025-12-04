"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { type Asset, getAssets } from "@/lib/portfolio"
import { useAuth } from "@/components/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardStats } from "@/components/dashboard-stats"
import { Button } from "@/components/ui/button"
import { AddAssetModal } from "@/components/add-asset-modal"
import { LogOut, Plus, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { PortfolioCharts } from "@/components/portfolio-charts"
import { PortfolioMetrics } from "@/components/portfolio-metrics"

export default function DashboardPage() {
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
        <header className="border-b border-border sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary rounded-xl p-2.5">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">InvestPro</h1>
                  <p className="text-xs text-muted-foreground font-medium">Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground font-medium">Bem-vindo,</p>
                  <p className="font-semibold text-sm">{user?.name || "Usuário"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Sair"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando seus dados...</p>
            </div>
          ) : (
            <>
              {/* Stats Section */}
              <section>
                <div className="mb-2">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resumo</h2>
                </div>
                <DashboardStats assets={assets} />
              </section>

              {/* Metrics and Charts Sections */}
              {assets.length > 0 && (
                <>
                  <PortfolioMetrics assets={assets} />
                  <PortfolioCharts assets={assets} />
                </>
              )}

              {/* Actions Section */}
              <section className="mt-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Minha Carteira</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {assets.length} {assets.length === 1 ? "ativo" : "ativos"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/portfolio" className="flex-1 sm:flex-none">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto justify-center gap-2 font-medium border-border/40 hover:bg-muted/50 bg-transparent"
                      >
                        Ver Todos
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Adicionar</span>
                    </Button>
                  </div>
                </div>

                {/* Recent Assets */}
                {assets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assets.slice(0, 3).map((asset) => {
                      const totalInvested = asset.purchase_price * asset.quantity
                      const currentTotal = asset.current_price * asset.quantity
                      const gainLoss = currentTotal - totalInvested
                      const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0
                      const isPositive = gainLoss >= 0

                      return (
                        <Link key={asset.id} href={`/portfolio?ticker=${asset.ticker}`}>
                          <div className="p-5 border border-border rounded-xl hover:border-primary/30 hover:shadow-md hover:bg-muted/30 transition-all cursor-pointer group">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <p className="font-bold text-lg group-hover:text-primary transition-colors">
                                  {asset.ticker}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">{asset.quantity} ações</p>
                              </div>
                              <div
                                className={`text-right px-3 py-1.5 rounded-lg font-semibold text-sm ${
                                  isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                                }`}
                              >
                                {isPositive ? "+" : ""}
                                {gainLossPercent.toFixed(2).replace(".", ",")}%
                              </div>
                            </div>
                            <div className="space-y-2 pt-3 border-t border-border/40">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Valor Atual</span>
                                <span className="font-semibold text-foreground">
                                  R$ {currentTotal.toFixed(2).replace(".", ",")}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Ganho/Perda</span>
                                <span className={`font-semibold ${isPositive ? "text-success" : "text-danger"}`}>
                                  {isPositive ? "+" : ""}R$ {gainLoss.toFixed(2).replace(".", ",")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <div className="bg-muted/50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-7 w-7 text-muted-foreground/50" />
                    </div>
                    <p className="font-medium text-foreground mb-1">Nenhum ativo adicionado</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Comece adicionando seu primeiro ativo à carteira
                    </p>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Ativo
                    </Button>
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        <AddAssetModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={loadAssets} />
      </div>
    </ProtectedRoute>
  )
}
