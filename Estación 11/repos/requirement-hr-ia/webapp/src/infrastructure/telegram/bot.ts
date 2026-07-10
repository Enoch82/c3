import { Bot, type Context, type SessionFlavor } from 'grammy';

// Contexto de sesión por chat — resuelve a qué conversación/campaña
// pertenece cada mensaje entrante (necesario tanto para el webhook
// como para long-polling, ya que un mensaje de texto no trae el
// campaignId por sí mismo).
export interface BotSessionData {
  tenantId?: string;
  campaignId?: string;
  conversationId?: string;
}

export type BotContext = Context & SessionFlavor<BotSessionData>;

let botInstance: Bot<BotContext> | null = null;

export function getBot(): Bot<BotContext> {
  if (!botInstance) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    botInstance = new Bot<BotContext>(token);
  }
  return botInstance;
}

export async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  const bot = getBot();
  await bot.api.sendMessage(chatId, text);
}
