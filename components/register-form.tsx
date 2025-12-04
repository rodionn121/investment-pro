"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { register } from "@/lib/auth"
import { useAuth } from "./auth-context"
import { TrendingUp } from "lucide-react"

export function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("Mínimo de 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      await register(name, email, password)
      const { login: loginFn } = await import("@/lib/auth")
      const response = await loginFn(email, password)
      login(response.access_token, response.user)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50 backdrop-blur-sm bg-card/95">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-4 shadow-lg shadow-primary/20">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-foreground">Criar Conta</h1>
          <p className="text-center text-muted-foreground text-sm mb-8 font-medium">
            Cadastre-se para começar a gerenciar seus investimentos
          </p>

          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-lg text-xs text-danger font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-2 text-foreground">Nome Completo</label>
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border-border/40 bg-input hover:border-border/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2 text-foreground">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border-border/40 bg-input hover:border-border/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2 text-foreground">Senha</label>
              <Input
                type="password"
                placeholder="Mínimo de 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border-border/40 bg-input hover:border-border/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2 text-foreground">Confirmar Senha</label>
              <Input
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-lg border-border/40 bg-input hover:border-border/60 transition-colors"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg py-2.5 mt-6 transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm border-t border-border/30 pt-6">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Fazer login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
