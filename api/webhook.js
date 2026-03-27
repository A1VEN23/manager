module.exports = async function (req, res) {
  // 1. Обработка GET-запроса (Верификация от Meta)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
        console.log('WEBHOOK VERIFIED!');
        // Meta требует вернуть ТОЛЬКО challenge как текст (не JSON)
        return res.status(200).send(challenge);
      } else {
        console.log('VERIFICATION FAILED! Токены не совпали.');
        return res.status(403).send('Forbidden');
      }
    }
    return res.status(400).send('Bad Request');
  }

  // 2. Обработка POST-запроса (Прием сообщений от пользователей)
  if (req.method === 'POST') {
    console.log('Получено сообщение:', JSON.stringify(req.body));
    
    // Здесь позже мы подключим логику Gemini и Redis
    // Но Meta требует моментальный ответ 200 OK, иначе отключит вебхук
    return res.status(200).send('EVENT_RECEIVED');
  }

  // Если пришел другой тип запроса
  return res.status(405).send('Method Not Allowed');
};
