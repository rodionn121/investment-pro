import { apiCall } from "./api-client"

export interface Asset {
  id: number
  ticker: string
  name: string
  quantity: number
  purchase_price: number
  current_price: number
  portfolio_id: number
}

export interface Portfolio {
  id: number
  name: string
  user_id: number
  assets: Asset[]
}

export async function getPortfolio(token: string): Promise<Portfolio> {
  return apiCall("/api/portfolio", { token })
}

export async function getAssets(token: string): Promise<Asset[]> {
  return apiCall("/api/assets", { token })
}

export async function getAsset(assetId: number, token: string): Promise<Asset> {
  return apiCall(`/api/assets/${assetId}`, { token })
}

export async function createAsset(
  ticker: string,
  quantity: number,
  purchase_price: number,
  token: string,
): Promise<Asset> {
  return apiCall("/api/assets", {
    method: "POST",
    body: JSON.stringify({ ticker, quantity, purchase_price }),
    token,
  })
}

export async function updateAsset(
  assetId: number,
  data: { quantity?: number; purchase_price?: number; current_price?: number },
  token: string,
): Promise<Asset> {
  return apiCall(`/api/assets/${assetId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  })
}

export async function deleteAsset(assetId: number, token: string): Promise<void> {
  return apiCall(`/api/assets/${assetId}`, {
    method: "DELETE",
    token,
  })
}
