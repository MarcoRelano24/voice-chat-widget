'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import {
  ChartBarIcon,
  PhoneIcon,
  CubeIcon,
  UsersIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  totalWidgets: number
  totalCalls: number
  activeWidgets: number
  totalClients: number
  callsOverTime: { date: string; calls: number }[]
  widgetPerformance: { name: string; calls: number }[]
  widgetTypeDistribution: { type: string; count: number }[]
  topDomains: { domain: string; visits: number }[]
  recentActivity: { event: string; timestamp: string; widget: string }[]
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(30) // days
  const [data, setData] = useState<AnalyticsData>({
    totalWidgets: 0,
    totalCalls: 0,
    activeWidgets: 0,
    totalClients: 0,
    callsOverTime: [],
    widgetPerformance: [],
    widgetTypeDistribution: [],
    topDomains: [],
    recentActivity: []
  })

  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const startDate = startOfDay(subDays(new Date(), dateRange))
      const endDate = endOfDay(new Date())

      // Fetch total widgets
      const { count: totalWidgets } = await supabase
        .from('widgets')
        .select('*', { count: 'exact', head: true })

      // Fetch active widgets
      const { count: activeWidgets } = await supabase
        .from('widgets')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Fetch total clients
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })

      // Fetch call events (call_started)
      const { data: callEvents, count: totalCalls } = await supabase
        .from('widget_analytics')
        .select('*, widgets!inner(name)', { count: 'exact' })
        .eq('event_type', 'call_started')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: false })

      // Process calls over time
      const callsOverTime: { [key: string]: number } = {}
      callEvents?.forEach(event => {
        const date = format(parseISO(event.timestamp), 'MMM dd')
        callsOverTime[date] = (callsOverTime[date] || 0) + 1
      })

      const callsOverTimeArray = Object.entries(callsOverTime)
        .map(([date, calls]) => ({ date, calls }))
        .slice(-14) // Last 14 days

      // Widget performance
      const widgetCallCounts: { [key: string]: number } = {}
      callEvents?.forEach(event => {
        const widgetName = event.widgets?.name || 'Unknown'
        widgetCallCounts[widgetName] = (widgetCallCounts[widgetName] || 0) + 1
      })

      const widgetPerformance = Object.entries(widgetCallCounts)
        .map(([name, calls]) => ({ name, calls }))
        .sort((a, b) => b.calls - a.calls)
        .slice(0, 5)

      // Fetch all widgets for type distribution
      const { data: widgets } = await supabase
        .from('widgets')
        .select('type')

      const typeDistribution: { [key: string]: number } = {}
      widgets?.forEach(widget => {
        typeDistribution[widget.type] = (typeDistribution[widget.type] || 0) + 1
      })

      const widgetTypeDistribution = Object.entries(typeDistribution)
        .map(([type, count]) => ({ type, count }))

      // Top domains
      const { data: analyticsData } = await supabase
        .from('widget_analytics')
        .select('page_url')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .not('page_url', 'is', null)

      const domainCounts: { [key: string]: number } = {}
      analyticsData?.forEach(event => {
        try {
          const url = new URL(event.page_url || '')
          const domain = url.hostname
          domainCounts[domain] = (domainCounts[domain] || 0) + 1
        } catch (e) {
          // Invalid URL, skip
        }
      })

      const topDomains = Object.entries(domainCounts)
        .map(([domain, visits]) => ({ domain, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5)

      // Recent activity
      const { data: recentEvents } = await supabase
        .from('widget_analytics')
        .select('event_type, timestamp, widgets!inner(name)')
        .order('timestamp', { ascending: false })
        .limit(10)

      const recentActivity = recentEvents?.map(event => ({
        event: event.event_type,
        timestamp: format(parseISO(event.timestamp), 'MMM dd, HH:mm'),
        widget: event.widgets?.name || 'Unknown'
      })) || []

      setData({
        totalWidgets: totalWidgets || 0,
        totalCalls: totalCalls || 0,
        activeWidgets: activeWidgets || 0,
        totalClients: totalClients || 0,
        callsOverTime: callsOverTimeArray,
        widgetPerformance,
        widgetTypeDistribution,
        topDomains,
        recentActivity
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your voice widget performance and usage</p>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Show data for:</span>
          <div className="flex gap-2">
            {[7, 14, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  dateRange === days
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                <PhoneIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{data.totalCalls.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Calls</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center">
                <CubeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{data.totalWidgets}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Widgets</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{data.activeWidgets}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Widgets</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{data.totalClients}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Clients</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Calls Over Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Call Activity Trend</h3>
            {data.callsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.callsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                No call data available for this period
              </div>
            )}
          </div>

          {/* Widget Type Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Widget Type Distribution</h3>
            {data.widgetTypeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.widgetTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.widgetTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                No widgets created yet
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Performing Widgets */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Widgets</h3>
            {data.widgetPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.widgetPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="calls" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                No performance data available
              </div>
            )}
          </div>

          {/* Top Domains */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Top Domains
            </h3>
            {data.topDomains.length > 0 ? (
              <div className="space-y-3">
                {data.topDomains.map((domain, index) => (
                  <div key={domain.domain} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{domain.domain}</span>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{domain.visits} visits</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[252px] text-gray-500 dark:text-gray-400">
                No domain data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DevicePhoneMobileIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Recent Activity
          </h3>
          {data.recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Event</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Widget</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentActivity.map((activity, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-400">
                          {activity.event}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{activity.widget}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{activity.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
