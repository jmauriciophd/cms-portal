/**
 * SCHEMAS AVANÇADOS DE COMPONENTES DO PAGE BUILDER
 * Sistema completo com todas as propriedades e funcionalidades
 * Baseado na especificação detalhada do núcleo comum e componentes específicos
 */

// ============================================================================
// TIPOS E INTERFACES BASE
// ============================================================================

export interface BaseComponentProperties {
  // 1.1 Identidade e metadados
  id: string;
  key?: string;
  name?: string;
  componentType: string;
  dataBinding?: string;
  visibility?: boolean | string; // boolean ou fórmula
  locked?: boolean;
  version?: string;

  // 1.2 Layout e dimensões
  zIndex?: number;
  width?: string; // em, rem, %, auto, px
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;

  // 1.3 Espaçamento (unidades: em, rem, %, px)
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;

  // 1.4 Tipografia e cores
  fontFamily?: string;
  fontSize?: string; // em/rem
  fontWeight?: string | number;
  lineHeight?: string; // em/%
  letterSpacing?: string; // em/rem
  color?: string;
  backgroundColor?: string;
  textDecoration?: string;
  textTransform?: string;

  // 1.5 Borda e raio
  borderRadius?: string; // em/rem/%/px
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;

  // 1.6 Efeitos visuais
  boxShadow?: BoxShadowConfig;
  opacity?: number; // 0-1
  filter?: FilterConfig;

  // 1.7 Transformações
  transform?: TransformConfig;
  transformOrigin?: string;

  // 1.8 Animações e transições
  transition?: TransitionConfig;
  animation?: AnimationConfig;
  scrollAnimation?: ScrollAnimationConfig;

  // 1.9 Estados e pseudoestados
  states?: StatesConfig;

  // 1.10 Responsividade
  breakpoints?: BreakpointsConfig;
  containerQueries?: ContainerQueryConfig;
  visibilityByBreakpoint?: VisibilityBreakpointConfig;

  // 1.11 Acessibilidade
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
  focusOutline?: boolean;
  keyboardShortcuts?: string[];
  readingOrder?: number;

  // 1.12 SEO e semântico
  tagName?: string;
  idAnchor?: string;
  meta?: Record<string, string>;

  // 1.13 Estilos customizados
  className?: string;
  styleOverrides?: string;
  cssVariables?: Record<string, string>;

  // 1.14 Eventos e ações
  onClick?: ActionConfig[];
  onDblClick?: ActionConfig[];
  onMouseEnter?: ActionConfig[];
  onMouseLeave?: ActionConfig[];
  onFocus?: ActionConfig[];
  onBlur?: ActionConfig[];
  onKeyDown?: ActionConfig[];
  onKeyUp?: ActionConfig[];
  onVisible?: ActionConfig[];
}

export interface BoxShadowConfig {
  offsetX: string; // em/rem/px
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
  inset?: boolean;
}

export interface FilterConfig {
  blur?: string;
  brightness?: number;
  contrast?: number;
  grayscale?: number;
  saturate?: number;
}

export interface TransformConfig {
  rotate?: number; // deg
  scaleX?: number;
  scaleY?: number;
  translateX?: string; // em/rem/%/px
  translateY?: string;
  skewX?: number; // deg
  skewY?: number;
}

export interface TransitionConfig {
  property?: string;
  duration?: string; // ms
  timingFunction?: string;
  delay?: string;
}

