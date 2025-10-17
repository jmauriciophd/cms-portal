# 🔧 API do Editor de Imagens - Documentação Técnica

## 📦 Componente Principal

### ImageEditor

Componente React para edição completa de imagens no navegador.

#### Props

```typescript
interface ImageEditorProps {
  imageUrl: string;        // URL ou Data URL da imagem
  imageName: string;       // Nome do arquivo
  onSave: (              // Callback ao salvar
    editedImageUrl: string,
    editedImageName: string
  ) => void;
  onClose: () => void;     // Callback ao fechar
}
```

#### Exemplo de Uso

```tsx
import { ImageEditor } from './components/files/ImageEditor';

function MyComponent() {
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleSave = (url: string, name: string) => {
    console.log('Imagem salva:', name);
    // Processar imagem editada
    setShowEditor(false);
  };

  return (
    <>
      <button onClick={() => setShowEditor(true)}>
        Editar Imagem
      </button>
      
      {showEditor && (
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
            <ImageEditor
              imageUrl="https://example.com/image.jpg"
              imageName="minha-imagem.jpg"
              onSave={handleSave}
              onClose={() => setShowEditor(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
```

## 🎨 Estados Internos

### Controles de Edição

```typescript
// Transformações
rotation: number;           // 0-360 graus
flipHorizontal: boolean;    // Espelhamento horizontal
flipVertical: boolean;      // Espelhamento vertical
scale: number;             // 10-200%

// Ajustes de cor
brightness: number;        // 0-200%
contrast: number;          // 0-200%
saturation: number;        // 0-200%
hue: number;              // 0-360 graus
blur: number;             // 0-10px

// Filtro aplicado
filter: 'none' | 'grayscale' | 'sepia' | 'invert' | 
        'vintage' | 'warm' | 'cool';

// Redimensionamento
newWidth: number;          // Pixels
newHeight: number;         // Pixels
maintainAspectRatio: boolean;

// Corte
cropRect: {
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

// Histórico
history: ImageState[];     // Até 20 estados
historyIndex: number;      // Posição atual
```

### Estrutura de Estado da Imagem

```typescript
interface ImageState {
  dataUrl: string;         // Data URL da imagem
  width: number;           // Largura em pixels
  height: number;          // Altura em pixels
}
```

## 🔄 Métodos Principais

### Transformações

#### `handleRotate(degrees: number)`
Rotaciona a imagem.

```typescript
// Rotacionar 90° horário
handleRotate(90);

// Rotacionar 90° anti-horário
handleRotate(-90);
```

#### `handleFlipHorizontal()`
Espelha horizontalmente.

```typescript
handleFlipHorizontal();
```

#### `handleFlipVertical()`
Espelha verticalmente.

```typescript
handleFlipVertical();
```

#### `handleZoomIn()` / `handleZoomOut()`
Ajusta escala em incrementos de 10%.

```typescript
handleZoomIn();   // +10%
handleZoomOut();  // -10%
```

### Redimensionamento

#### `handleWidthChange(value: number)`
Altera largura e recalcula altura se aspect ratio ativo.

```typescript
handleWidthChange(1920);
```

#### `handleHeightChange(value: number)`
Altera altura e recalcula largura se aspect ratio ativo.

```typescript
handleHeightChange(1080);
```

### Corte

#### `startCrop(e: MouseEvent)`
Inicia seleção de área de corte.

#### `updateCrop(e: MouseEvent)`
Atualiza área durante arraste.

#### `endCrop()`
Finaliza e aplica corte.

#### `applyCrop()`
Executa o corte baseado em cropRect.

```typescript
// Fluxo de corte
setIsCropping(true);
// Usuário arrasta na imagem
// cropRect é definido automaticamente
applyCrop(); // Aplica o corte
```

### Histórico

#### `addToHistory(state: ImageState)`
Adiciona estado ao histórico (max 20).

```typescript
addToHistory({
  dataUrl: canvas.toDataURL('image/png'),
  width: canvas.width,
  height: canvas.height
});
```

#### `handleUndo()`
Volta ao estado anterior.

```typescript
handleUndo(); // Disponível se historyIndex > 0
```

#### `handleRedo()`
Avança ao próximo estado.

```typescript
handleRedo(); // Disponível se historyIndex < history.length - 1
```

#### `handleReset()`
Reseta todas as edições.

```typescript
handleReset();
// Volta todos os controles para valores padrão
```

### Renderização

#### `renderImage()`
Renderiza imagem com todas as transformações aplicadas.

```typescript
// Chamado automaticamente quando estados mudam
useEffect(() => {
  if (image) renderImage();
}, [rotation, brightness, contrast, /* ... */]);
```

#### `applySyntaxHighlighting(html: string)`
Aplica todas as transformações ao canvas.

