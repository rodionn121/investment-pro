"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { createAsset } from "@/lib/portfolio"
import { useAuth } from "./auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AddAssetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddAssetModal({ open, onOpenChange, onSuccess }: AddAssetModalProps) {
  const [ticker, setTicker] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tickers, setTickers] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    // Load available tickers
    const loadTickers = async () => {
      try {
        const response = await fetch("https://database-investpro.onrender.com/api/brapi/tickers")
        const data = await response.json()
        if (Array.isArray(data)) {
          setTickers(data.map((t: any) => t.stock || t).filter(Boolean))
        } else {
          setTickers([])
        }
      } catch (err) {
        console.error("Error loading tickers:", err)
        setTickers([])
      }
    }
    if (open) loadTickers()
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!ticker || !quantity || !price || !token) {
      setError("Preencha todos os campos")
      return
    }

    setIsLoading(true)

    try {
      await createAsset(ticker.toUpperCase(), Number.parseInt(quantity), Number.parseFloat(price), token)
      setTicker("")
      setQuantity("")
      setPrice("")
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar ativo")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTickers =
    ticker && Array.isArray(tickers) ? tickers.filter((t) => t && t.includes(ticker.toUpperCase())).slice(0, 5) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Ativo</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="text-sm font-medium">Ticker do Ativo</label>
            <Input
              type="text"
              placeholder="Ex: PETR4"
              value={ticker}
              onChange={(e) => {
                setTicker(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              autoComplete="off"
            />
            {showSuggestions && filteredTickers.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-1 p-2 z-50">
                {filteredTickers.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTicker(t)
                      setShowSuggestions(false)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm"
                  >
                    {t}
                  </button>
                ))}
              </Card>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Quantidade</label>
            <Input
              type="number"
              placeholder="Ex: 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Preço de Compra (R$)</label>
            <Input
              type="number"
              placeholder="Ex: 25.50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Adicionando..." : "Adicionar Ativo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
