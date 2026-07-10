import { webhookCallback, session, type Context } from 'grammy';
import { getBot, type BotSessionData } from './bot';
import { conversationRepository, campaignRepository } from '@/infrastructure/dynamodb/repositories';
import { createScreeningSession } from '@/application/conversation/start-screening';
import { processMessage } from '@/application/conversation/process-message';
import { evaluateConversation } from '@/application/evaluation/evaluate-conversation';
import { generateConversationResponse, runEvaluatorPrompt } from '@/infrastructure/openai/chat-client';
import { logger } from '@/infrastructure/logging/logger';
import { generateCorrelationId } from '@/shared/utils/correlation';

let botConfigured = false;

export function setupBot(): void {
  if (botConfigured) return;
  botConfigured = true;

  const bot = getBot();

  // Sesión en memoria por chat — suficiente para desarrollo/demo (así lo
  // documentaba el código original: "en producción, usar session cache").
  bot.use(session<BotSessionData, Context>({ initial: () => ({}) }));

  bot.command('start', async (ctx) => {
    const correlationId = generateCorrelationId();
    const campaignId = ctx.match;
    const telegramUserId = String(ctx.from?.id || '');
    const chatId = ctx.chat.id;

    if (!campaignId) {
      await ctx.reply('¡Hola! Para iniciar una entrevista, necesitas un enlace válido de campaña.');
      return;
    }

    try {
      const campaign = await campaignRepository.findByCampaignId(campaignId);
      if (!campaign) {
        await ctx.reply('No encontramos esa campaña. Verifica el enlace e intenta de nuevo.');
        return;
      }

      if (campaign.status !== 'active') {
        await ctx.reply('Esta campaña no está activa actualmente.');
        return;
      }

      const existing = await conversationRepository.findByTelegramUser(telegramUserId, campaignId);
      if (existing) {
        ctx.session.tenantId = campaign.tenantId;
        ctx.session.campaignId = campaignId;
        ctx.session.conversationId = existing.conversationId;

        if (existing.state === 'completed') {
          await ctx.reply('Tu entrevista ya fue completada. ¡Gracias por participar! El equipo de reclutamiento se pondrá en contacto contigo.');
        } else {
          await ctx.reply('¡Hola de nuevo! Continuemos donde lo dejamos. Escribe tu siguiente mensaje.');
        }
        return;
      }

      logger.info('telegram', 'New screening started', {
        correlationId,
        tenantId: campaign.tenantId,
        context: { campaignId, telegramUserId },
      });

      const session = await createScreeningSession(
        campaign.tenantId,
        { campaignId, careerPageUrl: campaign.careerPageUrl },
        { telegramUserId, telegramChatId: chatId, campaignId },
      );

      if (!session.success || !session.conversation) {
        await ctx.reply('Lo siento, ha ocurrido un error al iniciar tu entrevista. Intenta de nuevo más tarde.');
        return;
      }

      ctx.session.tenantId = campaign.tenantId;
      ctx.session.campaignId = campaignId;
      ctx.session.conversationId = session.conversation.conversationId;

      logger.info('telegram', 'Conversation created', {
        correlationId,
        tenantId: campaign.tenantId,
        context: {
          campaignId,
          telegramUserId,
          conversationId: session.conversation.conversationId,
          candidateId: session.candidate?.candidateId,
        },
      });

      const result = await processMessage({
        tenantId: campaign.tenantId,
        conversation: session.conversation,
        message: '/start',
        rubric: campaign.rubric,
        knowledgeBaseContent: campaign.knowledgeBaseContent,
        generateAgentResponse: generateConversationResponse,
      });

      await ctx.reply(result.agentResponse);
    } catch (error) {
      logger.error('telegram', 'Error handling /start command', {
        correlationId,
        error: error instanceof Error ? error : new Error(String(error)),
        context: { campaignId, telegramUserId },
      });
      await ctx.reply('Lo siento, ha ocurrido un error. Por favor intenta de nuevo más tarde.');
    }
  });

  bot.on('message:text', async (ctx) => {
    const correlationId = generateCorrelationId();
    const telegramUserId = String(ctx.from?.id || '');
    const message = ctx.message.text;
    const { tenantId, campaignId, conversationId } = ctx.session;

    if (!tenantId || !campaignId || !conversationId) {
      await ctx.reply('Para comenzar tu entrevista, usa el enlace que te compartió el reclutador (contiene /start seguido del código de la campaña).');
      return;
    }

    try {
      logger.info('telegram', 'Message received', {
        correlationId,
        tenantId,
        context: { telegramUserId, campaignId, conversationId, messageLength: message.length },
      });

      const conversation = await conversationRepository.findById(tenantId, conversationId);
      if (!conversation) {
        await ctx.reply('No encontramos tu entrevista en curso. Usa el enlace de la campaña para comenzar de nuevo.');
        return;
      }

      if (conversation.state === 'completed') {
        await ctx.reply('Tu entrevista ya fue completada. ¡Gracias por participar!');
        return;
      }

      const campaign = await campaignRepository.findById(tenantId, campaignId);
      if (!campaign) {
        await ctx.reply('Lo siento, ha ocurrido un error. Por favor intenta de nuevo más tarde.');
        return;
      }

      const result = await processMessage({
        tenantId,
        conversation,
        message,
        rubric: campaign.rubric,
        knowledgeBaseContent: campaign.knowledgeBaseContent,
        generateAgentResponse: generateConversationResponse,
      });

      await ctx.reply(result.agentResponse);

      if (result.shouldEvaluate) {
        try {
          await evaluateConversation({
            tenantId,
            conversationId,
            rubric: campaign.rubric,
            runEvaluatorPrompt,
          });
        } catch (evalError) {
          logger.error('telegram', 'Error generating evaluation', {
            correlationId,
            tenantId,
            error: evalError instanceof Error ? evalError : new Error(String(evalError)),
            context: { conversationId, campaignId },
          });
        }
      }
    } catch (error) {
      logger.error('telegram', 'Error processing message', {
        correlationId,
        tenantId,
        error: error instanceof Error ? error : new Error(String(error)),
        context: { telegramUserId, campaignId, conversationId },
      });
      await ctx.reply('Estoy teniendo dificultades técnicas. Puedes intentar de nuevo en unos minutos. Tu progreso está guardado.');
    }
  });
}

export function getWebhookHandler() {
  setupBot();
  return webhookCallback(getBot(), 'std/http');
}
