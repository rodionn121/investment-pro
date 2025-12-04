"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Plus, Trash2 } from "lucide-react"

interface Asset {
  id: number
  ticker: string
  quantity: number
  purchase_price: number
  current_price: number
  total_invested: number
  current_value: number
  gain_loss: number
  gain_loss_percentage: number
}

interface AssetDetailModalProps {
  asset: Asset
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AssetDetailModal({ asset, open, onClose, onSuccess }: AssetDetailModalProps) {
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAddMore = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Usuário não autenticado")

      const response = await fetch(`/api/assets/${asset.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: asset.quantity + Number.parseFloat(quantity),
          purchase_price: Number.parseFloat(price),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setQuantity("")
        setPrice("")
        onSuccess()
      } else {
        setError(data.message || "Erro ao adicionar mais ações")
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja remover ${asset.ticker} da sua carteira?`)) {
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Usuário não autenticado")

      const response = await fetch(`/api/assets/${asset.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok || response.status === 204) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.message || "Erro ao remover ativo")
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{asset.ticker}</DialogTitle>
          <DialogDescription>Detalhes do ativo e ações disponíveis</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Quantidade</p>
            <p className="text-lg font-semibold">{asset.quantity}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Preço Médio</p>
            <p className="text-lg font-semibold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(asset.purchase_price)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Preço Atual</p>
            <p className="text-lg font-semibold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(asset.current_price)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Investido</p>
            <p className="text-lg font-semibold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(asset.total_invested)}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${asset.gain_loss >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Valor Atual da Posição</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(asset.current_value)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Ganho/Perda</p>
              <div
                className={`text-xl font-bold flex items-center gap-2 ${asset.gain_loss >= 0 ? "text-success" : "text-destructive"}`}
              >
                {asset.gain_loss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                <div>
                  <div>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(asset.gain_loss)}
                  </div>
                  <div className="text-sm">
                    ({asset.gain_loss >= 0 ? "+" : ""}
                    {asset.gain_loss_percentage.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Adicionar Mais</TabsTrigger>
            <TabsTrigger value="remove">Remover</TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <form onSubmit={handleAddMore} className="space-y-4 pt-4">
              {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="add-quantity">Quantidade Adicional</Label>
                <Input
                  id="add-quantity"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Ex: 50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-price">Preço de Compra (R$)</Label>
                <Input
                  id="add-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 25.50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                {loading ? "Adicionando..." : "Adicionar Mais Ações"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="remove" className="pt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Esta ação removerá completamente o ativo {asset.ticker} da sua carteira. Todas as {asset.quantity} ações
                serão removidas.
              </p>
              {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
              <Button variant="destructive" className="w-full" onClick={handleDelete} disabled={loading}>
                <Trash2 className="h-4 w-4 mr-2" />
                {loading ? "Removendo..." : "Remover Ativo da Carteira"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
