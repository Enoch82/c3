import { getBot } from './bot';
import { setupBot } from './webhook-handler';
import { logger } from '@/infrastructure/logging/logger';

let pollingStarted = false;

// Alternativa a setWebhook para desarrollo local: en vez de que Telegram
// empuje updates a una URL pública (requiere HTTPS/ALB, ver deployment-architecture.md),
// el bot los va a buscar activamente via getUpdates. Útil cuando no hay túnel
// público expuesto hacia localhost.
export function startTelegramPolling(): void {
  if (pollingStarted) return;
  pollingStarted = true;

  void (async () => {
    const bot = getBot();
    setupBot();

    try {
      // Un bot no puede tener webhook Y long-polling activos a la vez —
      // Telegram devuelve 409 si hay un webhook registrado.
      await bot.api.deleteWebhook();
    } catch (error) {
      logger.warn('telegram', 'deleteWebhook falló antes de iniciar polling (continuando)', {
        context: { error: String(error) },
      });
    }

    try {
      await bot.start({
        onStart: (info) => {
          logger.info('telegram', 'Long-polling iniciado', {
            context: { botUsername: info.username },
          });
          console.log(`[Telegram] Long-polling iniciado — @${info.username}`);
        },
      });
    } catch (error) {
      logger.error('telegram', 'Long-polling terminó con error', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  })();
}
