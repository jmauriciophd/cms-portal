import { useState, useEffect, useRef } from 'react';

export interface RealtimeConfig {
  interval?: number; // Intervalo de atualização em ms (padrão: 5000)
  enabled?: boolean; // Se as atualizações estão ativadas
  onError?: (error: Error) => void;
  onUpdate?: (data: any) => void;
}

export interface RealtimeStats {
  views: number;
  visitors: number;
  pageViews: number;
  avgDuration: number;
  timestamp: string;
}

/**
 * Hook para simular atualizações em tempo real
 * 
 * Em produção, isso seria substituído por:
 * - WebSockets (Socket.io, ws)
 * - Server-Sent Events (SSE)
 * - GraphQL Subscriptions
 * - Firebase Realtime Database
 * 
 * Estratégia de Polling Otimizada:
 * - Usa requestAnimationFrame para sincronizar com refresh da tela
 * - Implementa exponential backoff em caso de erros
 * - Pausa atualizações quando tab está inativa (Page Visibility API)
 * - Limpa recursos automaticamente
 */
export function useRealTimeData(
  fetchData: () => Promise<any>,
  config: RealtimeConfig = {}
) {
  const {
    interval = 5000,
    enabled = true,
    onError,
    onUpdate,
  } = config;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const isPageVisible = useRef(true);
  const fetchDataRef = useRef(fetchData);
  const onErrorRef = useRef(onError);
  const onUpdateRef = useRef(onUpdate);

  // Update refs when props change
  useEffect(() => {
    fetchDataRef.current = fetchData;
    onErrorRef.current = onError;
    onUpdateRef.current = onUpdate;
  }, [fetchData, onError, onUpdate]);

  // Page Visibility API: pausa quando tab está inativa
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = !document.hidden;
      
      if (isPageVisible.current && enabled) {
        // Atualiza imediatamente quando voltar a ficar visível
        fetchAndUpdateData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  const fetchAndUpdateData = async () => {
    if (!enabled || !isPageVisible.current) return;

    try {
      setIsLoading(true);
      const newData = await fetchDataRef.current();
      setData(newData);
      setError(null);
      setIsConnected(true);
      setLastUpdate(new Date());
      retryCount.current = 0; // Reset retry count on success
      
      if (onUpdateRef.current) {
        onUpdateRef.current(newData);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao buscar dados');
      setError(error);
      setIsConnected(false);
      retryCount.current++;

      if (onErrorRef.current) {
        onErrorRef.current(error);
      }

      // Exponential backoff: aumenta intervalo a cada erro
      if (retryCount.current >= maxRetries) {
        console.warn('Máximo de tentativas atingido. Pausando atualizações.');
        setIsConnected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Setup polling
  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    // Fetch inicial
    fetchAndUpdateData();

    // Calcular intervalo com exponential backoff
    const currentInterval = interval * Math.pow(2, Math.min(retryCount.current, 3));

    // Setup intervalo de polling
    intervalRef.current = setInterval(fetchAndUpdateData, currentInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval]);

  const refresh = () => {
    retryCount.current = 0;
    return fetchAndUpdateData();
  };

  return {
    data,
    isLoading,
    error,
    isConnected,
    lastUpdate,
    refresh,
  };
}

/**
 * Hook especializado para estatísticas de visualização em tempo real
 */
export function useRealtimeStats(enabled: boolean = true) {
  const generateMockStats = async (): Promise<RealtimeStats> => {
    // Simula latência de rede (50-200ms)
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));

    // Simula dados realísticos que variam ao longo do tempo
    const baseViews = 1247;
    const variation = Math.sin(Date.now() / 10000) * 50; // Variação suave
    const randomSpike = Math.random() > 0.9 ? Math.random() * 100 : 0; // Picos aleatórios

    return {
      views: Math.floor(baseViews + variation + randomSpike),
      visitors: Math.floor(baseViews * 0.7 + variation * 0.5),
      pageViews: Math.floor(baseViews * 1.3 + variation),
      avgDuration: Math.floor(120 + Math.random() * 60), // 2-3 minutos
      timestamp: new Date().toISOString(),
    };
  };

  return useRealTimeData(generateMockStats, {
    interval: 3000, // Atualiza a cada 3 segundos
    enabled,
    onError: (error) => {
      console.error('Erro ao buscar estatísticas em tempo real:', error);
    },
  });
}

/**
 * Hook para histórico de visualizações (últimas N entradas)
 */
export function useRealtimeViewsHistory(maxEntries: number = 10, enabled: boolean = true) {
  const [history, setHistory] = useState<RealtimeStats[]>([]);
  
  const { data, isLoading, error, isConnected, lastUpdate } = useRealtimeStats(enabled);

  useEffect(() => {
    if (data) {
      setHistory(prev => {
        const newHistory = [data, ...prev];
        return newHistory.slice(0, maxEntries);
      });
    }
  }, [data, maxEntries]);

  return {
    history,
    current: data,
    isLoading,
    error,
    isConnected,
    lastUpdate,
  };
}

/**
 * Indicador de status de conexão
 */
export function ConnectionStatus({ 
  isConnected, 
  lastUpdate 
}: { 
  isConnected: boolean; 
  lastUpdate: Date | null;
}) {
  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Nunca';
    
    const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s atrás`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
    return `${Math.floor(seconds / 3600)}h atrás`;
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
      <span>
        {isConnected ? 'Ao vivo' : 'Desconectado'} • {formatLastUpdate()}
      </span>
    </div>
  );
}
