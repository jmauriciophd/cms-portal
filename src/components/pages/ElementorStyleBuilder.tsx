import React, { useState, useEffect } from 'react';
import { Plus, Eye, Save, Undo, Redo, Settings, Download, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { WidgetLibrary } from '../editor/WidgetLibrary';
import { StructureSelector, StructureOption } from '../editor/StructureSelector';
import { TemplateLibrary, Template } from '../editor/TemplateLibrary';
import { SectionComponent } from '../editor/SectionComponent';
import { BuilderPropertiesPanel } from '../editor/BuilderPropertiesPanel';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner@2.0.3';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

interface Column {
  id: string;
  width: number;
  widgets: any[];
}

interface Section {
  id: string;
  type: 'section';
  columns: Column[];
  background?: string;
  padding?: string;
}

interface PageData {
  sections: Section[];
}

export function ElementorStyleBuilder() {
  const [pageData, setPageData] = useState<PageData>({ sections: [] });
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showStructureSelector, setShowStructureSelector] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [pendingStructureIndex, setPendingStructureIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<PageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('elementorPageData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPageData(data);
        setHistory([data]);
        setHistoryIndex(0);
      } catch (error) {
        console.error('Erro ao carregar página:', error);
      }
    }
  }, []);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (pageData.sections.length > 0) {
        localStorage.setItem('elementorPageData', JSON.stringify(pageData));
        console.log('Auto-save realizado');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [pageData]);

  const addToHistory = (newData: PageData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newData)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPageData(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPageData(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const handleAddSection = (index?: number) => {
    setPendingStructureIndex(index ?? pageData.sections.length);
    setShowStructureSelector(true);
  };

  const handleStructureSelect = (structure: StructureOption) => {
    const columns: Column[] = structure.columns.map(width => ({
      id: uuidv4(),
      width,
      widgets: []
    }));

    const newSection: Section = {
      id: uuidv4(),
      type: 'section',
      columns
    };

    const newSections = [...pageData.sections];
    if (pendingStructureIndex !== null) {
      newSections.splice(pendingStructureIndex, 0, newSection);
    } else {
      newSections.push(newSection);
    }

    const newData = { ...pageData, sections: newSections };
    setPageData(newData);
    addToHistory(newData);
    setSelectedSectionId(newSection.id);
    toast.success('Seção adicionada!');
  };

  const handleTemplateSelect = (template: Template) => {
    // Converter template data para Section
    const columns: Column[] = template.data.columns.map((col: any) => ({
      id: uuidv4(),
      width: col.width,
      widgets: col.widgets.map((w: any) => ({ ...w, id: uuidv4() }))
    }));

    const newSection: Section = {
      id: uuidv4(),
      type: 'section',
      columns,
      background: template.data.background,
    };

    const newData = {
      ...pageData,
      sections: [...pageData.sections, newSection]
    };

    setPageData(newData);
    addToHistory(newData);
    toast.success(`Template "${template.name}" adicionado!`);
  };

  const handleDuplicateSection = (sectionId: string) => {
    const sectionIndex = pageData.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const section = pageData.sections[sectionIndex];
    const duplicated: Section = {
      ...JSON.parse(JSON.stringify(section)),
      id: uuidv4(),
      columns: section.columns.map(col => ({
        ...col,
        id: uuidv4(),
        widgets: col.widgets.map(w => ({ ...w, id: uuidv4() }))
      }))
    };

    const newSections = [...pageData.sections];
    newSections.splice(sectionIndex + 1, 0, duplicated);

    const newData = { ...pageData, sections: newSections };
    setPageData(newData);
    addToHistory(newData);
    toast.success('Seção duplicada!');
  };

  const handleDeleteSection = (sectionId: string) => {
    const newData = {
      ...pageData,
      sections: pageData.sections.filter(s => s.id !== sectionId)
    };
    setPageData(newData);
    addToHistory(newData);
    setSelectedSectionId(null);
    toast.success('Seção excluída!');
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = pageData.sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pageData.sections.length) return;

    const newSections = [...pageData.sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];

    const newData = { ...pageData, sections: newSections };
    setPageData(newData);
    addToHistory(newData);
  };

  const handleAddWidget = (sectionId: string, columnId: string) => {
    // Aqui abriria um selector de widget ou permitiria arrastar
    toast.info('Arraste um widget da sidebar ou clique no botão +');
  };

  const handleSave = () => {
    localStorage.setItem('elementorPageData', JSON.stringify(pageData));
    localStorage.setItem('elementorPageData_timestamp', new Date().toISOString());
    toast.success('Página salva com sucesso!');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Se está arrastando um widget da biblioteca
    if (active.id.toString().startsWith('widget-')) {
      const widget = active.data.current?.widget;
      if (!widget) return;

      // Determinar em qual seção/coluna dropou
      // Por simplicidade, adicionar na primeira coluna da última seção
      if (pageData.sections.length === 0) {
        toast.error('Adicione uma seção primeiro');
        return;
      }

      const lastSection = pageData.sections[pageData.sections.length - 1];
      const firstColumn = lastSection.columns[0];

      const newWidget = {
        id: uuidv4(),
        type: widget.id,
        name: widget.name,
        content: `Novo ${widget.name}`
      };

      const newSections = pageData.sections.map(section => {
        if (section.id === lastSection.id) {
          return {
            ...section,
            columns: section.columns.map(col => {
              if (col.id === firstColumn.id) {
                return {
                  ...col,
                  widgets: [...col.widgets, newWidget]
                };
              }
              return col;
            })
          };
        }
        return section;
      });

      const newData = { ...pageData, sections: newSections };
      setPageData(newData);
      addToHistory(newData);
      toast.success(`${widget.name} adicionado!`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {/* Sidebar: Widget Library */}
        <div className="w-80">
          <WidgetLibrary />
        </div>

        {/* Canvas Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-gray-900">Editor de Páginas</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
                title="Desfazer (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="Refazer (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateLibrary(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Templates
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>

              <Button
                variant="default"
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-gray-200 p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg min-h-[800px]">
              {pageData.sections.length === 0 ? (
                // Estado vazio
                <div className="flex flex-col items-center justify-center h-[600px] gap-6">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Comece a construir sua página
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Adicione uma seção para começar
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      onClick={() => handleAddSection(0)}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Adicionar Seção
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setShowTemplateLibrary(true)}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Usar Template
                    </Button>
                  </div>
                </div>
              ) : (
                // Seções
                <div className="relative">
                  {/* Botão + no topo */}
                  <div className="relative h-12 flex items-center justify-center group">
                    <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Button
                      size="sm"
                      className="relative bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleAddSection(0)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Seção
                    </Button>
                  </div>

                  {pageData.sections.map((section, index) => (
                    <React.Fragment key={section.id}>
                      <SectionComponent
                        id={section.id}
                        columns={section.columns}
                        isSelected={selectedSectionId === section.id}
                        onSelect={() => setSelectedSectionId(section.id)}
                        onAddWidget={(columnId) => handleAddWidget(section.id, columnId)}
                        onDuplicate={() => handleDuplicateSection(section.id)}
                        onDelete={() => handleDeleteSection(section.id)}
                        onMoveUp={index > 0 ? () => handleMoveSection(section.id, 'up') : undefined}
                        onMoveDown={index < pageData.sections.length - 1 ? () => handleMoveSection(section.id, 'down') : undefined}
                      />

                      {/* Botão + entre seções */}
                      <div className="relative h-12 flex items-center justify-center group">
                        <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Button
                          size="sm"
                          className="relative bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleAddSection(index + 1)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar Seção
                        </Button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel de Propriedades */}
        <div className="w-80 bg-white border-l border-gray-200">
          {selectedSectionId ? (
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Propriedades da Seção</h3>
              {/* Adicionar controles de estilo aqui */}
              <p className="text-sm text-gray-500">
                Configure estilos, cores, espaçamentos e mais.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
              <Settings className="w-16 h-16 mb-4" />
              <p className="text-sm">Selecione uma seção ou widget para editar propriedades</p>
            </div>
          )}
        </div>

        <DragOverlay>
          {/* Overlay durante drag */}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <StructureSelector
        open={showStructureSelector}
        onClose={() => setShowStructureSelector(false)}
        onSelect={handleStructureSelect}
      />

      <TemplateLibrary
        open={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
