"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { X, Plus, Trash2, Package as PackageIcon, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { packagesApi, servicesApi } from "@/lib/api"
import type { Service, Package, ProfessionalStatus, PackageService } from "@/lib/types"

interface PackageModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  packageToEdit: Package | null 
}

export function PackageModal({ isOpen, onClose, onSave, packageToEdit }: PackageModalProps) {
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [errors, setErrors] = useState<{ name?: string; price?: string; services?: string }>({})
  
  const getInitialFormData = () => ({
    name: "",
    status: "Ativo" as ProfessionalStatus,
    description: "",
    services: [] as PackageService[]
  })

  const [formData, setFormData] = useState(getInitialFormData)

  const loadInitialData = async () => {
    try {
      const servicesRes = await servicesApi.getAll()
      setAvailableServices(servicesRes.data)
    } catch (error) {
      console.error("Erro ao carregar serviços:", error)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setFormData(getInitialFormData())
      setErrors({})
      return
    }

    loadInitialData().then(() => {
      if (packageToEdit) {
        setFormData({
          name: packageToEdit.name,
          status: packageToEdit.status as ProfessionalStatus,
          description: packageToEdit.description || "",
          services: packageToEdit.services.map(s => ({
            id: s.id,
            name: s.name,
            price: s.price ?? 0,
            quantity: s.quantity
          })) 
        })
      } else {
        setFormData(getInitialFormData())
      }
    })
  }, [isOpen, packageToEdit])
  
  // --- Funções da Grid de Serviços do Pacote ---
  const handleAddService = (serviceIdToAdd: string) => {
    const service = availableServices.find(s => s.id === serviceIdToAdd)
    if (service && !formData.services.some(s => s.id === serviceIdToAdd)) { // Evita duplicados
      const newService: PackageService = {
        id: service.id,
        name: service.name,
        price: service.price || 0,
      }
      setFormData(prev => ({ 
        ...prev, 
        services: [...prev.services, newService] 
      }))
      setSelectedServiceId("") 
      setErrors(prev => ({ ...prev, services: undefined })) 
    }
  }

  const handleRemoveService = (serviceIdToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== serviceIdToRemove)
    }))
  }

  const handleUpdateServiceLine = (lineId: string, field: keyof Service, value: number) => {
      setFormData(prev => ({
        ...prev,
        services: prev.services.map(line => 
          line.id === lineId ? { ...line, [field]: value } : line
        )
      }))
    }
  

  // Calcula o valor total avulso dos serviços
  const totalServicesValue = useMemo(() => {
    return formData.services.reduce((sum, service) => sum + service.price, 0)
  }, [formData.services])

  // Serviços já adicionados no pacote
  const serviceIdsInPackage = formData.services.map(s => s.id)
  const availableServicesToAdd = availableServices.filter(s => !serviceIdsInPackage.includes(s.id))


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { name?: string; price?: string; services?: string } = {}
    if (!formData.name.trim()) newErrors.name = 'O nome do pacote é obrigatório.'
    if (formData.services.length === 0) {
        newErrors.services = 'O pacote deve conter pelo menos um serviço.'
    }
    {/*if (formData.price <= 0) newErrors.price = 'O preço do pacote deve ser maior que R$ 0,00.' */}

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    const dataToSend = {
        name: formData.name,
        status: formData.status,
        description: formData.description,
        services: formData.services.map(s => ({ id: s.id, name: s.name, price: s.price }) as Service)
    }

    try {
      if (packageToEdit) {
        await packagesApi.update(packageToEdit.id, dataToSend)
      } else {
        await packagesApi.create(dataToSend)
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Erro ao salvar pacote:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--color-border)] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {packageToEdit ? "Editar Pacote" : "Novo Pacote de Serviços"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* CAMPOS PRIMÁRIOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Nome do Pacote */}
            <div className="md:col-span-2">
              <Label htmlFor="packageName" className="mb-2">Nome do Pacote *</Label>
              <Input
                id="packageName"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  setErrors((prev) => ({ ...prev, name: undefined }))
                }}
                placeholder="Ex: Pacote Relax Total"
                required
              />
              {errors.name && <p className="text-xs text-[var(--destructive)] mt-1">{errors.name}</p>}
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
            {/* Preço Fixo do Pacote
            <div>
              <Label htmlFor="packagePrice" className="mb-2">Preço do Pacote (R$) *</Label>
              <Input
                id="packagePrice"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  setErrors((prev) => ({ ...prev, price: undefined }))
                }}
                placeholder="0.00"
                required
              />
              {errors.price && <p className="text-xs text-[var(--destructive)] mt-1">{errors.price}</p>}
            </div>*/}

            {/* Descrição */}
            <div className='md:col-span-3'>
              <Label htmlFor="description" className="mb-2">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes e observações sobre o pacote"
                rows={2}
              />
            </div>

          </div>
          
          {/* SELEÇÃO DE SERVIÇOS PARA ADICIONAR */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-[var(--gold-medium)]"/> 
                Serviços Incluídos
            </h3>
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <Label htmlFor="addService" className="mb-2">Adicionar Serviço ao Pacote</Label>
                <Select 
                    value={selectedServiceId} 
                    onValueChange={setSelectedServiceId}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um Serviço para adicionar" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableServicesToAdd.length > 0 ? (
                            availableServicesToAdd.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                    {service.name} (R$ {service.price ? service.price.toFixed(2) : '0.00'})
                                </SelectItem>
                            ))
                        ) : (
                            <div className="p-2 text-sm text-muted-foreground">Nenhum serviço disponível para adicionar.</div>
                        )}
                    </SelectContent>
                </Select>
              </div>
              
              {/* BOTÃO DE ADICIONAR */}
              <Button 
                type="button" 
                size="icon" 
                onClick={() => handleAddService(selectedServiceId)}
                disabled={!selectedServiceId}
                className="h-10 w-10 shrink-0"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            {errors.services && <p className="text-xs text-[var(--destructive)] mt-1">{errors.services}</p>}
          </div>

          {/* GRID DE SERVIÇOS DO PACOTE */}
          {formData.services.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-3/5">Serviço</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/5">Preço Avulso (R$)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/12"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {service.name}
                      </td>
                    
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <Input
                          type="number"
                          step="1.00"
                          value={service.price}
                          onChange={(e) => handleUpdateServiceLine(service.id, 'price', parseFloat(e.target.value))}
                          className="w-full text-right h-8"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveService(service.id)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* LINHA DE SOMA E PREÇO DO PACOTE */}
                  <tr>
                    <td className="px-3 py-2 font-bold text-sm text-gray-700" colSpan={1}>
                        Soma dos Preços Avulsos:
                    </td>
                    <td className="px-3 py-2 font-bold text-sm text-right text-gray-700" colSpan={2}>
                        R$ {totalServicesValue.toFixed(2)}
                    </td>
                  </tr>
                  {/*<tr className="bg-yellow-50/50">
                    <td className="px-3 py-2 font-bold text-base text-gray-800" colSpan={1}>
                        Preço Fixo do Pacote:
                    </td>
                    <td className="px-3 py-2 font-bold text-base text-right text-gray-800" colSpan={2}>
                        R$ {formData.price.toFixed(2)}
                    </td>
                  </tr>*/}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" className="bg-white hover:opacity-70" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70"
            >
              {packageToEdit ? "Atualizar Pacote" : "Salvar Pacote"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}