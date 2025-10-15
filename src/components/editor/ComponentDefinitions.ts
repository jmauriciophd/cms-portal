/**
 * DEFINIÇÕES DE COMPONENTES DO EDITOR VISUAL
 * 
 * Este arquivo contém todas as definições de tipos e propriedades
 * dos componentes disponíveis no editor visual.
 */

import React from 'react';

/**
 * Tipos de Componentes
 * 
 * - CONTAINER: Componentes que podem conter outros componentes
 * - LEAF: Componentes que não contêm outros componentes
 * - HYBRID: Componentes que podem ou não conter outros componentes
 */
export type ComponentCategory = 'CONTAINER' | 'LEAF' | 'HYBRID';

/**
 * Interface base para todos os componentes
 */
export interface BaseComponent {
  id: string;
  type: string;
  category: ComponentCategory;
  props: Record<string, any>;
  styles: React.CSSProperties;
  customCSS?: string;
  customJS?: string;
  children?: BaseComponent[];
  slots?: Record<string, BaseComponent[]>; // Para componentes com múltiplas áreas
}

/**
 * ============================================
 * COMPONENTES DE TEXTO
 * ============================================
 */

export interface HeadingProps {
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  text: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  fontFamily?: string;
  fontWeight?: number | string;
  fontSize?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  margin?: string;
  padding?: string;
}

export interface ParagraphProps {
  text: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  fontWeight?: number | string;
  margin?: string;
  padding?: string;
  maxWidth?: string;
}

export interface QuoteProps {
  text: string;
  author?: string;
  authorRole?: string;
  cite?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderColor?: string;
  borderWidth?: string;
  borderSide?: 'left' | 'right' | 'top' | 'bottom';
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  fontStyle?: 'normal' | 'italic';
}

export interface ListProps {
  type: 'ordered' | 'unordered';
  items: string[];
  listStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman' | 'none';
  spacing?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  padding?: string;
  margin?: string;
}

/**
 * ============================================
 * COMPONENTES DE MÍDIA
 * ============================================
 */

export interface ImageProps {
  src: string;
  alt: string;
  title?: string;
  width?: string;
  height?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  loading?: 'lazy' | 'eager';
  aspectRatio?: string;
  caption?: string;
  link?: string;
  linkTarget?: '_blank' | '_self' | '_parent' | '_top';
  filter?: string; // CSS filters like brightness, contrast, etc.
}

export interface VideoProps {
  src: string;
  poster?: string; // Thumbnail
  width?: string;
  height?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  aspectRatio?: string;
  borderRadius?: string;
  boxShadow?: string;
}

export interface GalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: number;
  gap?: string;
  aspectRatio?: string;
  borderRadius?: string;
  layout?: 'grid' | 'masonry' | 'carousel';
  lightbox?: boolean;
}

/**
 * ============================================
 * COMPONENTES DE LAYOUT (CONTAINERS)
 * ============================================
 */

export interface ContainerProps {
  maxWidth?: string;
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  gap?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: number;
  // Suporta children
  allowChildren?: boolean;
}

export interface GridProps {
  columns?: number;
  rows?: number;
  gap?: string;
  columnGap?: string;
  rowGap?: string;
  gridTemplateColumns?: string; // Custom: "1fr 2fr 1fr"
  gridTemplateRows?: string;
  gridAutoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;
  // Suporta children (células)
  allowChildren?: boolean;
  minColumnWidth?: string; // Para grid responsivo automático
}

export interface GridCellProps {
  gridColumn?: string; // "1 / 3" ou "span 2"
  gridRow?: string;
  justifySelf?: 'start' | 'center' | 'end' | 'stretch';
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;
  // Suporta children
  allowChildren?: boolean;
}

export interface SectionProps {
  fullWidth?: boolean;
  maxWidth?: string;
  padding?: string;
  paddingTop?: string;
  paddingBottom?: string;
  margin?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  backgroundAttachment?: 'scroll' | 'fixed' | 'local';
  borderTop?: string;
  borderBottom?: string;
  minHeight?: string;
  // Suporta children
  allowChildren?: boolean;
}

export interface ColumnsProps {
  count?: number;
  gap?: string;
  layout?: 'equal' | 'sidebar-left' | 'sidebar-right' | 'custom';
  customWidths?: string[]; // ['1fr', '2fr', '1fr']
  reverseOnMobile?: boolean;
  stackOnMobile?: boolean;
  padding?: string;
  margin?: string;
  // Suporta children
  allowChildren?: boolean;
}

/**
 * ============================================
 * COMPONENTES HÍBRIDOS
 * ============================================
 */

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: string;
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  // Slots
  hasHeader?: boolean;
  hasFooter?: boolean;
  hasImage?: boolean;
  // Header props
  headerTitle?: string;
  headerSubtitle?: string;
  headerBackgroundColor?: string;
  headerPadding?: string;
  // Image props
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'background';
  imageHeight?: string;
  // Content (children via slots)
  allowChildren?: boolean;
}

