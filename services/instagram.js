const axios = require('axios');

/**
 * Отправляет текстовое сообщение пользователю в Instagram Direct
 * @param {string} recipientId - ID получателя (Instagram User ID)
 * @param {string} messageText - Текст сообщения
 * @returns {Promise<boolean>} - true если сообщение отправлено успешно
 */
async function sendMessage(recipientId, messageText) {
  try {
    const url = `https://graph.facebook.com/v18.0/me/messages`;
    
    const payload = {
      recipient: { id: recipientId },
      message: { text: messageText },
      messaging_type: 'RESPONSE'
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`
    };

    const response = await axios.post(url, payload, { headers });

    if (response.data && response.data.message_id) {
      console.log(`Message sent successfully to ${recipientId}, message_id: ${response.data.message_id}`);
      return true;
    } else {
      console.error('Unexpected response from Meta API:', response.data);
      return false;
    }

  } catch (error) {
    console.error('Error sending message to Instagram:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Отправляет сообщение с быстрыми ответами (кнопками)
 * @param {string} recipientId - ID получателя
 * @param {string} messageText - Текст сообщения
 * @param {Array} quickReplies - Массив быстрых ответов в формате [{content_type: 'text', title: 'Option 1', payload: 'OPTION_1'}]
 * @returns {Promise<boolean>} - true если сообщение отправлено успешно
 */
async function sendMessageWithQuickReplies(recipientId, messageText, quickReplies) {
  try {
    const url = `https://graph.facebook.com/v18.0/me/messages`;
    
    const payload = {
      recipient: { id: recipientId },
      message: {
        text: messageText,
        quick_replies: quickReplies
      },
      messaging_type: 'RESPONSE'
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`
    };

    const response = await axios.post(url, payload, { headers });

    if (response.data && response.data.message_id) {
      console.log(`Message with quick replies sent successfully to ${recipientId}`);
      return true;
    } else {
      console.error('Unexpected response from Meta API:', response.data);
      return false;
    }

  } catch (error) {
    console.error('Error sending message with quick replies to Instagram:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Отправляет сообщение с вложением (изображение, видео и т.д.)
 * @param {string} recipientId - ID получателя
 * @param {string} attachmentType - Тип вложения ('image', 'video', 'audio', 'file')
 * @param {string} attachmentUrl - URL вложения
 * @param {string} messageText - Опциональный текст сообщения
 * @returns {Promise<boolean>} - true если сообщение отправлено успешно
 */
async function sendAttachment(recipientId, attachmentType, attachmentUrl, messageText = '') {
  try {
    const url = `https://graph.facebook.com/v18.0/me/messages`;
    
    const payload = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: attachmentType,
          payload: { url: attachmentUrl }
        }
      },
      messaging_type: 'RESPONSE'
    };

    // Добавляем текст если он есть
    if (messageText) {
      payload.message.text = messageText;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`
    };

    const response = await axios.post(url, payload, { headers });

    if (response.data && response.data.message_id) {
      console.log(`Attachment sent successfully to ${recipientId}`);
      return true;
    } else {
      console.error('Unexpected response from Meta API:', response.data);
      return false;
    }

  } catch (error) {
    console.error('Error sending attachment to Instagram:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Проверяет валидность access token
 * @returns {Promise<boolean>} - true если токен валиден
 */
async function verifyAccessToken() {
  try {
    const url = `https://graph.facebook.com/v18.0/me`;
    const headers = {
      'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`
    };

    const response = await axios.get(url, { headers });
    return response.data && response.data.id;
  } catch (error) {
    console.error('Access token verification failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Получает информацию о странице Instagram
 * @returns {Promise<Object>} - Информация о странице
 */
async function getPageInfo() {
  try {
    const url = `https://graph.facebook.com/v18.0/me?fields=id,name,username`;
    const headers = {
      'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`
    };

    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error('Error getting page info:', error.response?.data || error.message);
    return null;
  }
}

module.exports = {
  sendMessage,
  sendMessageWithQuickReplies,
  sendAttachment,
  verifyAccessToken,
  getPageInfo
};
