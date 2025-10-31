"use client"

import { useEffect, useState } from "react"
import { Pencil, PlusCircle, Scissors, Trash2, Wrench } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { worksApi } from "@/lib/api"
import type { Work } from "@/lib/types"
import { WorkModal } from "./work-modal"
import { CategoryBadge } from "@/components/category-badge"
import { StatusBadge } from "@/components/status-badge"

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([])
  const [filterCategory, setFilterCategory] = useState("All")
  const [filterName, setFilterName] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedWork, setSelectedWork] = useState<Work | null>(null)

  const limitarTexto = (texto: string, limite: number): string => {
    if (texto.length > limite) {
        return texto.substring(0, limite) + '...';
    }
    return texto;
  };

  const loadWorks = async () => {
    try {
      const response = await worksApi.getAll()
      setWorks(response.data)
    } catch (error) {
      console.error("Erro ao carregar serviços:", error)
    }
  }

  useEffect(() => {
    loadWorks()
  }, [])

  const filteredWorks = works.filter((work) => {
    const matchesCategory = filterCategory != "All" ? work.category === filterCategory : true
    const matchesName = filterName
      ? work.name.toLowerCase().includes(filterName.toLowerCase())
      : true
    return matchesCategory && matchesName
  })

  const handleNewWork = () => {
    setSelectedWork(null)
    setIsModalOpen(true)
  }

  const handleEditWork = (work: Work) => {
    setSelectedWork(work)
    setIsModalOpen(true)
  }

  const handleDeleteWork = async (id: string) => {
    if (!confirm("Deseja realmente excluir este serviço?")) return
    try {
      await worksApi.delete(id)
      loadWorks()
    } catch (error) {
      console.error("Erro ao excluir serviço:", error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Serviços"
        description="Gerencie os serviços disponíveis em seu estabelecimento."
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nome"
          className="max-w-xs"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Todas as Categorias</SelectItem>
            <SelectItem value="Salão">Salão</SelectItem>
            <SelectItem value="Estética">Estética</SelectItem>
            <SelectItem value="Bronze">Bronze</SelectItem>
            <SelectItem value="Loja de roupas">Loja de roupas</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleNewWork}
          className="ml-auto bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorks.map((work) => (
          <div
            key={String(work.id)}
            className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2">
                <StatusBadge status={work.status} />
                <CategoryBadge category={work.category} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditWork(work)}
                  className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteWork(String(work.id))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{work.name}</h3>

            </div>
            <p className="text-sm text-muted-foreground mb-3">{limitarTexto(String(work.description), 50)}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-[var(--primary)]">
                R$ {work.price?.toFixed(2) ?? "0,00"}
              </span>
            </div>
          </div>
        ))}

        {filteredWorks.length === 0 && (
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
            <Scissors className="w-12 h-12 text-[var(--color-primary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
                Nenhum serviço encontrado
            </h3>
          </div>
        )}
      </div>

      <WorkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={loadWorks}
        work={selectedWork}
      />
    </div>
  )
}
