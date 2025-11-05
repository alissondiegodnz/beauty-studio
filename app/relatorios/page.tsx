"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, Receipt, Package, CalendarIcon, TagIcon, User, Scissors } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { reportsApi, professionalsApi } from "@/lib/api"
import type { Professional } from "@/lib/types"
import type { ReportData } from "@/lib/types"
import { startOfMonth, endOfMonth, format, set } from 'date-fns';
import Loading from "@/components/loading"

const COLORS = ["#e8c4c8", "#d4c5aa", "#ce9d5eff", "#d39b9fff"]

export default function RelatoriosPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  
  const [startDate, setStartDate] = useState(() => 
  format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );

  const [endDate, setEndDate] = useState(() => 
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReportData()
  }, [startDate, endDate, selectedCategory])
  
  useEffect(() => {
    loadProfessionals()
  }, [])

  useEffect(() => {
    loadReportData()
  }, [selectedProfessional])

  const loadReportData = async () => {
    setIsLoading(true)
    try {
      const params: any = { startDate, endDate }
      if (selectedCategory !== "all") params.category = selectedCategory
      if (selectedProfessional !== "all") params.professionalId = selectedProfessional

      const response = await reportsApi.getData(params)
      setReportData(response.data)
    } catch (error) {
      console.error("Error loading report data:", error)
      setReportData({
        todayRevenue: 0,
        totalRevenue: 0,
        totalPayments: 0,
        totalServices: 0,
        dailyRevenue: [],
        revenueByCategory: [],
        paymentMethods: [],
        revenueByProfessional: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadProfessionals = async () => {
    try {
      const res = await professionalsApi.getAll()
      setProfessionals(res.data)
    } catch (error) {
      console.error("Error loading professionals:", error)
    }
  }

  if (isLoading) {
      return <Loading />
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Relatórios" description="Análise de receita e desempenho" />

      {/* Filters */}
      <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-white rounded-xl shadow-md border border-[var(--color-border)]">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--color-text-primary)]">
              <CalendarIcon className="w-4 h-4" />
              Data Início
            </label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--color-text-primary)]">
              <CalendarIcon className="w-4 h-4" />
              Data Fim
            </label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--color-text-primary)]">
              <TagIcon className="w-4 h-4" />
              Categoria
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Salão">Salão</SelectItem>
                <SelectItem value="Estética">Estética</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Loja de roupas">Loja de roupas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--color-text-primary)]">
              <User className="w-4 h-4" />
              Profissional
            </label>
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {professionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-text-secondary)]">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Receita Hoje</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-primary)]">R$ {reportData.todayRevenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-[var(--gold-accent)] to-[var(--gold-medium)] rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm opacity-90">Receita Total</span>
          </div>
          <p className="text-3xl font-bold">R$ {reportData.totalRevenue.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">No período</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-text-secondary)]">
            <Package className="w-5 h-5" />
            <span className="text-sm">Total de Pagamentos</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-primary)]">{reportData.totalPayments}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">No período</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-text-secondary)]">
            <Package className="w-5 h-5" />
            <span className="text-sm">Total de Serviços</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-primary)]">{reportData.totalServices}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">No período</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <h3 className="font-bold text-lg mb-4 text-[var(--color-text-primary)]">Receita Diária</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.dailyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e6d5b8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#d4c5aa" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3E8EE" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip formatter={(value) => (typeof value === "number" ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : value)} />
              <Bar dataKey="value" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Charts 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Revenue by Category Chart */}
        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <h3 className="font-bold text-lg mb-4 text-[var(--color-text-primary)]">Receita por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.revenueByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="category"
              >
                {reportData.revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => (typeof value === "number" ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Métodos de Pagamento</h3>
          <p className="text-sm text-[var(--color-destructive)] mt-1 mb-4">* Calculado sobre o total do período (desconsiderando filtros)</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.paymentMethods}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3E8EE" />
              <XAxis dataKey="method" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip formatter={(value) => (typeof value === "number" ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : value)} />
              <Bar dataKey="value" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Professional */}
      <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] mb-8">
          <h3 className="font-bold text-lg mb-4 text-[var(--color-text-primary)]">Receita por Profissional</h3>
          <div className="space-y-4">
            {reportData.revenueByProfessional.map((professional, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[var(--gold-ultra-light)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold">
                    {professional.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium mb-3 text-[var(--color-text-primary)]">{professional.name}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <Scissors className="w-4 h-4" />
                      <span className="text-base font-semibold text-[var(--color-primary)] opacity-90">{professional.services} Serviços feitos</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-base text-[var(--color-success)] opacity-90">Participa de {professional.payments} Pagamentos</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-[var(--color-primary)]">R$ {professional.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}
