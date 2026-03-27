const { GoogleGenerativeAI } = require('@google/generative-ai');

// Инициализация Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Генерирует ответ с помощью Google Gemini
 * @param {string} systemPrompt - Системный промпт (база знаний клиента)
 * @param {Array} history - История диалога в формате [{role, text}]
 * @param {string} userMessage - Новое сообщение от пользователя
 * @returns {Promise<string>} - Текстовый ответ от ИИ
 */
async function generateResponse(systemPrompt, history, userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Формируем контекст для модели
    let conversationHistory = '';
    
    // Добавляем системный промпт
    conversationHistory += `Системная инструкция: ${systemPrompt}\n\n`;
    
    // Добавляем историю диалога (последние 10 сообщений для контекста)
    const recentHistory = history.slice(-10);
    if (recentHistory.length > 0) {
      conversationHistory += 'История диалога:\n';
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
        conversationHistory += `${role}: ${msg.text}\n`;
      });
      conversationHistory += '\n';
    }
    
    // Добавляем текущее сообщение
    conversationHistory += `Текущее сообщение пользователя: ${userMessage}\n\n`;
    conversationHistory += 'Пожалуйста, ответь на текущее сообщение пользователя, учитывая контекст и системную инструкцию. Ответ должен быть кратким и по делу, подходящим для Instagram Direct.';

    // Генерируем ответ
    const result = await model.generateContent(conversationHistory);
    const response = await result.response;
    const text = response.text();

    // Очищаем ответ от лишних символов и форматируем
    return text.trim().replace(/^["']|["']$/g, '');

  } catch (error) {
    console.error('AI generation error:', error);
    
    // Возвращаем запасной ответ в случае ошибки
    return 'Извините, произошла ошибка. Попробуйте задать вопрос еще раз.';
  }
}

/**
 * Генерирует ответ без истории (для первого сообщения)
 * @param {string} systemPrompt - Системный промпт
 * @param {string} userMessage - Сообщение пользователя
 * @returns {Promise<string>} - Ответ от ИИ
 */
async function generateFirstResponse(systemPrompt, userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `${systemPrompt}\n\nПользователь пишет: ${userMessage}\n\nПожалуйста, ответь кратко и дружелюбно, как в Instagram Direct.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim().replace(/^["']|["']$/g, '');

  } catch (error) {
    console.error('AI first response error:', error);
    return 'Здравствуйте! Чем могу помочь?';
  }
}

/**
 * Проверяет доступность Gemini API
 * @returns {Promise<boolean>} - true если API доступен
 */
async function checkApiAvailability() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    await model.generateContent('test');
    return true;
  } catch (error) {
    console.error('API availability check failed:', error);
    return false;
  }
}

module.exports = {
  generateResponse,
  generateFirstResponse,
  checkApiAvailability
};
