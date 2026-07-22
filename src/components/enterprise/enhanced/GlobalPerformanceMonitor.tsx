import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Zap, 
  Database, 
  Wifi, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Activity
} from 'lucide-react';

interface PerformanceMetrics {
  global: {
    averageLatency: number;
    throughput: number;
    errorRate: number;
    uptime: number;
  };
  regions: {
    id: string;
    name: string;
    latency: number;
    load: number;
    status: 'healthy' | 'warning' | 'error';
  }[];
  cdn: {
    hitRatio: number;
    bandwidth: number;
    requests: number;
  };
  database: {
    connectionPool: number;
    queryTime: number;
    activeConnections: number;
  };
  webrtc: {
    activeStreams: number;
    averageQuality: 'excellent' | 'good' | 'poor';
    packetLoss: number;
    jitter: number;
  };
}

export const GlobalPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    global: {
      averageLatency: 45,
      throughput: 1250,
      errorRate: 0.02,
      uptime: 99.98
    },
    regions: [
      { id: 'us-east', name: 'US East', latency: 23, load: 45, status: 'healthy' },
      { id: 'us-west', name: 'US West', latency: 31, load: 52, status: 'healthy' },
      { id: 'eu-west', name: 'EU West', latency: 18, load: 38, status: 'healthy' },
      { id: 'asia-pacific', name: 'Asia Pacific', latency: 67, load: 78, status: 'warning' },
      { id: 'africa', name: 'Africa', latency: 156, load: 23, status: 'error' }
    ],
    cdn: {
      hitRatio: 94.2,
      bandwidth: 2.4,
      requests: 156789
    },
    database: {
      connectionPool: 85,
      queryTime: 12.5,
      activeConnections: 247
    },
    webrtc: {
      activeStreams: 1247,
      averageQuality: 'good',
      packetLoss: 0.8,
      jitter: 2.3
    }
  });

  const [realTimeData, setRealTimeData] = useState<number[]>([]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData(prev => {
        const newData = [...prev, Math.random() * 100 + 50].slice(-20);
        return newData;
      });

      // Update metrics with slight variations
      setMetrics(prev => ({
        ...prev,
        global: {
          ...prev.global,
          averageLatency: Math.max(20, prev.global.averageLatency + (Math.random() - 0.5) * 10),
          throughput: Math.max(1000, prev.global.throughput + (Math.random() - 0.5) * 200)
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold">{Math.round(metrics.global.averageLatency)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold">{Math.round(metrics.global.throughput)}/s</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{(metrics.global.errorRate * 100).toFixed(2)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{metrics.global.uptime}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="regions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="regions">Regional Performance</TabsTrigger>
          <TabsTrigger value="cdn">CDN & Caching</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="webrtc">WebRTC Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global Regional Performance
              </CardTitle>
              <CardDescription>
                Real-time performance metrics across all regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.regions.map((region) => (
                  <Card key={region.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">{region.name}</span>
                        </div>
                        <Badge className={getStatusColor(region.status)}>
                          {region.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Latency</span>
                            <span>{region.latency}ms</span>
                          </div>
                          <Progress value={Math.min(100, (region.latency / 200) * 100)} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Load</span>
                            <span>{region.load}%</span>
                          </div>
                          <Progress value={region.load} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cdn" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cache Hit Ratio</p>
                    <p className="text-2xl font-bold">{metrics.cdn.hitRatio}%</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
                <Progress value={metrics.cdn.hitRatio} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bandwidth</p>
                    <p className="text-2xl font-bold">{metrics.cdn.bandwidth} GB/s</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Requests/min</p>
                    <p className="text-2xl font-bold">{metrics.cdn.requests.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Connection Pool</p>
                    <p className="text-2xl font-bold">{metrics.database.connectionPool}%</p>
                  </div>
                  <Database className="h-8 w-8 text-purple-500" />
                </div>
                <Progress value={metrics.database.connectionPool} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Query Time</p>
                    <p className="text-2xl font-bold">{metrics.database.queryTime}ms</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Connections</p>
                    <p className="text-2xl font-bold">{metrics.database.activeConnections}</p>
                  </div>
                  <Wifi className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="webrtc" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Streams</p>
                    <p className="text-2xl font-bold">{metrics.webrtc.activeStreams}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Quality</p>
                    <p className={`text-2xl font-bold capitalize ${getQualityColor(metrics.webrtc.averageQuality)}`}>
                      {metrics.webrtc.averageQuality}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Packet Loss</p>
                    <p className="text-2xl font-bold">{metrics.webrtc.packetLoss}%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Jitter</p>
                    <p className="text-2xl font-bold">{metrics.webrtc.jitter}ms</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};