import { useEffect, useState } from 'react';
import { StorageQuotaService } from '../../services/StorageQuotaService';
import { toast } from 'sonner@2.0.3';

/**
 * Hook para manutenção automática do armazenamento
 * Executa limpeza automática periodicamente
 */
export function useStorageMaintenance() {
  useEffect(() => {
    // Executar manutenção ao carregar
    const performInitialMaintenance = async () => {
      console.log('Iniciando manutenção de armazenamento...');
      await StorageQuotaService.performMaintenance();
      
      // Verificar saúde após manutenção
      const health = StorageQuotaService.checkHealth();
      
      if (health.status === 'critical') {
        toast.warning(
          'Armazenamento crítico! Esvazie a lixeira para evitar perda de dados.',
          { duration: 10000 }
        );
      }
    };

    performInitialMaintenance();

    // Executar manutenção a cada 30 minutos
    const maintenanceInterval = setInterval(() => {
      StorageQuotaService.performMaintenance();
    }, 30 * 60 * 1000); // 30 minutos

    // Verificar saúde a cada 5 minutos
    const healthCheckInterval = setInterval(() => {
      const health = StorageQuotaService.checkHealth();
      
      if (health.status === 'critical') {
        toast.error(
          `Armazenamento crítico (${health.percentage.toFixed(1)}%)! Esvazie a lixeira urgentemente.`,
          { duration: 10000 }
        );
      } else if (health.status === 'warning') {
        // Apenas mostrar no console para não incomodar demais
        console.warn(`Armazenamento em alerta: ${health.percentage.toFixed(1)}%`);
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      clearInterval(maintenanceInterval);
      clearInterval(healthCheckInterval);
    };
  }, []);

  return null;
}

/**
 * Hook para monitorar uso de armazenamento
 */
export function useStorageStats() {
  const [stats, setStats] = useState(StorageQuotaService.getStorageStats());
  const [health, setHealth] = useState(StorageQuotaService.checkHealth());

  useEffect(() => {
    const updateStats = () => {
      setStats(StorageQuotaService.getStorageStats());
      setHealth(StorageQuotaService.checkHealth());
    };

    // Atualizar a cada 10 segundos
    const interval = setInterval(updateStats, 10000);

    // Listener para eventos de storage
    const handleStorageChange = () => {
      updateStats();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('filesUpdated', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('filesUpdated', handleStorageChange);
    };
  }, []);

  return { stats, health };
}