```typescript
// Processo interno:
1. Configurar canvas (tamanho, contexto)
2. Aplicar transformações (rotate, scale, flip)
3. Aplicar filtros CSS
4. Desenhar imagem
5. Desenhar overlays (crop, etc)
```

### Exportação

#### `handleSaveClick()`
Abre modal de confirmação.

```typescript
handleSaveClick();
// Exibe modal com opções de formato e qualidade
```

#### `handleSaveConfirm()`
Processa e salva imagem editada.

```typescript
async handleSaveConfirm() {
  // 1. Determinar formato e qualidade
  const mimeType = getMimeType(exportFormat);
  const quality = quality / 100;
  
  // 2. Exportar canvas
  const dataUrl = canvas.toDataURL(mimeType, quality);
  
  // 3. Gerar nome
  const name = generateFileName(imageName, exportFormat);
  
  // 4. Registrar auditoria
  AuditService.log({...});
  
  // 5. Chamar callback
  onSave(dataUrl, name);
}
```

## 🎨 Filtros CSS

### Aplicação de Filtros

```typescript
const applyFilters = () => {
  let filterStr = '';
  
  // Ajustes básicos
  if (brightness !== 100) 
    filterStr += `brightness(${brightness}%) `;
  if (contrast !== 100) 
    filterStr += `contrast(${contrast}%) `;
  if (saturation !== 100) 
    filterStr += `saturate(${saturation}%) `;
  if (hue !== 0) 
    filterStr += `hue-rotate(${hue}deg) `;
  if (blur > 0) 
    filterStr += `blur(${blur}px) `;
  
  // Filtros pré-definidos
  switch (filter) {
    case 'grayscale':
      filterStr += 'grayscale(100%)';
      break;
    case 'sepia':
      filterStr += 'sepia(100%)';
      break;
    case 'invert':
      filterStr += 'invert(100%)';
      break;
    case 'vintage':
      filterStr += 'sepia(50%) contrast(120%) brightness(90%)';
      break;
    case 'warm':
      filterStr += 'sepia(20%) saturate(130%) hue-rotate(-10deg)';
      break;
    case 'cool':
      filterStr += 'saturate(110%) hue-rotate(10deg) brightness(105%)';
      break;
  }
  
  context.filter = filterStr;
};
```

## 📊 Utilitários

### Estimativa de Tamanho

```typescript
const estimateImageSize = (
  width: number, 
  height: number, 
  format: string = 'png'
): number => {
  const pixelCount = width * height;
  const bytesPerPixel = 
    format === 'jpg' ? 0.5 :
    format === 'webp' ? 0.3 : 
    4; // PNG
  return Math.round(pixelCount * bytesPerPixel);
};

// Uso
const size = estimateImageSize(1920, 1080, 'jpg');
console.log(formatFileSize(size)); // "1.01 MB"
```

### Formatação de Tamanho

```typescript
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) 
    return bytes + ' B';
  if (bytes < 1024 * 1024) 
    return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};
```

### Geração de Nome

```typescript
const generateFileName = (
  originalName: string, 
  format: string
): string => {
  const extension = format === 'jpg' ? 'jpg' : format;
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}-editado.${extension}`;
};

// Exemplo
generateFileName('foto.png', 'jpg');
// Retorna: "foto-editado.jpg"
```

## 🔐 Auditoria

### Registro de Evento

```typescript
import { AuditService } from '../../services/AuditService';
import { SecurityService } from '../../services/SecurityService';

const logImageEdit = () => {
  const user = SecurityService.getCurrentUser();
  
  AuditService.log({
    action: 'image_edited',
    userId: user?.id || 'system',
    details: {
      originalName: imageName,
      editedName: editedImageName,
      format: exportFormat,
      originalSize: {
        width: originalSize.width,
        height: originalSize.height,
        bytes: originalSize.bytes
      },
      newSize: {
        width: currentSize.width,
        height: currentSize.height,
        bytes: currentSize.bytes
      }
    },
    severity: 'info'
  });
};
```

## 🎯 Canvas API

### Configuração Dupla

```typescript
// Canvas principal (processamento)
const canvas = canvasRef.current;
canvas.width = targetWidth;
canvas.height = targetHeight;