export interface AnimationConfig {
  name?: string;
  duration?: string;
  timingFunction?: string;
  delay?: string;
  iterationCount?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

export interface ScrollAnimationConfig {
  threshold?: number; // 0-1
  once?: boolean;
  animation?: string;
}

export interface StatesConfig {
  base?: Partial<BaseComponentProperties>;
  hover?: Partial<BaseComponentProperties>;
  focus?: Partial<BaseComponentProperties>;
  active?: Partial<BaseComponentProperties>;
  disabled?: Partial<BaseComponentProperties>;
}

export interface BreakpointsConfig {
  xs?: Partial<BaseComponentProperties>; // <576px
  sm?: Partial<BaseComponentProperties>; // ≥576px
  md?: Partial<BaseComponentProperties>; // ≥768px
  lg?: Partial<BaseComponentProperties>; // ≥992px
  xl?: Partial<BaseComponentProperties>; // ≥1200px
}

export interface ContainerQueryConfig {
  small?: Partial<BaseComponentProperties>;
  medium?: Partial<BaseComponentProperties>;
  large?: Partial<BaseComponentProperties>;
}

export interface VisibilityBreakpointConfig {
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
}

export interface ActionConfig {
  type: 'navigate' | 'openModal' | 'closeModal' | 'toggle' | 'setState' | 'emit' | 'runScript' | 'callAPI' | 'trackEvent';
  target?: string;
  value?: any;
  params?: Record<string, any>;
  condition?: string; // fórmula condicional
}

// ============================================================================
// COMPONENTES ESTRUTURAIS
// ============================================================================

export interface ContainerProperties extends BaseComponentProperties {
  componentType: 'container';
  
  // Display
  display?: 'flex' | 'grid' | 'block' | 'inline-block' | 'none';
  
  // Flex
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  alignContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'stretch';
  gap?: string; // em/rem/px
  
  // Grid
  gridTemplateColumns?: string; // ex: repeat(3, 1fr)
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  gridAutoFlow?: 'row' | 'column' | 'dense';
  gridColumnGap?: string;
  gridRowGap?: string;
  
  // Background
  background?: BackgroundConfig;
  backgroundOverlay?: OverlayConfig;
  
  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // Advanced
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  
  // Functions
  asSection?: boolean;
  makeScrollable?: boolean;
  snapType?: 'none' | 'x' | 'y' | 'both';
  isolateStackingContext?: boolean;
}

export interface BackgroundConfig {
  type?: 'color' | 'gradient' | 'image' | 'combined';
  color?: string;
  gradient?: GradientConfig;
  image?: BackgroundImageConfig;
}

export interface GradientConfig {
  type?: 'linear' | 'radial';
  angle?: number; // deg
  colors?: Array<{ color: string; stop: number }>; // stop 0-100%
}

export interface BackgroundImageConfig {
  url?: string;
  repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  position?: string; // ex: center center
  size?: 'auto' | 'cover' | 'contain' | string;
  attachment?: 'scroll' | 'fixed' | 'local';
}

export interface OverlayConfig {
  color?: string;
  opacity?: number; // 0-1
}

export interface SectionProperties extends ContainerProperties {
  componentType: 'section';
  maxWidth?: string; // em/rem/px
  verticalPadding?: string;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  alternateBackground?: boolean;
}

export interface GridProperties extends ContainerProperties {
  componentType: 'grid';
  columns?: number;
  rows?: number;
  columnGap?: string;
  rowGap?: string;
  areas?: string[][];
  alignContent?: string;
  justifyItems?: string;
  responsiveTemplates?: Record<string, string>;
  autoLayout?: boolean;
}

// ============================================================================
// COMPONENTES DE CONTEÚDO
// ============================================================================

export interface TextProperties extends BaseComponentProperties {
  componentType: 'text';
  textType?: 'p' | 'span' | 'div' | 'blockquote';
  content?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  maxLines?: number; // line-clamp
  linkify?: boolean; // auto transform URLs
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap';
}

export interface HeadingProperties extends BaseComponentProperties {
  componentType: 'heading';
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  content?: string;
  anchorLink?: boolean;
  semanticPriority?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface ImageProperties extends BaseComponentProperties {
  componentType: 'image';
  src?: string;
  alt: string; // obrigatório
  title?: string;
  lazy?: boolean;
  decoding?: 'auto' | 'async' | 'sync';
  aspectRatio?: string; // ex: 16/9
  srcSet?: string;
  sizes?: string;
  placeholder?: 'blur' | 'color' | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  
  // Effects
  hoverZoom?: number; // scale factor
  parallax?: number; // scroll factor
  mask?: string; // shape
  
  // Functions
  openLightbox?: boolean;
  artDirection?: Record<string, string>; // breakpoint -> src
}

export interface ButtonProperties extends BaseComponentProperties {
  componentType: 'button';
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: string;
  iconRight?: string;
  disabled?: boolean;
  loading?: boolean;
  ariaPressed?: boolean;
  
