const { Redis } = require('@upstash/redis');

// Инициализация Redis клиента
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Получает историю диалога для пользователя
 * @param {string} userId - ID пользователя Instagram
 * @returns {Promise<Array>} - Массив сообщений в формате [{role, text, timestamp}]
 */
async function getHistory(userId) {
  try {
    const key = `chat:${userId}`;
    const messages = await redis.lrange(key, 0, -1);
    
    // Преобразуем строки обратно в объекты
    return messages.map(msg => JSON.parse(msg)).reverse();
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

/**
 * Добавляет новое сообщение в историю диалога
 * @param {string} userId - ID пользователя Instagram
 * @param {string} role - Роль ('user' или 'assistant')
 * @param {string} text - Текст сообщения
 * @returns {Promise<void>}
 */
async function addMessage(userId, role, text) {
  try {
    const key = `chat:${userId}`;
    const message = {
      role,
      text,
      timestamp: new Date().toISOString()
    };
    
    // Добавляем сообщение в начало списка
    await redis.lpush(key, JSON.stringify(message));
    
    // Ограничиваем историю последними 15 сообщениями
    await redis.ltrim(key, 0, 14);
    
    // Устанавливаем TTL 24 часа
    await redis.expire(key, 86400);
    
  } catch (error) {
    console.error('Error adding message:', error);
  }
}

/**
 * Очищает историю диалога пользователя
 * @param {string} userId - ID пользователя Instagram
 * @returns {Promise<void>}
 */
async function clearHistory(userId) {
  try {
    const key = `chat:${userId}`;
    await redis.del(key);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

/**
 * Получает количество сообщений в истории
 * @param {string} userId - ID пользователя Instagram
 * @returns {Promise<number>} - Количество сообщений
 */
async function getHistoryLength(userId) {
  try {
    const key = `chat:${userId}`;
    return await redis.llen(key);
  } catch (error) {
    console.error('Error getting history length:', error);
    return 0;
  }
}

module.exports = {
  getHistory,
  addMessage,
  clearHistory,
  getHistoryLength
};
