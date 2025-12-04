"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
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
import { Plus, Loader2 } from "lucide-react"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

interface AddAssetModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddAssetModal({ open, onClose, onSuccess }: AddAssetModalProps) {
  const [ticker, setTicker] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [allTickers, setAllTickers] = useState<string[]>([])
  const [loadingTickers, setLoadingTickers] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const fetchAllTickers = async () => {
      setLoadingTickers(true)
      try {
        const response = await fetch("/api/brapi/available")
        const data = await response.json()

        if (Array.isArray(data.stocks)) {
          setAllTickers(data.stocks)
        }
      } catch (err) {
        console.error("Erro ao buscar lista de ativos:", err)
      } finally {
        setLoadingTickers(false)
      }
    }

    fetchAllTickers()
  }, [])

  const filteredTickers = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) {
      return []
    }

    const query = searchQuery.toUpperCase()
    const filtered = allTickers.filter((tickerString) => tickerString.toUpperCase().includes(query)).slice(0, 10)

    return filtered
  }, [searchQuery, allTickers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Usuário não autenticado")

      const tickerUpper = ticker.toUpperCase()

      if (!allTickers.includes(tickerUpper)) {
        setError(`Ticker "${tickerUpper}" não encontrado. Verifique se está correto.`)
        setLoading(false)
        return
      }

      const quoteResponse = await fetch(`/api/brapi/quote/${tickerUpper}`)
      if (!quoteResponse.ok) {
        setError(`Ticker "${tickerUpper}" não encontrado na Brapi. Verifique se o ativo existe.`)
        setLoading(false)
        return
      }

      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticker: tickerUpper,
          quantity: Number.parseFloat(quantity),
          purchase_price: Number.parseFloat(price),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTicker("")
        setQuantity("")
        setPrice("")
        setSearchQuery("")
        onSuccess()
      } else {
        setError(data.message || "Erro ao adicionar ativo")
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleTickerSelect = (selectedTicker: string) => {
    setTicker(selectedTicker)
    setSearchQuery(selectedTicker)
    setShowDropdown(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Ativo</DialogTitle>
          <DialogDescription>Adicione um ativo à sua carteira informando os dados abaixo</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker do Ativo</Label>
              <div className="relative">
                <Input
                  id="ticker"
                  placeholder="Ex: PETR4, VALE3, ITUB4"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value
                    setSearchQuery(value)
                    setTicker(value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => {
                    if (searchQuery.length >= 2) {
                      setShowDropdown(true)
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowDropdown(false)
                    }, 200)
                  }}
                  required
                  disabled={loading || loadingTickers}
                  className="pr-8"
                  autoComplete="off"
                />
                {loadingTickers && (
                  <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                )}
                {showDropdown && filteredTickers.length > 0 && searchQuery.length >= 2 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[200px] overflow-auto">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {filteredTickers.map((tickerString) => (
                            <CommandItem
                              key={tickerString}
                              value={tickerString}
                              onSelect={() => handleTickerSelect(tickerString)}
                              className="cursor-pointer"
                            >
                              <span className="font-semibold">{tickerString}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {loadingTickers ? "Carregando lista de ativos..." : "Digite para buscar ativos da B3"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                min="1"
                placeholder="Ex: 100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço de Compra (R$)</Label>
              <Input
                id="price"
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
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              {loading ? "Adicionando..." : "Adicionar Ativo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
