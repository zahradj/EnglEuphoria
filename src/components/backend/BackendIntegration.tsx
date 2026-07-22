
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Database, 
  Users, 
  Key, 
  Server, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Cloud
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BackendService {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  icon: React.ReactNode;
}

export const BackendIntegration = () => {
  const [apiKey, setApiKey] = useState("");
  const [dbConnection, setDbConnection] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const services: BackendService[] = [
    {
      name: "Supabase Database",
      status: "disconnected",
      description: "User data, lessons, homework, payments",
      icon: <Database className="h-5 w-5" />
    },
    {
      name: "Authentication",
      status: "disconnected", 
      description: "Student/teacher login and registration",
      icon: <Users className="h-5 w-5" />
    },
    {
      name: "AI Assistant API",
      status: "disconnected",
      description: "OpenAI/Cohere for content generation",
      icon: <Zap className="h-5 w-5" />
    },
    {
      name: "Payment Gateway",
      status: "disconnected",
      description: "BaridiMob, CIB, Stripe integration",
      icon: <Key className="h-5 w-5" />
    },
    {
      name: "Video Conferencing",
      status: "disconnected",
      description: "Jitsi/Agora/Twilio for live classes",
      icon: <Server className="h-5 w-5" />
    }
  ];

  const handleConnect = async (serviceName: string) => {
    setIsConnecting(true);
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Service Connected",
        description: `${serviceName} has been successfully connected!`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${serviceName}. Please check your configuration.`,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusIcon = (status: BackendService['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: BackendService['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Cloud className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-800">Backend Integration</h2>
      </div>

      {/* Service Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.name} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {service.icon}
                    <span className="font-medium text-sm">{service.name}</span>
                  </div>
                  {getStatusIcon(service.status)}
                </div>
                <p className="text-xs text-gray-600 mb-3">{service.description}</p>
                <div className="flex items-center justify-between">
                  {getStatusBadge(service.status)}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleConnect(service.name)}
                    disabled={isConnecting || service.status === 'connected'}
                  >
                    {service.status === 'connected' ? 'Connected' : 'Connect'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Database Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="db-url">Database Connection URL</Label>
              <Input
                id="db-url"
                placeholder="postgresql://user:password@host:port/database"
                value={dbConnection}
                onChange={(e) => setDbConnection(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="db-schema">Schema Setup</Label>
              <Textarea
                id="db-schema"
                placeholder="Define your database tables..."
                rows={4}
                defaultValue={`-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  role VARCHAR CHECK (role IN ('student', 'teacher', 'parent')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lessons table  
CREATE TABLE lessons (
  id UUID PRIMARY KEY,
  teacher_id UUID REFERENCES users(id),
  student_id UUID REFERENCES users(id),
  scheduled_at TIMESTAMP,
  duration INTEGER,
  status VARCHAR
);`}
              />
            </div>
            <Button className="w-full">Apply Database Schema</Button>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="stripe-key">Stripe API Key</Label>
              <Input
                id="stripe-key"
                type="password"
                placeholder="sk_test_..."
              />
            </div>
            <div>
              <Label htmlFor="video-api">Video API Configuration</Label>
              <Input
                id="video-api"
                placeholder="Jitsi/Agora/Twilio API key"
              />
            </div>
            <Button className="w-full">Save API Configuration</Button>
          </CardContent>
        </Card>
      </div>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Badge className="bg-blue-100 text-blue-700">1</Badge>
              <span className="text-sm">Click the green Supabase button in the top-right corner to connect your database</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Badge className="bg-purple-100 text-purple-700">2</Badge>
              <span className="text-sm">Add your OpenAI API key for AI content generation features</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Badge className="bg-green-100 text-green-700">3</Badge>
              <span className="text-sm">Configure payment gateways for BaridiMob and CIB card processing</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Badge className="bg-orange-100 text-orange-700">4</Badge>
              <span className="text-sm">Set up video conferencing API for live classroom functionality</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
