"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { worksApi } from "@/lib/api"
import type { Work, Category, ProfessionalStatus } from "@/lib/types"

interface WorkModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  work: Work | null
}

export function WorkModal({ isOpen, onClose, onSave, work }: WorkModalProps) {
  const getInitialFormData = () => ({
    name: "",
    category: "" as Category | "",
    price: "",
    status: "Ativo" as ProfessionalStatus | "",
    description: "",
  })

  const [formData, setFormData] = useState(getInitialFormData())
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({})

  useEffect(() => {
    if (!isOpen) {
      setFormData(getInitialFormData())
      return
    }
    if (work) {
        requestAnimationFrame(() => {
            const newFormData = {
                name: work.name,
                category: work.category as Category,
                status: "Ativo" as ProfessionalStatus,
                price: String(work.price ?? ""),
                description: work.description ?? ""
            }
            setFormData(newFormData)
        })
    }
  }, [isOpen, work])

  useEffect(() => {
    console.log("formData changed:", formData)
    }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { name?: string; category?: string } = {}
    if (!formData.name) newErrors.name = "Informe o nome"
    if (!formData.category) newErrors.category = "Selecione a categoria"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price || "0"),
        category: formData.category as Category,
        status: formData.status as ProfessionalStatus
      }

      if (work) {
        await worksApi.update(work.id, data)
      } else {
        await worksApi.create(data)
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Erro ao salvar serviço:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--color-border)] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {work ? "Editar Serviço" : "Novo Serviço"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            {errors.name && <p className="text-xs text-[var(--destructive)] mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="category" className="mb-2">Categoria *</Label>
            <Select
              value={String(formData.category)}
              onValueChange={(value) => {
                setFormData({ ...formData, category: value as Category })
                setErrors((prev) => ({ ...prev, category: undefined }))
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Salão">Salão</SelectItem>
                <SelectItem value="Estética">Estética</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Loja de roupas">Loja de roupas</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-[var(--destructive)] mt-1">{errors.category}</p>}
          </div>

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
            <Label htmlFor="price" className="mb-2">Preço</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o serviço"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              className="bg-white hover:opacity-70"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70"
            >
              {work ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
