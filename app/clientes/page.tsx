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

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const response = await clientsApi.getAll()
      setClients(response.data)
    } catch (error) {
      console.error("Error loading clients:", error)
    }
  }

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este cliente?")) {
      try {
        await clientsApi.delete(id)
        loadClients()
      } catch (error) {
        console.error("Error deleting client:", error)
      }
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    setEditingClient(null)
    loadClients()
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Clientes"
        description="Gerencie o cadastro de clientes"
        action={
          <Button
            onClick={() => {
              setEditingClient(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        }
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <Input
            id="search-clients"
            type="text"
            placeholder="Digite o nome do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-3">{client.name}</h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Phone className="w-4 h-4" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Mail className="w-4 h-4" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Calendar className="w-4 h-4" />
                <span>{client.birthDate ? new Date(client.birthDate).toLocaleDateString("pt-BR") : ""}</span>
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
                p-16 // Aumenta o padding para um visual espaçoso
                flex 
                flex-col 
                items-center 
                justify-center 
                text-center 
                border-rose-outline // Adiciona a borda
                mx-auto // Centraliza o card se ele não ocupar 100% da largura
                w-full // Garante que ele ocupe 100% da coluna
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
