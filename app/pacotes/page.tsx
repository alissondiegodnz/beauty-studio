"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Edit, Trash2, Package as PackageIcon, DollarSign, Tag } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { packagesApi } from "@/lib/api"
import type { Package } from "@/lib/types" 
import { PackageModal } from "./package-modal" 
import Loading from "@/components/loading" // Mantido por referência

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [modalState, setModalState] = useState<{ isOpen: boolean; package: Package | null }>({
    isOpen: false,
    package: null
  })

  const loadPackages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await packagesApi.getAll()
      setPackages(response.data)
    } catch (error) {
      console.error("Erro ao carregar pacotes:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPackages()
  }, [loadPackages])

  const filteredPackages = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase().trim()
    if (!lowerCaseSearch) return packages

    return packages.filter((pkg) =>
      pkg.name.toLowerCase().includes(lowerCaseSearch) ||
      pkg.services.some(s => s.name.toLowerCase().includes(lowerCaseSearch))
    )
  }, [packages, searchTerm])
  
  const handleOpenNewModal = () => {
    setModalState({ isOpen: true, package: null })
  }

  const handleOpenEditModal = (pkg: Package) => {
    setModalState({ isOpen: true, package: pkg })
  }

  const handleCloseModal = () => {
    setModalState({ isOpen: false, package: null })
  }

  const handleSaveModal = () => {
    setModalState({ isOpen: false, package: null })
    loadPackages()
  }

  const handleDeletePackage = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este pacote? Todos os pagamentos associados a ele precisarão ser revisados.")) {
      try {
        await packagesApi.delete(id)
        loadPackages()
      } catch (error) {
        console.error("Erro ao deletar pacote:", error)
        alert("Não foi possível deletar o pacote.")
      }
    }
  }
  
  const totalPackages = packages.length

  return (
    <div className="relative mx-auto max-w-7xl">
      {loading && <Loading />}
      
      {/* HEADER DA PÁGINA */}
      <PageHeader
        title="Gestão de Pacotes"
        description="Crie e gerencie os pacotes de serviços disponíveis"
        action={
          <Button 
            onClick={handleOpenNewModal}
            className="bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pacote
          </Button>
        }
      />

      {/* FERRAMENTAS DE BUSCA E FILTRO (Simplificado) */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        <div className="col-span-5 p-4 bg-white rounded-xl shadow-md border border-[var(--color-border)]">
          <h3 className="text-sm font-medium mb-4 text-[var(--color-text-primary)]">Busca</h3>
          <Input
            type="search"
            placeholder="Buscar pacote por nome ou serviços incluídos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md border-[var(--color-border)]"
          />
        </div>
      </div>


      {/* KPI Cards (Simplificado para Pacotes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[var(--gold-accent)] to-[var(--gold-medium)] rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <PackageIcon className="w-5 h-5" />
            <span className="text-sm opacity-90">Total de Pacotes</span>
          </div>
          <p className="text-3xl font-bold">{totalPackages}</p>
          <p className="text-xs opacity-75 mt-1">Cadastrados</p>
        </div>
      </div>

      {/* Grid de Pacotes */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPackages.map((pkg) => (
          <div
            key={String(pkg.id)}
            className="bg-white rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-[var(--gold-medium)]" />
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{pkg.name}</h3>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEditModal(pkg)}
                  className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePackage(String(pkg.id))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-lg text-[var(--color-success)]">
                  <DollarSign className="w-5 h-5" />
                  <span>R$ {pkg.calculatedPrice ? pkg.calculatedPrice.toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex items-start gap-2 text-[var(--color-text-secondary)] text-sm">
                  <Tag className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {pkg.services.map(service => (
                        <span key={service.id} className="bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                            {service.name}
                        </span>
                    ))}
                    {pkg.services.length === 0 && <span className="text-xs text-red-500">Nenhum serviço incluído.</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <p className="font-medium">Descrição:</p>
                <p>{pkg.description || 'Nenhuma descrição fornecida.'}</p>
              </div>
            </div>
          </div>
        ))}

        {filteredPackages.length === 0 && !loading && (
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
              "
          >
              <PackageIcon className="w-12 h-12 text-[var(--gold-medium)] mb-4" />
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
                  Nenhum pacote encontrado
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                  Verifique o termo de busca ou crie um novo pacote.
              </p>
          </div>
        )}
      </div>

      {/* MODAL */}
      <PackageModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
        packageToEdit={modalState.package}
      />
    </div>
  )
}