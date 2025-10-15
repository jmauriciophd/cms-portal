import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Shield, 
  Users, 
  Eye, 
  Edit, 
  UserCog, 
  Save, 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { 
  usePermissions, 
  UserRole, 
  ALL_PERMISSIONS, 
  DASHBOARD_WIDGETS,
  Permission 
} from '../auth/PermissionsContext';
import { toast } from 'sonner@2.0.3';

const ROLE_INFO: Record<UserRole, { name: string; icon: any; color: string; description: string }> = {
  admin: {
    name: 'Administrador',
    icon: Shield,
    color: 'text-purple-600',
    description: 'Acesso total ao sistema, incluindo configurações avançadas e gerenciamento de usuários',
  },
  editor: {
    name: 'Editor',
    icon: Edit,
    color: 'text-blue-600',
    description: 'Pode criar, editar e publicar conteúdo, mas sem acesso a configurações do sistema',
  },
  viewer: {
    name: 'Visualizador',
    icon: Eye,
    color: 'text-gray-600',
    description: 'Acesso somente leitura ao site público, sem acesso ao painel administrativo',
  },
};

export function PermissionsManager() {
  const { rolePermissions, updateRolePermissions, currentUser } = usePermissions();
  const [selectedRole, setSelectedRole] = useState<UserRole>('editor');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estados locais para edição
  const [localPermissions, setLocalPermissions] = useState<Record<UserRole, string[]>>({
    admin: rolePermissions.admin.permissions,
    editor: rolePermissions.editor.permissions,
    viewer: rolePermissions.viewer.permissions,
  });

  const [localWidgets, setLocalWidgets] = useState<Record<UserRole, string[]>>({
    admin: rolePermissions.admin.dashboardWidgets,
    editor: rolePermissions.editor.dashboardWidgets,
    viewer: rolePermissions.viewer.dashboardWidgets,
  });

  const handlePermissionToggle = (role: UserRole, permissionId: string) => {
    if (role === 'admin') {
      toast.error('Não é possível modificar permissões do Administrador');
      return;
    }

    setLocalPermissions(prev => {
      const current = prev[role] || [];
      const updated = current.includes(permissionId)
        ? current.filter(id => id !== permissionId)
        : [...current, permissionId];
      
      return { ...prev, [role]: updated };
    });
    setHasChanges(true);
  };

  const handleWidgetToggle = (role: UserRole, widgetId: string) => {
    if (role === 'admin') {
      toast.error('Não é possível modificar widgets do Administrador');
      return;
    }

    setLocalWidgets(prev => {
      const current = prev[role] || [];
      const updated = current.includes(widgetId)
        ? current.filter(id => id !== widgetId)
        : [...current, widgetId];
      
      return { ...prev, [role]: updated };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    // Salvar permissões para editor e viewer
    updateRolePermissions('editor', localPermissions.editor, localWidgets.editor);
    updateRolePermissions('viewer', localPermissions.viewer, localWidgets.viewer);
    
    setHasChanges(false);
    toast.success('Permissões atualizadas com sucesso!', {
      description: 'As mudanças serão aplicadas na próxima vez que os usuários fizerem login.',
    });
  };

  const handleReset = () => {
    setLocalPermissions({
      admin: rolePermissions.admin.permissions,
      editor: rolePermissions.editor.permissions,
      viewer: rolePermissions.viewer.permissions,
    });
    setLocalWidgets({
      admin: rolePermissions.admin.dashboardWidgets,
      editor: rolePermissions.editor.dashboardWidgets,
      viewer: rolePermissions.viewer.dashboardWidgets,
    });
    setHasChanges(false);
    toast.info('Alterações descartadas');
  };

  const getPermissionsByCategory = () => {
    const categories: Record<string, Permission[]> = {};
    ALL_PERMISSIONS.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const permissionsByCategory = getPermissionsByCategory();

  const RoleIcon = ROLE_INFO[selectedRole].icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 mb-2">Gerenciamento de Permissões</h2>
        <p className="text-gray-600">
          Configure quais funcionalidades e widgets do dashboard cada papel de usuário pode acessar
        </p>
      </div>

      {/* Alerta de Segurança */}
      <Alert>
        <Lock className="w-4 h-4" />
        <AlertDescription>
          <strong>Segurança:</strong> As permissões do papel "Administrador" não podem ser modificadas para garantir 
          que sempre haja acesso total ao sistema. Apenas Administradores podem acessar este painel.
        </AlertDescription>
      </Alert>

      {/* Seletor de Papéis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(ROLE_INFO) as UserRole[]).map((role) => {
          const info = ROLE_INFO[role];
          const Icon = info.icon;
          const isSelected = selectedRole === role;
          const isLocked = role === 'admin';

          return (
            <Card
              key={role}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-indigo-500 shadow-lg' 
                  : 'hover:shadow-md'
              } ${isLocked ? 'opacity-75' : ''}`}
              onClick={() => setSelectedRole(role)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <Icon className={`w-6 h-6 ${info.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{info.name}</h3>
                      {isLocked && (
                        <Lock className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {info.description}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {localPermissions[role]?.length || 0} permissões
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {localWidgets[role]?.length || 0} widgets
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configurações do Papel Selecionado */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RoleIcon className={`w-6 h-6 ${ROLE_INFO[selectedRole].color}`} />
              <div>
                <CardTitle>Configurações: {ROLE_INFO[selectedRole].name}</CardTitle>
                <CardDescription>
                  {ROLE_INFO[selectedRole].description}
                </CardDescription>
              </div>
            </div>
            {selectedRole === 'admin' && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="w-3 h-3" />
                Protegido
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="permissions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="permissions">
                <Shield className="w-4 h-4 mr-2" />
                Permissões
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <UserCog className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
            </TabsList>

            {/* Tab de Permissões */}
            <TabsContent value="permissions" className="space-y-6 mt-6">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                  <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                    {permissions.map((permission) => {
                      const isChecked = localPermissions[selectedRole]?.includes(permission.id) || false;
                      const isDisabled = selectedRole === 'admin';

                      return (
                        <div key={permission.id} className="flex items-start gap-3 py-2">
                          <Checkbox
                            id={`${selectedRole}-${permission.id}`}
                            checked={isChecked}
                            disabled={isDisabled}
                            onCheckedChange={() => handlePermissionToggle(selectedRole, permission.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={`${selectedRole}-${permission.id}`}
                              className={`font-medium ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            >
                              {permission.name}
                            </Label>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {permission.description}
                            </p>
                          </div>
                          {isChecked && (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Tab de Dashboard */}
            <TabsContent value="dashboard" className="space-y-4 mt-6">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Configure quais widgets do dashboard este papel pode visualizar. 
                  Usuários com permissão "Visualizar Dashboard" verão apenas os widgets selecionados.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                {DASHBOARD_WIDGETS.map((widget) => {
                  const isChecked = localWidgets[selectedRole]?.includes(widget.id) || false;
                  const isDisabled = selectedRole === 'admin';

                  return (
                    <div
                      key={widget.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors ${
                        isChecked 
                          ? 'border-indigo-200 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isDisabled ? 'opacity-50' : ''}`}
                    >
                      <Checkbox
                        id={`${selectedRole}-widget-${widget.id}`}
                        checked={isChecked}
                        disabled={isDisabled}
                        onCheckedChange={() => handleWidgetToggle(selectedRole, widget.id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`${selectedRole}-widget-${widget.id}`}
                          className={`font-medium block mb-1 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {widget.name}
                        </Label>
                        <p className="text-sm text-gray-600">
                          {widget.description}
                        </p>
                      </div>
                      {isChecked && (
                        <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Ações */}
      {hasChanges && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Você tem alterações não salvas</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Descartar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      )}

      {/* Informações de Segurança */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Considerações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2 text-sm">
          <p>✓ <strong>Autenticação:</strong> Todos os usuários devem estar autenticados para acessar o sistema</p>
          <p>✓ <strong>Autorização:</strong> Cada ação é verificada contra as permissões do papel do usuário</p>
          <p>✓ <strong>Validação:</strong> Todas as entradas são sanitizadas para prevenir XSS e injeção</p>
          <p>✓ <strong>CSRF:</strong> Tokens CSRF seriam implementados em ambiente de produção</p>
          <p>✓ <strong>Rate Limiting:</strong> Em produção, limitaríamos requisições por usuário/IP</p>
          <p>✓ <strong>Auditoria:</strong> Todas as mudanças de permissões são registradas no sistema</p>
        </CardContent>
      </Card>
    </div>
  );
}
