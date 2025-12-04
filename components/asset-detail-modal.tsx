"use client"

import { useState } from "react"
import { type Asset, updateAsset, deleteAsset } from "@/lib/portfolio"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "./auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"

interface AssetDetailModalProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function AssetDetailModal({ asset, open, onOpenChange, onUpdate }: AssetDetailModalProps) {
  const [quantity, setQuantity] = useState(asset.quantity.toString())
  const [purchasePrice, setPurchasePrice] = useState(asset.purchase_price.toString())
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useAuth()

  const totalInvested = asset.purchase_price * asset.quantity
  const currentTotal = asset.current_price * asset.quantity
  const gainLoss = currentTotal - totalInvested
  const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0
  const isPositive = gainLoss >= 0

  async function handleUpdate() {
    setError("")
    if (!token) return

    setIsLoading(true)
    try {
      await updateAsset(
        asset.id,
        {
          quantity: Number.parseInt(quantity),
          purchase_price: Number.parseFloat(purchasePrice),
        },
        token,
      )
      onOpenChange(false)
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar ativo")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!token || !confirm("Tem certeza que deseja remover este ativo?")) return

    setIsLoading(true)
    try {
      await deleteAsset(asset.id, token)
      onOpenChange(false)
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover ativo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{asset.ticker}</span>
            <span className="text-sm font-normal text-muted-foreground">Detalhes do ativo e ações disponíveis</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Quantidade</span>
              <span className="font-semibold">{asset.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Preço Médio</span>
              <span className="font-semibold">R$ {asset.purchase_price.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Preço Atual</span>
              <span className="font-semibold">R$ {asset.current_price.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="text-sm text-muted-foreground">Total Investido</span>
              <span className="font-semibold">R$ {totalInvested.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valor Atual da Posição</span>
              <span className="font-semibold">R$ {currentTotal.toFixed(2).replace(".", ",")}</span>
            </div>
            <div
              className={`flex justify-between border-t border-border pt-2 mt-2 ${isPositive ? "text-green-600" : "text-red-600"}`}
            >
              <span className="text-sm font-medium">Ganho/Perda</span>
              <span className="font-bold">
                R$ {gainLoss.toFixed(2).replace(".", ",")} ({gainLossPercent.toFixed(2).replace(".", ",")}%)
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Quantidade Adicional</label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
            </div>

            <div>
              <label className="text-sm font-medium">Preço de Compra (R$)</label>
              <Input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button
              onClick={handleUpdate}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Atualizando..." : "Adicionar Mais Ações"}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isLoading} title="Remover ativo">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
