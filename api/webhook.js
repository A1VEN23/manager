const { getHistory, addMessage } = require('../services/memory');
const { generateResponse } = require('../services/ai');
const { sendMessage } = require('../services/instagram');

exports.handler = async (event, context) => {
  try {
    const { httpMethod, queryStringParameters, body } = event;

    // Обработка верификации вебхука (GET запрос)
    if (httpMethod === 'GET') {
      const mode = queryStringParameters['hub.mode'];
      const token = queryStringParameters['hub.verify_token'];
      const challenge = queryStringParameters['hub.challenge'];

      if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
        return {
          statusCode: 200,
          body: challenge
        };
      } else {
        return {
          statusCode: 403,
          body: 'Verification failed'
        };
      }
    }

    // Обработка входящих сообщений (POST запрос)
    if (httpMethod === 'POST') {
      const data = JSON.parse(body);

      // Проверяем, что это сообщение от Instagram
      if (data.object === 'instagram' && data.entry) {
        for (const entry of data.entry) {
          if (entry.messaging) {
            for (const messaging of entry.messaging) {
              // Обрабатываем только текстовые сообщения от пользователей
              if (messaging.message && messaging.message.text) {
                const senderId = messaging.sender.id;
                const messageText = messaging.message.text;

                // Сохраняем сообщение пользователя в историю
                await addMessage(senderId, 'user', messageText);

                // Получаем историю диалога
                const history = await getHistory(senderId);

                // Получаем ответ от ИИ
                const aiResponse = await generateResponse(
                  process.env.SYSTEM_PROMPT || 'Вы - полезный AI ассистент для Instagram Direct.',
                  history,
                  messageText
                );

                // Отправляем ответ пользователю
                await sendMessage(senderId, aiResponse);

                // Сохраняем ответ ИИ в историю
                await addMessage(senderId, 'assistant', aiResponse);
              }
            }
          }
        }
      }

      // Всегда возвращаем 200 OK, чтобы Meta не повторял запросы
      return {
        statusCode: 200,
        body: 'OK'
      };
    }

    return {
      statusCode: 404,
      body: 'Not Found'
    };

  } catch (error) {
    console.error('Webhook error:', error);
    
    // Даже в случае ошибки возвращаем 200 OK, чтобы Meta не повторял запросы
    return {
      statusCode: 200,
      body: 'OK'
    };
  }
};
