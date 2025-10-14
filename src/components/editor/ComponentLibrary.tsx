import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Type, 
  Image as ImageIcon, 
  Square, 
  Layout, 
  Grid3x3,
  FormInput,
  Video,
  Minus,
  AlignLeft,
  FileText,
  Star,
  List,
  Calendar,
  MapPin,
  Users,
  Mail,
  Phone,
  Menu,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Quote,
  Code,
  Table,
  Columns,
  Layers
} from 'lucide-react';

interface ComponentLibraryProps {
  onAddComponent: (type: string, props?: any, styles?: React.CSSProperties) => void;
}

export function ComponentLibrary({ onAddComponent }: ComponentLibraryProps) {
  const componentCategories = [
    {
      name: 'Texto',
      components: [
        {
          type: 'heading',
          icon: Type,
          label: 'Título',
          props: { tag: 'h2', text: 'Título Principal' },
          styles: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }
        },
        {
          type: 'paragraph',
          icon: AlignLeft,
          label: 'Parágrafo',
          props: { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
          styles: { marginBottom: '1rem', lineHeight: '1.6' }
        },
        {
          type: 'heading',
          icon: Type,
          label: 'Subtítulo',
          props: { tag: 'h3', text: 'Subtítulo' },
          styles: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' }
        },
        {
          type: 'quote',
          icon: Quote,
          label: 'Citação',
          props: { text: 'Citação inspiradora', author: 'Autor' },
          styles: { 
            borderLeft: '4px solid #3b82f6', 
            paddingLeft: '1rem', 
            fontStyle: 'italic',
            margin: '1rem 0'
          }
        }
      ]
    },
    {
      name: 'Mídia',
      components: [
        {
          type: 'image',
          icon: ImageIcon,
          label: 'Imagem',
          props: { src: 'https://via.placeholder.com/800x400', alt: 'Imagem' },
          styles: { width: '100%', height: 'auto', borderRadius: '0.5rem', marginBottom: '1rem' }
        },
        {
          type: 'video',
          icon: Video,
          label: 'Vídeo',
          props: { src: '' },
          styles: { width: '100%', marginBottom: '1rem' }
        },
        {
          type: 'image',
          icon: ImageIcon,
          label: 'Galeria',
          props: { gallery: true },
          styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }
        }
      ]
    },
    {
      name: 'Layout',
      components: [
        {
          type: 'container',
          icon: Square,
          label: 'Container',
          props: {},
          styles: { padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem' }
        },
        {
          type: 'grid',
          icon: Grid3x3,
          label: 'Grid 3 Colunas',
          props: { columns: 3, gap: '1rem' },
          styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }
        },
        {
          type: 'grid',
          icon: Columns,
          label: 'Grid 2 Colunas',
          props: { columns: 2, gap: '1rem' },
          styles: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }
        },
        {
          type: 'container',
          icon: Layers,
          label: 'Seção',
          props: {},
          styles: { padding: '4rem 2rem', marginBottom: '2rem' }
        },
        {
          type: 'divider',
          icon: Minus,
          label: 'Divisor',
          props: {},
          styles: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '2rem 0' }
        }
      ]
    },
    {
      name: 'Componentes',
      components: [
        {
          type: 'hero',
          icon: Layout,
          label: 'Hero Section',
          props: { 
            title: 'Bem-vindo ao nosso site', 
            subtitle: 'Descubra soluções incríveis',
            buttonText: 'Saiba Mais'
          },
          styles: { marginBottom: '2rem' }
        },
        {
          type: 'card',
          icon: FileText,
          label: 'Card',
          props: { 
            title: 'Título do Card', 
            description: 'Descrição do conteúdo do card'
          },
          styles: { marginBottom: '1rem' }
        },
        {
          type: 'button',
          icon: Square,
          label: 'Botão',
          props: { text: 'Clique Aqui' },
          styles: { 
            padding: '0.75rem 1.5rem', 
            background: '#3b82f6', 
            color: 'white', 
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }
        },
        {
          type: 'testimonial',
          icon: Star,
          label: 'Depoimento',
          props: { 
            text: 'Excelente serviço!',
            author: 'João Silva',
            role: 'CEO da Empresa'
          },
          styles: { 
            padding: '2rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }
        }
      ]
    },
    {
      name: 'Formulários',
      components: [
        {
          type: 'form',
          icon: FormInput,
          label: 'Formulário',
          props: {},
          styles: { marginBottom: '2rem' }
        },
        {
          type: 'input',
          icon: FormInput,
          label: 'Campo de Texto',
          props: { placeholder: 'Digite aqui...' },
          styles: { 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }
        },
        {
          type: 'textarea',
          icon: AlignLeft,
          label: 'Área de Texto',
          props: { placeholder: 'Digite sua mensagem...' },
          styles: { 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            minHeight: '120px',
            marginBottom: '1rem'
          }
        },
        {
          type: 'select',
          icon: List,
          label: 'Seleção',
          props: { options: ['Opção 1', 'Opção 2', 'Opção 3'] },
          styles: { 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }
        }
      ]
    },
    {
      name: 'Navegação',
      components: [
        {
          type: 'navbar',
          icon: Menu,
          label: 'Barra de Navegação',
          props: { 
            logo: 'Logo',
            items: ['Início', 'Sobre', 'Serviços', 'Contato']
          },
          styles: { 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: 'white',
            borderBottom: '1px solid #e5e7eb'
          }
        },
        {
          type: 'breadcrumb',
          icon: Menu,
          label: 'Breadcrumb',
          props: { items: ['Início', 'Categoria', 'Página'] },
          styles: { marginBottom: '1rem' }
        },
        {
          type: 'footer',
          icon: Layers,
          label: 'Rodapé',
          props: { text: '© 2024 Todos os direitos reservados' },
          styles: { 
            padding: '2rem',
            background: '#1f2937',
            color: 'white',
            textAlign: 'center'
          }
        }
      ]
    },
    {
      name: 'Listas',
      components: [
        {
          type: 'list',
          icon: List,
          label: 'Lista',
          props: { items: ['Item 1', 'Item 2', 'Item 3'] },
          styles: { marginBottom: '1rem', paddingLeft: '1.5rem' }
        },
        {
          type: 'timeline',
          icon: Calendar,
          label: 'Timeline',
          props: { 
            events: [
              { date: '2024', title: 'Evento 1', description: 'Descrição' },
              { date: '2023', title: 'Evento 2', description: 'Descrição' }
            ]
          },
          styles: { marginBottom: '2rem' }
        },
        {
          type: 'pricing',
          icon: FileText,
          label: 'Tabela de Preços',
          props: {
            plans: [
              { name: 'Básico', price: 'R$ 49', features: ['Feature 1', 'Feature 2'] },
              { name: 'Pro', price: 'R$ 99', features: ['Feature 1', 'Feature 2', 'Feature 3'] }
            ]
          },
          styles: { marginBottom: '2rem' }
        }
      ]
    },
    {
      name: 'Contato',
      components: [
        {
          type: 'contact-info',
          icon: Mail,
          label: 'Info de Contato',
          props: { 
            email: 'contato@email.com',
            phone: '(11) 1234-5678',
            address: 'Rua Exemplo, 123'
          },
          styles: { padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', marginBottom: '1rem' }
        },
        {
          type: 'map',
          icon: MapPin,
          label: 'Mapa',
          props: { location: 'Brasília, DF' },
          styles: { width: '100%', height: '400px', background: '#e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem' }
        },
        {
          type: 'social',
          icon: Users,
          label: 'Redes Sociais',
          props: { 
            facebook: '#',
            twitter: '#',
            instagram: '#',
            youtube: '#'
          },
          styles: { display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }
        }
      ]
    },
    {
      name: 'Avançado',
      components: [
        {
          type: 'accordion',
          icon: List,
          label: 'Accordion',
          props: {
            items: [
              { title: 'Pergunta 1', content: 'Resposta 1' },
              { title: 'Pergunta 2', content: 'Resposta 2' }
            ]
          },
          styles: { marginBottom: '1rem' }
        },
        {
          type: 'tabs',
          icon: Layers,
          label: 'Abas',
          props: {
            tabs: [
              { label: 'Aba 1', content: 'Conteúdo da aba 1' },
              { label: 'Aba 2', content: 'Conteúdo da aba 2' }
            ]
          },
          styles: { marginBottom: '1rem' }
        },
        {
          type: 'carousel',
          icon: ImageIcon,
          label: 'Carrossel',
          props: {
            slides: [
              { image: 'https://via.placeholder.com/800x400', title: 'Slide 1' },
              { image: 'https://via.placeholder.com/800x400', title: 'Slide 2' }
            ]
          },
          styles: { marginBottom: '2rem' }
        },
        {
          type: 'code',
          icon: Code,
          label: 'Código',
          props: { code: 'console.log("Hello World");', language: 'javascript' },
          styles: { 
            background: '#1f2937',
            color: '#10b981',
            padding: '1rem',
            borderRadius: '0.5rem',
            fontFamily: 'monospace',
            overflow: 'auto',
            marginBottom: '1rem'
          }
        },
        {
          type: 'table',
          icon: Table,
          label: 'Tabela',
          props: {
            headers: ['Coluna 1', 'Coluna 2', 'Coluna 3'],
            rows: [
              ['Dado 1', 'Dado 2', 'Dado 3'],
              ['Dado 4', 'Dado 5', 'Dado 6']
            ]
          },
          styles: { marginBottom: '1rem', width: '100%' }
        }
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Componentes</h3>
        <p className="text-sm text-gray-600">Arraste para adicionar</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {componentCategories.map((category) => (
            <div key={category.name}>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{category.name}</h4>
              <div className="grid grid-cols-2 gap-2">
                {category.components.map((comp) => (
                  <button
                    key={`${comp.type}-${comp.label}`}
                    onClick={() => onAddComponent(comp.type, comp.props, comp.styles)}
                    className="flex flex-col items-center gap-2 p-3 border rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-center"
                  >
                    <comp.icon className="w-6 h-6 text-gray-600" />
                    <span className="text-xs font-medium">{comp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
