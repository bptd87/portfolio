import React, { useState, useEffect } from 'react';
import VisitorMap from './VisitorMap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Globe,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Table,
  Search,
  Database,
  X
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';
import { AdminTokens } from '../../styles/admin-tokens';
// Recharts imported directly to ensure reliable chart rendering in Next/Vite

// Vibrant Palette (Restored)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface AnalyticsStats {
  articles: number;
  portfolio: number;
  news: number;
  links: number;
  tutorials: number;
  collaborators: number;
  categories: number;
  contactForms: number;
}

interface PageView {
  path: string;
  views: number;
}

interface DailyTraffic {
  date: string;
  views: number;
}

export function AnalyticsManager() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [dailyTraffic, setDailyTraffic] = useState<DailyTraffic[]>([]);
  const adminToken = sessionStorage.getItem('admin_token');
  const [topPages, setTopPages] = useState<PageView[]>([]);
  const [topLocations, setTopLocations] = useState<{ location: string; views: number }[]>([]);
  const [deviceStats, setDeviceStats] = useState<{ name: string; value: number }[]>([]);
  const [browserStats, setBrowserStats] = useState<{ name: string; value: number }[]>([]);
  const [rawViews, setRawViews] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'database'>('overview');
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState<'us' | 'world'>('us');
  const [selectedRegion, setSelectedRegion] = useState<{ name: string, type: 'us' | 'world' } | null>(null);

  const uniqueVisitors = React.useMemo(() => {
    const ids = new Set<string>();
    rawViews.forEach((view: any) => {
      if (view.ip) ids.add(view.ip);
      else if (view.user_agent) ids.add(view.user_agent);
      else if (view.id) ids.add(String(view.id));
    });
    return ids.size;
  }, [rawViews]);

  const averageDailyViews = React.useMemo(() => {
    if (!dailyTraffic.length) return 0;
    const total = dailyTraffic.reduce((sum, day) => sum + (day.views || 0), 0);
    return Math.round(total / dailyTraffic.length);
  }, [dailyTraffic]);

  // Filter cities based on selection
  const topCities = React.useMemo(() => {
    if (!selectedRegion) return [];

    const cityMap = new Map<string, number>();
    rawViews.forEach((view: any) => {
      let match = false;
      if (selectedRegion.type === 'us') {
        // Match Region (State)
        if (view.country === 'United States' && view.region?.toLowerCase() === selectedRegion.name.toLowerCase()) {
          match = true;
        }
      } else {
        // Match Country
        // Handle "United States of America" -> "United States" mapping if needed
        const viewCountry = view.country?.toLowerCase();
        const selName = selectedRegion.name.toLowerCase();
        if (viewCountry === selName || (selName === 'united states of america' && viewCountry === 'united states')) {
          match = true;
        }
      }

      if (match && view.city) {
        cityMap.set(view.city, (cityMap.get(view.city) || 0) + 1);
      }
    });

    return Array.from(cityMap.entries())
      .map(([city, views]) => ({ city, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5); // Top 5 cities
  }, [selectedRegion, rawViews]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();

        // 1. Fetch Content Stats (Existing API)
        const statsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/stats`,
          { headers: { 'X-Admin-Token': adminToken || '' } }
        );
        if (statsResponse.status === 401) {
          // If already handled elsewhere, maybe skip toast? but for now be explicit
          // console.warn('Admin token expired');
        }
        if (statsResponse.ok) {
          setStats(await statsResponse.json());
        }

        // 2. Fetch Page Views (Direct DB Access)
        const now = new Date();
        const pastDate = new Date();

        switch (dateRange) {
          case '24h': pastDate.setHours(pastDate.getHours() - 24); break;
          case '7d': pastDate.setDate(pastDate.getDate() - 7); break;
          case '30d': pastDate.setDate(pastDate.getDate() - 30); break;
          case '90d': pastDate.setDate(pastDate.getDate() - 90); break;
        }

        const { data: viewsData, error } = await supabase
          .from('page_views')
          // Fetch EVERYTHING for the database view
          .select('*')
          .gte('created_at', pastDate.toISOString())
          .order('created_at', { ascending: false });

        if (error) console.error('Error fetching views:', error);

        if (!error && viewsData) {
          setRawViews(viewsData);
          // Process Total Views
          setTotalViews(viewsData.length);

          // Process Daily Traffic
          const dailyMap = new Map<string, number>();
          viewsData.forEach((view: any) => {
            const date = new Date(view.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
          });

          // Fill in missing days (or hours if 24h)
          const chartData: DailyTraffic[] = [];

          if (dateRange === '24h') {
            const days = 1;
            for (let i = days - 1; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              chartData.push({
                date: dateStr,
                views: dailyMap.get(dateStr) || 0
              });
            }
          } else {
            const days = dateRange === '90d' ? 90 : dateRange === '30d' ? 30 : 7;
            for (let i = days - 1; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              chartData.push({
                date: dateStr,
                views: dailyMap.get(dateStr) || 0
              });
            }
          }
          setDailyTraffic(chartData);

          // Process Top Pages
          const pageMap = new Map<string, number>();
          viewsData.forEach((view: any) => {
            pageMap.set(view.path, (pageMap.get(view.path) || 0) + 1);
          });

          const sortedPages = Array.from(pageMap.entries())
            .map(([path, views]) => ({ path, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

          setTopPages(sortedPages);

          // Process Top Locations
          const locMap = new Map<string, number>();
          viewsData.forEach((view: any) => {
            // Build location string: City, Region, Country
            const parts = [view.city, view.region, view.country].filter(Boolean);
            if (parts.length > 0) {
              const loc = parts.join(', ');
              locMap.set(loc, (locMap.get(loc) || 0) + 1);
            } else {
              // Fallback
              const unknown = 'Unknown Location';
              locMap.set(unknown, (locMap.get(unknown) || 0) + 1);
            }
          });

          const sortedLocations = Array.from(locMap.entries())
            .map(([location, views]) => ({ location, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

          setTopLocations(sortedLocations);

          // Process Device Stats
          let mobile = 0;
          let desktop = 0;
          viewsData.forEach((view: any) => {
            if (view.screen_width < 768) mobile++;
            else desktop++;
          });
          setDeviceStats([
            { name: 'Mobile', value: mobile },
            { name: 'Desktop', value: desktop }
          ].filter(i => i.value > 0));

          // Process Browser Stats (Simple)
          const browserMap = new Map<string, number>();
          viewsData.forEach((view: any) => {
            const ua = view.user_agent || '';
            let browser = 'Other';
            if (ua.includes('Edg/')) browser = 'Edge';
            else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
            else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
            else if (ua.includes('Firefox/')) browser = 'Firefox';

            browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
          });
          setBrowserStats(Array.from(browserMap.entries()).map(([name, value]) => ({ name, value })));
        }

      } catch (error) {
        console.error('Analytics Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 3. Real-time Subscription
    const supabase = createClient();
    const subscription = supabase
      .channel('public:page_views')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'page_views' },
        (payload) => {
          console.log('Real-time update:', payload);
          const newView = payload.new;

          setRawViews((prev) => [newView, ...prev]);
          setTotalViews((prev) => prev + 1);

          // Note: Full reprocessing of charts/maps would be ideal here, 
          // but for now we just push to the raw log for instant feedback.
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-brand"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display italic">Analytics Overview</h2>
          <p className="text-muted-foreground">Traffic & Engagement • Last {dateRange === '24h' ? '24 Hours' : dateRange === '7d' ? '7 Days' : dateRange === '30d' ? '30 Days' : '90 Days'}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${viewMode === 'overview' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              <BarChart3 className="w-4 h-4" /> Overview
            </button>
            <button
              onClick={() => setViewMode('database')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${viewMode === 'database' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              <Database className="w-4 h-4" /> Database
            </button>
          </div>

          {/* Date Filter */}
          <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
            {(['24h', '7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${dateRange === range ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {viewMode === 'database' ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="p-4 border-b border-border flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search IP, Path, Country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-accent-brand"
              />
            </div>
            <div className="text-sm text-neutral-500">
              Showing {rawViews.filter(v => JSON.stringify(v).toLowerCase().includes(searchTerm.toLowerCase())).length} records
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-900/50 text-neutral-400 font-medium">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Visitor Location</th>
                  <th className="px-4 py-3">Page Path</th>
                  <th className="px-4 py-3">Referrer</th>
                  <th className="px-4 py-3">Device / OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {rawViews
                  .filter(v => !searchTerm || JSON.stringify(v).toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((view) => (
                    <tr key={view.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-500">
                        {new Date(view.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {view.country && <span className="text-lg">{getErrorFlag(view.country)}</span>}
                          <span>
                            {view.city ? `${view.city}, ` : ''}{view.country || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-accent-brand">
                        {view.path}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 max-w-[200px] truncate" title={view.referrer}>
                        {getReferrerHost(view.referrer) || '-'}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 max-w-[200px] truncate" title={view.user_agent}>
                        {view.screen_width < 768 ? '📱 Mobile' : '🖥️ Desktop'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Activity Log (Top Priority) */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-brand" />
              Recent Activity (Live)
            </h3>
            <div className="space-y-0 divide-y divide-border/50 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {rawViews.length > 0 ? (
                rawViews.slice(0, 50).map((view, i) => (
                  <div key={i} className="py-3 flex items-start justify-between gap-4 text-sm group hover:bg-white/5 px-2 rounded-md transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium flex items-center gap-2">
                        {view.country ? getErrorFlag(view.country) : '🌍'}
                        {[view.city, view.region, view.country].filter(Boolean).join(', ') || 'Unknown Location'}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[300px] font-mono opacity-70">
                        {view.path}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                      <span className="text-xs font-medium text-accent-brand">
                        {getTimeAgo(view.created_at)}
                      </span>
                      {view.referrer && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={view.referrer}>
                          via {getReferrerHost(view.referrer)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground italic">No recent activity</div>
              )}
            </div>
          </div>

          {/* 2. Device & Browser (Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-medium mb-6">Device Breakdown</h3>
              <div className="h-48 w-full">
                {deviceStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {deviceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', padding: '8px 12px' }}
                        itemStyle={{ color: '#E5E5E5', fontSize: '12px' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', opacity: 0.7 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                    No device data
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-medium mb-6">Browser Share</h3>
              <div className="h-48 w-full">
                {browserStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={browserStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {browserStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', padding: '8px 12px' }}
                        itemStyle={{ color: '#E5E5E5', fontSize: '12px' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', opacity: 0.7 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                    No browser data
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={`${dateRange.toUpperCase()} Views`}
              value={totalViews.toLocaleString()}
              icon={Eye}
              trend="Live updates"
              trendUp={true}
              helper={`Avg/day: ${averageDailyViews.toLocaleString()}`}
            />
            <StatCard
              title="Unique Visitors"
              value={uniqueVisitors.toLocaleString()}
              icon={Users}
              trend="Estimated"
              trendUp={true}
            />
            <StatCard
              title="Top Page"
              value={(topPages[0]?.views || 0).toLocaleString()}
              icon={TrendingUp}
              trend="Most viewed"
              trendUp={true}
              helper={topPages[0]?.path || 'No data'}
            />
            <StatCard
              title="Top Location"
              value={(topLocations[0]?.views || 0).toLocaleString()}
              icon={Globe}
              trend="Most active"
              trendUp={true}
              helper={topLocations[0]?.location || 'No data'}
            />
          </div>

          {stats && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-medium mb-4">Content Inventory</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricChip label="Projects" value={stats.portfolio} />
                <MetricChip label="Articles" value={stats.articles} />
                <MetricChip label="News" value={stats.news} />
                <MetricChip label="Tutorials" value={stats.tutorials} />
              </div>
            </div>
          )}

          {/* 4. Main Traffic Chart + Content Distribution (Split Row) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT COLUMN: Traffic + Top Pages */}
            <div className="lg:col-span-2 space-y-6">

              {/* Traffic Overview */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium">Traffic Overview</h3>
                </div>
                <div className="h-48 w-full"> {/* Reduced height from h-64 to h-48 */}
                  {dailyTraffic.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyTraffic}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: '#888' }}
                          tickLine={false}
                          axisLine={false}
                          interval={Math.floor(dailyTraffic.length / 5)}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#888' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar
                          dataKey="views"
                          fill="#D4AF37"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                      No traffic data
                    </div>
                  )}
                </div>
              </div>

              {/* Webpage Popularity (Moved here) */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-medium mb-6">Webpage Popularity (Top Pages)</h3>
                <div className="space-y-4">
                  {topPages.length > 0 ? (
                    topPages.map((page, i) => (
                      <div key={i} className="flex items-center justify-between text-sm group hover:bg-white/5 p-2 rounded-md transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="font-mono text-xs opacity-50 w-4">{i + 1}.</span>
                          <span className="truncate font-mono text-xs text-accent-brand" title={page.path}>
                            {page.path}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-white/40 rounded-full"
                              style={{ width: `${(page.views / Math.max(1, topPages[0].views)) * 100}%` }}
                            />
                          </div>
                          <span className="font-medium min-w-[3rem] text-right">{page.views}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground italic">No page data available</div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Top Locations */}
            <div className="bg-card border border-border rounded-xl p-6 h-fit transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium">
                  {selectedRegion ? `Top Cities in ${selectedRegion.name}` : 'Top Locations'}
                </h3>
                {selectedRegion && (
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="text-xs text-accent-brand hover:text-white flex items-center gap-1"
                  >
                    <X size={12} /> Clear Selection
                  </button>
                )}
              </div>

              {/* Visitor Map Visualization */}
              <div className="mb-6 relative">
                <VisitorMap
                  type={mapView}
                  onRegionClick={(name) => setSelectedRegion({ name, type: mapView })}
                  data={
                    (() => {
                      const mapData = new Map<string, number>();
                      // ... (existing map aggregation logic)
                      if (mapView === 'us') {
                        // US State Logic
                        rawViews.forEach((view: any) => {
                          if (view.country === 'United States' && view.region) {
                            mapData.set(view.region, (mapData.get(view.region) || 0) + 1);
                          }
                        });
                      } else {
                        // World Country Logic
                        rawViews.forEach((view: any) => {
                          if (view.country) {
                            mapData.set(view.country, (mapData.get(view.country) || 0) + 1);
                          }
                        });
                      }
                      return Array.from(mapData.entries()).map(([name, views]) => ({ name, views }));
                    })()
                  } />

                {/* External Toggle (Only show if no region selected to reduce clutter?) */}
                {!selectedRegion && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button onClick={() => setMapView('us')} className={`text-xs px-2 py-1 rounded border ${mapView === 'us' ? 'bg-white/10 border-white/20' : 'border-transparent text-muted-foreground hover:text-white'}`}>US Only</button>
                    <button onClick={() => setMapView('world')} className={`text-xs px-2 py-1 rounded border ${mapView === 'world' ? 'bg-white/10 border-white/20' : 'border-transparent text-muted-foreground hover:text-white'}`}>World</button>
                  </div>
                )}
              </div>

              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                {selectedRegion ? (
                  // CITIES VIEW
                  topCities.length > 0 ? (
                    topCities.map((city, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 rounded hover:bg-white/5 transition-colors">
                        <span className="truncate max-w-[180px] font-medium flex items-center gap-2">
                          <span className="opacity-50 text-xs w-4">{i + 1}.</span>
                          {city.city}
                        </span>
                        <span className="font-mono text-xs opacity-70 w-8 text-right">{city.views}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground italic text-center py-4">No specific city data found for this region.</div>
                  )
                ) : (
                  // DEFAULT LOCATIONS VIEW
                  topLocations.length > 0 ? (
                    topLocations.map((loc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="truncate max-w-[180px] font-medium flex items-center gap-2">
                          <span className="opacity-50 text-xs w-4">{i + 1}.</span>
                          {loc.location}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            {/* Fix dividing by zero possibility */}
                            <div className="h-full bg-accent-brand rounded-full" style={{ width: `${(loc.views / Math.max(1, topLocations[0].views)) * 100}%` }} />
                          </div>
                          <span className="font-mono text-xs opacity-70 w-8 text-right">{loc.views}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground italic">No location data available</div>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper for relative time (Simple implementation without date-fns)
function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " seconds ago";
}

// Helper to get simple flag emoji from country code if possible, or just use code
function getErrorFlag(countryName: string) {
  // This is a placeholder. Real implementation would map code to flag or use a lib.
  // For now returning a generic globe if no flag mapping
  return '🌍';
}

function getReferrerHost(referrer?: string) {
  if (!referrer) return '';
  try {
    return new URL(referrer).hostname.replace('www.', '');
  } catch {
    return referrer;
  }
}

function StatCard({ title, value, icon: Icon, trend, trendUp, isMock, helper }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-accent-brand/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-secondary rounded-lg">
          <Icon className="w-5 h-5 text-accent-brand" />
        </div>
        {isMock && <span className="text-[10px] uppercase tracking-wider opacity-40">Est.</span>}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
        {helper && (
          <p className="text-xs text-muted-foreground/80 truncate" title={helper}>
            {helper}
          </p>
        )}
      </div>
      <div className={`flex items-center gap-1 mt-4 text-xs ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function DistributionItem({ label, count, total, color }: any) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{count} ({percentage}%)</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TopPageRow({ path, views }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="truncate max-w-[180px] font-mono text-xs opacity-80">{path}</span>
      <span className="font-medium">{views.toLocaleString()}</span>
    </div>
  );
}
