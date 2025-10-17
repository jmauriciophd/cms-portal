import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Code2, Sparkles, Eye } from 'lucide-react';

export function EditorDemo() {
  const [content, setContent] = useState(`<h2>Bem-vindo ao Editor Inteligente</h2>
<p>Este é um editor de texto rico com recursos avançados.</p>`);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1>Editor de Texto Inteligente</h1>
        <p className="text-gray-600 mt-2">
          Editor avançado com sugestões de texto IA e editor de código HTML
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Editor</CardTitle>
              <CardDescription>
                Use o editor com sugestões inteligentes e modo código
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={content}
                onChange={setContent}
              />
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview do Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none p-4 border border-gray-200 rounded-md bg-gray-50"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recursos e instruções */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Sugestões Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm mb-2">Como usar:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Clique no botão <strong>IA</strong> na toolbar</li>
                  <li>• Ou pressione <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+M</kbd></li>
                  <li>• Digite e veja sugestões aparecerem automaticamente</li>
                  <li>• Use <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Tab</kbd> para aceitar</li>
                  <li>• Use <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↑↓</kbd> para navegar</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm mb-2">Palavras-chave que ativam sugestões:</h4>
                <div className="flex flex-wrap gap-2">
                  {['empresa', 'serviços', 'produtos', 'qualidade', 'tecnologia', 'contato', 'equipe', 'clientes'].map(word => (
                    <span key={word} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-blue-600" />
                Editor de Código
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm mb-2">Recursos:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Syntax highlighting para HTML</li>
                  <li>✓ Números de linha</li>
                  <li>✓ Auto-complete de tags</li>
                  <li>✓ Formatação automática de código</li>
                  <li>✓ Indentação com Tab</li>
                  <li>✓ Tema escuro (estilo VSCode)</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm mb-2">Atalhos do editor:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Indentar</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Tab</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-complete tag</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">{'>'}</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Formatar código</span>
                    <span className="text-xs text-gray-500">Botão na toolbar</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="text-sm mb-3">💡 Dica Profissional</h4>
              <p className="text-sm text-gray-700">
                Combine sugestões inteligentes com o editor de código para máxima produtividade. 
                Use sugestões para conteúdo rápido e o editor HTML para ajustes finos e personalizações avançadas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Exemplos de uso */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Exemplos para Testar</CardTitle>
          <CardDescription>
            Copie e cole estes textos no editor para ver as sugestões em ação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="intro">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="intro">Introdução</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="about">Sobre</TabsTrigger>
            </TabsList>
            
            <TabsContent value="intro" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600 mb-2">Digite no editor:</p>
                <code className="text-sm">Olá, somos uma empresa</code>
              </div>
              <p className="text-sm text-gray-600">
                As sugestões irão aparecer automaticamente com continuações relevantes.
              </p>
            </TabsContent>
            
            <TabsContent value="services" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600 mb-2">Digite no editor:</p>
                <code className="text-sm">Oferecemos serviços de tecnologia</code>
              </div>
              <p className="text-sm text-gray-600">
                Verá sugestões sobre produtos, soluções e benefícios.
              </p>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600 mb-2">Digite no editor:</p>
                <code className="text-sm">Entre em contato</code>
              </div>
              <p className="text-sm text-gray-600">
                Receberá sugestões de frases de chamada para ação.
              </p>
            </TabsContent>
            
            <TabsContent value="about" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600 mb-2">Digite no editor:</p>
                <code className="text-sm">Nossa equipe de profissionais</code>
              </div>
              <p className="text-sm text-gray-600">
                Obterá sugestões sobre experiência, qualidade e diferenciais.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
