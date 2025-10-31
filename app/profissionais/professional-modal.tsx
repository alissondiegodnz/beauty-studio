"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { professionalsApi } from "@/lib/api"
import type { Professional, ProfessionalStatus } from "@/lib/types"
import { Textarea } from "@/components/ui/textarea"

interface ProfessionalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  professional: Professional | null
}

export function ProfessionalModal({ isOpen, onClose, onSave, professional }: ProfessionalModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    status: "Ativo" as ProfessionalStatus | "",
    address: ""
  })

  useEffect(() => {
    if (isOpen && professional) {
        setFormData({
          name: professional.name,
          phone: professional.phone,
          status: professional.status as ProfessionalStatus,
          address: professional.address
        })
    } else {
      setFormData({
        name: "",
        phone: "",
        status: "Ativo",
        address: ""
      })
    }
  }, [isOpen, professional])

  useEffect(() => {
    if (professional && formData.status == "") {
      setFormData({
          name: professional.name,
          phone: professional.phone,
          status: professional.status as ProfessionalStatus,
          address: professional.address
        })
    }
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data = {
        ...formData,
        status: formData.status as ProfessionalStatus,
      }

      if (professional) {
        await professionalsApi.update(professional.id, data)
      } else {
        await professionalsApi.create(data)
      }

      onSave()
    } catch (error) {
      console.error("Error saving professional:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl">
        <div className="border-b border-[var(--color-border)] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {professional ? "Editar Profissional" : "Novo Profissional"}
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

          <div className="grid grid-cols-1 gap-4">

            <div>
              <Label htmlFor="status" className="mb-2">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as ProfessionalStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address" className="mb-2">Endereço</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" className="bg-white hover:opacity-70" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70"
            >
              {professional ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
