/**
 * BIBLIOTECA DE COMPONENTES AVANÇADA
 * 
 * Sistema completo de componentes com:
 * - Hierarquia clara (Container/Leaf/Hybrid)
 * - Propriedades completas e documentadas
 * - Suporte a children e slots
 * - Validação de tipos
 */

import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
  Menu,
  Quote,
  Code,
  Table,
  Columns,
  Layers,
  Container,
  Box,
  Boxes,
  Component as ComponentIcon,
  PlusCircle,
  MousePointerClick,
  Navigation,
  LayoutGrid,
  Sparkles,
  ShoppingCart,
  TrendingUp,
  Award,
  Heart,
  MessageCircle,
  Bell,
  Settings,
  ChevronRight
} from 'lucide-react';
import { ComponentDefinition } from './ComponentDefinitions';

interface ComponentLibraryAdvancedProps {
  onAddComponent: (type: string, props?: any, styles?: React.CSSProperties, config?: any) => void;
}

export function ComponentLibraryAdvanced({ onAddComponent }: ComponentLibraryAdvancedProps) {
  
  const componentCategories = [
    {
      name: 'Texto',
      icon: Type,
      color: 'blue',
      components: [
        {
          type: 'heading',
          icon: Type,
          label: 'Título H1',
          category: 'LEAF',
          props: { 
            tag: 'h1', 
            text: 'Título Principal',
            textAlign: 'left',
            color: '#000000'
          },
          styles: { 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            lineHeight: '1.2'
          },
          allowChildren: false
        },
        {
          type: 'heading',
          icon: Type,
          label: 'Título H2',
          category: 'LEAF',
          props: { 
            tag: 'h2', 
            text: 'Título Secundário',
            textAlign: 'left'
          },
          styles: { 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '0.875rem' 
          },
          allowChildren: false
        },
        {
          type: 'heading',
          icon: Type,
          label: 'Título H3',
          category: 'LEAF',
          props: { 
            tag: 'h3', 
            text: 'Subtítulo',
            textAlign: 'left'
          },
          styles: { 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '0.75rem' 
          },
          allowChildren: false
        },
        {
          type: 'paragraph',
          icon: AlignLeft,
          label: 'Parágrafo',
          category: 'LEAF',
          props: { 
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            textAlign: 'left'
          },
          styles: { 
            marginBottom: '1rem', 
            lineHeight: '1.6',
            color: '#374151'
          },
          allowChildren: false
        },
        {
          type: 'quote',
          icon: Quote,
          label: 'Citação',
          category: 'LEAF',
          props: { 
            text: 'Citação inspiradora que destaca informações importantes',
            author: 'Nome do Autor',
            authorRole: 'Cargo',
            borderSide: 'left'
          },
          styles: { 
            borderLeft: '4px solid #3b82f6', 
            paddingLeft: '1.5rem',
            paddingTop: '1rem',
            paddingBottom: '1rem',
            fontStyle: 'italic',
            margin: '1.5rem 0',
            color: '#1f2937',
            backgroundColor: '#f9fafb'
          },
          allowChildren: false
        },
        {
          type: 'list',
          icon: List,
          label: 'Lista',
          category: 'LEAF',
          props: { 
            type: 'unordered',
            items: ['Item 1', 'Item 2', 'Item 3'],
            listStyle: 'disc'
          },
          styles: { 
            marginBottom: '1rem', 
            paddingLeft: '1.5rem',
            lineHeight: '1.8'
          },
          allowChildren: false
        }
      ]
    },
    {
      name: 'Mídia',
      icon: ImageIcon,
      color: 'purple',
      components: [
        {
          type: 'image',
          icon: ImageIcon,
          label: 'Imagem',
          category: 'LEAF',
          props: { 
            src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600',
            alt: 'Imagem descritiva',
            loading: 'lazy',
            objectFit: 'cover'
          },
          styles: { 
            width: '100%', 
            height: 'auto', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem',
            display: 'block'
          },
          allowChildren: false
        },
        {
          type: 'video',
          icon: Video,
          label: 'Vídeo',
          category: 'LEAF',
          props: { 
            src: '',
            controls: true,
            autoplay: false,
            loop: false,
            muted: false
          },
          styles: { 
            width: '100%', 
            marginBottom: '1rem',
            borderRadius: '0.5rem'
          },
          allowChildren: false
        },
        {
          type: 'gallery',
          icon: LayoutGrid,
          label: 'Galeria',
          category: 'CONTAINER',
          props: { 
            images: [
              { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', alt: 'Imagem 1' },
              { src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400', alt: 'Imagem 2' },
              { src: 'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?w=400', alt: 'Imagem 3' }
            ],
            columns: 3,
            gap: '1rem',
            layout: 'grid'
          },
          styles: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1rem',
            marginBottom: '2rem'
          },
          allowChildren: false
        }
      ]
    },
    {
      name: 'Layout Containers',
      icon: Container,
      color: 'green',
      components: [
        {
          type: 'container',
          icon: Box,
          label: 'Container Simples',
          category: 'CONTAINER',
          props: { 
            allowChildren: true,
            maxWidth: '1200px',
            padding: '2rem'
          },
          styles: { 
            padding: '2rem', 
            border: '2px dashed #d1d5db', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem',
            minHeight: '100px',
            backgroundColor: '#fafafa'
          },
          allowChildren: true,
          slots: []
        },
        {
          type: 'container',
          icon: Box,
          label: 'Container Flex',
          category: 'CONTAINER',
          props: { 
            allowChildren: true,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '1rem'
          },
          styles: { 
            padding: '2rem',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '1rem',
            border: '2px dashed #d1d5db', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem',
            minHeight: '100px',
            backgroundColor: '#fafafa'
          },
          allowChildren: true
        },
        {
          type: 'grid',
          icon: Grid3x3,
          label: 'Grid 2 Colunas',
          category: 'CONTAINER',
          props: { 
            allowChildren: true,
            columns: 2, 
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(2, 1fr)'
          },
          styles: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem', 
            marginBottom: '1rem',
            padding: '1rem',
            border: '2px dashed #d1d5db',
            borderRadius: '0.5rem',
            minHeight: '200px'
          },
          allowChildren: true
        },
        {
          type: 'grid',
          icon: Grid3x3,
          label: 'Grid 3 Colunas',
          category: 'CONTAINER',
          props: { 
            allowChildren: true,
            columns: 3, 
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(3, 1fr)'
          },
          styles: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1.5rem', 
            marginBottom: '1rem',
            padding: '1rem',
            border: '2px dashed #d1d5db',
            borderRadius: '0.5rem',
            minHeight: '200px'
          },
          allowChildren: true
        },
        {
          type: 'grid',
          icon: LayoutGrid,
          label: 'Grid 4 Colunas',
          category: 'CONTAINER',
          props: { 
            allowChildren: true,
            columns: 4, 
            gap: '1rem',
            gridTemplateColumns: 'repeat(4, 1fr)'
          },
          styles: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '1rem', 
            marginBottom: '1rem',
            padding: '1rem',
            border: '2px dashed #d1d5db',
            borderRadius: '0.5rem',
            minHeight: '200px'
          },
          allowChildren: true
        },
        {
          type: 'grid-cell',
          icon: Square,
          label: 'Célula de Grid',
          category: 'CONTAINER',
          props: { 
            allowChildren: true,
            gridColumn: 'span 1',
            gridRow: 'span 1'
          },
          styles: { 
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            backgroundColor: '#ffffff',
            minHeight: '80px'
          },
          allowChildren: true
        },
        {
          type: 'section',
          icon: Layers,
          label: 'Seção',
          category: 'CONTAINER',
          props: { 
            allowChildren: true,
            fullWidth: true,
            padding: '4rem 2rem'
          },
          styles: { 
            padding: '4rem 2rem', 
            marginBottom: '2rem',
            border: '2px dashed #d1d5db',
            minHeight: '200px'
          },
          allowChildren: true
        },
        {
          type: 'columns',
          icon: Columns,
          label: 'Colunas',
          category: 'CONTAINER',
          props: { 
            allowChildren: true,
            count: 2,
            gap: '2rem',
            layout: 'equal'
          },
          styles: { 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '2rem',
            marginBottom: '1rem',
            padding: '1rem',
            border: '2px dashed #d1d5db',
            borderRadius: '0.5rem'
          },
          allowChildren: true
        }
      ]
    },
    {
      name: 'Componentes Pré-Construídos',
      icon: ComponentIcon,
      color: 'orange',
      components: [
        {
          type: 'hero',
          icon: Sparkles,
          label: 'Hero Section',
          category: 'HYBRID',
          props: { 
            title: 'Bem-vindo ao nosso site', 
            subtitle: 'Descubra soluções incríveis para seu negócio',
            description: 'Oferecemos serviços de alta qualidade com atendimento personalizado',
            primaryButtonText: 'Começar Agora',
            primaryButtonLink: '#',
            secondaryButtonText: 'Saiba Mais',
            secondaryButtonLink: '#',
            textAlign: 'center',
            verticalAlign: 'center',
            backgroundOverlay: true,
            overlayOpacity: 0.5,
            allowChildren: false
          },
          styles: { 
            minHeight: '500px',
            padding: '4rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#1e3a8a',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            marginBottom: '2rem',
            textAlign: 'center',
            position: 'relative'
          },
          allowChildren: true
        },
        {
          type: 'card',
          icon: FileText,
          label: 'Card Completo',
          category: 'HYBRID',
          props: { 
            hasHeader: true,
            hasImage: true,
            hasFooter: true,
            headerTitle: 'Título do Card',
            headerSubtitle: 'Subtítulo opcional',
            imageSrc: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400',
            imageAlt: 'Imagem do card',
            imagePosition: 'top',
            variant: 'elevated',
            allowChildren: true
          },
          styles: { 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '1rem',
            transition: 'transform 0.2s, box-shadow 0.2s'
          },
          allowChildren: true,
          slots: ['header', 'content', 'footer']
        },
        {
          type: 'testimonial',
          icon: MessageCircle,
          label: 'Depoimento',
          category: 'LEAF',
          props: { 
            text: 'Excelente serviço! Superou todas as minhas expectativas. Recomendo fortemente.',
            author: 'João Silva',
            authorRole: 'CEO da Empresa X',
            rating: 5,
            showQuotes: true,
            variant: 'card',
            textAlign: 'left'
          },
          styles: { 
            padding: '2rem',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            marginBottom: '1rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          },
          allowChildren: false
        },
        {
          type: 'features',
          icon: Sparkles,
          label: 'Lista de Features',
          category: 'HYBRID',
          props: {
            title: 'Nossos Recursos',
            subtitle: 'Tudo que você precisa em um só lugar',
            features: [
              { id: '1', icon: 'Zap', title: 'Rápido', description: 'Performance otimizada' },
              { id: '2', icon: 'Shield', title: 'Seguro', description: 'Proteção de dados' },
              { id: '3', icon: 'Heart', title: 'Confiável', description: 'Suporte 24/7' }
            ],
            columns: 3,
            gap: '2rem',
            layout: 'grid'
          },
          styles: {
            padding: '3rem 2rem',
            marginBottom: '2rem'
          },
          allowChildren: false
        },
        {
          type: 'stats',
          icon: TrendingUp,
          label: 'Estatísticas',
          category: 'LEAF',
          props: {
            stats: [
              { id: '1', value: '10k+', label: 'Clientes', prefix: '', suffix: '+' },
              { id: '2', value: '99%', label: 'Satisfação', prefix: '', suffix: '%' },
              { id: '3', value: '24/7', label: 'Suporte', prefix: '', suffix: '' },
              { id: '4', value: '150+', label: 'Países', prefix: '', suffix: '+' }
            ],
            columns: 4,
            gap: '2rem',
            variant: 'card',
            textAlign: 'center'
          },
          styles: {
            padding: '3rem 2rem',
            backgroundColor: '#f9fafb',
            marginBottom: '2rem'
          },
          allowChildren: false
        },
        {
          type: 'pricing',
          icon: ShoppingCart,
          label: 'Tabela de Preços',
          category: 'LEAF',
          props: {
            plans: [
              { 
                id: '1',
                name: 'Básico', 
                price: 'R$ 49', 
                period: '/mês',
                features: ['10 usuários', '10GB storage', 'Suporte email'],
                buttonText: 'Escolher Plano',
                buttonLink: '#'
              },
              { 
                id: '2',
                name: 'Pro', 
                price: 'R$ 99', 
                period: '/mês',
                features: ['50 usuários', '100GB storage', 'Suporte prioritário', 'API access'],
                highlighted: true,
                buttonText: 'Escolher Plano',
                buttonLink: '#'
              },
              { 
                id: '3',
                name: 'Enterprise', 
                price: 'R$ 199', 
                period: '/mês',
                features: ['Usuários ilimitados', '1TB storage', 'Suporte 24/7', 'API access', 'Custom features'],
                buttonText: 'Contato',
                buttonLink: '#'
              }
            ],
            columns: 3,
            gap: '2rem'
          },
          styles: {
            padding: '3rem 2rem',
            marginBottom: '2rem'
          },
          allowChildren: false
        },
        {
          type: 'team',
          icon: Users,
          label: 'Equipe',
          category: 'LEAF',
          props: {
            title: 'Nossa Equipe',
            members: [
              { 
                id: '1',
                name: 'Ana Silva', 
                role: 'CEO', 
                image: 'https://i.pravatar.cc/300?img=1',
                bio: 'Fundadora e visionária'
              },
              { 
                id: '2',
                name: 'Carlos Santos', 
                role: 'CTO', 
                image: 'https://i.pravatar.cc/300?img=12',
                bio: 'Especialista em tecnologia'
              },
              { 
                id: '3',
                name: 'Maria Oliveira', 
                role: 'Designer', 
                image: 'https://i.pravatar.cc/300?img=5',
                bio: 'Design criativo'
              }
            ],
            columns: 3,
            gap: '2rem',
            imageShape: 'circle',
            showSocial: true
          },
          styles: {
            padding: '3rem 2rem',
            marginBottom: '2rem'
          },
          allowChildren: false
        }
      ]
    },
    {
      name: 'Formulários',
      icon: FormInput,
      color: 'pink',
      components: [
        {
          type: 'form',
          icon: FormInput,
          label: 'Formulário',
          category: 'CONTAINER',
          props: { 
            allowChildren: true,
            name: 'contact-form',
            method: 'POST',
            submitButtonText: 'Enviar',
            submitButtonVariant: 'primary',
            gap: '1.5rem'
          },
          styles: { 
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            padding: '2rem',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            marginBottom: '2rem',
            maxWidth: '600px'
          },
          allowChildren: true
        },
        {
          type: 'input',
          icon: FormInput,
          label: 'Campo de Texto',
          category: 'LEAF',
          props: { 
            type: 'text',
            name: 'name',
            placeholder: 'Digite seu nome...',
            label: 'Nome',
            required: true
          },
          styles: { 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '1rem'
          },
          allowChildren: false
        },
        {
          type: 'input',
          icon: Mail,
          label: 'Campo Email',
          category: 'LEAF',
          props: { 
            type: 'email',
            name: 'email',
            placeholder: 'seu@email.com',
            label: 'E-mail',
            required: true
          },
          styles: { 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          },
          allowChildren: false
        },
        {
          type: 'textarea',
          icon: AlignLeft,
          label: 'Área de Texto',
          category: 'LEAF',
          props: { 
            name: 'message',
            placeholder: 'Digite sua mensagem...',
            label: 'Mensagem',
            rows: 4,
            required: true
          },
          styles: { 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            minHeight: '120px',
            marginBottom: '1rem',
            resize: 'vertical',
            fontFamily: 'inherit'
          },
          allowChildren: false
        },
        {
          type: 'select',
          icon: List,
          label: 'Seleção',
          category: 'LEAF',
          props: { 
            name: 'option',
            label: 'Escolha uma opção',
            options: [
              { value: '1', label: 'Opção 1' },
              { value: '2', label: 'Opção 2' },
              { value: '3', label: 'Opção 3' }
            ],
            required: false
          },
          styles: { 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            backgroundColor: 'white'
          },
          allowChildren: false
        },
        {
          type: 'checkbox',
          icon: Square,
          label: 'Checkbox',
          category: 'LEAF',
          props: {
            name: 'agree',
            label: 'Concordo com os termos',
            checked: false,
            required: false
          },
          styles: {
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          },
          allowChildren: false
        },
        {
          type: 'button',
          icon: MousePointerClick,
          label: 'Botão Submit',
          category: 'LEAF',
          props: { 
            text: 'Enviar Formulário',
            type: 'submit',
            variant: 'primary',
            size: 'medium',
            fullWidth: false
          },
          styles: { 
            padding: '0.75rem 2rem', 
            background: '#3b82f6', 
            color: 'white', 
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          },
          allowChildren: false
        }
      ]
    },
    {
      name: 'Navegação',
      icon: Navigation,
      color: 'indigo',
      components: [
        {
          type: 'navbar',
          icon: Menu,
          label: 'Barra de Navegação',
          category: 'HYBRID',
          props: { 
            logoText: 'Logo',
            items: [
              { label: 'Início', link: '#' },
              { label: 'Sobre', link: '#' },
              { label: 'Serviços', link: '#' },
              { label: 'Contato', link: '#' }
            ],
            position: 'sticky',
            ctaText: 'Começar',
            ctaLink: '#',
            ctaVariant: 'primary'
          },
          styles: { 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
            position: 'sticky',
            top: 0,
            zIndex: 50
          },
          allowChildren: false
        },
        {
          type: 'breadcrumb',
          icon: ChevronRight,
          label: 'Breadcrumb',
          category: 'LEAF',
          props: { 
            items: [
              { label: 'Início', link: '/' },
              { label: 'Categoria', link: '/categoria' },
              { label: 'Página Atual' }
            ],
            separator: 'chevron',
            showHome: true
          },
          styles: { 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: '#6b7280'
          },
          allowChildren: false
        },
        {
          type: 'footer',
          icon: Layers,
          label: 'Rodapé Simples',
          category: 'HYBRID',
          props: { 
            variant: 'simple',
            copyrightText: '© 2024 Todos os direitos reservados',
            showSocial: false,
            allowChildren: true
          },
          styles: { 
            padding: '2rem',
            background: '#1f2937',
            color: 'white',
            textAlign: 'center',
            marginTop: '4rem'
          },
          allowChildren: true
        },
        {
          type: 'footer',
          icon: Layers,
          label: 'Rodapé Multi-Coluna',
          category: 'HYBRID',
          props: { 
            variant: 'multi-column',
            columns: [
              {
                title: 'Empresa',
                links: [
                  { label: 'Sobre', link: '#' },
                  { label: 'Equipe', link: '#' },
                  { label: 'Carreiras', link: '#' }
                ]
              },
              {
                title: 'Recursos',
                links: [
                  { label: 'Blog', link: '#' },
                  { label: 'Documentação', link: '#' },
                  { label: 'Suporte', link: '#' }
                ]
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Privacidade', link: '#' },
                  { label: 'Termos', link: '#' }
                ]
              }
            ],
            copyrightText: '© 2024 Todos os direitos reservados',
            showSocial: true,
            allowChildren: false
          },
          styles: { 
            padding: '3rem 2rem 2rem',
            background: '#111827',
            color: 'white',
            marginTop: '4rem'
          },
          allowChildren: true
        }
      ]
    },
    {
      name: 'Interativos',
      icon: MousePointerClick,
      color: 'red',
      components: [
        {
          type: 'button',
          icon: MousePointerClick,
          label: 'Botão Primário',
          category: 'LEAF',
          props: { 
            text: 'Botão Primário',
            variant: 'primary',
            size: 'medium',
            type: 'button'
          },
          styles: { 
            padding: '0.75rem 1.5rem', 
            background: '#3b82f6', 
            color: 'white', 
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.2s',
            display: 'inline-block'
          },
          allowChildren: false
        },
        {
          type: 'button',
          icon: MousePointerClick,
          label: 'Botão Outline',
          category: 'LEAF',
          props: { 
            text: 'Botão Outline',
            variant: 'outline',
            size: 'medium'
          },
          styles: { 
            padding: '0.75rem 1.5rem', 
            background: 'transparent', 
            color: '#3b82f6', 
            border: '2px solid #3b82f6',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          },
          allowChildren: false
        },
        {
          type: 'accordion',
          icon: List,
          label: 'Accordion',
          category: 'HYBRID',
          props: {
            items: [
              { id: '1', title: 'Pergunta 1', content: 'Resposta detalhada para a pergunta 1' },
              { id: '2', title: 'Pergunta 2', content: 'Resposta detalhada para a pergunta 2' },
              { id: '3', title: 'Pergunta 3', content: 'Resposta detalhada para a pergunta 3' }
            ],
            allowMultiple: false,
            variant: 'bordered'
          },
          styles: { 
            marginBottom: '2rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            overflow: 'hidden'
          },
          allowChildren: false
        },
        {
          type: 'tabs',
          icon: Layers,
          label: 'Abas',
          category: 'HYBRID',
          props: {
            tabs: [
              { id: '1', label: 'Aba 1', content: 'Conteúdo da aba 1' },
              { id: '2', label: 'Aba 2', content: 'Conteúdo da aba 2' },
              { id: '3', label: 'Aba 3', content: 'Conteúdo da aba 3' }
            ],
            orientation: 'horizontal',
            variant: 'underline'
          },
          styles: { 
            marginBottom: '2rem'
          },
          allowChildren: false
        },
        {
          type: 'modal',
          icon: Layout,
          label: 'Modal',
          category: 'HYBRID',
          props: {
            triggerText: 'Abrir Modal',
            triggerVariant: 'primary',
            title: 'Título do Modal',
            content: '<p>Conteúdo do modal aqui</p>',
            size: 'medium',
            closeOnOverlay: true,
            showCloseButton: true,
            allowChildren: true
          },
          styles: {
            marginBottom: '1rem'
          },
          allowChildren: true
        }
      ]
    },
    {
      name: 'Avançados',
      icon: Settings,
      color: 'gray',
      components: [
        {
          type: 'timeline',
          icon: Calendar,
          label: 'Timeline',
          category: 'LEAF',
          props: {
            orientation: 'vertical',
            events: [
              { id: '1', date: '2024', title: 'Fundação', description: 'Início da empresa' },
              { id: '2', date: '2023', title: 'Expansão', description: 'Abertura de filiais' },
              { id: '3', date: '2022', title: 'Primeiro Produto', description: 'Lançamento' }
            ],
            alternating: true
          },
          styles: {
            padding: '2rem 0',
            marginBottom: '2rem'
          },
          allowChildren: false
        },
        {
          type: 'table',
          icon: Table,
          label: 'Tabela',
          category: 'LEAF',
          props: {
            headers: ['Nome', 'Email', 'Cargo', 'Status'],
            rows: [
              ['João Silva', 'joao@email.com', 'Gerente', 'Ativo'],
              ['Maria Santos', 'maria@email.com', 'Designer', 'Ativo'],
              ['Pedro Costa', 'pedro@email.com', 'Desenvolvedor', 'Inativo']
            ],
            striped: true,
            bordered: true,
            hoverable: true,
            responsive: true
          },
          styles: { 
            marginBottom: '2rem', 
            width: '100%',
            borderCollapse: 'collapse'
          },
          allowChildren: false
        },
        {
          type: 'code',
          icon: Code,
          label: 'Bloco de Código',
          category: 'LEAF',
          props: { 
            code: 'function hello() {\n  console.log("Hello World!");\n}',
            language: 'javascript',
            showLineNumbers: true,
            theme: 'dark',
            copyButton: true
          },
          styles: { 
            background: '#1e293b',
            color: '#10b981',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            fontFamily: 'monospace',
            overflow: 'auto',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.7'
          },
          allowChildren: false
        },
        {
          type: 'map',
          icon: MapPin,
          label: 'Mapa',
          category: 'LEAF',
          props: { 
            location: 'Brasília, DF',
            latitude: -15.7939,
            longitude: -47.8828,
            zoom: 12,
            height: '400px',
            mapType: 'roadmap'
          },
          styles: { 
            width: '100%', 
            height: '400px', 
            background: '#e5e7eb', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
          },
          allowChildren: false
        },
        {
          type: 'contact-info',
          icon: Mail,
          label: 'Info de Contato',
          category: 'LEAF',
          props: { 
            email: 'contato@email.com',
            phone: '(11) 1234-5678',
            address: 'Rua Exemplo, 123 - São Paulo, SP',
            hours: 'Seg-Sex: 9h às 18h',
            showIcons: true,
            layout: 'vertical'
          },
          styles: { 
            padding: '2rem', 
            background: '#f9fafb', 
            borderRadius: '0.75rem', 
            marginBottom: '1rem',
            border: '1px solid #e5e7eb'
          },
          allowChildren: false
        },
        {
          type: 'social-links',
          icon: Users,
          label: 'Redes Sociais',
          category: 'LEAF',
          props: { 
            links: {
              facebook: '#',
              twitter: '#',
              instagram: '#',
              linkedin: '#'
            },
            size: 'medium',
            variant: 'icon',
            orientation: 'horizontal',
            gap: '1rem'
          },
          styles: { 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            marginBottom: '1rem'
          },
          allowChildren: false
        },
        {
          type: 'divider',
          icon: Minus,
          label: 'Divisor',
          category: 'LEAF',
          props: {
            variant: 'solid',
            orientation: 'horizontal',
            thickness: '1px',
            color: '#e5e7eb'
          },
          styles: { 
            border: 'none', 
            borderTop: '1px solid #e5e7eb', 
            margin: '2rem 0',
            width: '100%'
          },
          allowChildren: false
        },
        {
          type: 'spacer',
          icon: Minus,
          label: 'Espaçador',
          category: 'LEAF',
          props: {
            height: '2rem',
            width: '100%'
          },
          styles: {
            height: '2rem',
            width: '100%'
          },
          allowChildren: false
        }
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Boxes className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Componentes</h3>
        </div>
        <p className="text-sm text-gray-600">Arraste ou clique para adicionar</p>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Container className="w-3 h-3 mr-1" />
            Container
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Square className="w-3 h-3 mr-1" />
            Leaf
          </Badge>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {componentCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.name}>
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className={`w-4 h-4 text-${category.color}-600`} />
                  <h4 className="text-sm font-semibold text-gray-700">{category.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {category.components.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {category.components.map((comp) => {
                    const CompIcon = comp.icon;
                    return (
                      <Button
                        key={`${comp.type}-${comp.label}`}
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all group relative"
                        onClick={() => onAddComponent(comp.type, comp.props, comp.styles, { 
                          allowChildren: comp.allowChildren,
                          category: comp.category,
                          slots: comp.slots
                        })}
                      >
                        <CompIcon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                        <span className="text-xs text-center leading-tight">{comp.label}</span>
                        {comp.allowChildren && (
                          <div className="absolute top-1 right-1">
                            <Container className="w-3 h-3 text-green-600" />
                          </div>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Info Footer */}
      <div className="p-4 border-t bg-white">
        <div className="text-xs text-gray-600 space-y-1">
          <p className="flex items-center gap-1">
            <Container className="w-3 h-3 text-green-600" />
            = Aceita componentes filhos
          </p>
          <p className="text-gray-500">
            Total: {componentCategories.reduce((acc, cat) => acc + cat.components.length, 0)} componentes
          </p>
        </div>
      </div>
    </div>
  );
}
