import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  branding_config: any;
  subscription_tier: string;
  settings: any;
  is_active: boolean;
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  permissions: string[];
  joined_at: string;
  status: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  memberRole: string | null;
  permissions: string[];
  loading: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  createOrganization: (data: Partial<Organization>) => Promise<Organization>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
  inviteMember: (email: string, role: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserOrganizations();
    }
  }, [user]);

  const loadUserOrganizations = async () => {
    try {
      setLoading(true);
      
      // Get user's organizations
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          id,
          organization_id,
          role,
          permissions,
          status,
          organizations (
            id,
            name,
            slug,
            domain,
            logo_url,
            primary_color,
            secondary_color,
            branding_config,
            subscription_tier,
            settings,
            is_active
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (memberError) throw memberError;

      const orgs = memberData?.map(m => m.organizations).filter(Boolean).flat() as Organization[];
      setOrganizations(orgs);

      // Set current organization (first one or from localStorage)
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      const targetOrg = savedOrgId 
        ? orgs.find(org => org.id === savedOrgId)
        : orgs[0];

      if (targetOrg) {
        const memberInfo = memberData?.find(m => m.organization_id === targetOrg.id);
        setCurrentOrganization(targetOrg);
        setMemberRole(memberInfo?.role || null);
        setPermissions(memberInfo?.permissions || []);
        localStorage.setItem('currentOrganizationId', targetOrg.id);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (!org) return;

    try {
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('role, permissions')
        .eq('organization_id', orgId)
        .eq('user_id', user?.id)
        .single();

      setCurrentOrganization(org);
      setMemberRole(memberData?.role || null);
      setPermissions(memberData?.permissions || []);
      localStorage.setItem('currentOrganizationId', orgId);
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (memberRole === 'owner' || memberRole === 'admin') return true;
    return permissions.includes(permission);
  };

  const isAdmin = (): boolean => {
    return memberRole === 'owner' || memberRole === 'admin';
  };

  const createOrganization = async (data: Partial<Organization>): Promise<Organization> => {
    const { data: orgData, error } = await supabase
      .from('organizations')
      .insert([{
        name: data.name,
        slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-'),
        primary_color: data.primary_color || '#6366f1',
        secondary_color: data.secondary_color || '#8b5cf6',
        ...data
      }])
      .select()
      .single();

    if (error) throw error;

    // Add creator as owner
    await supabase
      .from('organization_members')
      .insert([{
        organization_id: orgData.id,
        user_id: user?.id,
        role: 'owner'
      }]);

    await loadUserOrganizations();
    return orgData;
  };

  const updateOrganization = async (id: string, data: Partial<Organization>) => {
    const { error } = await supabase
      .from('organizations')
      .update(data)
      .eq('id', id);

    if (error) throw error;
    await loadUserOrganizations();
  };

  const inviteMember = async (email: string, role: string) => {
    if (!currentOrganization) return;

    // In a real app, this would send an email invitation
    // For now, we'll just add the user if they exist
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userData) {
      const { error } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: currentOrganization.id,
          user_id: userData.id,
          role,
          invited_by: user?.id
        }]);

      if (error) throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
  };

  return (
    <OrganizationContext.Provider value={{
      currentOrganization,
      organizations,
      memberRole,
      permissions,
      loading,
      switchOrganization,
      hasPermission,
      isAdmin,
      createOrganization,
      updateOrganization,
      inviteMember,
      removeMember
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};