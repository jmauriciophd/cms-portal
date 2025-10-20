import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Plus, Edit, Trash, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  twoFactorEnabled: boolean;
  active: boolean;
  createdAt: string;
}

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'editor' as User['role'],
    twoFactorEnabled: false,
    active: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const stored = localStorage.getItem('users');
    if (stored) {
      setUsers(JSON.parse(stored));
    } else {
      const defaultUsers: User[] = [
        {
          id: '1',
          name: 'Administrador',
          email: 'admin@portal.com',
          role: 'admin',
          twoFactorEnabled: true,
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Editor',
          email: 'editor@portal.com',
          role: 'editor',
          twoFactorEnabled: false,
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    }
  };

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        active: user.active
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'editor',
        twoFactorEnabled: false,
        active: true
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      const updated = users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      );
      saveUsers(updated);
      toast.success('Usuário atualizado com sucesso!');
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      saveUsers([...users, newUser]);
      toast.success('Usuário criado com sucesso!');
    }
    
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      saveUsers(users.filter(u => u.id !== id));
      toast.success('Usuário excluído com sucesso!');
    }
  };

  const toggleUserStatus = (id: string) => {
    const updated = users.map(u => 
      u.id === id ? { ...u, active: !u.active } : u
    );
    saveUsers(updated);
    toast.success('Status do usuário atualizado!');
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      admin: 'destructive',
      editor: 'default',
      viewer: 'secondary'
    };
    return variants[role] || 'secondary';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      editor: 'Editor',
      viewer: 'Visualizador'
    };
    return labels[role] || role;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Gerenciamento de Usuários</h1>
          <p className="text-gray-600">Controle de acesso e papéis do sistema</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={getRoleBadge(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
                {user.twoFactorEnabled && (
                  <Badge variant="outline" className="gap-1">
                    <Shield className="w-3 h-3" />
                    2FA
                  </Badge>
                )}
                <Badge variant={user.active ? 'default' : 'secondary'}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <Switch
                  checked={user.active}
                  onCheckedChange={() => toggleUserStatus(user.id)}
                />
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOpenDialog(user)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            <DialogDescription>
              Configure as informações e permissões do usuário
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Papel</Label>
              <Select
                value={formData.role}
                onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Administradores têm acesso total ao sistema
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="2fa">Autenticação de Dois Fatores</Label>
                <Switch
                  id="2fa"
                  checked={formData.twoFactorEnabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, twoFactorEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Conta Ativa</Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, active: checked })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingUser ? 'Atualizar' : 'Criar'} Usuário
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Permissions Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Permissões por Papel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                Administrador
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Acesso total ao sistema</li>
                <li>• Gerenciar usuários</li>
                <li>• Configurações avançadas</li>
                <li>• Todas as funcionalidades</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Editor
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Criar e editar conteúdo</li>
                <li>• Gerenciar páginas</li>
                <li>• Upload de arquivos</li>
                <li>• Publicar matérias</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-600" />
                Visualizador
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Visualizar conteúdo</li>
                <li>• Ler matérias</li>
                <li>• Ver estatísticas</li>
                <li>• Sem permissão de edição</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