  // Actions
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  formAction?: 'submit' | 'reset' | 'button';
}

export interface LinkProperties extends BaseComponentProperties {
  componentType: 'link';
  href: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string; // noopener, nofollow
  prefetch?: boolean;
  content?: string;
  underline?: 'none' | 'hover' | 'always';
}

export interface IconProperties extends BaseComponentProperties {
  componentType: 'icon';
  name?: string; // lib/tokens
  library?: 'lucide' | 'heroicons' | 'custom';
  size?: string; // em/rem/px
  color?: string;
  spin?: boolean;
  pulse?: boolean;
  ariaHidden?: boolean;
}

export interface VideoProperties extends BaseComponentProperties {
  componentType: 'video';
  source?: string;
  poster?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  captions?: string; // VTT file
  trackLang?: string;
  pip?: boolean; // picture-in-picture
  
  // Functions
  playbackRate?: number;
}

export interface ListProperties extends BaseComponentProperties {
  componentType: 'list' | 'repeater';
  listType?: 'ul' | 'ol';
  dataSource?: any[]; // array binding
  itemTemplate?: any; // componente filho
  emptyState?: any; // conteúdo alternativo
  pagination?: PaginationConfig;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterExpression?: string;
}

export interface PaginationConfig {
  pageSize?: number;
  showControls?: boolean;
  showInfo?: boolean;
}

export interface CardProperties extends BaseComponentProperties {
  componentType: 'card';
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  mediaTop?: ImageProperties;
  header?: any;
  content?: any;
  footer?: any;
  interactive?: boolean; // hover raise
  clickable?: boolean;
  href?: string;
}

export interface TableProperties extends BaseComponentProperties {
  componentType: 'table';
  columns?: TableColumn[];
  data?: any[];
  stickyHeader?: boolean;
  rowStriped?: boolean;
  rowHover?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  exportable?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: string; // template
}

// ============================================================================
// COMPONENTES DE NAVEGAÇÃO
// ============================================================================

export interface HeaderProperties extends BaseComponentProperties {
  componentType: 'header';
  brand?: BrandConfig;
  menuItems?: MenuItem[];
  sticky?: boolean;
  transparent?: boolean;
  collapseBreakpoint?: 'sm' | 'md' | 'lg';
  height?: string;
}

export interface BrandConfig {
  logo?: string;
  logoAlt?: string;
  text?: string;
  href?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: MenuItem[];
  active?: boolean;
}

export interface FooterProperties extends BaseComponentProperties {
  componentType: 'footer';
  columns?: number;
  links?: MenuItem[][];
  legal?: LegalConfig;
  showBackToTop?: boolean;
}

export interface LegalConfig {
  privacy?: string; // URL
  terms?: string;
  contact?: string;
  lgpd?: string;
}

export interface BreadcrumbProperties extends BaseComponentProperties {
  componentType: 'breadcrumb';
  items?: BreadcrumbItem[];
  separator?: string;
  showHome?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface TabsProperties extends BaseComponentProperties {
  componentType: 'tabs';
  orientation?: 'horizontal' | 'vertical';
  items?: TabItem[];
  activeId?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  content?: any;
  disabled?: boolean;
}

export interface AccordionProperties extends BaseComponentProperties {
  componentType: 'accordion';
  items?: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
}

export interface AccordionItem {
  id: string;
  title: string;
  content?: any;
  expanded?: boolean;
  disabled?: boolean;
}

export interface ModalProperties extends BaseComponentProperties {
  componentType: 'modal' | 'drawer';
  isOpen?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  title?: string;
  content?: any;
  footer?: any;
  focusTrap?: boolean;
}

export interface CarouselProperties extends BaseComponentProperties {
  componentType: 'carousel';
  items?: any[];
  autoPlay?: boolean;
  autoPlayInterval?: number; // ms
  loop?: boolean;
  showIndicators?: boolean;
  showArrows?: boolean;
  slidesPerView?: number;
  spaceBetween?: number;
  effect?: 'slide' | 'fade' | 'cube' | 'flip';
}

// ============================================================================
// COMPONENTES DE FORMULÁRIO
// ============================================================================

export interface FormProperties extends BaseComponentProperties {
  componentType: 'form';
  method?: 'GET' | 'POST';
  action?: string;
  enctype?: string;
  noValidate?: boolean;
  
