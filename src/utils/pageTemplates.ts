import { v4 as uuidv4 } from 'uuid';
import { BuilderNode } from '../store/useBuilderStore';

// Template padrão para páginas (estilo WordPress/TinyMCE)
export const createDefaultPageTemplate = (): BuilderNode[] => {
  return [
    {
      id: uuidv4(),
      type: 'richtext',
      props: {
        content: `
          <h2>Bem-vindo à Nova Página</h2>
          <p>Comece a editar este conteúdo usando o editor rich text abaixo. Você pode formatar texto, adicionar links, inserir imagens e muito mais.</p>
          
          <h3>Recursos Disponíveis:</h3>
          <ul>
            <li><strong>Formatação de texto:</strong> Negrito, itálico, sublinhado</li>
            <li><strong>Alinhamento:</strong> Esquerda, centro, direita</li>
            <li><strong>Listas:</strong> Com marcadores ou numeradas</li>
            <li><strong>Links:</strong> Adicione links internos ou externos</li>
          </ul>
          
          <p>Selecione este componente no canvas e use o painel de propriedades à direita para editar o conteúdo na aba "Conteúdo".</p>
          
          <p><em>Dica: Você pode arrastar mais componentes da barra lateral esquerda para construir sua página!</em></p>
        `.trim(),
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 4
      },
      className: '',
      styles: {}
    }
  ];
};

// Template de artigo/notícia
export const createArticleTemplate = (): BuilderNode[] => {
  return [
    {
      id: uuidv4(),
      type: 'container',
      className: 'max-w-4xl mx-auto py-8 px-4',
      children: [
        {
          id: uuidv4(),
          type: 'heading',
          props: {
            content: 'Título do Artigo',
            level: 'h1',
            fontSize: 48,
            fontWeight: '700',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: 24
          },
          className: '',
          styles: {}
        },
        {
          id: uuidv4(),
          type: 'text',
          props: {
            content: 'Data de publicação: ' + new Date().toLocaleDateString('pt-BR'),
            fontSize: 14,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 32
          },
          className: '',
          styles: {}
        },
        {
          id: uuidv4(),
          type: 'richtext',
          props: {
            content: `
              <p><strong>Introdução:</strong> Comece seu artigo com um parágrafo introdutório cativante que prenda a atenção do leitor.</p>
              
              <h3>Subtítulo do Artigo</h3>
              <p>Desenvolva suas ideias aqui. Use parágrafos bem estruturados para tornar o conteúdo fácil de ler.</p>
              
              <ul>
                <li>Ponto importante número 1</li>
                <li>Ponto importante número 2</li>
                <li>Ponto importante número 3</li>
              </ul>
              
              <p>Continue desenvolvendo o conteúdo com informações relevantes e bem organizadas.</p>
              
              <h3>Conclusão</h3>
              <p>Finalize com um resumo ou chamada para ação.</p>
            `.trim(),
            backgroundColor: '#ffffff',
            padding: 0
          },
          className: '',
          styles: {}
        }
      ],
      styles: {}
    }
  ];
};

// Template de página institucional
export const createInstitutionalTemplate = (): BuilderNode[] => {
  return [
    {
      id: uuidv4(),
      type: 'container',
      className: 'min-h-screen',
      children: [
        // Header
        {
          id: uuidv4(),
          type: 'header',
          className: 'bg-blue-600 text-white py-16 px-4',
          children: [
            {
              id: uuidv4(),
              type: 'container',
              className: 'max-w-6xl mx-auto',
              children: [
                {
                  id: uuidv4(),
                  type: 'heading',
                  props: {
                    content: 'Sobre Nossa Empresa',
                    level: 'h1',
                    fontSize: 56,
                    fontWeight: '800',
                    color: '#ffffff',
                    textAlign: 'center'
                  },
                  className: '',
                  styles: {}
                },
                {
                  id: uuidv4(),
                  type: 'text',
                  props: {
                    content: 'Conheça nossa história e valores',
                    fontSize: 20,
                    color: '#dbeafe',
                    textAlign: 'center',
                    marginTop: 16
                  },
                  className: '',
                  styles: {}
                }
              ],
              styles: {}
            }
          ],
          styles: {}
        },
        // Content
        {
          id: uuidv4(),
          type: 'container',
          className: 'max-w-4xl mx-auto py-12 px-4',
          children: [
            {
              id: uuidv4(),
              type: 'richtext',
              props: {
                content: `
                  <h2>Nossa História</h2>
                  <p>Fundada em [ano], nossa empresa tem se dedicado a fornecer [produtos/serviços] de excelência para nossos clientes.</p>
                  
                  <h2>Missão</h2>
                  <p>Nossa missão é [descrever missão].</p>
                  
                  <h2>Visão</h2>
                  <p>Aspiramos ser [descrever visão].</p>
                  
                  <h2>Valores</h2>
                  <ul>
                    <li><strong>Integridade:</strong> Agimos com honestidade em tudo que fazemos</li>
                    <li><strong>Inovação:</strong> Buscamos constantemente novas soluções</li>
                    <li><strong>Excelência:</strong> Comprometemo-nos com a qualidade</li>
                    <li><strong>Respeito:</strong> Valorizamos todas as pessoas</li>
                  </ul>
                `.trim(),
                backgroundColor: '#ffffff',
                padding: 0
              },
              className: '',
              styles: {}
            }
          ],
          styles: {}
        }
      ],
      styles: {}
    }
  ];
};

// Template em branco
export const createBlankTemplate = (): BuilderNode[] => {
  return [
    {
      id: uuidv4(),
      type: 'richtext',
      props: {
        content: '<p>Página em branco. Comece a editar!</p>',
        backgroundColor: '#ffffff',
        padding: 20
      },
      className: '',
      styles: {}
    }
  ];
};

// Lista de templates disponíveis
export const pageTemplates = {
  default: {
    name: 'Editor de Conteúdo',
    description: 'Template padrão com editor rich text',
    icon: '📝',
    create: createDefaultPageTemplate
  },
  article: {
    name: 'Artigo/Notícia',
    description: 'Template para artigos e notícias',
    icon: '📰',
    create: createArticleTemplate
  },
  institutional: {
    name: 'Página Institucional',
    description: 'Template para páginas sobre, missão, etc',
    icon: '🏢',
    create: createInstitutionalTemplate
  },
  blank: {
    name: 'Página em Branco',
    description: 'Comece do zero',
    icon: '📄',
    create: createBlankTemplate
  }
};

// Função para inicializar template baseado no tipo
export function initializePageTemplate(templateType: keyof typeof pageTemplates = 'default'): BuilderNode[] {
  const template = pageTemplates[templateType];
  if (!template) return createDefaultPageTemplate();
  return template.create();
}
