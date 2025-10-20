/**
 * 50 Templates Padrão do Sistema
 * Templates pré-configurados com diferentes componentes e layouts
 */

import { v4 as uuidv4 } from 'uuid';
import { HierarchicalNode } from '../components/editor/HierarchicalRenderNode';
import { HierarchicalTemplate, TemplateType } from '../services/HierarchicalTemplateService';

const currentUser = 'Sistema';

/**
 * Helper para criar template
 */
function createTemplate(
  name: string,
  description: string,
  type: TemplateType,
  category: string,
  tags: string[],
  nodes: HierarchicalNode[]
): HierarchicalTemplate {
  return {
    id: uuidv4(),
    name,
    description,
    type,
    category,
    tags,
    nodes,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser,
      version: 1,
      usageCount: 0
    },
    settings: {
      isPublic: true,
      isFavorite: false,
      allowEdit: true
    }
  };
}

/**
 * Helper para criar nó
 */
function createNode(
  type: string,
  props: any = {},
  children: HierarchicalNode[] = []
): HierarchicalNode {
  // Separar className de props se estiver misturado
  const { className, ...restProps } = props;
  
  return {
    id: uuidv4(),
    type,
    props: restProps,
    children: children.length > 0 ? children : undefined,
    className: className || '',
    styles: {}
  };
}

/**
 * 50 TEMPLATES PADRÃO
 */