  // Functions
  onSubmit?: ActionConfig[];
  onReset?: ActionConfig[];
  onValidate?: string; // validation expression
}

export interface InputProperties extends BaseComponentProperties {
  componentType: 'input';
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color';
  name?: string;
  value?: string;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string; // regex
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  
  // Validation
  helperText?: string;
  error?: string;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message?: string;
}

export interface TextareaProperties extends InputProperties {
  componentType: 'textarea';
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export interface SelectProperties extends BaseComponentProperties {
  componentType: 'select';
  name?: string;
  value?: string | string[];
  options?: SelectOption[];
  multiple?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  
  // Validation
  helperText?: string;
  error?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface CheckboxProperties extends BaseComponentProperties {
  componentType: 'checkbox';
  name?: string;
  value?: string;
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
}

export interface RadioProperties extends BaseComponentProperties {
  componentType: 'radio';
  name?: string;
  value?: string;
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface SwitchProperties extends BaseComponentProperties {
  componentType: 'switch';
  name?: string;
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// COMPONENTES UTILITÁRIOS
// ============================================================================

export interface SpacerProperties extends BaseComponentProperties {
  componentType: 'spacer';
  size?: string; // em/rem/%/px
  orientation?: 'horizontal' | 'vertical';
}

export interface DividerProperties extends BaseComponentProperties {
  componentType: 'divider';
  orientation?: 'horizontal' | 'vertical';
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  thickness?: string;
  color?: string;
  spacing?: string; // margin ao redor
  label?: string; // texto no meio
}

export interface MapProperties extends BaseComponentProperties {
  componentType: 'map';
  provider?: 'google' | 'mapbox' | 'openstreetmap';
  center?: { lat: number; lon: number };
  zoom?: number;
  markers?: MapMarker[];
  interactive?: boolean;
  height?: string;
  
  // Accessibility
  alternativeText?: string; // lista de locais
}

export interface MapMarker {
  id: string;
  position: { lat: number; lon: number };
  title?: string;
  description?: string;
  icon?: string;
}

export interface EmbedProperties extends BaseComponentProperties {
  componentType: 'embed' | 'code';
  embedType?: 'iframe' | 'script' | 'html';
  source?: string;
  sandbox?: string[]; // whitelist
  height?: string;
  width?: string;
  allowFullscreen?: boolean;
  
  // Security
  allowedDomains?: string[];
  csp?: string;
}

// ============================================================================
// REGISTRO COMPLETO DE SCHEMAS
// ============================================================================

export const COMPONENT_SCHEMAS = {
  // Estruturais
  container: 'ContainerProperties',
  section: 'SectionProperties',
  grid: 'GridProperties',
  
  // Conteúdo
  text: 'TextProperties',
  heading: 'HeadingProperties',
  image: 'ImageProperties',
  button: 'ButtonProperties',
  link: 'LinkProperties',
  icon: 'IconProperties',
  video: 'VideoProperties',
  list: 'ListProperties',
  card: 'CardProperties',
  table: 'TableProperties',
  
  // Navegação
  header: 'HeaderProperties',
  footer: 'FooterProperties',
  breadcrumb: 'BreadcrumbProperties',
  tabs: 'TabsProperties',
  accordion: 'AccordionProperties',
  modal: 'ModalProperties',
  carousel: 'CarouselProperties',
  
  // Formulários
  form: 'FormProperties',
  input: 'InputProperties',
  textarea: 'TextareaProperties',
  select: 'SelectProperties',
  checkbox: 'CheckboxProperties',
  radio: 'RadioProperties',
  switch: 'SwitchProperties',
  
  // Utilitários
  spacer: 'SpacerProperties',
  divider: 'DividerProperties',
  map: 'MapProperties',
  embed: 'EmbedProperties',
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Inicializa um componente com valores padrão
 */
export function initializeComponent(componentType: string, overrides: Partial<BaseComponentProperties> = {}): BaseComponentProperties {
  const base: BaseComponentProperties = {
    id: `${componentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    componentType,
    visibility: true,
    locked: false,
    version: '1.0.0',
    
    // Padrões de espaçamento
    margin: '0',
    padding: '0',
    
    // Padrões visuais
    opacity: 1,
    
    // Padrões de acessibilidade
    tabIndex: 0,
    focusOutline: true,
    
    ...overrides
  };
  
  return base;
}

/**
 * Valida se um componente pode ser filho de outro
 */
export function canAcceptChild(parentType: string, childType: string): boolean {
  const containerTypes = ['container', 'section', 'grid', 'card', 'form', 'header', 'footer'];
  const structuralTypes = ['section', 'container', 'grid'];
  
  // Containers aceitam quase tudo
  if (containerTypes.includes(parentType)) {
    return true;
  }
  
  // Forms aceitam inputs e buttons
  if (parentType === 'form') {
    return ['input', 'textarea', 'select', 'checkbox', 'radio', 'switch', 'button'].includes(childType);
  }
  
  // Tabs e Accordion têm estruturas específicas
  if (parentType === 'tabs') {
    return childType === 'tab';
  }
  
  if (parentType === 'accordion') {
    return childType === 'accordionItem';
  }
  
  return false;
}

/**
 * Converte propriedades para CSS inline
 */
export function propertiesToCSS(props: Partial<BaseComponentProperties>): React.CSSProperties {
  const css: React.CSSProperties = {};
  
  // Layout
  if (props.width) css.width = props.width;
  if (props.height) css.height = props.height;
  if (props.minWidth) css.minWidth = props.minWidth;
  if (props.minHeight) css.minHeight = props.minHeight;
  if (props.maxWidth) css.maxWidth = props.maxWidth;
  if (props.maxHeight) css.maxHeight = props.maxHeight;
  
  // Espaçamento
  if (props.margin) css.margin = props.margin;
  if (props.marginTop) css.marginTop = props.marginTop;
  if (props.marginRight) css.marginRight = props.marginRight;
  if (props.marginBottom) css.marginBottom = props.marginBottom;
  if (props.marginLeft) css.marginLeft = props.marginLeft;
  if (props.padding) css.padding = props.padding;
  if (props.paddingTop) css.paddingTop = props.paddingTop;
  if (props.paddingRight) css.paddingRight = props.paddingRight;
  if (props.paddingBottom) css.paddingBottom = props.paddingBottom;
  if (props.paddingLeft) css.paddingLeft = props.paddingLeft;
  
  // Tipografia
  if (props.fontFamily) css.fontFamily = props.fontFamily;
  if (props.fontSize) css.fontSize = props.fontSize;
  if (props.fontWeight) css.fontWeight = props.fontWeight;
  if (props.lineHeight) css.lineHeight = props.lineHeight;
  if (props.letterSpacing) css.letterSpacing = props.letterSpacing;
  if (props.color) css.color = props.color;
  if (props.textDecoration) css.textDecoration = props.textDecoration;
  if (props.textTransform) css.textTransform = props.textTransform as any;
  
  // Background
  if (props.backgroundColor) css.backgroundColor = props.backgroundColor;
  
  // Bordas
  if (props.borderRadius) css.borderRadius = props.borderRadius;
  if (props.borderWidth) css.borderWidth = props.borderWidth;
  if (props.borderStyle) css.borderStyle = props.borderStyle as any;
  if (props.borderColor) css.borderColor = props.borderColor;
  
  // Efeitos
  if (props.opacity !== undefined) css.opacity = props.opacity;
  if (props.zIndex !== undefined) css.zIndex = props.zIndex;
  
  // Box Shadow
  if (props.boxShadow) {
    const { offsetX, offsetY, blur, spread, color, inset } = props.boxShadow;
    css.boxShadow = `${inset ? 'inset ' : ''}${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
  }
  
  // Transform
  if (props.transform) {
    const { rotate, scaleX, scaleY, translateX, translateY, skewX, skewY } = props.transform;
    const transforms: string[] = [];
    if (rotate !== undefined) transforms.push(`rotate(${rotate}deg)`);
    if (scaleX !== undefined) transforms.push(`scaleX(${scaleX})`);
    if (scaleY !== undefined) transforms.push(`scaleY(${scaleY})`);
    if (translateX !== undefined) transforms.push(`translateX(${translateX})`);
    if (translateY !== undefined) transforms.push(`translateY(${translateY})`);
    if (skewX !== undefined) transforms.push(`skewX(${skewX}deg)`);
    if (skewY !== undefined) transforms.push(`skewY(${skewY}deg)`);
    if (transforms.length > 0) css.transform = transforms.join(' ');
  }
  
  if (props.transformOrigin) css.transformOrigin = props.transformOrigin;
  
  // Transition
  if (props.transition) {
    const { property, duration, timingFunction, delay } = props.transition;
    css.transition = `${property || 'all'} ${duration || '300ms'} ${timingFunction || 'ease'} ${delay || '0ms'}`;
  }
  
  // Filter
  if (props.filter) {
    const { blur, brightness, contrast, grayscale, saturate } = props.filter;
    const filters: string[] = [];
    if (blur) filters.push(`blur(${blur})`);
    if (brightness !== undefined) filters.push(`brightness(${brightness})`);
    if (contrast !== undefined) filters.push(`contrast(${contrast})`);
    if (grayscale !== undefined) filters.push(`grayscale(${grayscale})`);
    if (saturate !== undefined) filters.push(`saturate(${saturate})`);
    if (filters.length > 0) css.filter = filters.join(' ');
  }
  
  return css;
}

/**
 * Obtém propriedades de acessibilidade
 */
export function getAccessibilityProps(props: Partial<BaseComponentProperties>): Record<string, any> {
  const a11yProps: Record<string, any> = {};
  
  if (props.role) a11yProps.role = props.role;
  if (props.ariaLabel) a11yProps['aria-label'] = props.ariaLabel;
  if (props.ariaLabelledBy) a11yProps['aria-labelledby'] = props.ariaLabelledBy;
  if (props.ariaDescribedBy) a11yProps['aria-describedby'] = props.ariaDescribedBy;
  if (props.tabIndex !== undefined) a11yProps.tabIndex = props.tabIndex;
  
  return a11yProps;
}

/**
 * Gera ID único para componente
 */
export function generateComponentId(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clona componente com novo ID
 */
export function cloneComponent(component: BaseComponentProperties): BaseComponentProperties {
  return {
    ...component,
    id: generateComponentId(component.componentType),
    key: generateComponentId(component.componentType),
  };
}

export default COMPONENT_SCHEMAS;
