/**
 * Utilitário para copiar texto para a área de transferência
 * com fallback para ambientes onde a Clipboard API não está disponível
 */

/**
 * Copia texto para a área de transferência
 * Usa a Clipboard API moderna quando disponível,
 * caso contrário usa um fallback com textarea temporário
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Tenta usar a Clipboard API moderna
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API falhou, tentando fallback:', error);
      // Continua para o fallback
    }
  }

  // Fallback: criar elemento temporário
  return copyToClipboardFallback(text);
}

/**
 * Método fallback para copiar texto
 * Cria um textarea temporário e usa document.execCommand
 */
function copyToClipboardFallback(text: string): boolean {
  const textarea = document.createElement('textarea');
  
  // Configurar o textarea para ser invisível
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  textarea.setAttribute('readonly', '');
  
  document.body.appendChild(textarea);
  
  try {
    // Selecionar o texto
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    // Executar o comando de copiar
    const successful = document.execCommand('copy');
    
    if (!successful) {
      console.error('Comando de cópia falhou');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao copiar para a área de transferência:', error);
    return false;
  } finally {
    // Sempre remover o elemento temporário
    document.body.removeChild(textarea);
  }
}

/**
 * Versão síncrona (não recomendada, mas mantida para compatibilidade)
 * Sempre usa o fallback
 */
export function copyToClipboardSync(text: string): boolean {
  return copyToClipboardFallback(text);
}
