import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Shield,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Users,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import permissionService, { PermissionDropdownDto } from '@/services/permissionService';
import rolePermissionService, { RolePermissionDto } from '@/services/rolePermissionService';
import roleService, { Role } from '@/services/roleService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Group permissions by page
interface PermissionGroup {
  page: string;
  permissions: PermissionDropdownDto[];
}

interface PermissionState {
  [permissionId: number]: boolean;
}

const RolePermissions: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { isRTL } = useDirection();
  const queryClient = useQueryClient();

  const [selectedPermissions, setSelectedPermissions] = useState<PermissionState>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const languageCode = isRTL ? 'ar' : 'en';

  // Query for role details
  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ['role', roleId],
    queryFn: () => roleService.getRoleById(parseInt(roleId!)),
    enabled: !!roleId,
  });

  // Query for all permissions dropdown
  const { data: allPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions-dropdown', languageCode],
    queryFn: () => permissionService.getPermissionsDropdown(true, languageCode),
  });

  // Query for current role permissions
  const { data: currentRolePermissions, isLoading: rolePermissionsLoading } = useQuery({
    queryKey: ['role-permissions', roleId, languageCode],
    queryFn: () => rolePermissionService.getPermissionsByRoleId(parseInt(roleId!), languageCode),
    enabled: !!roleId,
  });

  // Mutation for saving role permissions
  const savePermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      rolePermissionService.saveRolePermissions(roleId, permissionIds, languageCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success(isRTL ? 'تم حفظ صلاحيات الدور بنجاح' : 'Role permissions saved successfully');
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حفظ الصلاحيات' : 'Error saving permissions'));
    },
  });

  // Group permissions by page
  const permissionGroups: PermissionGroup[] = React.useMemo(() => {
    if (!allPermissions) return [];

    const groups: { [page: string]: PermissionDropdownDto[] } = {};
    
    allPermissions.forEach(permission => {
      if (!groups[permission.page]) {
        groups[permission.page] = [];
      }
      groups[permission.page].push(permission);
    });

    return Object.keys(groups).map(page => ({
      page,
      permissions: groups[page].sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.page.localeCompare(b.page));
  }, [allPermissions]);

  // Initialize selected permissions when current role permissions are loaded
  useEffect(() => {
    if (currentRolePermissions) {
      const initialState: PermissionState = {};
      currentRolePermissions.forEach(permission => {
        initialState[permission.id] = true;
      });
      setSelectedPermissions(initialState);
    }
  }, [currentRolePermissions]);


  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => {
      const newState = {
        ...prev,
        [permissionId]: !prev[permissionId]
      };
      
      // Check if there are changes
      const selectedIds = Object.keys(newState).filter(id => newState[parseInt(id)]).map(id => parseInt(id));
      const currentIds = currentRolePermissions?.map(p => p.id) || [];
      
      const hasChanges = selectedIds.length !== currentIds.length || 
                        selectedIds.some(id => !currentIds.includes(id));
      setHasChanges(hasChanges);
      
      return newState;
    });
  };


  const handleSelectAllInGroup = (groupPermissions: PermissionDropdownDto[], select: boolean) => {
    setSelectedPermissions(prev => {
      const newState = { ...prev };
      groupPermissions.forEach(permission => {
        newState[permission.id] = select;
      });
      
      // Check if there are changes
      const selectedIds = Object.keys(newState).filter(id => newState[parseInt(id)]).map(id => parseInt(id));
      const currentIds = currentRolePermissions?.map(p => p.id) || [];
      
      const hasChanges = selectedIds.length !== currentIds.length || 
                        selectedIds.some(id => !currentIds.includes(id));
      setHasChanges(hasChanges);
      
      return newState;
    });
  };

  const handleSavePermissions = () => {
    if (!roleId) return;

    const selectedIds = Object.keys(selectedPermissions)
      .filter(id => selectedPermissions[parseInt(id)])
      .map(id => parseInt(id));

    savePermissionsMutation.mutate({
      roleId: parseInt(roleId),
      permissionIds: selectedIds
    });
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      navigate('/roles');
    }
  };

  const getGroupStats = (groupPermissions: PermissionDropdownDto[]) => {
    const selectedCount = groupPermissions.filter(p => selectedPermissions[p.id]).length;
    const totalCount = groupPermissions.length;
    return { selected: selectedCount, total: totalCount };
  };

  const isLoading = roleLoading || permissionsLoading || rolePermissionsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-lg">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              {isRTL ? 'صلاحيات الدور' : 'Role Permissions'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? `إدارة صلاحيات الدور: ${role?.name}` : `Manage permissions for role: ${role?.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              {isRTL ? (
                <ArrowLeft className="h-4 w-4 rotate-180" />
              ) : (
                <ArrowLeft className="h-4 w-4" />
              )}
              {isRTL ? 'رجوع' : 'Back'}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
            <Button 
              className="gradient-primary flex items-center gap-2"
              onClick={handleSavePermissions}
              disabled={!hasChanges || savePermissionsMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {savePermissionsMutation.isPending 
                ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                : (isRTL ? 'حفظ التغييرات' : 'Save Changes')
              }
            </Button>
          </div>
        </div>

        {/* Role Info Card */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{role?.name}</h3>
                  <p className="text-muted-foreground">{role?.description || (isRTL ? 'لا يوجد وصف' : 'No description')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={role?.isActive ? 'default' : 'secondary'} className="px-4 py-2">
                  {role?.isActive 
                    ? (isRTL ? 'نشط' : 'Active')
                    : (isRTL ? 'غير نشط' : 'Inactive')
                  }
                </Badge>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Object.values(selectedPermissions).filter(Boolean).length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? 'صلاحيات مختارة' : 'Selected Permissions'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions by Page - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {permissionGroups.map((group) => {
            const stats = getGroupStats(group.permissions);
            const allSelected = stats.selected === stats.total;
            const someSelected = stats.selected > 0 && stats.selected < stats.total;

            return (
              <Card key={group.page} className="border-0 shadow-elegant">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg capitalize">
                        {group.page}
                      </CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {stats.selected} / {stats.total}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {allSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : someSelected ? (
                        <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/50" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Group Actions */}
                    <div className="flex items-center gap-2 pb-3 border-b">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllInGroup(group.permissions, true)}
                        disabled={allSelected}
                      >
                        {isRTL ? 'تحديد الكل' : 'Select All'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllInGroup(group.permissions, false)}
                        disabled={stats.selected === 0}
                      >
                        {isRTL ? 'إلغاء تحديد الكل' : 'Deselect All'}
                      </Button>
                    </div>

                    {/* Permission List */}
                    <div className="grid gap-3">
                      {group.permissions.map((permission) => {
                        const isChecked = selectedPermissions[permission.id] || false;
                        return (
                          <div
                            key={permission.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                              isChecked 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/30 hover:bg-muted/30'
                            } ${isRTL ? 'space-x-reverse' : ''}`}
                          >
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={isChecked}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={`permission-${permission.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium text-sm">
                                {permission.name}
                              </div>
                            </label>
                            {isChecked && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Confirm Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isRTL ? 'لديك تغييرات غير محفوظة' : 'You have unsaved changes'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isRTL 
                  ? 'هل أنت متأكد أنك تريد المغادرة؟ ستفقد جميع التغييرات غير المحفوظة.'
                  : 'Are you sure you want to leave? You will lose all unsaved changes.'
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {isRTL ? 'البقاء' : 'Stay'}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowConfirmDialog(false);
                  navigate('/roles');
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isRTL ? 'مغادرة بدون حفظ' : 'Leave without saving'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default RolePermissions;
