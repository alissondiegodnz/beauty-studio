"use client"

import { useState, useEffect } from "react"
import { Plus, User, Phone, Pencil, Trash2, Search, UserCheck } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/status-badge"
import { professionalsApi } from "@/lib/api"
import type { Professional } from "@/lib/types"
import { ProfessionalModal } from "./professional-modal"
import { set } from "date-fns"
import Loading from "@/components/loading"

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    setIsLoading(true)
    try {
      const response = await professionalsApi.getAllStatus()
      setProfessionals(response.data)
    } catch (error) {
      console.error("Error loading professionals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProfessionals = professionals.filter((professional) =>
    professional.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este profissional?")) {
      try {
        await professionalsApi.delete(id)
        loadProfessionals()
      } catch (error) {
        console.error("Error deleting professional:", error)
      }
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    setEditingProfessional(null)
    loadProfessionals()
  }

  if (isLoading) {
      return <Loading />
  }
  
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Profissionais"
        description="Gerencie o cadastro de profissionais"
        action={
          <Button
            onClick={() => {
              setEditingProfessional(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Profissional
          </Button>
        }
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <Input
            id="search-professionals"
            type="text"
            placeholder="Digite o nome do profissional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfessionals.map((professional) => (
          <div
            key={professional.id}
            className="bg-white rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold-accent)] to-[var(--gold-medium)] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(professional)}
                  className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(professional.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-lg text-[var(--color-text-secondary)] mb-3">{professional.name}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Phone className="w-4 h-4" />
                  <span>{professional.phone ? professional.phone : "-"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <UserCheck className="w-4 h-4" />
              <span>{professional.status}</span>
            </div>

          </div>
        ))}

        {filteredProfessionals.length === 0 && (
          <div 
            className="
                bg-white 
                rounded-xl 
                shadow-sm 
                p-16
                flex 
                flex-col 
                items-center 
                justify-center 
                text-center 
                border-rose-outline
                mx-auto
                w-full
                col-span-full
            "
        >
            <User className="w-12 h-12 text-[var(--color-primary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
                {searchTerm ? "Nenhum profissional encontrado" : "Nenhum profissional cadastrado"}
            </h3>
          </div>
        )}
      </div>

      <ProfessionalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProfessional(null)
        }}
        onSave={handleSave}
        professional={editingProfessional}
      />
    </div>
  )
}
