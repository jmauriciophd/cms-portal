/**
 * Templates Pré-montados com Hierarquia
 * Exemplos prontos para testar o sistema
 */

import { HierarchicalNode } from '../components/editor/HierarchicalRenderNode';
import { v4 as uuidv4 } from 'uuid';

/**
 * Template: Landing Page Hero
 */
export const heroSectionTemplate: HierarchicalNode = {
  id: uuidv4(),
  type: 'section',
  props: { id: 'hero' },
  styles: {
    padding: '4rem 2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    minHeight: '500px',
    display: 'flex',
    alignItems: 'center'
  },
  children: [
    {
      id: uuidv4(),
      type: 'container',
      styles: {
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      },
      children: [
        {
          id: uuidv4(),
          type: 'heading',
          props: {
            tag: 'h1',
            text: 'Bem-vindo ao Futuro'
          },
          styles: {
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }
        },
        {
          id: uuidv4(),
          type: 'paragraph',
          props: {
            text: 'Construa páginas incríveis com nosso editor visual de arrastar e soltar'
          },
          styles: {
            fontSize: '1.25rem',
            marginBottom: '2rem',
            opacity: '0.9'
          }
        },
        {
          id: uuidv4(),
          type: 'flexbox',
          props: {
            justifyContent: 'center',
            gap: '1rem'
          },
          children: [
            {
              id: uuidv4(),
              type: 'button',
              props: {
                text: 'Começar Agora',
                buttonType: 'button'
              },
              styles: {
                padding: '1rem 2rem',
                background: '#ffffff',
                color: '#667eea',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }
            },
            {
              id: uuidv4(),
              type: 'button',
              props: {
                text: 'Saiba Mais',
                buttonType: 'button'
              },
              styles: {
                padding: '1rem 2rem',
                background: 'transparent',
                color: '#ffffff',
                border: '2px solid #ffffff',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Template: Grid de Features com Cards
 */
export const featuresGridTemplate: HierarchicalNode = {
  id: uuidv4(),
  type: 'section',
  props: { id: 'features' },
  styles: {
    padding: '4rem 2rem',
    background: '#f7fafc'
  },
  children: [
    {
      id: uuidv4(),
      type: 'container',
      styles: {
        maxWidth: '1200px',
        margin: '0 auto'
      },
      children: [
        {
          id: uuidv4(),
          type: 'heading',
          props: {
            tag: 'h2',
            text: 'Recursos Poderosos'
          },
          styles: {
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '3rem'
          }
        },
        {
          id: uuidv4(),
          type: 'grid',
          props: {
            columns: 'repeat(3, 1fr)',
            gap: '2rem'
          },
          children: [
            {
              id: uuidv4(),
              type: 'card',
              styles: {
                padding: '2rem',
                background: '#ffffff',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              },
              children: [
                {
                  id: uuidv4(),
                  type: 'heading',
                  props: {
                    tag: 'h3',
                    text: '🚀 Rápido'
                  },
                  styles: {
                    marginBottom: '1rem'
                  }
                },
                {
                  id: uuidv4(),
                  type: 'paragraph',
                  props: {
                    text: 'Editor visual de alta performance com drag & drop fluido'
                  }
                }
              ]
            },
            {
              id: uuidv4(),
              type: 'card',
              styles: {
                padding: '2rem',
                background: '#ffffff',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              },
              children: [
                {
                  id: uuidv4(),
                  type: 'heading',
                  props: {
                    tag: 'h3',
                    text: '🎨 Flexível'
                  },
                  styles: {
                    marginBottom: '1rem'
                  }
                },
                {
                  id: uuidv4(),
                  type: 'paragraph',
                  props: {
                    text: '50+ componentes prontos para usar e personalizar'
                  }
                }
              ]
            },
            {
              id: uuidv4(),
              type: 'card',
              styles: {
                padding: '2rem',
                background: '#ffffff',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              },
              children: [
                {
                  id: uuidv4(),
                  type: 'heading',
                  props: {
                    tag: 'h3',
                    text: '🔒 Seguro'
                  },
                  styles: {
                    marginBottom: '1rem'
                  }
                },
                {
                  id: uuidv4(),
                  type: 'paragraph',
                  props: {
                    text: 'Validação completa de hierarquia e prevenção de erros'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Template: Accordion FAQ
 */
export const faqAccordionTemplate: HierarchicalNode = {
  id: uuidv4(),
  type: 'section',
  props: { id: 'faq' },
  styles: {
    padding: '4rem 2rem',
    background: '#ffffff'
  },
  children: [
    {
      id: uuidv4(),
      type: 'container',
      styles: {
        maxWidth: '800px',
        margin: '0 auto'
      },
      children: [
        {
          id: uuidv4(),
          type: 'heading',
          props: {
            tag: 'h2',
            text: 'Perguntas Frequentes'
          },
          styles: {
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '3rem'
          }
        },
        {
          id: uuidv4(),
          type: 'accordion',
          children: [
            {
              id: uuidv4(),
              type: 'accordionItem',
              props: {
                title: 'Como funciona o sistema de hierarquia?'
              },
              slots: {
                content: [
                  {
                    id: uuidv4(),
                    type: 'paragraph',
                    props: {
                      text: 'O sistema permite que containers aceitem componentes filhos, criando uma estrutura aninhada. Cada componente pode ter suas próprias validações de tipos aceitos.'
                    }
                  }
                ]
              }
            },
            {
              id: uuidv4(),
              type: 'accordionItem',
              props: {
                title: 'Posso arrastar componentes para dentro de outros?'
              },
              slots: {
                content: [
                  {
                    id: uuidv4(),
                    type: 'paragraph',
                    props: {
                      text: 'Sim! Arraste componentes da biblioteca para dentro de containers como section, div, grid, card, etc. O sistema valida automaticamente se o componente pode ser adicionado.'
                    }
                  }
                ]
              }
            },
            {
              id: uuidv4(),
              type: 'accordionItem',
              props: {
                title: 'Existe limite de aninhamento?'
              },
              slots: {
                content: [
                  {
                    id: uuidv4(),
                    type: 'paragraph',
                    props: {
                      text: 'Não há limite técnico, mas recomendamos manter a estrutura organizada e não muito profunda para melhor performance e manutenibilidade.'
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Template: 2 Colunas com Conteúdo
 */
export const twoColumnsTemplate: HierarchicalNode = {
  id: uuidv4(),
  type: 'section',
  props: { id: 'content' },
  styles: {
    padding: '4rem 2rem'
  },
  children: [
    {
      id: uuidv4(),
      type: 'container',
      styles: {
        maxWidth: '1200px',
        margin: '0 auto'
      },
      children: [
        {
          id: uuidv4(),
          type: 'columns',
          props: {
            gap: '3rem'
          },
          children: [
            {
              id: uuidv4(),
              type: 'column',
              children: [
                {
                  id: uuidv4(),
                  type: 'heading',
                  props: {
                    tag: 'h2',
                    text: 'Sobre Nós'
                  },
                  styles: {
                    marginBottom: '1rem'
                  }
                },
                {
                  id: uuidv4(),
                  type: 'paragraph',
                  props: {
                    text: 'Somos uma empresa dedicada a criar as melhores ferramentas de desenvolvimento web. Nossa missão é tornar a criação de websites acessível a todos.'
                  },
                  styles: {
                    marginBottom: '1rem'
                  }
                },
                {
                  id: uuidv4(),
                  type: 'paragraph',
                  props: {
                    text: 'Com anos de experiência no mercado, desenvolvemos soluções inovadoras que combinam poder e simplicidade.'
                  }
                }
              ]
            },
            {
              id: uuidv4(),
              type: 'column',
              children: [
                {
                  id: uuidv4(),
                  type: 'image',
                  props: {
                    src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
                    alt: 'Equipe trabalhando'
                  },
                  styles: {
                    width: '100%',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Template: Formulário de Contato
 */
export const contactFormTemplate: HierarchicalNode = {
  id: uuidv4(),
  type: 'section',
  props: { id: 'contact' },
  styles: {
    padding: '4rem 2rem',
    background: '#f7fafc'
  },
  children: [
    {
      id: uuidv4(),
      type: 'container',
      styles: {
        maxWidth: '600px',
        margin: '0 auto'
      },
      children: [
        {
          id: uuidv4(),
          type: 'heading',
          props: {
            tag: 'h2',
            text: 'Entre em Contato'
          },
          styles: {
            textAlign: 'center',
            marginBottom: '2rem'
          }
        },
        {
          id: uuidv4(),
          type: 'form',
          props: {
            method: 'POST',
            action: '/api/contact'
          },
          styles: {
            background: '#ffffff',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          },
          children: [
            {
              id: uuidv4(),
              type: 'formGroup',
              children: [
                {
                  id: uuidv4(),
                  type: 'label',
                  content: 'Nome',
                  styles: {
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }
                },
                {
                  id: uuidv4(),
                  type: 'input',
                  props: {
                    inputType: 'text',
                    placeholder: 'Seu nome completo'
                  },
                  styles: {
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem'
                  }
                }
              ]
            },
            {
              id: uuidv4(),
              type: 'formGroup',
              children: [
                {
                  id: uuidv4(),
                  type: 'label',
                  content: 'Email',
                  styles: {
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }
                },
                {
                  id: uuidv4(),
                  type: 'input',
                  props: {
                    inputType: 'email',
                    placeholder: 'seu@email.com'
                  },
                  styles: {
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem'
                  }
                }
              ]
            },
            {
              id: uuidv4(),
              type: 'formGroup',
              children: [
                {
                  id: uuidv4(),
                  type: 'label',
                  content: 'Mensagem',
                  styles: {
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }
                },
                {
                  id: uuidv4(),
                  type: 'textarea',
                  props: {
                    placeholder: 'Sua mensagem...',
                    rows: 5
                  },
                  styles: {
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem'
                  }
                }
              ]
            },
            {
              id: uuidv4(),
              type: 'button',
              props: {
                text: 'Enviar Mensagem',
                buttonType: 'submit'
              },
              styles: {
                width: '100%',
                padding: '0.75rem 2rem',
                background: '#667eea',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Template: Landing Page Completa
 */
export const fullLandingPageTemplate: HierarchicalNode[] = [
  heroSectionTemplate,
  featuresGridTemplate,
  twoColumnsTemplate,
  faqAccordionTemplate,
  contactFormTemplate
];

/**
 * Exportar todos os templates
 */
export const hierarchicalTemplates = {
  hero: heroSectionTemplate,
  features: featuresGridTemplate,
  faq: faqAccordionTemplate,
  twoColumns: twoColumnsTemplate,
  contactForm: contactFormTemplate,
  fullPage: fullLandingPageTemplate
};
