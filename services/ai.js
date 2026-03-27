const { GoogleGenerativeAI } = require('@google/generative-ai');

// Инициализация Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// База знаний клиента - ИЗМЕНИТЕ ЭТОТ БЛОК ПОД КАЖДОГО КЛИЕНТА
const CLIENT_KNOWLEDGE_BASE = `
[СЮДА ВСТАВЬТЕ ПРАЙС, УСЛУГИ И ИНФОРМАЦИЮ О КОМПАНИИ]
Пример:
- Услуга 1: 10000 руб, срок 3 дня
- Услуга 2: 15000 руб, срок 5 дней  
- Услуга 3: 20000 руб, срок 7 дней
Компания: [НАЗВАНИЕ КОМПАНИИ]
Контакты: [КОНТАКТНАЯ ИНФОРМАЦИЯ]
`;

// Системный промпт для Gemini
const SYSTEM_INSTRUCTION = `
1. ИДЕНТИЧНОСТЬ И СТИЛЬ:
Ты — профессиональный менеджер компании. Твоя задача — консультировать клиентов в Instagram Direct и помогать им с выбором.
Твой стиль общения: строгий минимализм. Отвечай коротко, емко и по делу. Никаких длинных полотен текста. Форматируй ответы так, чтобы их было удобно читать с экрана телефона (используй абзацы из 1-2 предложений).

2. ПРАВИЛА ПОВЕДЕНИЯ (СТРОГИЕ ОГРАНИЧЕНИЯ):

НИКОГДА не выдумывай цены, услуги или товары, которых нет в Базе Знаний.

Если клиент спрашивает о том, чего нет в Базе Знаний, честно скажи, что уточнишь этот вопрос у коллег, и переведи диалог на человека.

Не давай абстрактных советов. Опирайся только на факты из Базы Знаний.

Завершай каждое свое сообщение ОДНИМ вовлекающим или уточняющим вопросом, чтобы вести клиента по воронке продаж.

3. КОНТЕКСТ И АНАЛИЗ:
Перед тем как ответить, проанализируй историю диалога. Учитывай уже названные клиентом параметры (бюджет, размеры, сроки, проблемы), чтобы не переспрашивать их дважды.

4. БАЗА ЗНАНИЙ КЛИЕНТА:
${CLIENT_KNOWLEDGE_BASE}
`;

/**
 * Генерирует ответ с помощью Google Gemini
 * @param {string} customSystemPrompt - Дополнительный системный промпт (опционально)
 * @param {Array} history - История диалога в формате [{role, text}]
 * @param {string} userMessage - Новое сообщение от пользователя
 * @returns {Promise<string>} - Текстовый ответ от ИИ
 */
async function generateResponse(customSystemPrompt, history, userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Формируем полный системный промпт
    let fullSystemPrompt = SYSTEM_INSTRUCTION;
    if (customSystemPrompt) {
      fullSystemPrompt += `\n\nДОПОЛНИТЕЛЬНАЯ ИНСТРУКЦИЯ: ${customSystemPrompt}`;
    }

    // Формируем контекст для модели
    let conversationHistory = '';
    
    // Добавляем системный промпт
    conversationHistory += `СИСТЕМНАЯ ИНСТРУКЦИЯ:\n${fullSystemPrompt}\n\n`;
    
    // Добавляем историю диалога с четким разделением ролей
    const recentHistory = history.slice(-10);
    if (recentHistory.length > 0) {
      conversationHistory += 'ИСТОРИЯ ДИАЛОГА:\n';
      recentHistory.forEach(msg => {
        if (msg.role === 'user') {
          conversationHistory += `КЛИЕНТ: ${msg.text}\n`;
        } else if (msg.role === 'assistant') {
          conversationHistory += `МЕНЕДЖЕР (ВЫ): ${msg.text}\n`;
        }
      });
      conversationHistory += '\n';
    }
    
    // Добавляем текущее сообщение
    conversationHistory += `ТЕКУЩЕЕ СООБЩЕНИЕ КЛИЕНТА: ${userMessage}\n\n`;
    conversationHistory += `ЗАДАНИЕ: Ответь клиенту, строго следуя системной инструкции. Учитывай историю диалога и базу знаний. Заверши ответ одним уточняющим вопросом.`;

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
 * @param {string} customSystemPrompt - Дополнительный системный промпт (опционально)
 * @param {string} userMessage - Сообщение пользователя
 * @returns {Promise<string>} - Ответ от ИИ
 */
async function generateFirstResponse(customSystemPrompt, userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Формируем полный системный промпт
    let fullSystemPrompt = SYSTEM_INSTRUCTION;
    if (customSystemPrompt) {
      fullSystemPrompt += `\n\nДОПОЛНИТЕЛЬНАЯ ИНСТРУКЦИЯ: ${customSystemPrompt}`;
    }
    
    const prompt = `СИСТЕМНАЯ ИНСТРУКЦИЯ:\n${fullSystemPrompt}\n\nТЕКУЩЕЕ СООБЩЕНИЕ КЛИЕНТА: ${userMessage}\n\nЗАДАНИЕ: Это первое сообщение клиента. Ответь строго следуя системной инструкции. Заверши ответ одним уточняющим вопросом.`;
    
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
