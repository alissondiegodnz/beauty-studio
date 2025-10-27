"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { clientsApi } from "@/lib/api"
import type { Client } from "@/lib/types"

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  client: Client | null
}

export function ClientModal({ isOpen, onClose, onSave, client }: ClientModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birthDate: "",
    observations: "",
  })

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData({
          name: client.name,
          phone: client.phone,
          email: client.email,
          birthDate: client.birthDate,
          observations: client.observations || "",
        })
      } else {
        setFormData({
          name: "",
          phone: "",
          email: "",
          birthDate: "",
          observations: "",
        })
      }
    }
  }, [isOpen, client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (client) {
        await clientsApi.update(client.id, formData)
      } else {
        await clientsApi.create(formData)
      }

      onSave()
    } catch (error) {
      console.error("Error saving client:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl">
        <div className="border-b border-[var(--color-border)] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {client ? "Editar Cliente" : "Novo Cliente"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="mb-2">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ana Silva"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(81) 98765-4321"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="mb-2">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ana.silva@email.com"
              />
            </div>

            <div>
              <Label htmlFor="birthDate" className="mb-2">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observations" className="mb-2">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Preferências, alergias, etc."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
            >
              {client ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
