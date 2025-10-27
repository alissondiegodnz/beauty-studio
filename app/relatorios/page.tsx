"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, Receipt, Package, CalendarIcon, TagIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { reportsApi } from "@/lib/api"
import type { ReportData } from "@/lib/types"

const COLORS = ["#E91E8C", "#F59E0B", "#10B981", "#3B82F6"]

export default function RelatoriosPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [startDate, setStartDate] = useState("2025-10-01")
  const [endDate, setEndDate] = useState("2025-10-31")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    loadReportData()
  }, [startDate, endDate, selectedCategory])

  const loadReportData = async () => {
    try {
      const params: any = { startDate, endDate }
      if (selectedCategory !== "all") params.category = selectedCategory

      const response = await reportsApi.getData(params)
      setReportData(response.data)
    } catch (error) {
      console.error("Error loading report data:", error)
    }
  }

  if (!reportData) {
    return <div>Carregando...</div>
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Relatórios" description="Análise de receita e desempenho" />

      {/* Filters */}
      <div className="grid grid-cols-3 gap-6 mb-6 p-4 bg-white rounded-xl shadow-md border border-[var(--color-border)]">
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm opacity-90">Receita Total</span>
          </div>
          <p className="text-3xl font-bold">R$ {reportData.totalRevenue.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">No período</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-text-secondary)]">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Receita Hoje</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-primary)]">R$ {reportData.todayRevenue.toFixed(2)}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">1 serviços</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-text-secondary)]">
            <Receipt className="w-5 h-5" />
            <span className="text-sm">Ticket Médio</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-primary)]">R$ {reportData.averageTicket.toFixed(2)}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">Por serviço</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <h3 className="font-bold text-lg mb-4 text-[var(--color-text-primary)]">Receita Diária</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.dailyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E91E8C" stopOpacity={1} />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3E8EE" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Bar dataKey="value" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

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
              >
                {reportData.revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Professional */}
        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] mb-8">
          <h3 className="font-bold text-lg mb-4 text-[var(--color-text-primary)]">Receita por Profissional</h3>
          <div className="space-y-4">
            {reportData.revenueByProfessional.map((professional, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold">
                    {professional.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{professional.name}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{professional.services} serviços</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-[var(--color-primary)]">R$ {professional.total.toFixed(2)}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Média: R$ {professional.average.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <h3 className="font-bold text-lg mb-4 text-[var(--color-text-primary)]">Métodos de Pagamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.paymentMethods}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3E8EE" />
              <XAxis dataKey="method" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Bar dataKey="value" fill="#E91E8C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