export interface HeroProps {
  height?: string;
  minHeight?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  backgroundOverlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  padding?: string;
  // Content
  title?: string;
  subtitle?: string;
  description?: string;
  // Buttons
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  // Suporta children para conteúdo customizado
  allowChildren?: boolean;
}

export interface AccordionProps {
  items: Array<{
    id: string;
    title: string;
    content: string; // Pode ser HTML
  }>;
  allowMultiple?: boolean;
  defaultOpen?: string[]; // IDs dos itens abertos por padrão
  variant?: 'default' | 'bordered' | 'separated';
  iconPosition?: 'left' | 'right';
  padding?: string;
  margin?: string;
  borderRadius?: string;
  backgroundColor?: string;
}

export interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: string; // Pode ser HTML
    icon?: string;
  }>;
  defaultTab?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  tabsPosition?: 'start' | 'center' | 'end';
  padding?: string;
  margin?: string;
}

/**
 * ============================================
 * COMPONENTES DE FORMULÁRIO
 * ============================================
 */

export interface FormProps {
  action?: string;
  method?: 'GET' | 'POST';
  name?: string;
  gap?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  maxWidth?: string;
  // Suporta children (campos de formulário)
  allowChildren?: boolean;
  submitButtonText?: string;
  submitButtonVariant?: 'primary' | 'secondary' | 'outline';
  onSubmit?: string; // JavaScript code
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date' | 'time' | 'datetime-local' | 'search';
  name?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: string;
  defaultValue?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  autocomplete?: string;
  width?: string;
  padding?: string;
  margin?: string;
  border?: string;
  borderRadius?: string;
  fontSize?: string;
  backgroundColor?: string;
  focusBorderColor?: string;
  helperText?: string;
  errorText?: string;
}

export interface TextareaProps {
  name?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: string;
  defaultValue?: string;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  width?: string;
  padding?: string;
  margin?: string;
  border?: string;
  borderRadius?: string;
  fontSize?: string;
  backgroundColor?: string;
  helperText?: string;
}

export interface SelectProps {
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  multiple?: boolean;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  optgroups?: Array<{
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
  width?: string;
  padding?: string;
  margin?: string;
  border?: string;
  borderRadius?: string;
  fontSize?: string;
  backgroundColor?: string;
  helperText?: string;
}

export interface CheckboxProps {
  name?: string;
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
  margin?: string;
}

export interface RadioGroupProps {
  name?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  gap?: string;
  margin?: string;
}

/**
 * ============================================
 * COMPONENTES DE NAVEGAÇÃO
 * ============================================
 */

export interface NavbarProps {
  logo?: string;
  logoText?: string;
  logoLink?: string;
  items: Array<{
    label: string;
    link: string;
    children?: Array<{ label: string; link: string }>;
  }>;
  position?: 'static' | 'sticky' | 'fixed';
  backgroundColor?: string;
  textColor?: string;
  height?: string;
  padding?: string;
  boxShadow?: string;
  borderBottom?: string;
  transparent?: boolean;
  mobileBreakpoint?: string;
  // CTA Button
  ctaText?: string;
  ctaLink?: string;
  ctaVariant?: 'primary' | 'secondary' | 'outline';
}

export interface BreadcrumbProps {
  items: Array<{
    label: string;
    link?: string;
  }>;
  separator?: string | 'slash' | 'chevron' | 'arrow' | 'dot';
  showHome?: boolean;
  homeLabel?: string;
  homeLink?: string;
  color?: string;
  fontSize?: string;
  margin?: string;
}

export interface FooterProps {
  variant?: 'simple' | 'multi-column' | 'centered';
  columns?: Array<{
    title: string;
    links: Array<{ label: string; link: string }>;
  }>;
  copyrightText?: string;
  showSocial?: boolean;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  borderTop?: string;
  // Suporta children para conteúdo customizado
  allowChildren?: boolean;
}

/**
 * ============================================
 * COMPONENTES INTERATIVOS
 * ============================================
 */

export interface ButtonProps {
  text: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: string; // Lucide icon name
  iconPosition?: 'left' | 'right';
  link?: string;
  linkTarget?: '_blank' | '_self';
  onClick?: string; // JavaScript code
  backgroundColor?: string;
  color?: string;
  border?: string;
  borderRadius?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: string;
  boxShadow?: string;
  hoverBackgroundColor?: string;
  hoverColor?: string;
  margin?: string;
}

export interface CarouselProps {
  slides: Array<{
    id: string;
    image?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
  }>;
  autoplay?: boolean;
  autoplayDelay?: number; // milliseconds
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  slidesPerView?: number;
  spaceBetween?: number;
  height?: string;
  borderRadius?: string;
  transition?: 'slide' | 'fade' | 'cube' | 'flip';
}

export interface ModalProps {
  triggerText: string;
  triggerVariant?: 'primary' | 'secondary' | 'outline';
  title?: string;
  content: string; // HTML
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  footer?: string; // HTML for footer buttons
  padding?: string;
  borderRadius?: string;
  // Suporta children para conteúdo do modal
  allowChildren?: boolean;
}

/**
 * ============================================
 * COMPONENTES DE CONTEÚDO
 * ============================================
 */

export interface TestimonialProps {
  text: string;
  author: string;
  authorRole?: string;
  authorImage?: string;
  rating?: number; // 1-5
  showQuotes?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  variant?: 'card' | 'minimal' | 'featured';
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
}

export interface TimelineProps {
  orientation?: 'vertical' | 'horizontal';
  events: Array<{
    id: string;
    date: string;
    title: string;
    description: string;
    icon?: string;
    image?: string;
  }>;
  lineColor?: string;
  dotColor?: string;
  dotSize?: string;
  spacing?: string;
  alternating?: boolean; // Para vertical timeline
}

export interface PricingProps {
  plans: Array<{
    id: string;
    name: string;
    price: string;
    period?: string; // "/mês"
    description?: string;
    features: string[];
    featuresExcluded?: string[];
    highlighted?: boolean;
    buttonText?: string;
    buttonLink?: string;
  }>;
  columns?: number;
  gap?: string;
  showComparison?: boolean;
  currency?: string;
  margin?: string;
}

export interface StatsProps {
  stats: Array<{
    id: string;
    value: string | number;
    label: string;
    icon?: string;
    prefix?: string; // "$"
    suffix?: string; // "+"
  }>;
  columns?: number;
  gap?: string;
  textAlign?: 'left' | 'center' | 'right';
  variant?: 'default' | 'card' | 'minimal';
  animateOnView?: boolean;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
}

export interface FeaturesProps {
  title?: string;
  subtitle?: string;
  features: Array<{
    id: string;
    icon?: string;
    title: string;
    description: string;
  }>;
  columns?: number;
  gap?: string;
  layout?: 'grid' | 'list' | 'alternating';
  iconSize?: string;
  iconColor?: string;
  padding?: string;
  margin?: string;
}

export interface TeamProps {
  title?: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
    image?: string;
    bio?: string;
    social?: {
      linkedin?: string;
      twitter?: string;
      email?: string;
    };
  }>;
  columns?: number;
  gap?: string;
  showSocial?: boolean;
  imageShape?: 'circle' | 'square' | 'rounded';
  padding?: string;
  margin?: string;
}

