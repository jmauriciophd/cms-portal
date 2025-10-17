import { useState, useEffect, useRef } from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

interface Suggestion {
  text: string;
  type: 'completion' | 'continuation' | 'enhancement';
  confidence: number;
}

interface TextSuggestionsProps {
  currentText: string;
  cursorPosition: number;
  onAcceptSuggestion: (suggestion: string) => void;
}

export function TextSuggestions({ 
  currentText, 
  cursorPosition, 
  onAcceptSuggestion 
}: TextSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Base de conhecimento para sugestões inteligentes
  const knowledgeBase = {
    greetings: {
      triggers: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite'],
      suggestions: [
        'Olá! Seja bem-vindo ao nosso site.',
        'Oi! Estamos felizes em ter você aqui.',
        'Bem-vindo! Explore nossos conteúdos e serviços.',
      ]
    },
    introduction: {
      triggers: ['somos', 'empresa', 'organização', 'equipe'],
      suggestions: [
        'Somos uma empresa dedicada a fornecer soluções inovadoras para nossos clientes.',
        'Nossa equipe é composta por profissionais experientes e apaixonados pelo que fazem.',
        'Trabalhamos com excelência e comprometimento para superar expectativas.',
      ]
    },
    services: {
      triggers: ['serviços', 'oferecemos', 'soluções', 'produtos'],
      suggestions: [
        'Oferecemos uma ampla gama de serviços personalizados para atender suas necessidades.',
        'Nossos produtos são desenvolvidos com tecnologia de ponta e foco em qualidade.',
        'Soluções completas e integradas para impulsionar seu negócio.',
      ]
    },
    contact: {
      triggers: ['contato', 'fale conosco', 'entre em contato'],
      suggestions: [
        'Entre em contato conosco para mais informações. Estamos à disposição!',
        'Fale conosco através dos nossos canais de atendimento. Teremos prazer em ajudar.',
        'Nossa equipe está pronta para atender você. Entre em contato!',
      ]
    },
    benefits: {
      triggers: ['benefícios', 'vantagens', 'diferenciais'],
      suggestions: [
        'Nossos principais benefícios incluem qualidade, confiabilidade e suporte especializado.',
        'As vantagens de trabalhar conosco vão além do esperado.',
        'Nossos diferenciais garantem a melhor experiência para você.',
      ]
    },
    technology: {
      triggers: ['tecnologia', 'inovação', 'digital', 'sistema'],
      suggestions: [
        'Utilizamos as mais modernas tecnologias para garantir eficiência e segurança.',
        'Nossa plataforma digital oferece uma experiência inovadora e intuitiva.',
        'Sistemas desenvolvidos com as melhores práticas do mercado.',
      ]
    },
    quality: {
      triggers: ['qualidade', 'excelência', 'padrão'],
      suggestions: [
        'Nosso compromisso com a qualidade é refletido em cada detalhe do nosso trabalho.',
        'Mantemos os mais altos padrões de excelência em tudo que fazemos.',
        'Qualidade superior é nossa prioridade em cada projeto.',
      ]
    },
    experience: {
      triggers: ['experiência', 'anos', 'mercado', 'história'],
      suggestions: [
        'Com anos de experiência no mercado, somos referência em nosso segmento.',
        'Nossa trajetória é marcada por conquistas e satisfação de nossos clientes.',
        'História construída com dedicação e resultados consistentes.',
      ]
    },
    team: {
      triggers: ['equipe', 'time', 'profissionais', 'especialistas'],
      suggestions: [
        'Nossa equipe de especialistas está pronta para atender suas demandas.',
        'Profissionais qualificados e comprometidos com a sua satisfação.',
        'Time experiente dedicado a entregar os melhores resultados.',
      ]
    },
    customer: {
      triggers: ['cliente', 'clientes', 'parceiros'],
      suggestions: [
        'Nossos clientes são nossa maior prioridade e inspiração.',
        'Trabalhamos em parceria com nossos clientes para alcançar o sucesso.',
        'A satisfação do cliente é o que nos motiva a melhorar continuamente.',
      ]
    }
  };

  const commonPhrases = [
    'Saiba mais sobre',
    'Descubra como',
    'Conheça nossos',
    'Explore todas as',
    'Aproveite os benefícios de',
    'Tenha acesso a',
    'Transforme sua experiência com',
    'Otimize seus resultados através de',
  ];

  const continuations = {
    'Como': ['podemos ajudar você?', 'funciona nosso serviço?', 'começar?'],
    'Por que': ['escolher nossa empresa?', 'somos diferentes?', 'confiamos em tecnologia?'],
    'O que': ['fazemos de melhor?', 'nos torna únicos?', 'oferecemos?'],
    'Quando': ['você precisa de', 'é o melhor momento para'],
    'Onde': ['estamos localizados?', 'você pode nos encontrar?'],
  };

  useEffect(() => {
    // Limpa o timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Aguarda um momento antes de gerar sugestões
    timeoutRef.current = setTimeout(() => {
      generateSuggestions();
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentText, cursorPosition]);

  const generateSuggestions = () => {
    const textBeforeCursor = currentText.substring(0, cursorPosition).toLowerCase();
    const words = textBeforeCursor.split(/\s+/);
    const lastWords = words.slice(-3).join(' ');
    const lastWord = words[words.length - 1] || '';

    const newSuggestions: Suggestion[] = [];

    // Verifica palavras-chave da base de conhecimento
    Object.entries(knowledgeBase).forEach(([category, data]) => {
      data.triggers.forEach(trigger => {
        if (lastWords.includes(trigger)) {
          data.suggestions.forEach((suggestion, index) => {
            newSuggestions.push({
              text: suggestion,
              type: 'continuation',
              confidence: 0.9 - (index * 0.1)
            });
          });
        }
      });
    });

    // Sugestões de continuação baseadas em início de frase
    Object.entries(continuations).forEach(([start, ends]) => {
      if (lastWords.endsWith(start.toLowerCase())) {
        ends.forEach((end, index) => {
          newSuggestions.push({
            text: `${start} ${end}`,
            type: 'continuation',
            confidence: 0.85 - (index * 0.1)
          });
        });
      }
    });

    // Sugestões de frases comuns se o texto estiver vazio ou com poucas palavras
    if (words.length < 5) {
      commonPhrases.forEach((phrase, index) => {
        if (phrase.toLowerCase().startsWith(lastWord)) {
          newSuggestions.push({
            text: phrase,
            type: 'completion',
            confidence: 0.7 - (index * 0.05)
          });
        }
      });
    }

    // Auto-complete de palavras comuns
    const commonWords = [
      'empresa', 'serviços', 'soluções', 'produtos', 'qualidade', 'excelência',
      'tecnologia', 'inovação', 'experiência', 'profissionais', 'clientes',
      'atendimento', 'suporte', 'garantia', 'segurança', 'confiança'
    ];

    if (lastWord.length >= 2) {
      commonWords.forEach(word => {
        if (word.startsWith(lastWord) && word !== lastWord) {
          newSuggestions.push({
            text: word,
            type: 'completion',
            confidence: 0.6
          });
        }
      });
    }

    // Ordena por confiança
    newSuggestions.sort((a, b) => b.confidence - a.confidence);

    // Limita a 5 sugestões
    setSuggestions(newSuggestions.slice(0, 5));
    setShowSuggestions(newSuggestions.length > 0 && lastWord.length >= 2);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Tab' || e.key === 'Enter') {
      if (e.key === 'Tab' || (e.key === 'Enter' && e.ctrlKey)) {
        e.preventDefault();
        acceptSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const acceptSuggestion = (suggestion: Suggestion) => {
    onAcceptSuggestion(suggestion.text);
    setShowSuggestions(false);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, suggestions, selectedIndex]);

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full left-0 mb-2 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg z-10 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 border-b flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <span className="text-sm text-gray-700">Sugestões Inteligentes</span>
        <span className="text-xs text-gray-500 ml-auto">Tab para aceitar</span>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => acceptSuggestion(suggestion)}
            className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-start gap-2 ${
              index === selectedIndex ? 'bg-blue-100' : ''
            }`}
          >
            <Lightbulb className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
              suggestion.type === 'continuation' ? 'text-purple-500' : 
              suggestion.type === 'enhancement' ? 'text-green-500' : 
              'text-blue-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 line-clamp-2">
                {suggestion.text}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  suggestion.type === 'continuation' ? 'bg-purple-100 text-purple-700' :
                  suggestion.type === 'enhancement' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {suggestion.type === 'continuation' ? 'Continuação' :
                   suggestion.type === 'enhancement' ? 'Melhoria' :
                   'Completar'}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full"
                    style={{ width: `${suggestion.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="bg-gray-50 px-3 py-2 border-t">
        <p className="text-xs text-gray-600">
          ↑↓ Navegar • Tab/Ctrl+Enter Aceitar • Esc Fechar
        </p>
      </div>
    </div>
  );
}
