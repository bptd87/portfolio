import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Globe, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText 
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';
import { AdminTokens } from '../../styles/admin-tokens';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

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
  const [topPages, setTopPages] = useState<PageView[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();

        // 1. Fetch Content Stats (Existing API)
        const statsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/stats`,
          { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
        );
        if (statsResponse.ok) {
          setStats(await statsResponse.json());
        }

        // 2. Fetch Page Views (Direct DB Access)
        // Get last 30 days of traffic
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: viewsData, error } = await supabase
          .from('page_views')
          .select('created_at, path')
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (!error && viewsData) {
          // Process Total Views
          setTotalViews(viewsData.length);

          // Process Daily Traffic
          const dailyMap = new Map<string, number>();
          viewsData.forEach((view: any) => {
            const date = new Date(view.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
          });

          // Fill in missing days
          const chartData: DailyTraffic[] = [];
          for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            chartData.push({
              date: dateStr,
              views: dailyMap.get(dateStr) || 0
            });
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
            .slice(0, 5);
            
          setTopPages(sortedPages);
        }

      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-brand"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display italic">Analytics Overview</h2>
          <p className="text-muted-foreground">Site performance and content metrics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Data
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Projects" 
          value={stats?.portfolio || 0} 
          icon={Globe} 
          trend="+2 this month" 
          trendUp={true} 
        />
        <StatCard 
          title="Articles Published" 
          value={stats?.articles || 0} 
          icon={FileText} 
          trend="+1 this week" 
          trendUp={true} 
        />
        <StatCard 
          title="30-Day Views" 
          value={totalViews} 
          icon={Eye} 
          trend="Real-time" 
          trendUp={true} 
        />
        <StatCard 
          title="Avg. Time on Site" 
          value="--" 
          icon={Clock} 
          trend="Coming Soon" 
          trendUp={false} 
          isMock={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Traffic Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium">Traffic Overview (Last 30 Days)</h3>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTraffic}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: '#888' }} 
                  tickLine={false}
                  axisLine={false}
                  interval={6}
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
          </div>
        </div>

        {/* Content Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-medium mb-6">Content Distribution</h3>
          <div className="space-y-6">
            <DistributionItem 
              label="Portfolio Projects" 
              count={stats?.portfolio || 0} 
              total={(stats?.portfolio || 0) + (stats?.articles || 0) + (stats?.news || 0)} 
              color="bg-blue-500" 
            />
            <DistributionItem 
              label="Blog Articles" 
              count={stats?.articles || 0} 
              total={(stats?.portfolio || 0) + (stats?.articles || 0) + (stats?.news || 0)} 
              color="bg-purple-500" 
            />
            <DistributionItem 
              label="News Updates" 
              count={stats?.news || 0} 
              total={(stats?.portfolio || 0) + (stats?.articles || 0) + (stats?.news || 0)} 
              color="bg-orange-500" 
            />
            <DistributionItem 
              label="Tutorials" 
              count={stats?.tutorials || 0} 
              total={(stats?.portfolio || 0) + (stats?.articles || 0) + (stats?.news || 0)} 
              color="bg-green-500" 
            />
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="text-sm font-medium mb-4">Top Performing Pages (30 Days)</h4>
            <div className="space-y-3">
              {topPages.length > 0 ? (
                topPages.map((page, i) => (
                  <TopPageRow key={i} path={page.path} views={page.views} />
                ))
              ) : (
                <div className="text-xs text-muted-foreground italic">No data yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, isMock }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-accent-brand/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-secondary rounded-lg">
          <Icon className="w-5 h-5 text-accent-brand" />
        </div>
        {isMock && <span className="text-[10px] uppercase tracking-wider opacity-40">Est.</span>}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <div className={`flex items-center gap-1 mt-4 text-xs ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
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
