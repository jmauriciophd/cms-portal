import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Palette, Type, Ruler, Circle, Box, Grid, Eye } from 'lucide-react';
import { DesignSystemTokens, TokenCollection } from '../../services/DesignSystemService';
import { toast } from 'sonner@2.0.3';

interface TokenEditorProps {
  tokens: DesignSystemTokens;
  onUpdate: (tokens: DesignSystemTokens) => void;
}

export function TokenEditor({ tokens, onUpdate }: TokenEditorProps) {
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [newValue, setNewValue] = useState('');

  const flatTokens = (collection: TokenCollection, prefix = ''): Array<{ path: string; value: any }> => {
    const result: Array<{ path: string; value: any }> = [];

    for (const [key, value] of Object.entries(collection)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object') {
        if ('$value' in value || 'value' in value) {
          result.push({ path, value: value.$value || value.value });
        } else {
          result.push(...flatTokens(value as TokenCollection, path));
        }
      }
    }

    return result;
  };

  const updateToken = (path: string, value: any) => {
    const parts = path.split('.');
    const updated = JSON.parse(JSON.stringify(tokens));
    let current: any = updated;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) current[part] = {};
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    if (current[lastPart] && typeof current[lastPart] === 'object') {
      current[lastPart].value = value;
    } else {
      current[lastPart] = { value };
    }

    onUpdate(updated);
    setEditingToken(null);
    setNewValue('');
  };

  const renderColorTokens = () => {
    if (!tokens.color) return null;
    const colorTokens = flatTokens(tokens.color);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colorTokens.map(({ path, value }) => (
          <Card key={path}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-md border-2 border-gray-200"
                  style={{ backgroundColor: value }}
                />
                <div className="flex-1">
                  <p className="text-sm mb-1">{path}</p>
                  {editingToken === path ? (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="h-8 text-xs"
                        placeholder={value}
                      />
                      <Button
                        size="sm"
                        onClick={() => updateToken(path, newValue)}
                      >
                        OK
                      </Button>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        setEditingToken(path);
                        setNewValue(value);
                      }}
                    >
                      {value}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderTypographyTokens = () => {
    if (!tokens.typography) return null;
    const typoTokens = flatTokens(tokens.typography);

    return (
      <div className="space-y-4">
        {typoTokens.map(({ path, value }) => (
          <Card key={path}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{path}</p>
                  {editingToken === path ? (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="h-8"
                        placeholder={value}
                      />
                      <Button
                        size="sm"
                        onClick={() => updateToken(path, newValue)}
                      >
                        Salvar
                      </Button>
                    </div>
                  ) : (
                    <p
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setEditingToken(path);
                        setNewValue(value);
                      }}
                      style={
                        path.includes('fontFamily') ? { fontFamily: value } :
                        path.includes('fontSize') ? { fontSize: value } :
                        path.includes('fontWeight') ? { fontWeight: value } :
                        path.includes('lineHeight') ? { lineHeight: value } :
                        {}
                      }
                    >
                      {value}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderSpacingTokens = () => {
    if (!tokens.spacing) return null;
    const spacingTokens = flatTokens(tokens.spacing);

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {spacingTokens.map(({ path, value }) => (
          <Card key={path}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-2">{path}</p>
              <div className="flex items-center gap-2">
                <div
                  className="bg-blue-500"
                  style={{ width: value, height: '20px' }}
                />
                {editingToken === path ? (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="h-8 w-20 text-xs"
                      placeholder={value}
                    />
                    <Button
                      size="sm"
                      onClick={() => updateToken(path, newValue)}
                    >
                      OK
                    </Button>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      setEditingToken(path);
                      setNewValue(value);
                    }}
                  >
                    {value}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderRadiusTokens = () => {
    if (!tokens.radius) return null;
    const radiusTokens = flatTokens(tokens.radius);

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {radiusTokens.map(({ path, value }) => (
          <Card key={path}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-2">{path}</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ borderRadius: value }}
                />
                {editingToken === path ? (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="h-8 w-20 text-xs"
                      placeholder={value}
                    />
                    <Button
                      size="sm"
                      onClick={() => updateToken(path, newValue)}
                    >
                      OK
                    </Button>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      setEditingToken(path);
                      setNewValue(value);
                    }}
                  >
                    {value}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderShadowTokens = () => {
    if (!tokens.shadow) return null;
    const shadowTokens = flatTokens(tokens.shadow);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shadowTokens.map(({ path, value }) => (
          <Card key={path}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-3">{path}</p>
              <div
                className="w-full h-24 bg-white rounded-lg flex items-center justify-center"
                style={{ boxShadow: value }}
              >
                <p className="text-sm text-gray-400">Preview</p>
              </div>
              {editingToken === path ? (
                <div className="flex gap-2 mt-2">
                  <Input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="h-8 text-xs"
                    placeholder={value}
                  />
                  <Button
                    size="sm"
                    onClick={() => updateToken(path, newValue)}
                  >
                    Salvar
                  </Button>
                </div>
              ) : (
                <Badge
                  variant="outline"
                  className="cursor-pointer mt-2"
                  onClick={() => {
                    setEditingToken(path);
                    setNewValue(value);
                  }}
                >
                  Editar
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderBreakpointTokens = () => {
    if (!tokens.breakpoint) return null;
    const breakpointTokens = flatTokens(tokens.breakpoint);

    return (
      <div className="space-y-4">
        {breakpointTokens.map(({ path, value }) => (
          <Card key={path}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1">{path}</p>
                  <p className="text-sm text-gray-600">Min-width: {value}</p>
                </div>
                {editingToken === path ? (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="h-8 w-24"
                      placeholder={value}
                    />
                    <Button
                      size="sm"
                      onClick={() => updateToken(path, newValue)}
                    >
                      Salvar
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingToken(path);
                      setNewValue(value);
                    }}
                  >
                    Editar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor de Tokens</CardTitle>
        <CardDescription>
          Edite os tokens do Design System. Clique em um token para editá-lo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors">
          <TabsList>
            <TabsTrigger value="colors">
              <Palette className="w-4 h-4 mr-2" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="typography">
              <Type className="w-4 h-4 mr-2" />
              Tipografia
            </TabsTrigger>
            <TabsTrigger value="spacing">
              <Ruler className="w-4 h-4 mr-2" />
              Espaçamentos
            </TabsTrigger>
            <TabsTrigger value="radius">
              <Circle className="w-4 h-4 mr-2" />
              Raios
            </TabsTrigger>
            <TabsTrigger value="shadow">
              <Box className="w-4 h-4 mr-2" />
              Sombras
            </TabsTrigger>
            <TabsTrigger value="breakpoints">
              <Grid className="w-4 h-4 mr-2" />
              Breakpoints
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="mt-6">
            {renderColorTokens()}
          </TabsContent>

          <TabsContent value="typography" className="mt-6">
            {renderTypographyTokens()}
          </TabsContent>

          <TabsContent value="spacing" className="mt-6">
            {renderSpacingTokens()}
          </TabsContent>

          <TabsContent value="radius" className="mt-6">
            {renderRadiusTokens()}
          </TabsContent>

          <TabsContent value="shadow" className="mt-6">
            {renderShadowTokens()}
          </TabsContent>

          <TabsContent value="breakpoints" className="mt-6">
            {renderBreakpointTokens()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