// Canvas preview (visualização)
const previewCanvas = previewCanvasRef.current;
const scaleFactor = Math.min(
  maxPreviewSize / targetWidth, 
  maxPreviewSize / targetHeight, 
  1
);
previewCanvas.width = targetWidth * scaleFactor;
previewCanvas.height = targetHeight * scaleFactor;
```

### Aplicação de Transformações

```typescript
const applyTransformations = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  
  // Centralizar
  ctx.translate(canvas.width / 2, canvas.height / 2);
  
  // Rotação
  ctx.rotate((rotation * Math.PI) / 180);
  
  // Espelhamento e escala
  const flipX = flipHorizontal ? -1 : 1;
  const flipY = flipVertical ? -1 : 1;
  ctx.scale(flipX * (scale / 100), flipY * (scale / 100));
  
  // Aplicar filtros
  ctx.filter = filterString;
  
  // Desenhar
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  
  ctx.restore();
};
```

## 📱 Responsividade

### Preview Adaptativo

```typescript
const maxPreviewSize = 800;
const scaleFactor = Math.min(
  maxPreviewSize / image.width,
  maxPreviewSize / image.height,
  1 // Não aumentar se menor que max
);

previewCanvas.width = image.width * scaleFactor;
previewCanvas.height = image.height * scaleFactor;
```

## 🧪 Testes

### Teste de Carregamento

```typescript
test('should load image correctly', async () => {
  const { getByAltText } = render(
    <ImageEditor
      imageUrl="test-image.jpg"
      imageName="test.jpg"
      onSave={jest.fn()}
      onClose={jest.fn()}
    />
  );
  
  await waitFor(() => {
    expect(getByAltText('Preview')).toBeInTheDocument();
  });
});
```

### Teste de Rotação

```typescript
test('should rotate image 90 degrees', () => {
  const { getByText } = render(<ImageEditor {...props} />);
  
  const rotateButton = getByText('Girar 90°');
  fireEvent.click(rotateButton);
  
  // Verificar estado interno
  expect(getRotation()).toBe(90);
});
```

### Teste de Salvamento

```typescript
test('should save edited image', async () => {
  const onSave = jest.fn();
  const { getByText } = render(
    <ImageEditor {...props} onSave={onSave} />
  );
  
  fireEvent.click(getByText('Salvar'));
  fireEvent.click(getByText('Salvar Cópia'));
  
  await waitFor(() => {
    expect(onSave).toHaveBeenCalledWith(
      expect.stringContaining('data:image'),
      expect.stringContaining('-editado')
    );
  });
});
```

## 🔧 Configuração

### Constantes

```typescript
// Limites de escala
const MIN_SCALE = 10;
const MAX_SCALE = 200;

// Tamanho máximo de preview
const MAX_PREVIEW_SIZE = 800;

// Tamanho do histórico
const MAX_HISTORY_SIZE = 20;

// Formatos suportados
const SUPPORTED_FORMATS = ['png', 'jpg', 'webp'];

// Qualidade padrão
const DEFAULT_QUALITY = 95;
```

### Customização

```typescript
// Adicionar novo filtro
const customFilters = {
  ...defaultFilters,
  'my-filter': 'saturate(150%) brightness(110%)'
};

// Alterar limites
const customConfig = {
  minScale: 5,
  maxScale: 300,
  maxHistorySize: 50
};
```

## 🚀 Performance

### Otimizações Implementadas

```typescript
// 1. Debounce de renderização
const debouncedRender = useMemo(
  () => debounce(renderImage, 100),
  []
);

// 2. Memoização de cálculos
const scaleFactor = useMemo(() => {
  return Math.min(
    MAX_PREVIEW_SIZE / width,
    MAX_PREVIEW_SIZE / height,
    1
  );
}, [width, height]);

// 3. Canvas offscreen para processamento
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d', {
  willReadFrequently: true
});
```

## 📚 Dependências

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "lucide-react": "^0.x.x",
    "@radix-ui/react-dialog": "^1.x.x",
    "@radix-ui/react-slider": "^1.x.x",
    "@radix-ui/react-select": "^1.x.x",
    "sonner": "^2.0.3"
  }
}
```

## 🐛 Debugging

### Console Logs Úteis

```typescript
// Estado da imagem
console.log('Image size:', {
  width: image.width,
  height: image.height,
  dataUrl: image.src.substring(0, 50) + '...'
});

// Transformações aplicadas
console.log('Transformations:', {
  rotation,
  scale,
  flipH: flipHorizontal,
  flipV: flipVertical
});

// Tamanho do histórico
console.log('History:', {
  length: history.length,
  index: historyIndex,
  canUndo: historyIndex > 0,
  canRedo: historyIndex < history.length - 1
});
```

### Erros Comuns

```typescript
// Imagem não carrega
// Verificar: CORS, URL válida, formato suportado

// Canvas vazio
// Verificar: Dimensões não zero, contexto obtido

// Transformações não aplicadas
// Verificar: renderImage() sendo chamado, estados atualizados
```

## 📖 Referências

- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [CSS Filters - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/filter)
- [Data URLs - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)

---

**Última Atualização**: Outubro 2025
**Versão**: 1.0.0
**Autor**: Sistema CMS
