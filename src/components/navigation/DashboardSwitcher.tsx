import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Home, GraduationCap, Shield, Users } from 'lucide-react';

export const DashboardSwitcher = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const dashboardOptions = [
    {
      role: 'student',
      label: 'Student Dashboard',
      path: '/student',
      icon: GraduationCap,
      available: user.role === 'student' || user.role === 'admin'
    },
    {
      role: 'teacher',
      label: 'Teacher Dashboard',
      path: '/teacher',
      icon: Users,
      available: user.role === 'teacher' || user.role === 'admin'
    },
    {
      role: 'admin',
      label: 'Admin Dashboard',
      path: '/super-admin',
      icon: Shield,
      available: user.role === 'admin'
    }
  ];

  const availableOptions = dashboardOptions.filter(option => option.available);
  
  if (availableOptions.length <= 1) return null;

  const currentDashboard = dashboardOptions.find(option => 
    window.location.pathname.startsWith(option.path)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {currentDashboard?.icon && <currentDashboard.icon className="h-4 w-4" />}
          {currentDashboard?.label || 'Switch Dashboard'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Dashboard</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableOptions.map((option) => (
          <DropdownMenuItem
            key={option.role}
            onClick={() => navigate(option.path)}
            className="gap-2 cursor-pointer"
          >
            <option.icon className="h-4 w-4" />
            {option.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/')} className="gap-2 cursor-pointer">
          <Home className="h-4 w-4" />
          Return to Home
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};