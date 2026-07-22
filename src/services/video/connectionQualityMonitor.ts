export interface ConnectionQualityMetrics {
  packetLoss: number;
  latency: number;
  jitter: number;
  bandwidth: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export class ConnectionQualityMonitor {
  private peerConnection: RTCPeerConnection | null = null;
  private monitoringInterval: number | null = null;
  private onQualityChange: ((metrics: ConnectionQualityMetrics) => void) | null = null;

  setPeerConnection(pc: RTCPeerConnection) {
    this.peerConnection = pc;
  }

  startMonitoring(callback: (metrics: ConnectionQualityMetrics) => void) {
    this.onQualityChange = callback;
    
    this.monitoringInterval = window.setInterval(async () => {
      if (!this.peerConnection) return;

      try {
        const stats = await this.peerConnection.getStats();
        const metrics = this.analyzeStats(stats);
        
        if (this.onQualityChange && metrics) {
          this.onQualityChange(metrics);
        }
      } catch (error) {
        console.error('Error monitoring connection quality:', error);
      }
    }, 2000); // Check every 2 seconds
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private analyzeStats(stats: RTCStatsReport): ConnectionQualityMetrics | null {
    let packetLoss = 0;
    let latency = 0;
    let jitter = 0;
    let bandwidth = 0;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        // Calculate packet loss
        if (report.packetsLost && report.packetsReceived) {
          const totalPackets = report.packetsLost + report.packetsReceived;
          packetLoss = totalPackets > 0 ? (report.packetsLost / totalPackets) * 100 : 0;
        }

        // Get jitter
        if (report.jitter) {
          jitter = report.jitter * 1000; // Convert to ms
        }

        // Estimate bandwidth
        if (report.bytesReceived && report.timestamp) {
          bandwidth = report.bytesReceived / 1000; // KB/s
        }
      }

      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        // Get round-trip time (latency)
        if (report.currentRoundTripTime) {
          latency = report.currentRoundTripTime * 1000; // Convert to ms
        }
      }
    });

    // Determine overall quality
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    
    if (packetLoss < 1 && latency < 100 && jitter < 30) {
      quality = 'excellent';
    } else if (packetLoss < 3 && latency < 200 && jitter < 50) {
      quality = 'good';
    } else if (packetLoss < 5 && latency < 300 && jitter < 100) {
      quality = 'fair';
    } else {
      quality = 'poor';
    }

    return {
      packetLoss: Math.round(packetLoss * 100) / 100,
      latency: Math.round(latency),
      jitter: Math.round(jitter),
      bandwidth: Math.round(bandwidth),
      quality
    };
  }

  dispose() {
    this.stopMonitoring();
    this.peerConnection = null;
    this.onQualityChange = null;
  }
}