/**
 * ============================================
 * COMPONENTES AVANÇADOS
 * ============================================
 */

export interface TableProps {
  headers: string[];
  rows: string[][];
  caption?: string;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  responsive?: boolean;
  sortable?: boolean;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  borderColor?: string;
  fontSize?: string;
  padding?: string;
  margin?: string;
}

export interface CodeProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  theme?: 'light' | 'dark' | 'github' | 'vscode' | 'monokai';
  fileName?: string;
  copyButton?: boolean;
  maxHeight?: string;
  fontSize?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
}

export interface MapProps {
  location?: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: string;
  width?: string;
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
    description?: string;
  }>;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  showControls?: boolean;
  borderRadius?: string;
  margin?: string;
}

export interface ContactInfoProps {
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
  showIcons?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  gap?: string;
  iconColor?: string;
  fontSize?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;
}

export interface SocialLinksProps {
  links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    github?: string;
    pinterest?: string;
  };
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'icon-text' | 'button';
  orientation?: 'horizontal' | 'vertical';
  gap?: string;
  iconColor?: string;
  backgroundColor?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
}

export interface DividerProps {
  variant?: 'solid' | 'dashed' | 'dotted' | 'double';
  orientation?: 'horizontal' | 'vertical';
  thickness?: string;
  color?: string;
  width?: string;
  height?: string;
  spacing?: string; // margin top/bottom
  withText?: string; // Text in the middle
  textPosition?: 'left' | 'center' | 'right';
}

export interface SpacerProps {
  height?: string;
  width?: string;
  responsive?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

export interface IconProps {
  name: string; // Lucide icon name
  size?: string;
  color?: string;
  strokeWidth?: number;
  fill?: 'none' | 'currentColor';
  rotation?: number; // degrees
  animation?: 'none' | 'spin' | 'pulse' | 'bounce';
  margin?: string;
}

/**
 * ============================================
 * MAPA DE COMPONENTES
 * ============================================
 */

export interface ComponentDefinition {
  type: string;
  category: ComponentCategory;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  defaultProps: Record<string, any>;
  defaultStyles: React.CSSProperties;
  allowChildren: boolean;
  slots?: string[]; // Lista de slots disponíveis: ['header', 'footer', 'sidebar']
  propsSchema: Record<string, PropertyDefinition>;
}

export interface PropertyDefinition {
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'array' | 'object';
  label: string;
  description?: string;
  default?: any;
  options?: Array<{ value: any; label: string }>; // Para type: 'select'
  min?: number;
  max?: number;
  required?: boolean;
  group?: string; // Para agrupar propriedades no painel
}

/**
 * Registro de todos os componentes disponíveis
 */
export const COMPONENT_REGISTRY: Record<string, ComponentDefinition> = {
  // Será populado pela ComponentLibrary
};
