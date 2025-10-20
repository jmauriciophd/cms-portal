/**
 * Gerenciador de Campos Personalizados
 * Interface para criar e gerenciar campos personalizados com tipos de dados
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, Trash2, Edit, Database, Upload, Download, FileJson, Check, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { FieldDefinition, FieldType } from '../../utils/fieldTypeMapper';
import { getFriendlyName, validateFieldValue } from '../../utils/fieldTypeMapper';

interface CustomFieldGroup {
  id: string;
  name: string;
  description: string;
  fields: FieldDefinition[];
  appliesTo: ('page' | 'article' | 'custom_list')[];
  createdAt: string;
  updatedAt: string;
}

export function CustomFieldsManager() {
  const [groups, setGroups] = useState<CustomFieldGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CustomFieldGroup | null>(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isEditingField, setIsEditingField] = useState(false);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  
  // Form states
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    appliesTo: [] as ('page' | 'article' | 'custom_list')[]
  });
  
  const [fieldForm, setFieldForm] = useState<Partial<FieldDefinition>>({
    name: '',
    internalName: '',
    type: 'text' as FieldType,
    required: false,
    defaultValue: '',
    validation: {
      allowNull: true
    }
  });
  
  useEffect(() => {
    loadGroups();
  }, []);
  
  const loadGroups = () => {
    try {
      const stored = localStorage.getItem('cms_custom_field_groups');
      if (stored) {
        setGroups(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading field groups:', error);
    }
  };
  
  const saveGroups = (updatedGroups: CustomFieldGroup[]) => {
    try {
      localStorage.setItem('cms_custom_field_groups', JSON.stringify(updatedGroups));
      setGroups(updatedGroups);
    } catch (error) {
      console.error('Error saving field groups:', error);
      toast.error('Erro ao salvar grupos de campos');
    }
  };
  
  const handleCreateGroup = () => {
    if (!groupForm.name.trim()) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }
    
    const newGroup: CustomFieldGroup = {
      id: `group_${Date.now()}`,
      name: groupForm.name,
      description: groupForm.description,
      fields: [],
      appliesTo: groupForm.appliesTo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    saveGroups([...groups, newGroup]);
    setSelectedGroup(newGroup);
    setIsEditingGroup(false);
    setGroupForm({ name: '', description: '', appliesTo: [] });
    toast.success('Grupo criado com sucesso');
  };
  
  const handleUpdateGroup = () => {
    if (!selectedGroup) return;
    
    const updated = groups.map(g =>
      g.id === selectedGroup.id
        ? {
            ...g,
            name: groupForm.name,
            description: groupForm.description,
            appliesTo: groupForm.appliesTo,
            updatedAt: new Date().toISOString()
          }
        : g
    );
    
    saveGroups(updated);
    setSelectedGroup(updated.find(g => g.id === selectedGroup.id) || null);
    setIsEditingGroup(false);
    toast.success('Grupo atualizado com sucesso');
  };
  
  const handleDeleteGroup = (groupId: string) => {
    if (!confirm('Deseja realmente excluir este grupo de campos?')) return;
    
    saveGroups(groups.filter(g => g.id !== groupId));
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(null);
    }
    toast.success('Grupo excluído com sucesso');
  };
  
  const handleAddField = () => {
    if (!selectedGroup) return;
    
    if (!fieldForm.name?.trim()) {
      toast.error('Nome do campo é obrigatório');
      return;
    }
    
    const internalName = fieldForm.internalName || 
      fieldForm.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    
    const newField: FieldDefinition = {
      name: fieldForm.name!,
      internalName,
      type: fieldForm.type || 'text',
      required: fieldForm.required || false,
      defaultValue: fieldForm.defaultValue,
      validation: fieldForm.validation
    };
    
    const updated = groups.map(g =>
      g.id === selectedGroup.id
        ? {
            ...g,
            fields: [...g.fields, newField],
            updatedAt: new Date().toISOString()
          }
        : g
    );
    
    saveGroups(updated);
    setSelectedGroup(updated.find(g => g.id === selectedGroup.id) || null);
    setIsEditingField(false);
    setFieldForm({
      name: '',
      internalName: '',
      type: 'text',
      required: false,
      defaultValue: '',
      validation: { allowNull: true }
    });
    toast.success('Campo adicionado com sucesso');
  };
  
  const handleUpdateField = () => {
    if (!selectedGroup || !editingField) return;
    
    const updated = groups.map(g =>
      g.id === selectedGroup.id
        ? {
            ...g,
            fields: g.fields.map(f =>
              f.internalName === editingField.internalName
                ? { ...f, ...fieldForm }
                : f
            ),
            updatedAt: new Date().toISOString()
          }
        : g
    );
    
    saveGroups(updated);
    setSelectedGroup(updated.find(g => g.id === selectedGroup.id) || null);
    setIsEditingField(false);
    setEditingField(null);
    toast.success('Campo atualizado com sucesso');
  };
  
  const handleDeleteField = (internalName: string) => {
    if (!selectedGroup) return;
    
    const updated = groups.map(g =>
      g.id === selectedGroup.id
        ? {
            ...g,
            fields: g.fields.filter(f => f.internalName !== internalName),
            updatedAt: new Date().toISOString()
          }
        : g
    );
    
    saveGroups(updated);
    setSelectedGroup(updated.find(g => g.id === selectedGroup.id) || null);
    toast.success('Campo removido com sucesso');
  };
  
  const handleEditGroup = (group: CustomFieldGroup) => {
    setSelectedGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description,
      appliesTo: group.appliesTo
    });
    setIsEditingGroup(true);
  };
  
  const handleEditField = (field: FieldDefinition) => {
    setEditingField(field);
    setFieldForm(field);
    setIsEditingField(true);
  };
  
  const handleImportJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        
        // Navegar para sincronização de conteúdo
        toast.success('JSON carregado. Redirecionando para sincronização...');
        setTimeout(() => {
          window.location.hash = '#/content/sync';
        }, 1000);
      } catch (error) {
        toast.error('Erro ao ler arquivo JSON');
        console.error(error);
      }
    };
    
    input.click();
  };
  
  const handleExportGroup = (group: CustomFieldGroup) => {
    const dataStr = JSON.stringify(group, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${group.name.replace(/\s+/g, '_')}_fields.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Grupo exportado com sucesso');
  };
  
  const fieldTypeOptions: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'boolean', label: 'Verdadeiro/Falso' },
    { value: 'datetime', label: 'Data e Hora' },
    { value: 'date', label: 'Data' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' },
    { value: 'richtext', label: 'Texto Rico (HTML)' },
    { value: 'collection', label: 'Coleção (Array)' },
    { value: 'taxonomy', label: 'Taxonomia' },
    { value: 'lookup', label: 'Referência (Lookup)' },
    { value: 'choice', label: 'Escolha' },
    { value: 'user', label: 'Usuário' },
    { value: 'guid', label: 'GUID' }
  ];
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Campos Personalizados</h1>
          <p className="text-muted-foreground">
            Gerencie campos personalizados e tipos de dados para páginas, matérias e listas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportJson}>
            <Upload className="w-4 h-4 mr-2" />
            Importar JSON
          </Button>
          <Dialog open={isEditingGroup} onOpenChange={setIsEditingGroup}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setGroupForm({ name: '', description: '', appliesTo: [] });
                setSelectedGroup(null);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedGroup ? 'Editar Grupo' : 'Novo Grupo de Campos'}
                </DialogTitle>
                <DialogDescription>
                  Crie um grupo de campos personalizados para organizar seus dados
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Nome do Grupo</Label>
                  <Input
                    id="group-name"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    placeholder="Ex: Dados de Publicação"
                  />
                </div>
                
                <div>
                  <Label htmlFor="group-description">Descrição</Label>
                  <Input
                    id="group-description"
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    placeholder="Descreva o propósito deste grupo"
                  />
                </div>
                
                <div>
                  <Label>Aplicar a:</Label>
                  <div className="flex gap-4 mt-2">
                    {(['page', 'article', 'custom_list'] as const).map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={`applies-${type}`}
                          checked={groupForm.appliesTo.includes(type)}
                          onCheckedChange={(checked) => {
                            setGroupForm({
                              ...groupForm,
                              appliesTo: checked
                                ? [...groupForm.appliesTo, type]
                                : groupForm.appliesTo.filter(t => t !== type)
                            });
                          }}
                        />
                        <Label htmlFor={`applies-${type}`}>
                          {type === 'page' ? 'Páginas' : type === 'article' ? 'Matérias' : 'Listas'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditingGroup(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={selectedGroup ? handleUpdateGroup : handleCreateGroup}>
                    {selectedGroup ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Lista de grupos */}
        <Card className="col-span-4 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3>Grupos de Campos</h3>
            <Badge variant="secondary">{groups.length}</Badge>
          </div>
          
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedGroup?.id === group.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div>{group.name}</div>
                      <p className="text-muted-foreground text-sm">{group.description}</p>
                      <div className="flex gap-1 mt-2">
                        {group.appliesTo.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type === 'page' ? 'Páginas' : type === 'article' ? 'Matérias' : 'Listas'}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {group.fields.length} campo(s)
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGroup(group);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportGroup(group);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {groups.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum grupo criado</p>
                  <p className="text-sm">Crie seu primeiro grupo de campos</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
        
        {/* Detalhes do grupo e campos */}
        <Card className="col-span-8 p-4">
          {selectedGroup ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3>{selectedGroup.name}</h3>
                  <p className="text-muted-foreground text-sm">{selectedGroup.description}</p>
                </div>
                <Dialog open={isEditingField} onOpenChange={setIsEditingField}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingField(null);
                      setFieldForm({
                        name: '',
                        internalName: '',
                        type: 'text',
                        required: false,
                        defaultValue: '',
                        validation: { allowNull: true }
                      });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Campo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingField ? 'Editar Campo' : 'Novo Campo'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure o campo personalizado
                      </DialogDescription>
                    </DialogHeader>
                    
                    <ScrollArea className="max-h-[500px]">
                      <div className="space-y-4 pr-4">
                        <div>
                          <Label htmlFor="field-name">Nome do Campo</Label>
                          <Input
                            id="field-name"
                            value={fieldForm.name}
                            onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                            placeholder="Ex: Data de Publicação"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="field-internal">Nome Interno</Label>
                          <Input
                            id="field-internal"
                            value={fieldForm.internalName}
                            onChange={(e) => setFieldForm({ ...fieldForm, internalName: e.target.value })}
                            placeholder="Ex: DataPublicacao (sem espaços)"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="field-type">Tipo de Dado</Label>
                          <Select
                            value={fieldForm.type}
                            onValueChange={(value: FieldType) => setFieldForm({ ...fieldForm, type: value })}
                          >
                            <SelectTrigger id="field-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="field-required"
                            checked={fieldForm.required}
                            onCheckedChange={(checked) => 
                              setFieldForm({ ...fieldForm, required: checked as boolean })
                            }
                          />
                          <Label htmlFor="field-required">Campo obrigatório</Label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="field-allow-null"
                            checked={fieldForm.validation?.allowNull}
                            onCheckedChange={(checked) => 
                              setFieldForm({ 
                                ...fieldForm, 
                                validation: { ...fieldForm.validation, allowNull: checked as boolean }
                              })
                            }
                          />
                          <Label htmlFor="field-allow-null">Permitir valor nulo</Label>
                        </div>
                        
                        <div>
                          <Label htmlFor="field-default">Valor Padrão</Label>
                          <Input
                            id="field-default"
                            value={fieldForm.defaultValue || ''}
                            onChange={(e) => setFieldForm({ ...fieldForm, defaultValue: e.target.value })}
                            placeholder="Valor padrão (opcional)"
                          />
                        </div>
                        
                        {(fieldForm.type === 'number') && (
                          <>
                            <div>
                              <Label htmlFor="field-min">Valor Mínimo</Label>
                              <Input
                                id="field-min"
                                type="number"
                                value={fieldForm.validation?.min || ''}
                                onChange={(e) => setFieldForm({
                                  ...fieldForm,
                                  validation: {
                                    ...fieldForm.validation,
                                    min: e.target.value ? Number(e.target.value) : undefined
                                  }
                                })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="field-max">Valor Máximo</Label>
                              <Input
                                id="field-max"
                                type="number"
                                value={fieldForm.validation?.max || ''}
                                onChange={(e) => setFieldForm({
                                  ...fieldForm,
                                  validation: {
                                    ...fieldForm.validation,
                                    max: e.target.value ? Number(e.target.value) : undefined
                                  }
                                })}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </ScrollArea>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => {
                        setIsEditingField(false);
                        setEditingField(null);
                      }}>
                        Cancelar
                      </Button>
                      <Button onClick={editingField ? handleUpdateField : handleAddField}>
                        {editingField ? 'Atualizar' : 'Adicionar'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Separator className="my-4" />
              
              <ScrollArea className="h-[550px]">
                <div className="space-y-2">
                  {selectedGroup.fields.map((field) => (
                    <div
                      key={field.internalName}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span>{field.name}</span>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            <code className="bg-muted px-2 py-0.5 rounded">
                              {field.internalName}
                            </code>
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">
                              {fieldTypeOptions.find(o => o.value === field.type)?.label || field.type}
                            </Badge>
                            {field.defaultValue && (
                              <Badge variant="secondary" className="text-xs">
                                Padrão: {field.defaultValue}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditField(field)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteField(field.internalName)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {selectedGroup.fields.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileJson className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum campo adicionado</p>
                      <p className="text-sm">Adicione campos personalizados a este grupo</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selecione um grupo para ver os campos</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
