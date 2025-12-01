"use client"

import { useState, useEffect } from "react"
import { Plus, User, Phone, Mail, Calendar, Pencil, Trash2, Search } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { clientsApi } from "@/lib/api"
import type { Client } from "@/lib/types"
import { ClientModal } from "./client-modal"
import Loading from "@/components/loading"

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [page, setPage] = useState(1)
  const perPage = 30
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadClients(page, searchTerm)
  }, [page, searchTerm])

  const loadClients = async (pageParam = page, qParam = "") => {
    setIsLoading(true)
    try {
      const response = await clientsApi.getPage(pageParam, perPage, qParam ? { q: qParam } : undefined)
      setClients(response.data)

      const totalHeader = response.headers?.["x-total-count"] || response.headers?.["X-Total-Count"]
      if (totalHeader) {
        setTotalCount(Number(totalHeader))
      } else {
        if (pageParam === 1 && response.data.length < perPage) {
          setTotalCount(response.data.length)
        } else if (response.data.length < perPage) {
          setTotalCount((pageParam - 1) * perPage + response.data.length)
        } else {
          setTotalCount(null)
        }
      }
    } catch (error) {
      console.error("Error loading clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClients = clients

  const triggerSearch = () => {
    setPage(1)
    setSearchTerm(searchInput)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este cliente?")) {
      try {
        await clientsApi.delete(id)
        loadClients(page, searchTerm)
      } catch (error) {
        console.error("Error deleting client:", error)
      }
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    setEditingClient(null)
    loadClients(page, searchTerm)
  }

  return (
    <div className="relative max-w-7xl mx-auto p-6">
      {isLoading && <Loading />}
      <PageHeader
        title="Clientes"
        description="Gerencie o cadastro de clientes"
        action={
          <Button
            onClick={() => { 
              setEditingClient(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70 
    text-white text-base py-5 rounded-lg flex items-center gap-4 shadow-md transition-all"
          >
            <Plus className="w-6 h-6" />
            Novo Cliente
          </Button>
        }
      />

      <div className="flex items-start gap-4 mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <Input
            id="search-clients"
            type="text"
            placeholder="Digite o nome do cliente..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e: any) => {
              if (e.key === "Enter") triggerSearch()
            }}
            className="pl-10 pr-28"
          />
        </div>
        <div className="">
            <Button size="sm" onClick={triggerSearch} className="h-9">
              Buscar
            </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold-accent)] to-[var(--gold-medium)] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-lg text-[var(--color-text-secondary)] mb-3">{client.name}</h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Phone className="w-4 h-4" />
                <span>{client.phone ? client.phone : "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Mail className="w-4 h-4" />
                <span>{client.email ? client.email : "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Calendar className="w-4 h-4" />
                <span>{client.birthDate ? new Date(`${client.birthDate}T12:00:00`).toLocaleDateString("pt-BR") : "-"}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
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
                {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </h3>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-[var(--color-text-secondary)]">Mostrando {clients.length} cliente(s)</div>
        <div className="flex items-center gap-2">
          <Button size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          <div className="px-3 text-sm">Página {page}{totalCount ? ` de ${Math.max(1, Math.ceil(totalCount / perPage))}` : ""}</div>
          <Button
            size="sm"
            disabled={totalCount ? page >= Math.ceil(totalCount / perPage) : clients.length < perPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingClient(null)
        }}
        onSave={handleSave}
        client={editingClient}
      />
    </div>
  )
}