export const defaultTemplates: HierarchicalTemplate[] = [
  
  // ============================================================================
  // LANDING PAGES (10 templates)
  // ============================================================================
  
  createTemplate(
    'Hero com CTA Centralizado',
    'Landing page moderna com hero section e call-to-action destacado',
    'page',
    'landing',
    ['hero', 'cta', 'moderno'],
    [
      createNode('section', { className: 'min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center px-4' }, [
        createNode('container', { className: 'max-w-4xl mx-auto text-center' }, [
          createNode('heading', {
            content: 'Transforme Seu Negócio Hoje',
            level: 'h1',
            fontSize: 64,
            fontWeight: '900',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 24
          }),
          createNode('text', {
            content: 'A solução completa que você precisa para crescer e escalar sua empresa de forma inteligente e eficiente',
            fontSize: 24,
            color: '#e0e7ff',
            textAlign: 'center',
            marginBottom: 48
          }),
          createNode('container', { className: 'flex gap-4 justify-center flex-wrap' }, [
            createNode('button', {
              text: 'Começar Agora',
              variant: 'primary',
              size: 'large',
              backgroundColor: '#ffffff',
              textColor: '#1e40af',
              borderRadius: 50
            }),
            createNode('button', {
              text: 'Ver Demonstração',
              variant: 'outline',
              size: 'large',
              backgroundColor: 'transparent',
              textColor: '#ffffff',
              borderColor: '#ffffff',
              borderRadius: 50
            })
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Hero com Imagem Lateral',
    'Layout split com texto e imagem lado a lado',
    'page',
    'landing',
    ['hero', 'split', 'imagem'],
    [
      createNode('section', { className: 'min-h-screen flex items-center px-4 bg-white' }, [
        createNode('container', { className: 'max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center' }, [
          createNode('container', { className: 'space-y-6' }, [
            createNode('heading', {
              content: 'Inovação que Impulsiona Resultados',
              level: 'h1',
              fontSize: 56,
              fontWeight: '800',
              color: '#111827'
            }),
            createNode('text', {
              content: 'Nossa plataforma oferece ferramentas poderosas para automatizar processos, aumentar produtividade e alcançar seus objetivos mais rapidamente.',
              fontSize: 18,
              color: '#6b7280',
              lineHeight: 1.8
            }),
            createNode('container', { className: 'flex gap-4 pt-4' }, [
              createNode('button', {
                text: 'Teste Grátis por 14 Dias',
                variant: 'primary',
                size: 'large',
                backgroundColor: '#3b82f6'
              }),
              createNode('button', {
                text: 'Falar com Vendas',
                variant: 'outline',
                size: 'large'
              })
            ])
          ]),
          createNode('image', {
            src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            alt: 'Dashboard Analytics',
            width: '100%',
            borderRadius: 12,
            className: 'shadow-2xl'
          })
        ])
      ])
    ]
  ),

  createTemplate(
    'Hero Fullscreen com Vídeo',
    'Hero com vídeo de fundo e overlay gradiente',
    'page',
    'landing',
    ['hero', 'video', 'fullscreen'],
    [
      createNode('section', { className: 'relative h-screen flex items-center justify-center overflow-hidden' }, [
        createNode('container', { className: 'absolute inset-0 bg-gradient-to-br from-black/70 to-blue-900/70 z-10' }),
        createNode('container', { className: 'relative z-20 max-w-5xl mx-auto text-center px-4' }, [
          createNode('badge', {
            text: '✨ Novidade 2025',
            variant: 'secondary',
            className: 'mb-6 text-white/90 bg-white/10 border-white/20'
          }),
          createNode('heading', {
            content: 'O Futuro dos Negócios Digitais',
            level: 'h1',
            fontSize: 72,
            fontWeight: '900',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 24
          }),
          createNode('text', {
            content: 'Tecnologia de ponta, design intuitivo e resultados comprovados',
            fontSize: 28,
            color: '#e0e7ff',
            textAlign: 'center',
            marginBottom: 48
          }),
          createNode('button', {
            text: 'Descubra Mais ↓',
            variant: 'primary',
            size: 'large',
            backgroundColor: '#ffffff',
            textColor: '#1e40af'
          })
        ])
      ])
    ]
  ),

  createTemplate(
    'Landing com Formulário',
    'Landing page focada em geração de leads com formulário',
    'page',
    'landing',
    ['formulario', 'leads', 'conversao'],
    [
      createNode('section', { className: 'min-h-screen bg-gray-50 py-20 px-4' }, [
        createNode('container', { className: 'max-w-6xl mx-auto grid md:grid-cols-2 gap-12' }, [
          createNode('container', { className: 'space-y-6' }, [
            createNode('heading', {
              content: 'Baixe Nosso E-book Gratuito',
              level: 'h1',
              fontSize: 48,
              fontWeight: '800',
              color: '#111827'
            }),
            createNode('text', {
              content: 'Aprenda as 10 estratégias comprovadas para aumentar suas vendas em até 300%',
              fontSize: 20,
              color: '#4b5563'
            }),
            createNode('container', { className: 'space-y-4 pt-4' }, [
              createNode('text', { content: '✅ 120 páginas de conteúdo prático', fontSize: 16, color: '#374151' }),
              createNode('text', { content: '✅ Casos reais de sucesso', fontSize: 16, color: '#374151' }),
              createNode('text', { content: '✅ Templates prontos para usar', fontSize: 16, color: '#374151' }),
              createNode('text', { content: '✅ Acesso imediato após cadastro', fontSize: 16, color: '#374151' })
            ])
          ]),
          createNode('container', { className: 'bg-white p-8 rounded-xl shadow-xl' }, [
            createNode('heading', {
              content: 'Preencha seus dados',
              level: 'h3',
              fontSize: 24,
              fontWeight: '700',
              marginBottom: 24
            }),
            createNode('form', { className: 'space-y-4' }, [
              createNode('input', { placeholder: 'Seu nome completo', type: 'text', required: true }),
              createNode('input', { placeholder: 'Seu melhor e-mail', type: 'email', required: true }),
              createNode('input', { placeholder: 'Seu telefone', type: 'tel', required: true }),
              createNode('button', {
                text: 'Baixar E-book Grátis',
                variant: 'primary',
                size: 'large',
                backgroundColor: '#10b981',
                fullWidth: true
              }),
              createNode('text', {
                content: '🔒 Seus dados estão seguros conosco',
                fontSize: 12,
                color: '#9ca3af',
                textAlign: 'center'
              })
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Features em Destaque',
    'Seção mostrando 3 principais recursos com ícones',
    'section',
    'landing',
    ['features', 'recursos', 'icones'],
    [
      createNode('section', { className: 'py-20 px-4 bg-white' }, [
        createNode('container', { className: 'max-w-7xl mx-auto' }, [
          createNode('heading', {
            content: 'Por Que Nos Escolher?',
            level: 'h2',
            fontSize: 48,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'Recursos poderosos para impulsionar seu negócio',
            fontSize: 20,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 64
          }),
          createNode('container', { className: 'grid md:grid-cols-3 gap-12' }, [
            createNode('container', { className: 'text-center space-y-4' }, [
              createNode('container', { className: 'w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl' }, [
                createNode('text', { content: '⚡', fontSize: 32 })
              ]),
              createNode('heading', {
                content: 'Ultra Rápido',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700'
              }),
              createNode('text', {
                content: 'Performance otimizada para entregar resultados em milissegundos',
                fontSize: 16,
                color: '#6b7280',
                lineHeight: 1.6
              })
            ]),
            createNode('container', { className: 'text-center space-y-4' }, [
              createNode('container', { className: 'w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl' }, [
                createNode('text', { content: '🔒', fontSize: 32 })
              ]),
              createNode('heading', {
                content: 'Seguro',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700'
              }),
              createNode('text', {
                content: 'Criptografia de ponta a ponta e conformidade com LGPD e GDPR',
                fontSize: 16,
                color: '#6b7280',
                lineHeight: 1.6
              })
            ]),
            createNode('container', { className: 'text-center space-y-4' }, [
              createNode('container', { className: 'w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl' }, [
                createNode('text', { content: '📊', fontSize: 32 })
              ]),
              createNode('heading', {
                content: 'Analytics',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700'
              }),
              createNode('text', {
                content: 'Dashboards inteligentes com insights em tempo real',
                fontSize: 16,
                color: '#6b7280',
                lineHeight: 1.6
              })
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Pricing Table',
    'Tabela de preços com 3 planos',
    'section',
    'landing',
    ['pricing', 'planos', 'precos'],
    [
      createNode('section', { className: 'py-20 px-4 bg-gray-50' }, [
        createNode('container', { className: 'max-w-7xl mx-auto' }, [
          createNode('heading', {
            content: 'Escolha Seu Plano',
            level: 'h2',
            fontSize: 48,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'Cancele quando quiser. Sem taxas ocultas.',
            fontSize: 20,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 64
          }),
          createNode('container', { className: 'grid md:grid-cols-3 gap-8' }, [
            // Plano Básico
            createNode('container', { className: 'bg-white p-8 rounded-xl border-2 border-gray-200' }, [
              createNode('heading', {
                content: 'Básico',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700',
                marginBottom: 8
              }),
              createNode('container', { className: 'mb-6' }, [
                createNode('text', {
                  content: 'R$ 29',
                  fontSize: 48,
                  fontWeight: '800',
                  color: '#111827'
                }),
                createNode('text', {
                  content: '/mês',
                  fontSize: 16,
                  color: '#6b7280'
                })
              ]),
              createNode('container', { className: 'space-y-3 mb-8' }, [
                createNode('text', { content: '✓ 10 projetos', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ 5 GB armazenamento', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ Suporte por email', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ Atualizações básicas', fontSize: 14, color: '#374151' })
              ]),
              createNode('button', {
                text: 'Começar',
                variant: 'outline',
                fullWidth: true
              })
            ]),
            // Plano Pro (Destaque)
            createNode('container', { className: 'bg-blue-600 p-8 rounded-xl border-4 border-blue-700 relative transform scale-105 shadow-2xl' }, [
              createNode('badge', {
                text: 'POPULAR',
                className: 'absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900'
              }),
              createNode('heading', {
                content: 'Pro',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: 8
              }),
              createNode('container', { className: 'mb-6' }, [
                createNode('text', {
                  content: 'R$ 79',
                  fontSize: 48,
                  fontWeight: '800',
                  color: '#ffffff'
                }),
                createNode('text', {
                  content: '/mês',
                  fontSize: 16,
                  color: '#dbeafe'
                })
              ]),
              createNode('container', { className: 'space-y-3 mb-8' }, [
                createNode('text', { content: '✓ Projetos ilimitados', fontSize: 14, color: '#e0e7ff' }),
                createNode('text', { content: '✓ 50 GB armazenamento', fontSize: 14, color: '#e0e7ff' }),
                createNode('text', { content: '✓ Suporte prioritário', fontSize: 14, color: '#e0e7ff' }),
                createNode('text', { content: '✓ Todas as funcionalidades', fontSize: 14, color: '#e0e7ff' }),
                createNode('text', { content: '✓ Analytics avançado', fontSize: 14, color: '#e0e7ff' })
              ]),
              createNode('button', {
                text: 'Começar Agora',
                variant: 'primary',
                backgroundColor: '#ffffff',
                textColor: '#1e40af',
                fullWidth: true
              })
            ]),
            // Plano Enterprise
            createNode('container', { className: 'bg-white p-8 rounded-xl border-2 border-gray-200' }, [
              createNode('heading', {
                content: 'Enterprise',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700',
                marginBottom: 8
              }),
              createNode('container', { className: 'mb-6' }, [
                createNode('text', {
                  content: 'R$ 199',
                  fontSize: 48,
                  fontWeight: '800',
                  color: '#111827'
                }),
                createNode('text', {
                  content: '/mês',
                  fontSize: 16,
                  color: '#6b7280'
                })
              ]),
              createNode('container', { className: 'space-y-3 mb-8' }, [
                createNode('text', { content: '✓ Tudo do Pro', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ 500 GB armazenamento', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ Suporte 24/7', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ SLA garantido', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ Customização dedicada', fontSize: 14, color: '#374151' })
              ]),
              createNode('button', {
                text: 'Falar com Vendas',
                variant: 'outline',
                fullWidth: true
              })
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Testimonials Carousel',
    'Carrossel de depoimentos de clientes',
    'section',
    'landing',
    ['depoimentos', 'carousel', 'social-proof'],
    [
      createNode('section', { className: 'py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50' }, [
        createNode('container', { className: 'max-w-6xl mx-auto' }, [
          createNode('heading', {
            content: 'O Que Nossos Clientes Dizem',
            level: 'h2',
            fontSize: 48,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 64
          }),
          createNode('container', { className: 'grid md:grid-cols-3 gap-8' }, [
            createNode('container', { className: 'bg-white p-8 rounded-xl shadow-lg' }, [
              createNode('container', { className: 'flex gap-1 mb-4 text-yellow-400 text-xl' }, [
                createNode('text', { content: '⭐⭐⭐⭐⭐', fontSize: 20 })
              ]),
              createNode('text', {
                content: '"A plataforma revolucionou completamente nossa forma de trabalhar. Aumento de 250% em produtividade!"',
                fontSize: 16,
                color: '#374151',
                lineHeight: 1.6,
                marginBottom: 16
              }),
              createNode('container', { className: 'flex items-center gap-3' }, [
                createNode('container', { className: 'w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full' }),
                createNode('container', {}, [
                  createNode('text', { content: 'Maria Silva', fontSize: 14, fontWeight: '700' }),
                  createNode('text', { content: 'CEO, TechCorp', fontSize: 12, color: '#6b7280' })
                ])
              ])
            ]),
            createNode('container', { className: 'bg-white p-8 rounded-xl shadow-lg' }, [
              createNode('container', { className: 'flex gap-1 mb-4 text-yellow-400 text-xl' }, [
                createNode('text', { content: '⭐⭐⭐⭐⭐', fontSize: 20 })
              ]),
              createNode('text', {
                content: '"Suporte excepcional e funcionalidades incríveis. Recomendo para qualquer empresa que queira crescer."',
                fontSize: 16,
                color: '#374151',
                lineHeight: 1.6,
                marginBottom: 16
              }),
              createNode('container', { className: 'flex items-center gap-3' }, [
                createNode('container', { className: 'w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full' }),
                createNode('container', {}, [
                  createNode('text', { content: 'João Santos', fontSize: 14, fontWeight: '700' }),
                  createNode('text', { content: 'Diretor, Inovax', fontSize: 12, color: '#6b7280' })
                ])
              ])
            ]),
            createNode('container', { className: 'bg-white p-8 rounded-xl shadow-lg' }, [
              createNode('container', { className: 'flex gap-1 mb-4 text-yellow-400 text-xl' }, [
                createNode('text', { content: '⭐⭐⭐⭐⭐', fontSize: 20 })
              ]),
              createNode('text', {
                content: '"ROI positivo já no primeiro mês. A melhor decisão que tomamos este ano!"',
                fontSize: 16,
                color: '#374151',
                lineHeight: 1.6,
                marginBottom: 16
              }),
              createNode('container', { className: 'flex items-center gap-3' }, [
                createNode('container', { className: 'w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full' }),
                createNode('container', {}, [
                  createNode('text', { content: 'Ana Costa', fontSize: 14, fontWeight: '700' }),
                  createNode('text', { content: 'CMO, Digital Plus', fontSize: 12, color: '#6b7280' })
                ])
              ])
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'FAQ Accordion',
    'Seção de perguntas frequentes com accordion',
    'section',
    'landing',
    ['faq', 'perguntas', 'accordion'],
    [
      createNode('section', { className: 'py-20 px-4 bg-white' }, [
        createNode('container', { className: 'max-w-3xl mx-auto' }, [
          createNode('heading', {
            content: 'Perguntas Frequentes',
            level: 'h2',
            fontSize: 48,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'Tire suas dúvidas sobre nosso produto',
            fontSize: 20,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 64
          }),
          createNode('container', { className: 'space-y-4' }, [
            createNode('container', { className: 'bg-gray-50 p-6 rounded-lg border border-gray-200' }, [
              createNode('heading', {
                content: 'Como funciona o período de teste?',
                level: 'h3',
                fontSize: 18,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Você tem 14 dias para testar todas as funcionalidades sem compromisso. Não é necessário cartão de crédito.',
                fontSize: 16,
                color: '#4b5563',
                lineHeight: 1.6
              })
            ]),
            createNode('container', { className: 'bg-gray-50 p-6 rounded-lg border border-gray-200' }, [
              createNode('heading', {
                content: 'Posso cancelar a qualquer momento?',
                level: 'h3',
                fontSize: 18,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais.',
                fontSize: 16,
                color: '#4b5563',
                lineHeight: 1.6
              })
            ]),
            createNode('container', { className: 'bg-gray-50 p-6 rounded-lg border border-gray-200' }, [
              createNode('heading', {
                content: 'Qual o método de pagamento aceito?',
                level: 'h3',
                fontSize: 18,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Aceitamos cartões de crédito (Visa, Mastercard, Amex), débito e PIX. Pagamento 100% seguro.',
                fontSize: 16,
                color: '#4b5563',
                lineHeight: 1.6
              })
            ]),
            createNode('container', { className: 'bg-gray-50 p-6 rounded-lg border border-gray-200' }, [
              createNode('heading', {
                content: 'Existe suporte técnico?',
                level: 'h3',
                fontSize: 18,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Sim! Oferecemos suporte por email, chat e telefone. Planos Pro e Enterprise têm suporte prioritário.',
                fontSize: 16,
                color: '#4b5563',
                lineHeight: 1.6
              })
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'CTA Final Section',
    'Call-to-action final para conversão',
    'section',
    'landing',
    ['cta', 'conversao', 'final'],
    [
      createNode('section', { className: 'py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600' }, [
        createNode('container', { className: 'max-w-4xl mx-auto text-center' }, [
          createNode('heading', {
            content: 'Pronto Para Começar?',
            level: 'h2',
            fontSize: 56,
            fontWeight: '900',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 24
          }),
          createNode('text', {
            content: 'Junte-se a mais de 10.000 empresas que já transformaram seus resultados',
            fontSize: 24,
            color: '#e0e7ff',
            textAlign: 'center',
            marginBottom: 48
          }),
          createNode('container', { className: 'flex gap-4 justify-center flex-wrap' }, [
            createNode('button', {
              text: 'Começar Teste Grátis',
              variant: 'primary',
              size: 'large',
              backgroundColor: '#ffffff',
              textColor: '#1e40af'
            }),
            createNode('button', {
              text: 'Agendar Demo',
              variant: 'outline',
              size: 'large',
              textColor: '#ffffff',
              borderColor: '#ffffff'
            })
          ]),
          createNode('text', {
            content: '✓ Sem cartão de crédito  •  ✓ Cancele quando quiser  •  ✓ Suporte em português',
            fontSize: 14,
            color: '#dbeafe',
            textAlign: 'center',
            marginTop: 32
          })
        ])
      ])
    ]
  ),

  createTemplate(
    'Stats Counter',
    'Seção com estatísticas e números impressionantes',
    'section',
    'landing',
    ['stats', 'numeros', 'metricas'],
    [
      createNode('section', { className: 'py-20 px-4 bg-gray-900' }, [
        createNode('container', { className: 'max-w-6xl mx-auto' }, [
          createNode('heading', {
            content: 'Números Que Falam Por Si',
            level: 'h2',
            fontSize: 48,
            fontWeight: '800',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 64
          }),
          createNode('container', { className: 'grid md:grid-cols-4 gap-12' }, [
            createNode('container', { className: 'text-center' }, [
              createNode('text', {
                content: '10K+',
                fontSize: 56,
                fontWeight: '900',
                color: '#3b82f6',
                textAlign: 'center',
                marginBottom: 8
              }),
              createNode('text', {
                content: 'Clientes Ativos',
                fontSize: 16,
                color: '#9ca3af',
                textAlign: 'center'
              })
            ]),
            createNode('container', { className: 'text-center' }, [
              createNode('text', {
                content: '250%',
                fontSize: 56,
                fontWeight: '900',
                color: '#10b981',
                textAlign: 'center',
                marginBottom: 8
              }),
              createNode('text', {
                content: 'Aumento Médio ROI',
                fontSize: 16,
                color: '#9ca3af',
                textAlign: 'center'
              })
            ]),
            createNode('container', { className: 'text-center' }, [
              createNode('text', {
                content: '99.9%',
                fontSize: 56,
                fontWeight: '900',
                color: '#f59e0b',
                textAlign: 'center',
                marginBottom: 8
              }),
              createNode('text', {
                content: 'Uptime Garantido',
                fontSize: 16,
                color: '#9ca3af',
                textAlign: 'center'
              })
            ]),
            createNode('container', { className: 'text-center' }, [
              createNode('text', {
                content: '24/7',
                fontSize: 56,
                fontWeight: '900',
                color: '#8b5cf6',
                textAlign: 'center',
                marginBottom: 8
              }),
              createNode('text', {
                content: 'Suporte Disponível',
                fontSize: 16,
                color: '#9ca3af',
                textAlign: 'center'
              })
            ])
          ])
        ])
      ])
    ]
  ),

  // ============================================================================
  // BLOG / ARTIGOS (8 templates)
  // ============================================================================

  createTemplate(
    'Post de Blog Padrão',
    'Layout clássico para artigos de blog',
    'article',
    'blog',
    ['blog', 'post', 'artigo'],
    [
      createNode('article', { className: 'max-w-4xl mx-auto py-12 px-4' }, [
        createNode('heading', {
          content: 'Título do Artigo Vai Aqui',
          level: 'h1',
          fontSize: 48,
          fontWeight: '800',
          marginBottom: 16
        }),
        createNode('container', { className: 'flex items-center gap-4 mb-8 text-gray-600' }, [
          createNode('text', { content: 'Por Autor Nome', fontSize: 14 }),
          createNode('text', { content: '•', fontSize: 14 }),
          createNode('text', { content: '20 de Out, 2025', fontSize: 14 }),
          createNode('text', { content: '•', fontSize: 14 }),
          createNode('text', { content: '5 min de leitura', fontSize: 14 })
        ]),
        createNode('image', {
          src: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200',
          alt: 'Imagem destacada',
          width: '100%',
          borderRadius: 12,
          className: 'mb-12'
        }),
        createNode('richtext', {
          content: `
            <p class="text-xl text-gray-700 mb-6 leading-relaxed">
              Introdução do artigo com um parágrafo chamativo que prende a atenção do leitor e estabelece o contexto do que será discutido.
            </p>
            
            <h2>Primeiro Subtítulo</h2>
            <p>
              Desenvolva suas ideias aqui. Use parágrafos bem estruturados para tornar o conteúdo fácil de ler e digerir.
            </p>
            
            <h3>Sub-seção Importante</h3>
            <p>
              Continue desenvolvendo o conteúdo com informações relevantes e bem organizadas.
            </p>
            
            <ul>
              <li>Ponto importante número 1 com detalhes relevantes</li>
              <li>Ponto importante número 2 explicado claramente</li>
              <li>Ponto importante número 3 com exemplos práticos</li>
            </ul>
            
            <blockquote class="border-l-4 border-blue-500 pl-4 italic my-6 text-gray-600">
              "Uma citação impactante ou estatística relevante que reforça seu argumento."
            </blockquote>
            
            <h2>Segundo Tópico Principal</h2>
            <p>
              Mais conteúdo valioso aqui. Lembre-se de usar subtítulos para organizar o texto e facilitar a leitura.
            </p>
            
            <h2>Conclusão</h2>
            <p>
              Finalize com um resumo dos pontos principais e uma chamada para ação clara.
            </p>
          `,
          padding: 0
        })
      ])
    ]
  ),

  createTemplate(
    'Artigo com Sidebar',
    'Post de blog com barra lateral para widgets',
    'article',
    'blog',
    ['blog', 'sidebar', 'widgets'],
    [
      createNode('container', { className: 'max-w-7xl mx-auto py-12 px-4' }, [
        createNode('container', { className: 'grid md:grid-cols-3 gap-12' }, [
          // Conteúdo Principal
          createNode('article', { className: 'md:col-span-2' }, [
            createNode('heading', {
              content: 'Guia Completo: Título do Artigo',
              level: 'h1',
              fontSize: 42,
              fontWeight: '800',
              marginBottom: 24
            }),
            createNode('image', {
              src: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1000',
              alt: 'Post image',
              width: '100%',
              borderRadius: 8,
              className: 'mb-8'
            }),
            createNode('richtext', {
              content: `
                <p class="text-lg mb-4">Conteúdo do artigo aqui...</p>
                <h2>Seção 1</h2>
                <p>Texto explicativo...</p>
              `,
              padding: 0
            })
          ]),
          // Sidebar
          createNode('aside', { className: 'space-y-8' }, [
            createNode('container', { className: 'bg-gray-50 p-6 rounded-lg' }, [
              createNode('heading', {
                content: 'Sobre o Autor',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 16
              }),
              createNode('container', { className: 'w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4' }),
              createNode('text', {
                content: 'Especialista em tecnologia com 10+ anos de experiência',
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 1.6
              })
            ]),
            createNode('container', { className: 'bg-blue-50 p-6 rounded-lg border-2 border-blue-200' }, [
              createNode('heading', {
                content: '📬 Newsletter',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Receba conteúdos exclusivos',
                fontSize: 14,
                color: '#4b5563',
                marginBottom: 16
              }),
              createNode('input', {
                placeholder: 'Seu e-mail',
                type: 'email',
                className: 'mb-3'
              }),
              createNode('button', {
                text: 'Inscrever',
                variant: 'primary',
                fullWidth: true,
                backgroundColor: '#3b82f6'
              })
            ]),
            createNode('container', { className: 'bg-gray-50 p-6 rounded-lg' }, [
              createNode('heading', {
                content: 'Posts Relacionados',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 16
              }),
              createNode('container', { className: 'space-y-4' }, [
                createNode('text', {
                  content: '→ Como aumentar produtividade',
                  fontSize: 14,
                  color: '#3b82f6',
                  className: 'hover:underline cursor-pointer'
                }),
                createNode('text', {
                  content: '→ Ferramentas essenciais 2025',
                  fontSize: 14,
                  color: '#3b82f6',
                  className: 'hover:underline cursor-pointer'
                }),
                createNode('text', {
                  content: '→ Tendências do mercado',
                  fontSize: 14,
                  color: '#3b82f6',
                  className: 'hover:underline cursor-pointer'
                })
              ])
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Lista de Posts',
    'Grid com lista de artigos do blog',
    'page',
    'blog',
    ['blog', 'lista', 'grid'],
    [
      createNode('container', { className: 'max-w-7xl mx-auto py-12 px-4' }, [
        createNode('heading', {
          content: 'Blog & Novidades',
          level: 'h1',
          fontSize: 48,
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: 16
        }),
        createNode('text', {
          content: 'Insights, tutoriais e tendências do mercado',
          fontSize: 20,
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: 64
        }),
        createNode('container', { className: 'grid md:grid-cols-3 gap-8' }, [
          // Post 1
          createNode('container', { className: 'bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer' }, [
            createNode('image', {
              src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
              alt: 'Post thumbnail',
              width: '100%',
              className: 'aspect-video object-cover'
            }),
            createNode('container', { className: 'p-6' }, [
              createNode('badge', {
                text: 'TECNOLOGIA',
                variant: 'secondary',
                className: 'mb-3'
              }),
              createNode('heading', {
                content: '10 Tendências de Tech para 2025',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Descubra as principais tecnologias que vão dominar o mercado no próximo ano...',
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 1.6,
                marginBottom: 16
              }),
              createNode('container', { className: 'flex items-center justify-between text-sm text-gray-500' }, [
                createNode('text', { content: '5 min de leitura', fontSize: 12 }),
                createNode('text', { content: '15 Out', fontSize: 12 })
              ])
            ])
          ]),
          // Post 2
          createNode('container', { className: 'bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer' }, [
            createNode('image', {
              src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600',
              alt: 'Post thumbnail',
              width: '100%',
              className: 'aspect-video object-cover'
            }),
            createNode('container', { className: 'p-6' }, [
              createNode('badge', {
                text: 'PRODUTIVIDADE',
                variant: 'secondary',
                className: 'mb-3'
              }),
              createNode('heading', {
                content: 'Como Triplicar sua Produtividade',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Técnicas comprovadas e ferramentas essenciais para fazer mais em menos tempo...',
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 1.6,
                marginBottom: 16
              }),
              createNode('container', { className: 'flex items-center justify-between text-sm text-gray-500' }, [
                createNode('text', { content: '8 min de leitura', fontSize: 12 }),
                createNode('text', { content: '12 Out', fontSize: 12 })
              ])
            ])
          ]),
          // Post 3
          createNode('container', { className: 'bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer' }, [
            createNode('image', {
              src: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600',
              alt: 'Post thumbnail',
              width: '100%',
              className: 'aspect-video object-cover'
            }),
            createNode('container', { className: 'p-6' }, [
              createNode('badge', {
                text: 'MARKETING',
                variant: 'secondary',
                className: 'mb-3'
              }),
              createNode('heading', {
                content: 'Estratégias de Marketing Digital',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'As melhores práticas para crescer sua presença online e gerar mais leads...',
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 1.6,
                marginBottom: 16
              }),
              createNode('container', { className: 'flex items-center justify-between text-sm text-gray-500' }, [
                createNode('text', { content: '6 min de leitura', fontSize: 12 }),
                createNode('text', { content: '10 Out', fontSize: 12 })
              ])
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Tutorial Passo a Passo',
    'Template para guias e tutoriais',
    'article',
    'blog',
    ['tutorial', 'guia', 'passo-a-passo'],
    [
      createNode('article', { className: 'max-w-4xl mx-auto py-12 px-4' }, [
        createNode('badge', {
          text: '📚 TUTORIAL',
          variant: 'secondary',
          className: 'mb-6'
        }),
        createNode('heading', {
          content: 'Como Fazer: Guia Completo Passo a Passo',
          level: 'h1',
          fontSize: 48,
          fontWeight: '800',
          marginBottom: 24
        }),
        createNode('container', { className: 'bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-12' }, [
          createNode('heading', {
            content: '⏱️ Tempo Estimado: 30 minutos',
            level: 'h3',
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 8
          }),
          createNode('text', {
            content: 'Nível: Intermediário • Pré-requisitos: Conhecimento básico',
            fontSize: 14,
            color: '#4b5563'
          })
        ]),
        // Passo 1
        createNode('container', { className: 'mb-12' }, [
          createNode('container', { className: 'flex items-center gap-3 mb-4' }, [
            createNode('container', { className: 'w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center' }, [
              createNode('text', { content: '1', fontSize: 20, fontWeight: '700', color: '#ffffff' })
            ]),
            createNode('heading', {
              content: 'Primeiro Passo',
              level: 'h2',
              fontSize: 28,
              fontWeight: '700'
            })
          ]),
          createNode('text', {
            content: 'Descrição detalhada do primeiro passo com todas as informações necessárias.',
            fontSize: 16,
            color: '#374151',
            lineHeight: 1.8,
            marginBottom: 16
          }),
          createNode('image', {
            src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
            alt: 'Passo 1',
            width: '100%',
            borderRadius: 8
          })
        ]),
        // Passo 2
        createNode('container', { className: 'mb-12' }, [
          createNode('container', { className: 'flex items-center gap-3 mb-4' }, [
            createNode('container', { className: 'w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center' }, [
              createNode('text', { content: '2', fontSize: 20, fontWeight: '700', color: '#ffffff' })
            ]),
            createNode('heading', {
              content: 'Segundo Passo',
              level: 'h2',
              fontSize: 28,
              fontWeight: '700'
            })
          ]),
          createNode('text', {
            content: 'Continue com instruções claras e específicas.',
            fontSize: 16,
            color: '#374151',
            lineHeight: 1.8
          })
        ]),
        // Passo 3
        createNode('container', { className: 'mb-12' }, [
          createNode('container', { className: 'flex items-center gap-3 mb-4' }, [
            createNode('container', { className: 'w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center' }, [
              createNode('text', { content: '3', fontSize: 20, fontWeight: '700', color: '#ffffff' })
            ]),
            createNode('heading', {
              content: 'Terceiro Passo',
              level: 'h2',
              fontSize: 28,
              fontWeight: '700'
            })
          ]),
          createNode('text', {
            content: 'Finalize com os últimos detalhes importantes.',
            fontSize: 16,
            color: '#374151',
            lineHeight: 1.8
          })
        ]),
        createNode('container', { className: 'bg-green-50 border-l-4 border-green-500 p-6 rounded' }, [
          createNode('heading', {
            content: '✅ Parabéns!',
            level: 'h3',
            fontSize: 20,
            fontWeight: '700',
            marginBottom: 8
          }),
          createNode('text', {
            content: 'Você completou o tutorial com sucesso. Agora você sabe como...',
            fontSize: 16,
            color: '#065f46'
          })
        ])
      ])
    ]
  ),

  createTemplate(
    'Review / Análise',
    'Template para reviews e análises de produtos',
    'article',
    'blog',
    ['review', 'analise', 'produto'],
    [
      createNode('article', { className: 'max-w-4xl mx-auto py-12 px-4' }, [
        createNode('badge', {
          text: '⭐ REVIEW',
          variant: 'secondary',
          className: 'mb-6'
        }),
        createNode('heading', {
          content: 'Review Completo: Nome do Produto',
          level: 'h1',
          fontSize: 48,
          fontWeight: '800',
          marginBottom: 24
        }),
        // Rating
        createNode('container', { className: 'flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-lg' }, [
          createNode('container', { className: 'text-center' }, [
            createNode('text', {
              content: '4.5',
              fontSize: 48,
              fontWeight: '900',
              color: '#3b82f6'
            }),
            createNode('text', {
              content: '⭐⭐⭐⭐⭐',
              fontSize: 24
            })
          ]),
          createNode('container', { className: 'flex-1' }, [
            createNode('heading', {
              content: 'Avaliação Geral',
              level: 'h3',
              fontSize: 20,
              fontWeight: '700',
              marginBottom: 8
            }),
            createNode('text', {
              content: 'Excelente produto com alguns pontos de melhoria',
              fontSize: 14,
              color: '#6b7280'
            })
          ])
        ]),
        // Prós e Contras
        createNode('container', { className: 'grid md:grid-cols-2 gap-6 mb-12' }, [
          createNode('container', { className: 'bg-green-50 p-6 rounded-lg' }, [
            createNode('heading', {
              content: '✅ Pontos Positivos',
              level: 'h3',
              fontSize: 20,
              fontWeight: '700',
              marginBottom: 16
            }),
            createNode('container', { className: 'space-y-2' }, [
              createNode('text', { content: '• Design moderno e intuitivo', fontSize: 14, color: '#065f46' }),
              createNode('text', { content: '• Performance excepcional', fontSize: 14, color: '#065f46' }),
              createNode('text', { content: '• Ótimo custo-benefício', fontSize: 14, color: '#065f46' }),
              createNode('text', { content: '• Suporte técnico eficiente', fontSize: 14, color: '#065f46' })
            ])
          ]),
          createNode('container', { className: 'bg-red-50 p-6 rounded-lg' }, [
            createNode('heading', {
              content: '❌ Pontos Negativos',
              level: 'h3',
              fontSize: 20,
              fontWeight: '700',
              marginBottom: 16
            }),
            createNode('container', { className: 'space-y-2' }, [
              createNode('text', { content: '• Curva de aprendizado inicial', fontSize: 14, color: '#991b1b' }),
              createNode('text', { content: '• Algumas funcionalidades limitadas', fontSize: 14, color: '#991b1b' }),
              createNode('text', { content: '• Preço poderia ser mais competitivo', fontSize: 14, color: '#991b1b' })
            ])
          ])
        ]),
        createNode('richtext', {
          content: `
            <h2>Análise Detalhada</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Análise completa do produto...</p>
            
            <h3>Design e Usabilidade</h3>
            <p>Descrição detalhada...</p>
            
            <h3>Performance</h3>
            <p>Análise de performance...</p>
            
            <h2>Conclusão</h2>
            <p>Resumo final da análise com recomendação...</p>
          `,
          padding: 0
        }),
        createNode('container', { className: 'bg-blue-600 text-white p-8 rounded-lg text-center mt-12' }, [
          createNode('heading', {
            content: 'Veredicto Final',
            level: 'h3',
            fontSize: 28,
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'Recomendado para quem busca qualidade e eficiência',
            fontSize: 18,
            color: '#dbeafe'
          })
        ])
      ])
    ]
  ),

  createTemplate(
    'Comparação de Produtos',
    'Template para comparar dois ou mais produtos',
    'article',
    'blog',
    ['comparacao', 'vs', 'produtos'],
    [
      createNode('article', { className: 'max-w-6xl mx-auto py-12 px-4' }, [
        createNode('heading', {
          content: 'Produto A vs Produto B: Qual Escolher?',
          level: 'h1',
          fontSize: 48,
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: 64
        }),
        // Tabela Comparativa
        createNode('container', { className: 'grid md:grid-cols-2 gap-8 mb-12' }, [
          // Produto A
          createNode('container', { className: 'bg-white border-2 border-blue-200 rounded-xl p-8' }, [
            createNode('container', { className: 'text-center mb-6' }, [
              createNode('heading', {
                content: 'Produto A',
                level: 'h2',
                fontSize: 32,
                fontWeight: '800',
                color: '#3b82f6',
                marginBottom: 8
              }),
              createNode('text', {
                content: 'R$ 99/mês',
                fontSize: 24,
                fontWeight: '700'
              })
            ]),
            createNode('container', { className: 'space-y-4' }, [
              createNode('container', { className: 'flex items-start gap-2' }, [
                createNode('text', { content: '✅', fontSize: 20 }),
                createNode('text', { content: 'Interface moderna', fontSize: 14 })
              ]),
              createNode('container', { className: 'flex items-start gap-2' }, [
                createNode('text', { content: '✅', fontSize: 20 }),
                createNode('text', { content: 'Integração com 50+ apps', fontSize: 14 })
              ]),
              createNode('container', { className: 'flex items-start gap-2' }, [
                createNode('text', { content: '✅', fontSize: 20 }),
                createNode('text', { content: 'Suporte 24/7', fontSize: 14 })
              ]),
              createNode('container', { className: 'flex items-start gap-2' }, [
                createNode('text', { content: '❌', fontSize: 20 }),
                createNode('text', { content: 'Sem app mobile', fontSize: 14 })
              ])
            ]),
            createNode('button', {
              text: 'Escolher Produto A',
              variant: 'primary',
              fullWidth: true,
              backgroundColor: '#3b82f6',
              className: 'mt-8'
            })
          ]),
          // Produto B
          createNode('container', { className: 'bg-white border-2 border-green-200 rounded-xl p-8' }, [
            createNode('container', { className: 'text-center mb-6' }, [
              createNode('heading', {
                content: 'Produto B',
                level: 'h2',
                fontSize: 32,
                fontWeight: '800',
                color: '#10b981',
                marginBottom: 8
              }),
              createNode('text', {
                content: 'R$ 149/mês',
                fontSize: 24,
                fontWeight: '700'
              })
            ]),
            createNode('container', { className: 'space-y-4' }, [
              createNode('container', { className: 'flex items-start gap-2' }, [
                createNode('text', { content: '✅', fontSize: 20 }),
                createNode('text', { content: 'Interface intuitiva', fontSize: 14 })
              ]),
              createNode('container', { className: 'flex items-start gap-2' }, [
                createNode('text', { content: '✅', fontSize: 20 }),
                createNode('text', { content: 'App mobile nativo', fontSize: 14 })
              ]),
              createNode('container', { className: 'flex items-start gap-2' }, [
                createNode('text', { content: '✅', fontSize: 20 }),
                createNode('text', { content: 'Analytics avançado', fontSize: 14 })
              ]),
              createNode('container', { className: 'flex items-start gap-2' }, [
                createNode('text', { content: '✅', fontSize: 20 }),
                createNode('text', { content: 'Recursos IA', fontSize: 14 })
              ])
            ]),
            createNode('button', {
              text: 'Escolher Produto B',
              variant: 'primary',
              fullWidth: true,
              backgroundColor: '#10b981',
              className: 'mt-8'
            })
          ])
        ]),
        createNode('richtext', {
          content: `
            <h2>Análise Detalhada</h2>
            <p>Vamos comparar os principais aspectos de cada produto...</p>
            
            <h3>Design e Usabilidade</h3>
            <p>Comparação de interfaces...</p>
            
            <h3>Funcionalidades</h3>
            <p>Recursos disponíveis em cada um...</p>
            
            <h2>Conclusão</h2>
            <p>Qual produto é melhor para você?</p>
          `,
          padding: 0
        })
      ])
    ]
  ),

  createTemplate(
    'Entrevista / Q&A',
    'Template para entrevistas e perguntas e respostas',
    'article',
    'blog',
    ['entrevista', 'qa', 'perguntas'],
    [
      createNode('article', { className: 'max-w-4xl mx-auto py-12 px-4' }, [
        createNode('badge', {
          text: '🎤 ENTREVISTA',
          variant: 'secondary',
          className: 'mb-6'
        }),
        createNode('heading', {
          content: 'Entrevista com [Nome do Entrevistado]',
          level: 'h1',
          fontSize: 48,
          fontWeight: '800',
          marginBottom: 24
        }),
        // Info do Entrevistado
        createNode('container', { className: 'flex items-center gap-6 bg-gray-50 p-6 rounded-lg mb-12' }, [
          createNode('container', { className: 'w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0' }),
          createNode('container', {}, [
            createNode('heading', {
              content: 'Nome do Entrevistado',
              level: 'h3',
              fontSize: 24,
              fontWeight: '700',
              marginBottom: 8
            }),
            createNode('text', {
              content: 'CEO da Empresa X • Especialista em Tecnologia',
              fontSize: 16,
              color: '#6b7280'
            })
          ])
        ]),
        // Q&A
        createNode('container', { className: 'space-y-8' }, [
          createNode('container', {}, [
            createNode('heading', {
              content: 'P: Como você começou na área de tecnologia?',
              level: 'h3',
              fontSize: 20,
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: 12
            }),
            createNode('text', {
              content: 'R: Minha jornada começou há 15 anos quando... [resposta detalhada do entrevistado com insights valiosos]',
              fontSize: 16,
              color: '#374151',
              lineHeight: 1.8,
              className: 'pl-6 border-l-4 border-gray-200'
            })
          ]),
          createNode('container', {}, [
            createNode('heading', {
              content: 'P: Qual foi o maior desafio que você enfrentou?',
              level: 'h3',
              fontSize: 20,
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: 12
            }),
            createNode('text', {
              content: 'R: O maior desafio foi... [resposta com detalhes sobre superação e aprendizados]',
              fontSize: 16,
              color: '#374151',
              lineHeight: 1.8,
              className: 'pl-6 border-l-4 border-gray-200'
            })
          ]),
          createNode('container', {}, [
            createNode('heading', {
              content: 'P: Quais conselhos você daria para iniciantes?',
              level: 'h3',
              fontSize: 20,
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: 12
            }),
            createNode('text', {
              content: 'R: Meu principal conselho é... [dicas práticas e motivacionais]',
              fontSize: 16,
              color: '#374151',
              lineHeight: 1.8,
              className: 'pl-6 border-l-4 border-gray-200'
            })
          ])
        ]),
        // Conclusão
        createNode('container', { className: 'bg-blue-50 p-8 rounded-lg mt-12' }, [
          createNode('heading', {
            content: '💡 Principais Insights',
            level: 'h3',
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 16
          }),
          createNode('container', { className: 'space-y-2' }, [
            createNode('text', { content: '• Insight número 1 da entrevista', fontSize: 16, color: '#374151' }),
            createNode('text', { content: '• Insight número 2 importante', fontSize: 16, color: '#374151' }),
            createNode('text', { content: '• Insight número 3 valioso', fontSize: 16, color: '#374151' })
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Case Study',
    'Template para estudos de caso e histórias de sucesso',
    'article',
    'blog',
    ['case-study', 'sucesso', 'resultados'],
    [
      createNode('article', { className: 'max-w-5xl mx-auto py-12 px-4' }, [
        createNode('badge', {
          text: '📊 CASE STUDY',
          variant: 'secondary',
          className: 'mb-6'
        }),
        createNode('heading', {
          content: 'Como a Empresa X Aumentou Vendas em 300%',
          level: 'h1',
          fontSize: 48,
          fontWeight: '800',
          marginBottom: 24
        }),
        // Resumo Executivo
        createNode('container', { className: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl mb-12' }, [
          createNode('heading', {
            content: 'Resumo Executivo',
            level: 'h2',
            fontSize: 28,
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: 16
          }),
          createNode('container', { className: 'grid md:grid-cols-3 gap-8' }, [
            createNode('container', {}, [
              createNode('text', {
                content: '300%',
                fontSize: 48,
                fontWeight: '900',
                color: '#ffffff'
              }),
              createNode('text', {
                content: 'Aumento em vendas',
                fontSize: 14,
                color: '#dbeafe'
              })
            ]),
            createNode('container', {}, [
              createNode('text', {
                content: '6 meses',
                fontSize: 48,
                fontWeight: '900',
                color: '#ffffff'
              }),
              createNode('text', {
                content: 'Tempo de implementação',
                fontSize: 14,
                color: '#dbeafe'
              })
            ]),
            createNode('container', {}, [
              createNode('text', {
                content: 'R$ 2M',
                fontSize: 48,
                fontWeight: '900',
                color: '#ffffff'
              }),
              createNode('text', {
                content: 'Receita adicional',
                fontSize: 14,
                color: '#dbeafe'
              })
            ])
          ])
        ]),
        // O Desafio
        createNode('container', { className: 'mb-12' }, [
          createNode('heading', {
            content: '🎯 O Desafio',
            level: 'h2',
            fontSize: 32,
            fontWeight: '800',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'A Empresa X enfrentava dificuldades para escalar suas vendas e alcançar novos mercados...',
            fontSize: 16,
            color: '#374151',
            lineHeight: 1.8
          })
        ]),
        // A Solução
        createNode('container', { className: 'mb-12' }, [
          createNode('heading', {
            content: '💡 A Solução',
            level: 'h2',
            fontSize: 32,
            fontWeight: '800',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'Implementamos uma estratégia integrada que incluiu...',
            fontSize: 16,
            color: '#374151',
            lineHeight: 1.8,
            marginBottom: 16
          }),
          createNode('container', { className: 'grid md:grid-cols-2 gap-6' }, [
            createNode('container', { className: 'bg-blue-50 p-6 rounded-lg' }, [
              createNode('heading', {
                content: 'Fase 1: Análise',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Mapeamento completo dos processos atuais...',
                fontSize: 14,
                color: '#4b5563'
              })
            ]),
            createNode('container', { className: 'bg-green-50 p-6 rounded-lg' }, [
              createNode('heading', {
                content: 'Fase 2: Implementação',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Aplicação das novas estratégias e ferramentas...',
                fontSize: 14,
                color: '#4b5563'
              })
            ])
          ])
        ]),
        // Resultados
        createNode('container', { className: 'bg-green-50 border-l-4 border-green-500 p-8 rounded-lg' }, [
          createNode('heading', {
            content: '🎉 Os Resultados',
            level: 'h2',
            fontSize: 32,
            fontWeight: '800',
            marginBottom: 16
          }),
          createNode('container', { className: 'space-y-4' }, [
            createNode('text', { content: '✅ 300% de aumento em vendas em 6 meses', fontSize: 16, color: '#065f46' }),
            createNode('text', { content: '✅ Redução de 40% nos custos operacionais', fontSize: 16, color: '#065f46' }),
            createNode('text', { content: '✅ Aumento de 150% na satisfação do cliente', fontSize: 16, color: '#065f46' }),
            createNode('text', { content: '✅ Expansão para 3 novos mercados', fontSize: 16, color: '#065f46' })
          ])
        ])
      ])
    ]
  ),

  // ============================================================================
  // INSTITUCIONAL (8 templates)
  // ============================================================================

  createTemplate(
    'Sobre Nós Completo',
    'Página sobre a empresa com história e valores',
    'page',
    'institutional',
    ['sobre', 'empresa', 'valores'],
    [
      createNode('section', { className: 'min-h-screen' }, [
        // Hero
        createNode('container', { className: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4' }, [
          createNode('container', { className: 'max-w-4xl mx-auto text-center' }, [
            createNode('heading', {
              content: 'Sobre Nossa Empresa',
              level: 'h1',
              fontSize: 56,
              fontWeight: '900',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: 24
            }),
            createNode('text', {
              content: 'Transformando ideias em realidade desde 2010',
              fontSize: 24,
              color: '#e0e7ff',
              textAlign: 'center'
            })
          ])
        ]),
        // Nossa História
        createNode('container', { className: 'max-w-6xl mx-auto py-20 px-4' }, [
          createNode('container', { className: 'grid md:grid-cols-2 gap-12 items-center mb-20' }, [
            createNode('container', {}, [
              createNode('heading', {
                content: 'Nossa História',
                level: 'h2',
                fontSize: 40,
                fontWeight: '800',
                marginBottom: 24
              }),
              createNode('text', {
                content: 'Fundada em 2010 por um grupo de empreendedores visionários, nossa empresa nasceu com a missão de revolucionar o mercado de tecnologia.',
                fontSize: 18,
                color: '#4b5563',
                lineHeight: 1.8,
                marginBottom: 16
              }),
              createNode('text', {
                content: 'Ao longo dos anos, crescemos de uma startup com 3 pessoas para uma empresa com mais de 200 colaboradores, sempre mantendo nossos valores e compromisso com a excelência.',
                fontSize: 18,
                color: '#4b5563',
                lineHeight: 1.8
              })
            ]),
            createNode('image', {
              src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
              alt: 'Equipe trabalhando',
              width: '100%',
              borderRadius: 12,
              className: 'shadow-xl'
            })
          ]),
          // Missão, Visão, Valores
          createNode('container', { className: 'grid md:grid-cols-3 gap-8 mb-20' }, [
            createNode('container', { className: 'bg-blue-50 p-8 rounded-xl' }, [
              createNode('container', { className: 'text-5xl mb-4' }, [
                createNode('text', { content: '🎯', fontSize: 48 })
              ]),
              createNode('heading', {
                content: 'Missão',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Fornecer soluções inovadoras que transformam a forma como as empresas operam e crescem.',
                fontSize: 16,
                color: '#4b5563',
                lineHeight: 1.6
              })
            ]),
            createNode('container', { className: 'bg-green-50 p-8 rounded-xl' }, [
              createNode('container', { className: 'text-5xl mb-4' }, [
                createNode('text', { content: '🚀', fontSize: 48 })
              ]),
              createNode('heading', {
                content: 'Visão',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Ser reconhecida como a empresa mais inovadora e confiável do setor até 2030.',
                fontSize: 16,
                color: '#4b5563',
                lineHeight: 1.6
              })
            ]),
            createNode('container', { className: 'bg-purple-50 p-8 rounded-xl' }, [
              createNode('container', { className: 'text-5xl mb-4' }, [
                createNode('text', { content: '💎', fontSize: 48 })
              ]),
              createNode('heading', {
                content: 'Valores',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Integridade, inovação, excelência e respeito em tudo que fazemos.',
                fontSize: 16,
                color: '#4b5563',
                lineHeight: 1.6
              })
            ])
          ]),
          // Números
          createNode('container', { className: 'bg-gray-900 text-white p-12 rounded-2xl' }, [
            createNode('heading', {
              content: 'Nossa Jornada em Números',
              level: 'h2',
              fontSize: 40,
              fontWeight: '800',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: 48
            }),
            createNode('container', { className: 'grid md:grid-cols-4 gap-8 text-center' }, [
              createNode('container', {}, [
                createNode('text', {
                  content: '15+',
                  fontSize: 48,
                  fontWeight: '900',
                  color: '#3b82f6'
                }),
                createNode('text', {
                  content: 'Anos de Experiência',
                  fontSize: 14,
                  color: '#9ca3af'
                })
              ]),
              createNode('container', {}, [
                createNode('text', {
                  content: '200+',
                  fontSize: 48,
                  fontWeight: '900',
                  color: '#10b981'
                }),
                createNode('text', {
                  content: 'Colaboradores',
                  fontSize: 14,
                  color: '#9ca3af'
                })
              ]),
              createNode('container', {}, [
                createNode('text', {
                  content: '10K+',
                  fontSize: 48,
                  fontWeight: '900',
                  color: '#f59e0b'
                }),
                createNode('text', {
                  content: 'Clientes Satisfeitos',
                  fontSize: 14,
                  color: '#9ca3af'
                })
              ]),
              createNode('container', {}, [
                createNode('text', {
                  content: '50+',
                  fontSize: 48,
                  fontWeight: '900',
                  color: '#8b5cf6'
                }),
                createNode('text', {
                  content: 'Países Atendidos',
                  fontSize: 14,
                  color: '#9ca3af'
                })
              ])
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Página de Contato',
    'Formulário de contato com informações da empresa',
    'page',
    'institutional',
    ['contato', 'formulario', 'endereco'],
    [
      createNode('section', { className: 'min-h-screen bg-gray-50 py-20 px-4' }, [
        createNode('container', { className: 'max-w-6xl mx-auto' }, [
          createNode('heading', {
            content: 'Entre em Contato',
            level: 'h1',
            fontSize: 48,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'Estamos aqui para ajudar. Envie sua mensagem!',
            fontSize: 20,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 64
          }),
          createNode('container', { className: 'grid md:grid-cols-2 gap-12' }, [
            // Formulário
            createNode('container', { className: 'bg-white p-8 rounded-xl shadow-lg' }, [
              createNode('heading', {
                content: 'Envie sua Mensagem',
                level: 'h2',
                fontSize: 28,
                fontWeight: '700',
                marginBottom: 24
              }),
              createNode('form', { className: 'space-y-4' }, [
                createNode('input', {
                  placeholder: 'Seu nome',
                  type: 'text',
                  required: true
                }),
                createNode('input', {
                  placeholder: 'Seu e-mail',
                  type: 'email',
                  required: true
                }),
                createNode('input', {
                  placeholder: 'Telefone',
                  type: 'tel'
                }),
                createNode('input', {
                  placeholder: 'Assunto',
                  type: 'text',
                  required: true
                }),
                createNode('textarea', {
                  placeholder: 'Sua mensagem',
                  rows: 5,
                  required: true
                }),
                createNode('button', {
                  text: 'Enviar Mensagem',
                  variant: 'primary',
                  size: 'large',
                  fullWidth: true,
                  backgroundColor: '#3b82f6'
                })
              ])
            ]),
            // Informações
            createNode('container', { className: 'space-y-8' }, [
              createNode('container', { className: 'bg-white p-6 rounded-xl shadow' }, [
                createNode('container', { className: 'flex items-center gap-4 mb-4' }, [
                  createNode('container', { className: 'w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl' }, [
                    createNode('text', { content: '📍', fontSize: 24 })
                  ]),
                  createNode('heading', {
                    content: 'Endereço',
                    level: 'h3',
                    fontSize: 20,
                    fontWeight: '700'
                  })
                ]),
                createNode('text', {
                  content: 'Rua Exemplo, 1234\nCentro, São Paulo - SP\nCEP 01234-567',
                  fontSize: 16,
                  color: '#6b7280',
                  lineHeight: 1.6
                })
              ]),
              createNode('container', { className: 'bg-white p-6 rounded-xl shadow' }, [
                createNode('container', { className: 'flex items-center gap-4 mb-4' }, [
                  createNode('container', { className: 'w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl' }, [
                    createNode('text', { content: '📞', fontSize: 24 })
                  ]),
                  createNode('heading', {
                    content: 'Telefone',
                    level: 'h3',
                    fontSize: 20,
                    fontWeight: '700'
                  })
                ]),
                createNode('text', {
                  content: '+55 (11) 1234-5678\nSegunda a Sexta, 9h às 18h',
                  fontSize: 16,
                  color: '#6b7280',
                  lineHeight: 1.6
                })
              ]),
              createNode('container', { className: 'bg-white p-6 rounded-xl shadow' }, [
                createNode('container', { className: 'flex items-center gap-4 mb-4' }, [
                  createNode('container', { className: 'w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl' }, [
                    createNode('text', { content: '✉️', fontSize: 24 })
                  ]),
                  createNode('heading', {
                    content: 'E-mail',
                    level: 'h3',
                    fontSize: 20,
                    fontWeight: '700'
                  })
                ]),
                createNode('text', {
                  content: 'contato@empresa.com\nsuporte@empresa.com',
                  fontSize: 16,
                  color: '#6b7280',
                  lineHeight: 1.6
                })
              ]),
              createNode('container', { className: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl' }, [
                createNode('heading', {
                  content: 'Redes Sociais',
                  level: 'h3',
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: 16
                }),
                createNode('container', { className: 'flex gap-4' }, [
                  createNode('text', { content: 'f', fontSize: 24, color: '#ffffff', className: 'w-10 h-10 bg-white/20 rounded-full flex items-center justify-center' }),
                  createNode('text', { content: 'in', fontSize: 16, color: '#ffffff', className: 'w-10 h-10 bg-white/20 rounded-full flex items-center justify-center' }),
                  createNode('text', { content: 'X', fontSize: 24, color: '#ffffff', className: 'w-10 h-10 bg-white/20 rounded-full flex items-center justify-center' }),
                  createNode('text', { content: 'IG', fontSize: 16, color: '#ffffff', className: 'w-10 h-10 bg-white/20 rounded-full flex items-center justify-center' })
                ])
              ])
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Nossos Serviços',
    'Página mostrando serviços oferecidos',
    'page',
    'institutional',
    ['servicos', 'ofertas', 'solucoes'],
    [
      createNode('section', { className: 'min-h-screen py-20 px-4' }, [
        createNode('container', { className: 'max-w-7xl mx-auto' }, [
          createNode('heading', {
            content: 'Nossos Serviços',
            level: 'h1',
            fontSize: 56,
            fontWeight: '900',
            textAlign: 'center',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'Soluções completas para transformar seu negócio',
            fontSize: 24,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 64
          }),
          createNode('container', { className: 'grid md:grid-cols-3 gap-8' }, [
            // Serviço 1
            createNode('container', { className: 'bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow' }, [
              createNode('container', { className: 'w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6' }, [
                createNode('text', { content: '💻', fontSize: 32 })
              ]),
              createNode('heading', {
                content: 'Desenvolvimento Web',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Criamos sites e aplicações web modernas, responsivas e otimizadas para conversão.',
                fontSize: 16,
                color: '#6b7280',
                lineHeight: 1.6,
                marginBottom: 16
              }),
              createNode('container', { className: 'space-y-2 mb-6' }, [
                createNode('text', { content: '✓ Design responsivo', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ SEO otimizado', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ Performance máxima', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ Manutenção inclusa', fontSize: 14, color: '#374151' })
              ]),
              createNode('button', {
                text: 'Saiba Mais',
                variant: 'outline',
                fullWidth: true
              })
            ]),
            // Serviço 2
            createNode('container', { className: 'bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-2xl shadow-xl text-white transform scale-105' }, [
              createNode('badge', {
                text: 'MAIS POPULAR',
                className: 'bg-yellow-400 text-yellow-900 mb-4'
              }),
              createNode('container', { className: 'w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-6' }, [
                createNode('text', { content: '📱', fontSize: 32 })
              ]),
              createNode('heading', {
                content: 'Aplicativos Mobile',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Apps nativos e híbridos para iOS e Android com design impecável e funcionalidades avançadas.',
                fontSize: 16,
                color: '#ffffff',
                lineHeight: 1.6,
                marginBottom: 16
              }),
              createNode('container', { className: 'space-y-2 mb-6' }, [
                createNode('text', { content: '✓ iOS e Android', fontSize: 14, color: '#ffffff' }),
                createNode('text', { content: '✓ UX excepcional', fontSize: 14, color: '#ffffff' }),
                createNode('text', { content: '✓ Integração total', fontSize: 14, color: '#ffffff' }),
                createNode('text', { content: '✓ Suporte dedicado', fontSize: 14, color: '#ffffff' })
              ]),
              createNode('button', {
                text: 'Começar Projeto',
                variant: 'primary',
                fullWidth: true,
                backgroundColor: '#ffffff',
                textColor: '#059669'
              })
            ]),
            // Serviço 3
            createNode('container', { className: 'bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow' }, [
              createNode('container', { className: 'w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6' }, [
                createNode('text', { content: '🚀', fontSize: 32 })
              ]),
              createNode('heading', {
                content: 'Marketing Digital',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700',
                marginBottom: 12
              }),
              createNode('text', {
                content: 'Estratégias completas de marketing para aumentar sua presença online e gerar mais vendas.',
                fontSize: 16,
                color: '#6b7280',
                lineHeight: 1.6,
                marginBottom: 16
              }),
              createNode('container', { className: 'space-y-2 mb-6' }, [
                createNode('text', { content: '✓ SEO e SEM', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ Redes sociais', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ Email marketing', fontSize: 14, color: '#374151' }),
                createNode('text', { content: '✓ Analytics', fontSize: 14, color: '#374151' })
              ]),
              createNode('button', {
                text: 'Saiba Mais',
                variant: 'outline',
                fullWidth: true
              })
            ])
          ])
        ])
      ])
    ]
  ),

  // Continue com mais templates... (devido ao limite, vou resumir os próximos)
  
  createTemplate(
    'Equipe / Team',
    'Página apresentando a equipe da empresa',
    'page',
    'institutional',
    ['equipe', 'time', 'pessoas'],
    [
      createNode('section', { className: 'py-20 px-4 bg-gray-50' }, [
        createNode('container', { className: 'max-w-7xl mx-auto' }, [
          createNode('heading', {
            content: 'Conheça Nossa Equipe',
            level: 'h1',
            fontSize: 48,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 64
          }),
          createNode('container', { className: 'grid md:grid-cols-4 gap-8' }, [
            // Membro 1
            createNode('container', { className: 'bg-white p-6 rounded-xl shadow-lg text-center' }, [
              createNode('container', { className: 'w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4' }),
              createNode('heading', {
                content: 'João Silva',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 4
              }),
              createNode('text', {
                content: 'CEO & Fundador',
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 12
              }),
              createNode('text', {
                content: '15+ anos de experiência em tecnologia',
                fontSize: 12,
                color: '#9ca3af'
              })
            ]),
            // Repita para outros membros...
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Política de Privacidade',
    'Template para política de privacidade e termos',
    'page',
    'institutional',
    ['privacidade', 'legal', 'termos'],
    [
      createNode('article', { className: 'max-w-4xl mx-auto py-12 px-4' }, [
        createNode('heading', {
          content: 'Política de Privacidade',
          level: 'h1',
          fontSize: 48,
          fontWeight: '800',
          marginBottom: 16
        }),
        createNode('text', {
          content: 'Última atualização: 20 de outubro de 2025',
          fontSize: 14,
          color: '#6b7280',
          marginBottom: 48
        }),
        createNode('richtext', {
          content: `
            <p class="text-lg mb-6">
              Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais.
            </p>
            
            <h2>1. Informações que Coletamos</h2>
            <p>Coletamos as seguintes informações:</p>
            <ul>
              <li>Nome e informações de contato</li>
              <li>Dados de uso e navegação</li>
              <li>Informações de pagamento (quando aplicável)</li>
            </ul>
            
            <h2>2. Como Usamos Suas Informações</h2>
            <p>Utilizamos suas informações para:</p>
            <ul>
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Processar pagamentos</li>
              <li>Enviar comunicações importantes</li>
              <li>Personalizar sua experiência</li>
            </ul>
            
            <h2>3. Proteção de Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra
              acesso não autorizado, perda ou alteração.
            </p>
            
            <h2>4. Seus Direitos</h2>
            <p>Você tem o direito de:</p>
            <ul>
              <li>Acessar suas informações pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Opor-se ao processamento de suas informações</li>
            </ul>
            
            <h2>5. Contato</h2>
            <p>
              Para questões sobre privacidade, entre em contato: privacidade@empresa.com
            </p>
          `,
          padding: 0
        })
      ])
    ]
  ),

  // Mais templates institucionais...

  // ============================================================================
  // E-COMMERCE (6 templates)
  // ============================================================================

  createTemplate(
    'Catálogo de Produtos',
    'Grid de produtos com filtros',
    'page',
    'ecommerce',
    ['produtos', 'catalogo', 'loja'],
    [
      createNode('section', { className: 'py-12 px-4 bg-gray-50' }, [
        createNode('container', { className: 'max-w-7xl mx-auto' }, [
          createNode('heading', {
            content: 'Nossos Produtos',
            level: 'h1',
            fontSize: 48,
            fontWeight: '800',
            marginBottom: 48
          }),
          createNode('container', { className: 'grid md:grid-cols-4 gap-6' }, [
            // Produto 1
            createNode('container', { className: 'bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer' }, [
              createNode('container', { className: 'aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative' }, [
                createNode('badge', {
                  text: '-20%',
                  className: 'absolute top-2 right-2 bg-red-500 text-white'
                }),
                createNode('text', { content: '🛍️', fontSize: 64 })
              ]),
              createNode('container', { className: 'p-4' }, [
                createNode('heading', {
                  content: 'Nome do Produto',
                  level: 'h3',
                  fontSize: 18,
                  fontWeight: '700',
                  marginBottom: 8
                }),
                createNode('container', { className: 'flex items-center gap-2 mb-3' }, [
                  createNode('text', {
                    content: 'R$ 99,90',
                    fontSize: 24,
                    fontWeight: '800',
                    color: '#3b82f6'
                  }),
                  createNode('text', {
                    content: 'R$ 124,90',
                    fontSize: 14,
                    color: '#9ca3af',
                    className: 'line-through'
                  })
                ]),
                createNode('container', { className: 'flex gap-1 mb-3 text-yellow-400' }, [
                  createNode('text', { content: '⭐⭐⭐⭐⭐', fontSize: 14 })
                ]),
                createNode('button', {
                  text: 'Adicionar ao Carrinho',
                  variant: 'primary',
                  fullWidth: true,
                  size: 'small',
                  backgroundColor: '#3b82f6'
                })
              ])
            ]),
            // Repita para mais produtos...
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Página de Produto',
    'Detalhes completos do produto com galeria',
    'page',
    'ecommerce',
    ['produto', 'detalhes', 'compra'],
    [
      createNode('section', { className: 'py-12 px-4' }, [
        createNode('container', { className: 'max-w-7xl mx-auto' }, [
          createNode('container', { className: 'grid md:grid-cols-2 gap-12' }, [
            // Galeria
            createNode('container', {}, [
              createNode('container', { className: 'aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4' }, [
                createNode('text', { content: '📸', fontSize: 96 })
              ]),
              createNode('container', { className: 'grid grid-cols-4 gap-2' }, [
                createNode('container', { className: 'aspect-square bg-gray-100 rounded-lg' }),
                createNode('container', { className: 'aspect-square bg-gray-100 rounded-lg' }),
                createNode('container', { className: 'aspect-square bg-gray-100 rounded-lg' }),
                createNode('container', { className: 'aspect-square bg-gray-100 rounded-lg' })
              ])
            ]),
            // Informações
            createNode('container', {}, [
              createNode('badge', {
                text: 'NOVO',
                variant: 'secondary',
                className: 'mb-4'
              }),
              createNode('heading', {
                content: 'Nome do Produto Incrível',
                level: 'h1',
                fontSize: 40,
                fontWeight: '800',
                marginBottom: 16
              }),
              createNode('container', { className: 'flex items-center gap-2 mb-6' }, [
                createNode('text', { content: '⭐⭐⭐⭐⭐', fontSize: 20 }),
                createNode('text', { content: '(248 avaliações)', fontSize: 14, color: '#6b7280' })
              ]),
              createNode('container', { className: 'flex items-end gap-3 mb-8' }, [
                createNode('text', {
                  content: 'R$ 299,90',
                  fontSize: 48,
                  fontWeight: '900',
                  color: '#3b82f6'
                }),
                createNode('text', {
                  content: 'R$ 399,90',
                  fontSize: 24,
                  color: '#9ca3af',
                  className: 'line-through mb-2'
                })
              ]),
              createNode('text', {
                content: 'Descrição detalhada do produto com todos os benefícios e características que fazem dele a melhor escolha.',
                fontSize: 16,
                color: '#4b5563',
                lineHeight: 1.8,
                marginBottom: 24
              }),
              createNode('container', { className: 'space-y-4 mb-8' }, [
                createNode('text', { content: '✓ Entrega grátis para todo Brasil', fontSize: 14, color: '#10b981' }),
                createNode('text', { content: '✓ Garantia de 12 meses', fontSize: 14, color: '#10b981' }),
                createNode('text', { content: '✓ Troca em até 30 dias', fontSize: 14, color: '#10b981' })
              ]),
              createNode('button', {
                text: 'Comprar Agora',
                variant: 'primary',
                size: 'large',
                fullWidth: true,
                backgroundColor: '#10b981'
              })
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Carrinho de Compras',
    'Página do carrinho com resumo do pedido',
    'page',
    'ecommerce',
    ['carrinho', 'checkout', 'pedido'],
    [
      createNode('section', { className: 'py-12 px-4 bg-gray-50' }, [
        createNode('container', { className: 'max-w-6xl mx-auto' }, [
          createNode('heading', {
            content: 'Seu Carrinho',
            level: 'h1',
            fontSize: 40,
            fontWeight: '800',
            marginBottom: 48
          }),
          createNode('container', { className: 'grid md:grid-cols-3 gap-8' }, [
            // Lista de Produtos
            createNode('container', { className: 'md:col-span-2 space-y-4' }, [
              // Item 1
              createNode('container', { className: 'bg-white p-6 rounded-xl shadow flex items-center gap-6' }, [
                createNode('container', { className: 'w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0' }),
                createNode('container', { className: 'flex-1' }, [
                  createNode('heading', {
                    content: 'Produto 1',
                    level: 'h3',
                    fontSize: 18,
                    fontWeight: '700',
                    marginBottom: 8
                  }),
                  createNode('text', {
                    content: 'R$ 99,90',
                    fontSize: 20,
                    fontWeight: '700',
                    color: '#3b82f6'
                  })
                ]),
                createNode('container', { className: 'flex items-center gap-2' }, [
                  createNode('button', { text: '-', variant: 'outline', size: 'small' }),
                  createNode('text', { content: '1', fontSize: 16, fontWeight: '700' }),
                  createNode('button', { text: '+', variant: 'outline', size: 'small' })
                ])
              ])
            ]),
            // Resumo
            createNode('container', {}, [
              createNode('container', { className: 'bg-white p-6 rounded-xl shadow sticky top-4' }, [
                createNode('heading', {
                  content: 'Resumo do Pedido',
                  level: 'h3',
                  fontSize: 24,
                  fontWeight: '700',
                  marginBottom: 24
                }),
                createNode('container', { className: 'space-y-3 mb-6 pb-6 border-b' }, [
                  createNode('container', { className: 'flex justify-between' }, [
                    createNode('text', { content: 'Subtotal', fontSize: 14, color: '#6b7280' }),
                    createNode('text', { content: 'R$ 99,90', fontSize: 14, fontWeight: '600' })
                  ]),
                  createNode('container', { className: 'flex justify-between' }, [
                    createNode('text', { content: 'Frete', fontSize: 14, color: '#6b7280' }),
                    createNode('text', { content: 'Grátis', fontSize: 14, fontWeight: '600', color: '#10b981' })
                  ])
                ]),
                createNode('container', { className: 'flex justify-between mb-6' }, [
                  createNode('text', { content: 'Total', fontSize: 20, fontWeight: '800' }),
                  createNode('text', { content: 'R$ 99,90', fontSize: 24, fontWeight: '900', color: '#3b82f6' })
                ]),
                createNode('button', {
                  text: 'Finalizar Compra',
                  variant: 'primary',
                  size: 'large',
                  fullWidth: true,
                  backgroundColor: '#10b981'
                })
              ])
            ])
          ])
        ])
      ])
    ]
  ),

  // ============================================================================
  // PORTFÓLIO (6 templates)
  // ============================================================================

  createTemplate(
    'Galeria de Projetos',
    'Grid com projetos em destaque',
    'page',
    'portfolio',
    ['portfolio', 'projetos', 'galeria'],
    [
      createNode('section', { className: 'py-20 px-4' }, [
        createNode('container', { className: 'max-w-7xl mx-auto' }, [
          createNode('heading', {
            content: 'Meu Portfólio',
            level: 'h1',
            fontSize: 56,
            fontWeight: '900',
            textAlign: 'center',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'Projetos selecionados que demonstram minha experiência',
            fontSize: 20,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 64
          }),
          createNode('container', { className: 'grid md:grid-cols-2 lg:grid-cols-3 gap-8' }, [
            // Projeto 1
            createNode('container', { className: 'group cursor-pointer' }, [
              createNode('container', { className: 'aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden mb-4 relative' }, [
                createNode('container', { className: 'absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center' }, [
                  createNode('text', {
                    content: 'Ver Projeto →',
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#ffffff',
                    className: 'opacity-0 group-hover:opacity-100 transition-opacity'
                  })
                ])
              ]),
              createNode('heading', {
                content: 'Nome do Projeto',
                level: 'h3',
                fontSize: 24,
                fontWeight: '700',
                marginBottom: 8
              }),
              createNode('text', {
                content: 'Design • Desenvolvimento • Branding',
                fontSize: 14,
                color: '#6b7280'
              })
            ])
            // Repita para mais projetos...
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Detalhes do Projeto',
    'Página completa de case do projeto',
    'page',
    'portfolio',
    ['projeto', 'case', 'detalhes'],
    [
      createNode('article', { className: 'max-w-5xl mx-auto py-12 px-4' }, [
        createNode('container', { className: 'aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-12' }),
        createNode('heading', {
          content: 'Nome do Projeto',
          level: 'h1',
          fontSize: 56,
          fontWeight: '900',
          marginBottom: 24
        }),
        createNode('container', { className: 'grid md:grid-cols-3 gap-6 mb-12 p-8 bg-gray-50 rounded-xl' }, [
          createNode('container', {}, [
            createNode('text', {
              content: 'Cliente',
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 4
            }),
            createNode('text', {
              content: 'Empresa XYZ',
              fontSize: 18,
              fontWeight: '700'
            })
          ]),
          createNode('container', {}, [
            createNode('text', {
              content: 'Serviços',
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 4
            }),
            createNode('text', {
              content: 'Design & Dev',
              fontSize: 18,
              fontWeight: '700'
            })
          ]),
          createNode('container', {}, [
            createNode('text', {
              content: 'Ano',
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 4
            }),
            createNode('text', {
              content: '2025',
              fontSize: 18,
              fontWeight: '700'
            })
          ])
        ]),
        createNode('richtext', {
          content: `
            <h2>O Desafio</h2>
            <p>Descrição do desafio enfrentado pelo cliente...</p>
            
            <h2>A Solução</h2>
            <p>Como resolvemos o problema...</p>
            
            <h2>Resultados</h2>
            <p>Resultados alcançados com o projeto...</p>
          `,
          padding: 0
        })
      ])
    ]
  ),

  // ============================================================================
  // COMPONENTS (Headers, Footers, etc) (12 templates)
  // ============================================================================

  createTemplate(
    'Header Moderno',
    'Cabeçalho com navegação e CTA',
    'header',
    'components',
    ['header', 'navegacao', 'menu'],
    [
      createNode('header', { className: 'bg-white border-b sticky top-0 z-50' }, [
        createNode('container', { className: 'max-w-7xl mx-auto px-4 py-4 flex items-center justify-between' }, [
          createNode('heading', {
            content: 'Logo',
            level: 'h1',
            fontSize: 24,
            fontWeight: '900',
            color: '#3b82f6'
          }),
          createNode('container', { className: 'flex items-center gap-8' }, [
            createNode('text', { content: 'Home', fontSize: 16, fontWeight: '600', className: 'hover:text-blue-600 cursor-pointer' }),
            createNode('text', { content: 'Sobre', fontSize: 16, fontWeight: '600', className: 'hover:text-blue-600 cursor-pointer' }),
            createNode('text', { content: 'Serviços', fontSize: 16, fontWeight: '600', className: 'hover:text-blue-600 cursor-pointer' }),
            createNode('text', { content: 'Contato', fontSize: 16, fontWeight: '600', className: 'hover:text-blue-600 cursor-pointer' })
          ]),
          createNode('button', {
            text: 'Começar',
            variant: 'primary',
            backgroundColor: '#3b82f6'
          })
        ])
      ])
    ]
  ),

  createTemplate(
    'Footer Completo',
    'Rodapé com links e informações',
    'footer',
    'components',
    ['footer', 'rodape', 'links'],
    [
      createNode('footer', { className: 'bg-gray-900 text-white py-16 px-4' }, [
        createNode('container', { className: 'max-w-7xl mx-auto' }, [
          createNode('container', { className: 'grid md:grid-cols-4 gap-12 mb-12' }, [
            createNode('container', {}, [
              createNode('heading', {
                content: 'Logo',
                level: 'h3',
                fontSize: 24,
                fontWeight: '900',
                color: '#ffffff',
                marginBottom: 16
              }),
              createNode('text', {
                content: 'Transformando ideias em realidade digital desde 2010.',
                fontSize: 14,
                color: '#9ca3af',
                lineHeight: 1.6
              })
            ]),
            createNode('container', {}, [
              createNode('heading', {
                content: 'Empresa',
                level: 'h4',
                fontSize: 16,
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: 12
              }),
              createNode('container', { className: 'space-y-2' }, [
                createNode('text', { content: 'Sobre', fontSize: 14, color: '#9ca3af', className: 'hover:text-white cursor-pointer' }),
                createNode('text', { content: 'Serviços', fontSize: 14, color: '#9ca3af', className: 'hover:text-white cursor-pointer' }),
                createNode('text', { content: 'Portfólio', fontSize: 14, color: '#9ca3af', className: 'hover:text-white cursor-pointer' }),
                createNode('text', { content: 'Contato', fontSize: 14, color: '#9ca3af', className: 'hover:text-white cursor-pointer' })
              ])
            ]),
            createNode('container', {}, [
              createNode('heading', {
                content: 'Suporte',
                level: 'h4',
                fontSize: 16,
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: 12
              }),
              createNode('container', { className: 'space-y-2' }, [
                createNode('text', { content: 'Central de Ajuda', fontSize: 14, color: '#9ca3af', className: 'hover:text-white cursor-pointer' }),
                createNode('text', { content: 'FAQ', fontSize: 14, color: '#9ca3af', className: 'hover:text-white cursor-pointer' }),
                createNode('text', { content: 'Privacidade', fontSize: 14, color: '#9ca3af', className: 'hover:text-white cursor-pointer' }),
                createNode('text', { content: 'Termos', fontSize: 14, color: '#9ca3af', className: 'hover:text-white cursor-pointer' })
              ])
            ]),
            createNode('container', {}, [
              createNode('heading', {
                content: 'Newsletter',
                level: 'h4',
                fontSize: 16,
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: 12
              }),
              createNode('input', {
                placeholder: 'Seu e-mail',
                type: 'email',
                className: 'mb-2'
              }),
              createNode('button', {
                text: 'Inscrever',
                variant: 'primary',
                fullWidth: true,
                backgroundColor: '#3b82f6'
              })
            ])
          ]),
          createNode('container', { className: 'border-t border-gray-800 pt-8 flex justify-between items-center' }, [
            createNode('text', {
              content: '© 2025 Empresa. Todos os direitos reservados.',
              fontSize: 14,
              color: '#6b7280'
            }),
            createNode('container', { className: 'flex gap-4' }, [
              createNode('text', { content: 'f', fontSize: 16, color: '#9ca3af', className: 'hover:text-white cursor-pointer' }),
              createNode('text', { content: 'in', fontSize: 14, color: '#9ca3af', className: 'hover:text-white cursor-pointer' }),
              createNode('text', { content: 'X', fontSize: 16, color: '#9ca3af', className: 'hover:text-white cursor-pointer' })
            ])
          ])
        ])
      ])
    ]
  ),

  // Continue com mais componentes reutilizáveis...

  createTemplate(
    'CTA Box com Gradiente',
    'Call-to-action destacado com gradiente',
    'section',
    'components',
    ['cta', 'box', 'destaque'],
    [
      createNode('section', { className: 'py-16 px-4' }, [
        createNode('container', { className: 'max-w-4xl mx-auto bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-12 text-center text-white' }, [
          createNode('heading', {
            content: 'Pronto Para Decolar?',
            level: 'h2',
            fontSize: 40,
            fontWeight: '900',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'Comece hoje e veja resultados em 30 dias ou seu dinheiro de volta',
            fontSize: 20,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 32
          }),
          createNode('button', {
            text: 'Comece Grátis',
            variant: 'primary',
            size: 'large',
            backgroundColor: '#ffffff',
            textColor: '#dc2626'
          })
        ])
      ])
    ]
  ),

  createTemplate(
    'Newsletter Signup',
    'Seção de cadastro para newsletter',
    'section',
    'components',
    ['newsletter', 'email', 'signup'],
    [
      createNode('section', { className: 'py-16 px-4 bg-blue-50' }, [
        createNode('container', { className: 'max-w-2xl mx-auto text-center' }, [
          createNode('heading', {
            content: '📬 Receba Nossas Novidades',
            level: 'h2',
            fontSize: 36,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'Dicas, tutoriais e ofertas exclusivas direto no seu email',
            fontSize: 18,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 32
          }),
          createNode('container', { className: 'flex gap-3 max-w-md mx-auto' }, [
            createNode('input', {
              placeholder: 'seu@email.com',
              type: 'email',
              className: 'flex-1'
            }),
            createNode('button', {
              text: 'Inscrever',
              variant: 'primary',
              backgroundColor: '#3b82f6'
            })
          ]),
          createNode('text', {
            content: '✓ Sem spam  •  ✓ Cancele quando quiser',
            fontSize: 12,
            color: '#9ca3af',
            textAlign: 'center',
            marginTop: 12
          })
        ])
      ])
    ]
  ),

  createTemplate(
    'Grid de Recursos',
    'Grade 2x2 com ícones e descrições',
    'section',
    'components',
    ['features', 'grid', 'recursos'],
    [
      createNode('section', { className: 'py-16 px-4' }, [
        createNode('container', { className: 'max-w-5xl mx-auto grid md:grid-cols-2 gap-8' }, [
          createNode('container', { className: 'flex gap-4' }, [
            createNode('container', { className: 'w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl' }, [
              createNode('text', { content: '⚡', fontSize: 24 })
            ]),
            createNode('container', {}, [
              createNode('heading', {
                content: 'Velocidade',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 8
              }),
              createNode('text', {
                content: 'Performance otimizada para carregamento ultra-rápido',
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 1.6
              })
            ])
          ]),
          createNode('container', { className: 'flex gap-4' }, [
            createNode('container', { className: 'w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl' }, [
              createNode('text', { content: '🔒', fontSize: 24 })
            ]),
            createNode('container', {}, [
              createNode('heading', {
                content: 'Segurança',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 8
              }),
              createNode('text', {
                content: 'Proteção avançada com criptografia de ponta a ponta',
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 1.6
              })
            ])
          ]),
          createNode('container', { className: 'flex gap-4' }, [
            createNode('container', { className: 'w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl' }, [
              createNode('text', { content: '📊', fontSize: 24 })
            ]),
            createNode('container', {}, [
              createNode('heading', {
                content: 'Analytics',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 8
              }),
              createNode('text', {
                content: 'Métricas detalhadas para tomar decisões informadas',
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 1.6
              })
            ])
          ]),
          createNode('container', { className: 'flex gap-4' }, [
            createNode('container', { className: 'w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl' }, [
              createNode('text', { content: '🎨', fontSize: 24 })
            ]),
            createNode('container', {}, [
              createNode('heading', {
                content: 'Customização',
                level: 'h3',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 8
              }),
              createNode('text', {
                content: 'Personalize cada detalhe de acordo com sua marca',
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 1.6
              })
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Timeline Vertical',
    'Linha do tempo vertical com marcos',
    'section',
    'components',
    ['timeline', 'historia', 'marcos'],
    [
      createNode('section', { className: 'py-16 px-4 bg-gray-50' }, [
        createNode('container', { className: 'max-w-3xl mx-auto' }, [
          createNode('heading', {
            content: 'Nossa Jornada',
            level: 'h2',
            fontSize: 40,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 48
          }),
          createNode('container', { className: 'space-y-8' }, [
            createNode('container', { className: 'flex gap-6' }, [
              createNode('container', { className: 'flex flex-col items-center' }, [
                createNode('container', { className: 'w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0' }, [
                  createNode('text', { content: '2010', fontSize: 10, fontWeight: '700', color: '#ffffff' })
                ]),
                createNode('container', { className: 'w-0.5 h-full bg-blue-200 flex-1 mt-2' })
              ]),
              createNode('container', { className: 'flex-1 pb-8' }, [
                createNode('heading', {
                  content: 'Fundação',
                  level: 'h3',
                  fontSize: 24,
                  fontWeight: '700',
                  marginBottom: 8
                }),
                createNode('text', {
                  content: 'Início da jornada com uma equipe de 3 pessoas e um grande sonho',
                  fontSize: 14,
                  color: '#6b7280',
                  lineHeight: 1.6
                })
              ])
            ]),
            createNode('container', { className: 'flex gap-6' }, [
              createNode('container', { className: 'flex flex-col items-center' }, [
                createNode('container', { className: 'w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white flex-shrink-0' }, [
                  createNode('text', { content: '2015', fontSize: 10, fontWeight: '700', color: '#ffffff' })
                ]),
                createNode('container', { className: 'w-0.5 h-full bg-green-200 flex-1 mt-2' })
              ]),
              createNode('container', { className: 'flex-1 pb-8' }, [
                createNode('heading', {
                  content: 'Expansão',
                  level: 'h3',
                  fontSize: 24,
                  fontWeight: '700',
                  marginBottom: 8
                }),
                createNode('text', {
                  content: 'Alcançamos 1000 clientes e expandimos para novos mercados',
                  fontSize: 14,
                  color: '#6b7280',
                  lineHeight: 1.6
                })
              ])
            ]),
            createNode('container', { className: 'flex gap-6' }, [
              createNode('container', { className: 'w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0' }, [
                createNode('text', { content: '2025', fontSize: 10, fontWeight: '700', color: '#ffffff' })
              ]),
              createNode('container', { className: 'flex-1' }, [
                createNode('heading', {
                  content: 'Liderança',
                  level: 'h3',
                  fontSize: 24,
                  fontWeight: '700',
                  marginBottom: 8
                }),
                createNode('text', {
                  content: 'Reconhecidos como líderes de mercado com 10K+ clientes ativos',
                  fontSize: 14,
                  color: '#6b7280',
                  lineHeight: 1.6
                })
              ])
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Logos de Clientes',
    'Seção mostrando logos de clientes/parceiros',
    'section',
    'components',
    ['logos', 'clientes', 'parceiros'],
    [
      createNode('section', { className: 'py-16 px-4 bg-white' }, [
        createNode('container', { className: 'max-w-6xl mx-auto' }, [
          createNode('heading', {
            content: 'Empresas que Confiam em Nós',
            level: 'h2',
            fontSize: 32,
            fontWeight: '700',
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: 48
          }),
          createNode('container', { className: 'grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60' }, [
            createNode('container', { className: 'h-20 bg-gray-200 rounded-lg flex items-center justify-center' }, [
              createNode('text', { content: 'LOGO 1', fontSize: 16, fontWeight: '700', color: '#9ca3af' })
            ]),
            createNode('container', { className: 'h-20 bg-gray-200 rounded-lg flex items-center justify-center' }, [
              createNode('text', { content: 'LOGO 2', fontSize: 16, fontWeight: '700', color: '#9ca3af' })
            ]),
            createNode('container', { className: 'h-20 bg-gray-200 rounded-lg flex items-center justify-center' }, [
              createNode('text', { content: 'LOGO 3', fontSize: 16, fontWeight: '700', color: '#9ca3af' })
            ]),
            createNode('container', { className: 'h-20 bg-gray-200 rounded-lg flex items-center justify-center' }, [
              createNode('text', { content: 'LOGO 4', fontSize: 16, fontWeight: '700', color: '#9ca3af' })
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Countdown Timer',
    'Temporizador para ofertas limitadas',
    'section',
    'components',
    ['countdown', 'timer', 'urgencia'],
    [
      createNode('section', { className: 'py-16 px-4 bg-gradient-to-r from-red-600 to-orange-600' }, [
        createNode('container', { className: 'max-w-4xl mx-auto text-center' }, [
          createNode('heading', {
            content: '⚡ Oferta Limitada!',
            level: 'h2',
            fontSize: 40,
            fontWeight: '900',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 16
          }),
          createNode('text', {
            content: 'Aproveite 50% OFF até o fim da promoção',
            fontSize: 20,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 32
          }),
          createNode('container', { className: 'grid grid-cols-4 gap-4 max-w-lg mx-auto mb-8' }, [
            createNode('container', { className: 'bg-white/10 backdrop-blur rounded-lg p-4' }, [
              createNode('text', {
                content: '23',
                fontSize: 40,
                fontWeight: '900',
                color: '#ffffff',
                textAlign: 'center'
              }),
              createNode('text', {
                content: 'Dias',
                fontSize: 12,
                color: '#ffffff',
                textAlign: 'center'
              })
            ]),
            createNode('container', { className: 'bg-white/10 backdrop-blur rounded-lg p-4' }, [
              createNode('text', {
                content: '14',
                fontSize: 40,
                fontWeight: '900',
                color: '#ffffff',
                textAlign: 'center'
              }),
              createNode('text', {
                content: 'Horas',
                fontSize: 12,
                color: '#ffffff',
                textAlign: 'center'
              })
            ]),
            createNode('container', { className: 'bg-white/10 backdrop-blur rounded-lg p-4' }, [
              createNode('text', {
                content: '35',
                fontSize: 40,
                fontWeight: '900',
                color: '#ffffff',
                textAlign: 'center'
              }),
              createNode('text', {
                content: 'Min',
                fontSize: 12,
                color: '#ffffff',
                textAlign: 'center'
              })
            ]),
            createNode('container', { className: 'bg-white/10 backdrop-blur rounded-lg p-4' }, [
              createNode('text', {
                content: '42',
                fontSize: 40,
                fontWeight: '900',
                color: '#ffffff',
                textAlign: 'center'
              }),
              createNode('text', {
                content: 'Seg',
                fontSize: 12,
                color: '#ffffff',
                textAlign: 'center'
              })
            ])
          ]),
          createNode('button', {
            text: 'Garantir Desconto Agora',
            variant: 'primary',
            size: 'large',
            backgroundColor: '#ffffff',
            textColor: '#dc2626'
          })
        ])
      ])
    ]
  ),

  createTemplate(
    'Video Hero',
    'Hero section com vídeo embed',
    'section',
    'components',
    ['video', 'hero', 'media'],
    [
      createNode('section', { className: 'relative h-screen flex items-center justify-center overflow-hidden bg-black' }, [
        createNode('container', { className: 'absolute inset-0 bg-black/60 z-10' }),
        createNode('container', { className: 'relative z-20 max-w-4xl mx-auto text-center px-4' }, [
          createNode('heading', {
            content: 'Veja Como Funciona',
            level: 'h1',
            fontSize: 64,
            fontWeight: '900',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 24
          }),
          createNode('text', {
            content: 'Uma demonstração rápida de 2 minutos',
            fontSize: 24,
            color: '#e0e7ff',
            textAlign: 'center',
            marginBottom: 48
          }),
          createNode('button', {
            text: '▶️ Assistir Vídeo',
            variant: 'primary',
            size: 'large',
            backgroundColor: '#3b82f6'
          })
        ])
      ])
    ]
  ),

  createTemplate(
    'Barra de Progresso',
    'Indicadores de progresso e estatísticas',
    'section',
    'components',
    ['progress', 'stats', 'skills'],
    [
      createNode('section', { className: 'py-16 px-4' }, [
        createNode('container', { className: 'max-w-3xl mx-auto' }, [
          createNode('heading', {
            content: 'Nossas Especialidades',
            level: 'h2',
            fontSize: 36,
            fontWeight: '800',
            marginBottom: 48
          }),
          createNode('container', { className: 'space-y-8' }, [
            createNode('container', {}, [
              createNode('container', { className: 'flex justify-between mb-2' }, [
                createNode('text', { content: 'Web Development', fontSize: 16, fontWeight: '600' }),
                createNode('text', { content: '95%', fontSize: 16, fontWeight: '700', color: '#3b82f6' })
              ]),
              createNode('container', { className: 'h-3 bg-gray-200 rounded-full overflow-hidden' }, [
                createNode('container', { className: 'h-full bg-blue-600 rounded-full', styles: { width: '95%' } })
              ])
            ]),
            createNode('container', {}, [
              createNode('container', { className: 'flex justify-between mb-2' }, [
                createNode('text', { content: 'UI/UX Design', fontSize: 16, fontWeight: '600' }),
                createNode('text', { content: '90%', fontSize: 16, fontWeight: '700', color: '#10b981' })
              ]),
              createNode('container', { className: 'h-3 bg-gray-200 rounded-full overflow-hidden' }, [
                createNode('container', { className: 'h-full bg-green-600 rounded-full', styles: { width: '90%' } })
              ])
            ]),
            createNode('container', {}, [
              createNode('container', { className: 'flex justify-between mb-2' }, [
                createNode('text', { content: 'Marketing Digital', fontSize: 16, fontWeight: '600' }),
                createNode('text', { content: '85%', fontSize: 16, fontWeight: '700', color: '#f59e0b' })
              ]),
              createNode('container', { className: 'h-3 bg-gray-200 rounded-full overflow-hidden' }, [
                createNode('container', { className: 'h-full bg-orange-600 rounded-full', styles: { width: '85%' } })
              ])
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Comparação Antes/Depois',
    'Mostrar transformação ou resultados',
    'section',
    'components',
    ['antes-depois', 'comparacao', 'resultados'],
    [
      createNode('section', { className: 'py-16 px-4' }, [
        createNode('container', { className: 'max-w-5xl mx-auto' }, [
          createNode('heading', {
            content: 'A Transformação que Você Merece',
            level: 'h2',
            fontSize: 40,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 48
          }),
          createNode('container', { className: 'grid md:grid-cols-2 gap-8' }, [
            createNode('container', { className: 'relative' }, [
              createNode('badge', {
                text: 'ANTES',
                className: 'absolute top-4 left-4 z-10 bg-red-500 text-white'
              }),
              createNode('container', { className: 'aspect-square bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl' })
            ]),
            createNode('container', { className: 'relative' }, [
              createNode('badge', {
                text: 'DEPOIS',
                className: 'absolute top-4 left-4 z-10 bg-green-500 text-white'
              }),
              createNode('container', { className: 'aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl' })
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Tabela de Características',
    'Comparação de planos ou features',
    'section',
    'components',
    ['tabela', 'features', 'comparacao'],
    [
      createNode('section', { className: 'py-16 px-4 bg-gray-50' }, [
        createNode('container', { className: 'max-w-5xl mx-auto' }, [
          createNode('heading', {
            content: 'Compare os Planos',
            level: 'h2',
            fontSize: 40,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 48
          }),
          createNode('container', { className: 'bg-white rounded-xl shadow-lg overflow-hidden' }, [
            createNode('container', { className: 'grid md:grid-cols-3 divide-x' }, [
              createNode('container', { className: 'p-6' }, [
                createNode('heading', {
                  content: 'Básico',
                  level: 'h3',
                  fontSize: 24,
                  fontWeight: '700',
                  textAlign: 'center',
                  marginBottom: 16
                }),
                createNode('container', { className: 'space-y-3' }, [
                  createNode('text', { content: '✓ 10 projetos', fontSize: 14 }),
                  createNode('text', { content: '✓ 5 GB storage', fontSize: 14 }),
                  createNode('text', { content: '✓ Email support', fontSize: 14 }),
                  createNode('text', { content: '✗ Priority support', fontSize: 14, color: '#9ca3af' })
                ])
              ]),
              createNode('container', { className: 'p-6 bg-blue-50' }, [
                createNode('heading', {
                  content: 'Pro',
                  level: 'h3',
                  fontSize: 24,
                  fontWeight: '700',
                  textAlign: 'center',
                  color: '#3b82f6',
                  marginBottom: 16
                }),
                createNode('container', { className: 'space-y-3' }, [
                  createNode('text', { content: '✓ Unlimited projects', fontSize: 14 }),
                  createNode('text', { content: '✓ 50 GB storage', fontSize: 14 }),
                  createNode('text', { content: '✓ Priority support', fontSize: 14 }),
                  createNode('text', { content: '✓ Advanced features', fontSize: 14 })
                ])
              ]),
              createNode('container', { className: 'p-6' }, [
                createNode('heading', {
                  content: 'Enterprise',
                  level: 'h3',
                  fontSize: 24,
                  fontWeight: '700',
                  textAlign: 'center',
                  marginBottom: 16
                }),
                createNode('container', { className: 'space-y-3' }, [
                  createNode('text', { content: '✓ Everything in Pro', fontSize: 14 }),
                  createNode('text', { content: '✓ 500 GB storage', fontSize: 14 }),
                  createNode('text', { content: '✓ 24/7 support', fontSize: 14 }),
                  createNode('text', { content: '✓ Custom solutions', fontSize: 14 })
                ])
              ])
            ])
          ])
        ])
      ])
    ]
  ),

  createTemplate(
    'Citação Destacada',
    'Blockquote estilizado para depoimento',
    'section',
    'components',
    ['quote', 'citacao', 'depoimento'],
    [
      createNode('section', { className: 'py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50' }, [
        createNode('container', { className: 'max-w-4xl mx-auto' }, [
          createNode('container', { className: 'text-center' }, [
            createNode('text', {
              content: '"',
              fontSize: 120,
              fontWeight: '900',
              color: '#e0e7ff',
              lineHeight: 1
            }),
            createNode('text', {
              content: 'Este produto transformou completamente a forma como nossa empresa opera. Não consigo imaginar voltar aos métodos antigos.',
              fontSize: 28,
              fontWeight: '600',
              color: '#1f2937',
              textAlign: 'center',
              lineHeight: 1.6,
              marginBottom: 32,
              className: 'italic'
            }),
            createNode('container', { className: 'flex items-center justify-center gap-4' }, [
              createNode('container', { className: 'w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full' }),
              createNode('container', { className: 'text-left' }, [
                createNode('text', {
                  content: 'Maria Silva',
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#1f2937'
                }),
                createNode('text', {
                  content: 'CEO, TechCorp',
                  fontSize: 14,
                  color: '#6b7280'
                })
              ])
            ])
          ])
        ])
      ])
    ]
  )

];

/**
 * Função para inicializar templates padrão no localStorage
 */
export function initializeDefaultTemplates(): void {
  const stored = localStorage.getItem('hierarchical_templates');
  
  // Se já existem templates, não sobrescrever
  if (stored) {
    const existing = JSON.parse(stored);
    if (existing.length > 0) {
      console.log('Templates já inicializados');
      return;
    }
  }
  
  // Salvar templates padrão
  localStorage.setItem('hierarchical_templates', JSON.stringify(defaultTemplates));
  console.log(`${defaultTemplates.length} templates padrão inicializados`);
}
