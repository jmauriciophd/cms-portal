// Component Property Schemas para o Page Builder
// Define as propriedades editáveis de cada tipo de componente

export interface PropertyField {
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'color' | 'range' | 'checkbox' | 'image' | 'richtext' | 'spacing' | 'url';
  section: 'content' | 'style' | 'settings';
  defaultValue?: any;
  options?: string[] | { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  description?: string;
}

export type ComponentSchema = {
  [key: string]: PropertyField;
};

export const componentSchemas: { [componentType: string]: ComponentSchema } = {
  // TEXT COMPONENT
  text: {
    content: { 
      label: "Texto", 
      type: "richtext", 
      section: "content",
      defaultValue: "Digite seu texto aqui...",
      placeholder: "Insira o conteúdo do texto"
    },
    tag: { 
      label: "Tag HTML", 
      type: "select", 
      section: "content",
      options: [
        { value: "p", label: "Parágrafo (p)" },
        { value: "h1", label: "Título 1 (h1)" },
        { value: "h2", label: "Título 2 (h2)" },
        { value: "h3", label: "Título 3 (h3)" },
        { value: "h4", label: "Título 4 (h4)" },
        { value: "span", label: "Span" },
        { value: "div", label: "Div" }
      ],
      defaultValue: "p"
    },
    // Estilos - Tipografia
    fontSize: { 
      label: "Tamanho da Fonte", 
      type: "range", 
      section: "style",
      min: 10,
      max: 100,
      step: 1,
      unit: "px",
      defaultValue: 16
    },
    fontWeight: { 
      label: "Peso da Fonte", 
      type: "select", 
      section: "style",
      options: [
        { value: "300", label: "Leve (300)" },
        { value: "400", label: "Normal (400)" },
        { value: "500", label: "Médio (500)" },
        { value: "600", label: "Semi-negrito (600)" },
        { value: "700", label: "Negrito (700)" },
        { value: "800", label: "Extra-negrito (800)" }
      ],
      defaultValue: "400"
    },
    color: { 
      label: "Cor do Texto", 
      type: "color", 
      section: "style",
      defaultValue: "#000000"
    },
    lineHeight: { 
      label: "Altura da Linha", 
      type: "range", 
      section: "style",
      min: 1,
      max: 3,
      step: 0.1,
      defaultValue: 1.5
    },
    textAlign: { 
      label: "Alinhamento", 
      type: "select", 
      section: "style",
      options: ["left", "center", "right", "justify"],
      defaultValue: "left"
    },
    // Estilos - Espaçamento
    marginTop: { label: "Margem Superior", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 0 },
    marginRight: { label: "Margem Direita", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 0 },
    marginBottom: { label: "Margem Inferior", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 0 },
    marginLeft: { label: "Margem Esquerda", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 0 },
    paddingTop: { label: "Padding Superior", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 0 },
    paddingRight: { label: "Padding Direita", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 0 },
    paddingBottom: { label: "Padding Inferior", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 0 },
    paddingLeft: { label: "Padding Esquerda", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 0 },
    // Estilos - Background e Borda
    backgroundColor: { label: "Cor de Fundo", type: "color", section: "style", defaultValue: "transparent" },
    borderRadius: { label: "Borda Arredondada", type: "range", section: "style", min: 0, max: 50, unit: "px", defaultValue: 0 },
    borderWidth: { label: "Largura da Borda", type: "range", section: "style", min: 0, max: 10, unit: "px", defaultValue: 0 },
    borderColor: { label: "Cor da Borda", type: "color", section: "style", defaultValue: "#000000" },
    // Configurações
    id: { label: "ID do Elemento", type: "text", section: "settings", placeholder: "ex: meu-texto" },
    className: { label: "Classes CSS", type: "text", section: "settings", placeholder: "ex: destaque importante" },
    ariaLabel: { label: "ARIA Label", type: "text", section: "settings", description: "Para acessibilidade" },
  },

  // BUTTON COMPONENT
  button: {
    label: { 
      label: "Texto do Botão", 
      type: "text", 
      section: "content",
      defaultValue: "Clique aqui",
      placeholder: "Digite o texto"
    },
    url: { 
      label: "URL de Destino", 
      type: "url", 
      section: "content",
      placeholder: "https://exemplo.com"
    },
    target: { 
      label: "Abrir em Nova Aba", 
      type: "checkbox", 
      section: "content",
      defaultValue: false
    },
    variant: { 
      label: "Variante", 
      type: "select", 
      section: "content",
      options: [
        { value: "default", label: "Padrão" },
        { value: "outline", label: "Outline" },
        { value: "ghost", label: "Ghost" },
        { value: "link", label: "Link" }
      ],
      defaultValue: "default"
    },
    // Estilos
    backgroundColor: { label: "Cor de Fundo", type: "color", section: "style", defaultValue: "#3b82f6" },
    color: { label: "Cor do Texto", type: "color", section: "style", defaultValue: "#ffffff" },
    fontSize: { label: "Tamanho da Fonte", type: "range", section: "style", min: 10, max: 30, unit: "px", defaultValue: 16 },
    fontWeight: { label: "Peso da Fonte", type: "select", section: "style", options: ["400", "500", "600", "700"], defaultValue: "500" },
    borderRadius: { label: "Borda Arredondada", type: "range", section: "style", min: 0, max: 50, unit: "px", defaultValue: 6 },
    paddingX: { label: "Padding Horizontal", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 24 },
    paddingY: { label: "Padding Vertical", type: "range", section: "style", min: 0, max: 50, unit: "px", defaultValue: 12 },
    // Configurações
    id: { label: "ID do Elemento", type: "text", section: "settings" },
    className: { label: "Classes CSS", type: "text", section: "settings" },
    ariaLabel: { label: "ARIA Label", type: "text", section: "settings" },
  },

  // IMAGE COMPONENT
  image: {
    src: { 
      label: "URL da Imagem", 
      type: "image", 
      section: "content",
      placeholder: "Cole a URL ou faça upload"
    },
    alt: { 
      label: "Texto Alternativo", 
      type: "text", 
      section: "content",
      placeholder: "Descrição da imagem",
      description: "Importante para SEO e acessibilidade"
    },
    width: { 
      label: "Largura", 
      type: "range", 
      section: "style",
      min: 50,
      max: 1200,
      unit: "px",
      defaultValue: 400
    },
    height: { 
      label: "Altura", 
      type: "range", 
      section: "style",
      min: 50,
      max: 800,
      unit: "px",
      defaultValue: 300
    },
    objectFit: { 
      label: "Ajuste da Imagem", 
      type: "select", 
      section: "style",
      options: [
        { value: "cover", label: "Cobrir (cover)" },
        { value: "contain", label: "Conter (contain)" },
        { value: "fill", label: "Preencher (fill)" },
        { value: "none", label: "Nenhum" }
      ],
      defaultValue: "cover"
    },
    borderRadius: { label: "Borda Arredondada", type: "range", section: "style", min: 0, max: 50, unit: "px", defaultValue: 0 },
    // Configurações
    id: { label: "ID do Elemento", type: "text", section: "settings" },
    className: { label: "Classes CSS", type: "text", section: "settings" },
  },

  // CONTAINER COMPONENT
  container: {
    direction: { 
      label: "Direção", 
      type: "select", 
      section: "content",
      options: [
        { value: "row", label: "Horizontal (row)" },
        { value: "column", label: "Vertical (column)" }
      ],
      defaultValue: "row"
    },
    gap: { 
      label: "Espaçamento entre Itens", 
      type: "range", 
      section: "content",
      min: 0,
      max: 100,
      unit: "px",
      defaultValue: 16
    },
    justifyContent: { 
      label: "Justificar Conteúdo", 
      type: "select", 
      section: "content",
      options: [
        { value: "flex-start", label: "Início" },
        { value: "center", label: "Centro" },
        { value: "flex-end", label: "Fim" },
        { value: "space-between", label: "Espaçamento Entre" },
        { value: "space-around", label: "Espaçamento Ao Redor" }
      ],
      defaultValue: "flex-start"
    },
    alignItems: { 
      label: "Alinhar Itens", 
      type: "select", 
      section: "content",
      options: [
        { value: "flex-start", label: "Início" },
        { value: "center", label: "Centro" },
        { value: "flex-end", label: "Fim" },
        { value: "stretch", label: "Esticar" }
      ],
      defaultValue: "flex-start"
    },
    // Estilos
    backgroundColor: { label: "Cor de Fundo", type: "color", section: "style", defaultValue: "transparent" },
    borderRadius: { label: "Borda Arredondada", type: "range", section: "style", min: 0, max: 50, unit: "px", defaultValue: 0 },
    borderWidth: { label: "Largura da Borda", type: "range", section: "style", min: 0, max: 10, unit: "px", defaultValue: 0 },
    borderColor: { label: "Cor da Borda", type: "color", section: "style", defaultValue: "#e5e7eb" },
    padding: { label: "Padding", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 16 },
    margin: { label: "Margem", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 0 },
    minHeight: { label: "Altura Mínima", type: "range", section: "style", min: 0, max: 800, unit: "px", defaultValue: 0 },
    // Configurações
    id: { label: "ID do Elemento", type: "text", section: "settings" },
    className: { label: "Classes CSS", type: "text", section: "settings" },
  },

  // HEADING COMPONENT
  heading: {
    content: { 
      label: "Texto do Título", 
      type: "textarea", 
      section: "content",
      defaultValue: "Título da Seção",
      placeholder: "Digite o título"
    },
    level: { 
      label: "Nível do Título", 
      type: "select", 
      section: "content",
      options: [
        { value: "h1", label: "H1 - Título Principal" },
        { value: "h2", label: "H2 - Subtítulo" },
        { value: "h3", label: "H3 - Seção" },
        { value: "h4", label: "H4 - Subseção" },
        { value: "h5", label: "H5" },
        { value: "h6", label: "H6" }
      ],
      defaultValue: "h2"
    },
    // Estilos
    fontSize: { label: "Tamanho da Fonte", type: "range", section: "style", min: 16, max: 72, unit: "px", defaultValue: 32 },
    fontWeight: { label: "Peso da Fonte", type: "select", section: "style", options: ["400", "500", "600", "700", "800"], defaultValue: "700" },
    color: { label: "Cor do Texto", type: "color", section: "style", defaultValue: "#1f2937" },
    textAlign: { label: "Alinhamento", type: "select", section: "style", options: ["left", "center", "right"], defaultValue: "left" },
    marginBottom: { label: "Margem Inferior", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 16 },
    // Configurações
    id: { label: "ID do Elemento", type: "text", section: "settings" },
    className: { label: "Classes CSS", type: "text", section: "settings" },
  },

  // RICHTEXT COMPONENT (Para edição de páginas)
  richtext: {
    content: { 
      label: "Conteúdo", 
      type: "richtext", 
      section: "content",
      defaultValue: "<p>Digite seu conteúdo aqui...</p>",
      placeholder: "Insira o conteúdo"
    },
    // Estilos
    backgroundColor: { label: "Cor de Fundo", type: "color", section: "style", defaultValue: "#ffffff" },
    padding: { label: "Padding", type: "range", section: "style", min: 0, max: 100, unit: "px", defaultValue: 20 },
    borderRadius: { label: "Borda Arredondada", type: "range", section: "style", min: 0, max: 20, unit: "px", defaultValue: 4 },
    // Configurações
    id: { label: "ID do Elemento", type: "text", section: "settings" },
    className: { label: "Classes CSS", type: "text", section: "settings" },
  },
};

// Função auxiliar para obter propriedades por seção
export function getPropertiesBySection(componentType: string, section: 'content' | 'style' | 'settings'): ComponentSchema {
  const schema = componentSchemas[componentType];
  if (!schema) return {};
  
  return Object.entries(schema)
    .filter(([_, field]) => field.section === section)
    .reduce((acc, [key, field]) => ({ ...acc, [key]: field }), {});
}

// Função auxiliar para obter valor padrão
export function getDefaultValue(componentType: string, propertyKey: string): any {
  const schema = componentSchemas[componentType];
  if (!schema || !schema[propertyKey]) return undefined;
  return schema[propertyKey].defaultValue;
}

// Função para inicializar componente com valores padrão
export function initializeComponentWithDefaults(componentType: string): Record<string, any> {
  const schema = componentSchemas[componentType];
  if (!schema) return {};
  
  const defaults: Record<string, any> = {};
  Object.entries(schema).forEach(([key, field]) => {
    if (field.defaultValue !== undefined) {
      defaults[key] = field.defaultValue;
    }
  });
  
  return defaults;
}
