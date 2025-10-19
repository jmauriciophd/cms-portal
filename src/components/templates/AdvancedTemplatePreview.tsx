/**
 * PREVIEW AVANÇADO DE TEMPLATES
 * Mostra visualmente as propriedades avançadas dos componentes
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Layout, 
  Type, 
  Palette, 
  Layers, 
  Smartphone,
  Eye,
  Lock,
  Zap
} from 'lucide-react';
import { BaseComponentProperties } from '../../utils/advancedComponentSchemas';

interface AdvancedTemplatePreviewProps {
  component: Partial<BaseComponentProperties>;
}

export function AdvancedTemplatePreview({ component }: AdvancedTemplatePreviewProps) {
  const hasLayout = component.width || component.height || component.margin || component.padding;
  const hasTypography = component.fontFamily || component.fontSize || component.fontWeight;
  const hasColors = component.color || component.backgroundColor;
  const hasEffects = component.boxShadow || component.opacity || component.transform;
  const hasResponsive = component.breakpoints && Object.keys(component.breakpoints).length > 0;
  const hasAccessibility = component.ariaLabel || component.role || component.tabIndex;
  const hasStates = component.states && Object.keys(component.states).length > 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-4 h-4" />
            {component.name || component.componentType || 'Componente'}
          </CardTitle>
          {component.locked && (
            <Badge variant="outline" className="gap-1">
              <Lock className="w-3 h-3" />
              Bloqueado
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Tipo: <code className="bg-muted px-1 py-0.5 rounded">{component.componentType}</code>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Preview Visual */}
        <div 
          className="border rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-[100px] flex items-center justify-center"
          style={{
            width: component.width,
            height: component.height,
            backgroundColor: component.backgroundColor,
            color: component.color,
            fontFamily: component.fontFamily,
            fontSize: component.fontSize,
            fontWeight: component.fontWeight,
            borderRadius: component.borderRadius,
            opacity: component.opacity,
            boxShadow: component.boxShadow ? 
              `${component.boxShadow.offsetX} ${component.boxShadow.offsetY} ${component.boxShadow.blur} ${component.boxShadow.spread} ${component.boxShadow.color}` : 
              undefined
          }}
        >
          <div className="text-center text-xs opacity-50">
            Preview do componente
          </div>
        </div>

        <Separator />

        {/* Propriedades Ativas */}
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {hasLayout && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Layout className="w-3 h-3" />
                  Layout
                </div>
                <div className="pl-5 space-y-0.5 text-xs text-muted-foreground">
                  {component.width && <div>• Width: <code>{component.width}</code></div>}
                  {component.height && <div>• Height: <code>{component.height}</code></div>}
                  {component.margin && <div>• Margin: <code>{component.margin}</code></div>}
                  {component.padding && <div>• Padding: <code>{component.padding}</code></div>}
                  {component.zIndex !== undefined && <div>• Z-Index: <code>{component.zIndex}</code></div>}
                </div>
              </div>
            )}

            {hasTypography && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Type className="w-3 h-3" />
                  Tipografia
                </div>
                <div className="pl-5 space-y-0.5 text-xs text-muted-foreground">
                  {component.fontFamily && <div>• Font Family: <code>{component.fontFamily}</code></div>}
                  {component.fontSize && <div>• Font Size: <code>{component.fontSize}</code></div>}
                  {component.fontWeight && <div>• Font Weight: <code>{component.fontWeight}</code></div>}
                  {component.lineHeight && <div>• Line Height: <code>{component.lineHeight}</code></div>}
                  {component.letterSpacing && <div>• Letter Spacing: <code>{component.letterSpacing}</code></div>}
                </div>
              </div>
            )}

            {hasColors && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Palette className="w-3 h-3" />
                  Cores
                </div>
                <div className="pl-5 space-y-0.5 text-xs text-muted-foreground">
                  {component.color && (
                    <div className="flex items-center gap-2">
                      • Texto: 
                      <div 
                        className="w-3 h-3 rounded border" 
                        style={{ backgroundColor: component.color }}
                      />
                      <code>{component.color}</code>
                    </div>
                  )}
                  {component.backgroundColor && (
                    <div className="flex items-center gap-2">
                      • Fundo: 
                      <div 
                        className="w-3 h-3 rounded border" 
                        style={{ backgroundColor: component.backgroundColor }}
                      />
                      <code>{component.backgroundColor}</code>
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasEffects && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  Efeitos
                </div>
                <div className="pl-5 space-y-0.5 text-xs text-muted-foreground">
                  {component.boxShadow && <div>• Box Shadow: Ativo</div>}
                  {component.opacity !== undefined && <div>• Opacity: <code>{component.opacity}</code></div>}
                  {component.transform && <div>• Transform: Ativo</div>}
                  {component.filter && <div>• Filter: Ativo</div>}
                </div>
              </div>
            )}

            {hasResponsive && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Smartphone className="w-3 h-3" />
                  Responsivo
                </div>
                <div className="pl-5 space-y-0.5 text-xs text-muted-foreground">
                  {component.breakpoints && Object.keys(component.breakpoints).map(bp => (
                    <div key={bp}>• Breakpoint: <code>{bp}</code></div>
                  ))}
                </div>
              </div>
            )}

            {hasAccessibility && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Eye className="w-3 h-3" />
                  Acessibilidade
                </div>
                <div className="pl-5 space-y-0.5 text-xs text-muted-foreground">
                  {component.role && <div>• Role: <code>{component.role}</code></div>}
                  {component.ariaLabel && <div>• ARIA Label: <code>{component.ariaLabel}</code></div>}
                  {component.tabIndex !== undefined && <div>• Tab Index: <code>{component.tabIndex}</code></div>}
                </div>
              </div>
            )}

            {hasStates && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  Estados
                </div>
                <div className="pl-5 space-y-0.5 text-xs text-muted-foreground">
                  {component.states && Object.keys(component.states).map(state => (
                    <div key={state}>• Estado: <code>{state}</code></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Badges de Features */}
        <div className="flex flex-wrap gap-1 pt-2 border-t">
          {hasLayout && <Badge variant="secondary" className="text-xs">Layout</Badge>}
          {hasTypography && <Badge variant="secondary" className="text-xs">Tipografia</Badge>}
          {hasColors && <Badge variant="secondary" className="text-xs">Cores</Badge>}
          {hasEffects && <Badge variant="secondary" className="text-xs">Efeitos</Badge>}
          {hasResponsive && <Badge variant="secondary" className="text-xs">Responsivo</Badge>}
          {hasAccessibility && <Badge variant="secondary" className="text-xs">Acessível</Badge>}
          {hasStates && <Badge variant="secondary" className="text-xs">Estados</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
