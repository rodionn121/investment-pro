"use client"

import { useState } from "react"
import type { Asset } from "@/lib/portfolio"
import { Card } from "@/components/ui/card"
import { AssetDetailModal } from "./asset-detail-modal"

interface AssetsTableProps {
  assets: Asset[]
  onAssetUpdate?: () => void
}

export function AssetsTable({ assets, onAssetUpdate }: AssetsTableProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset)
    setShowDetail(true)
  }

  return (
    <>
      <Card className="overflow-hidden border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ticker</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Quantidade</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Preço Médio</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Preço Atual</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total Investido</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Valor Atual</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ganho/Perda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Nenhum ativo adicionado ainda
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  const totalInvested = asset.purchase_price * asset.quantity
                  const currentTotal = asset.current_price * asset.quantity
                  const gainLoss = currentTotal - totalInvested
                  const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0
                  const isPositive = gainLoss >= 0

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => handleAssetClick(asset)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-semibold text-foreground group-hover:text-primary transition-colors">
                        {asset.ticker}
                      </td>
                      <td className="px-6 py-4 text-foreground">{asset.quantity}</td>
                      <td className="px-6 py-4 text-foreground">
                        R$ {asset.purchase_price.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        R$ {asset.current_price.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-6 py-4 text-foreground">R$ {totalInvested.toFixed(2).replace(".", ",")}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        R$ {currentTotal.toFixed(2).replace(".", ",")}
                      </td>
                      <td className={`px-6 py-4 font-semibold`}>
                        <div className={`${isPositive ? "text-success" : "text-danger"}`}>
                          {isPositive ? "+" : ""}R$ {gainLoss.toFixed(2).replace(".", ",")}
                        </div>
                        <div className={`text-xs font-medium ${isPositive ? "text-success/80" : "text-danger/80"}`}>
                          {gainLossPercent.toFixed(2).replace(".", ",")}%
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          open={showDetail}
          onOpenChange={setShowDetail}
          onUpdate={() => {
            setShowDetail(false)
            onAssetUpdate?.()
          }}
        />
      )}
    </>
  )
}
