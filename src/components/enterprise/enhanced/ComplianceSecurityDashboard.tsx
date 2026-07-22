import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Globe,
  Eye,
  UserCheck,
  Key,
  Database,
  Zap,
  Download,
  Settings
} from 'lucide-react';

interface ComplianceStatus {
  gdpr: {
    status: 'compliant' | 'warning' | 'non-compliant';
    score: number;
    lastAudit: string;
    issues: string[];
  };
  coppa: {
    status: 'compliant' | 'warning' | 'non-compliant';
    score: number;
    verifications: number;
    pendingReviews: number;
  };
  ferpa: {
    status: 'compliant' | 'warning' | 'non-compliant';
    score: number;
    dataRetention: string;
    accessLogs: number;
  };
  hipaa: {
    status: 'compliant' | 'warning' | 'non-compliant';
    score: number;
    encryptionLevel: string;
    auditTrail: boolean;
  };
}

interface SecurityMetrics {
  threatDetection: {
    level: 'low' | 'medium' | 'high';
    blocked: number;
    investigated: number;
  };
  dataEncryption: {
    atRest: boolean;
    inTransit: boolean;
    keyRotation: string;
  };
  accessControl: {
    mfaEnabled: number;
    totalUsers: number;
    failedAttempts: number;
    suspiciousActivity: number;
  };
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface DataResidency {
  regions: {
    name: string;
    users: number;
    dataCenter: string;
    compliance: string[];
  }[];
  migrations: {
    pending: number;
    completed: number;
    failed: number;
  };
}

export const ComplianceSecurityDashboard = () => {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    gdpr: {
      status: 'compliant',
      score: 94,
      lastAudit: '2024-06-15',
      issues: []
    },
    coppa: {
      status: 'warning',
      score: 87,
      verifications: 1234,
      pendingReviews: 23
    },
    ferpa: {
      status: 'compliant',
      score: 96,
      dataRetention: '7 years',
      accessLogs: 15678
    },
    hipaa: {
      status: 'non-compliant',
      score: 67,
      encryptionLevel: 'AES-256',
      auditTrail: false
    }
  });

  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    threatDetection: {
      level: 'low',
      blocked: 247,
      investigated: 12
    },
    dataEncryption: {
      atRest: true,
      inTransit: true,
      keyRotation: 'Every 90 days'
    },
    accessControl: {
      mfaEnabled: 8934,
      totalUsers: 12847,
      failedAttempts: 156,
      suspiciousActivity: 3
    },
    vulnerabilities: {
      critical: 0,
      high: 2,
      medium: 15,
      low: 34
    }
  });

  const [dataResidency, setDataResidency] = useState<DataResidency>({
    regions: [
      { name: 'EU (Frankfurt)', users: 3456, dataCenter: 'AWS eu-central-1', compliance: ['GDPR', 'DPA'] },
      { name: 'US (Virginia)', users: 5678, dataCenter: 'AWS us-east-1', compliance: ['FERPA', 'COPPA'] },
      { name: 'Asia (Singapore)', users: 2345, dataCenter: 'AWS ap-southeast-1', compliance: ['PDPA'] },
      { name: 'Canada (Central)', users: 1368, dataCenter: 'AWS ca-central-1', compliance: ['PIPEDA'] }
    ],
    migrations: {
      pending: 45,
      completed: 1234,
      failed: 2
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'non-compliant': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getVulnerabilityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Compliance & Security</h2>
          <p className="text-muted-foreground">Global compliance monitoring and enterprise security</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="space-y-3">
        {complianceStatus.hipaa.status === 'non-compliant' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">HIPAA Compliance Issue</AlertTitle>
            <AlertDescription className="text-red-700">
              Audit trail is not enabled. This is required for HIPAA compliance when handling health-related data.
            </AlertDescription>
          </Alert>
        )}
        
        {complianceStatus.coppa.pendingReviews > 20 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">COPPA Reviews Pending</AlertTitle>
            <AlertDescription className="text-yellow-700">
              {complianceStatus.coppa.pendingReviews} age verification reviews are pending. Please review to maintain compliance.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GDPR</p>
                <p className="text-2xl font-bold">{complianceStatus.gdpr.score}%</p>
                <Badge className={getStatusColor(complianceStatus.gdpr.status)}>
                  {complianceStatus.gdpr.status}
                </Badge>
              </div>
              {getStatusIcon(complianceStatus.gdpr.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">COPPA</p>
                <p className="text-2xl font-bold">{complianceStatus.coppa.score}%</p>
                <Badge className={getStatusColor(complianceStatus.coppa.status)}>
                  {complianceStatus.coppa.status}
                </Badge>
              </div>
              {getStatusIcon(complianceStatus.coppa.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">FERPA</p>
                <p className="text-2xl font-bold">{complianceStatus.ferpa.score}%</p>
                <Badge className={getStatusColor(complianceStatus.ferpa.status)}>
                  {complianceStatus.ferpa.status}
                </Badge>
              </div>
              {getStatusIcon(complianceStatus.ferpa.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">HIPAA</p>
                <p className="text-2xl font-bold">{complianceStatus.hipaa.score}%</p>
                <Badge className={getStatusColor(complianceStatus.hipaa.status)}>
                  {complianceStatus.hipaa.status}
                </Badge>
              </div>
              {getStatusIcon(complianceStatus.hipaa.status)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compliance">Compliance Details</TabsTrigger>
          <TabsTrigger value="security">Security Monitoring</TabsTrigger>
          <TabsTrigger value="data-residency">Data Residency</TabsTrigger>
          <TabsTrigger value="identity">Identity & Access</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  GDPR Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Overall Score</span>
                    <span className="font-medium">{complianceStatus.gdpr.score}%</span>
                  </div>
                  <Progress value={complianceStatus.gdpr.score} />
                </div>
                <div className="text-sm text-muted-foreground">
                  Last audit: {complianceStatus.gdpr.lastAudit}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Data Processing Records</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Consent Management</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Subject Rights</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  COPPA Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Overall Score</span>
                    <span className="font-medium">{complianceStatus.coppa.score}%</span>
                  </div>
                  <Progress value={complianceStatus.coppa.score} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Verifications</span>
                    <p className="font-medium">{complianceStatus.coppa.verifications}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pending Reviews</span>
                    <p className="font-medium text-yellow-600">{complianceStatus.coppa.pendingReviews}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Age Verification</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Parental Consent</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Threat Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Threat Level</span>
                    <span className={`font-medium capitalize ${getThreatLevelColor(securityMetrics.threatDetection.level)}`}>
                      {securityMetrics.threatDetection.level}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Blocked</span>
                    <p className="font-medium">{securityMetrics.threatDetection.blocked}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Investigated</span>
                    <p className="font-medium">{securityMetrics.threatDetection.investigated}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Data Encryption
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>At Rest</span>
                    {securityMetrics.dataEncryption.atRest ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span>In Transit</span>
                    {securityMetrics.dataEncryption.inTransit ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    }
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Key Rotation: </span>
                  <span className="font-medium">{securityMetrics.dataEncryption.keyRotation}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>MFA Adoption</span>
                    <span className="font-medium">
                      {Math.round((securityMetrics.accessControl.mfaEnabled / securityMetrics.accessControl.totalUsers) * 100)}%
                    </span>
                  </div>
                  <Progress value={(securityMetrics.accessControl.mfaEnabled / securityMetrics.accessControl.totalUsers) * 100} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Failed Attempts</span>
                    <p className="font-medium">{securityMetrics.accessControl.failedAttempts}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Suspicious</span>
                    <p className="font-medium text-orange-600">{securityMetrics.accessControl.suspiciousActivity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vulnerabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Vulnerability Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(securityMetrics.vulnerabilities).map(([severity, count]) => (
                  <div key={severity} className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-xl font-bold ${getVulnerabilityColor(severity)}`}>
                      {count}
                    </div>
                    <p className="mt-2 text-sm font-medium capitalize">{severity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-residency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global Data Distribution
              </CardTitle>
              <CardDescription>
                Data residency compliance across regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataResidency.regions.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">{region.name}</h4>
                      <p className="text-sm text-muted-foreground">{region.dataCenter}</p>
                      <div className="flex gap-1 mt-2">
                        {region.compliance.map((comp, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{region.users.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">users</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{dataResidency.migrations.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Migrations</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{dataResidency.migrations.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{dataResidency.migrations.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="identity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Document Verification</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Biometric Authentication</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Age Verification (COPPA)</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Video KYC</span>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SSO Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Active Directory</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>LDAP</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SAML 2.0</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>OpenID Connect</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};