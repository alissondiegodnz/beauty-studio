"use client"

import { useEffect, useState } from "react"
import { DollarSign, Pencil, PlusCircle, Scissors, Trash2, Wrench } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { servicesApi } from "@/lib/api"
import type { Service } from "@/lib/types"
import { ServiceModal } from "./service-modal"
import { CategoryBadge } from "@/components/category-badge"
import { StatusBadge } from "@/components/status-badge"
import Loading from "@/components/loading"

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [filterCategory, setFilterCategory] = useState("All")
  const [filterName, setFilterName] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const limitarTexto = (texto: string, limite: number): string => {
    if (texto.length > limite) {
        return texto.substring(0, limite) + '...';
    }
    return texto;
  };

  const loadServices = async () => {
    setIsLoading(true)
    try {
      const response = await servicesApi.getAll()
      setServices(response.data)
    } catch (error) {
      console.error("Erro ao carregar serviços:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const filteredServices = services.filter((service) => {
    const matchesCategory = filterCategory != "All" ? service.category === filterCategory : true
    const matchesName = filterName
      ? service.name.toLowerCase().includes(filterName.toLowerCase())
      : true
    return matchesCategory && matchesName
  })

  const handleNewService = () => {
    setSelectedService(null)
    setIsModalOpen(true)
  }

  const handleEditService = (service: Service) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm("Deseja realmente excluir este serviço?")) return
    try {
      await servicesApi.delete(id)
      loadServices()
    } catch (error) {
      console.error("Erro ao excluir serviço:", error)
    }
  }

  return (
    <div className="relative mx-auto max-w-7xl">
      {isLoading && <Loading />}
      <PageHeader
        title="Serviços"
        description="Gerencie os serviços disponíveis em seu estabelecimento."
      />

      <div className="flex flex-wrap gap-3 mb-6">
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
          onClick={handleNewService}
          className="ml-auto bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div
            key={String(service.id)}
            className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2">
                <StatusBadge status={service.status} />
                <CategoryBadge category={service.category} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditService(service)}
                  className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteService(String(service.id))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{service.name}</h3>

            </div>
            <p className="text-sm text-muted-foreground mb-3">{limitarTexto(String(service.description), 30)}</p>
            <div className="flex items-center gap-2 text-[var(--color-success)] font-bold text-lg">
              <DollarSign className="w-5 h-5" />
              <span>R$ {service.price?.toFixed(2) ?? "0,00"}</span>
            </div>
          </div>
        ))}

        {filteredServices.length === 0 && (
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

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={loadServices}
        service={selectedService}
      />
    </div>
  )
}
