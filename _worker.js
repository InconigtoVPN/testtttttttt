import { connect } from "cloudflare:sockets";

// Variables
let cachedProxyList = [];
let proxyIP = "";

const DEFAULT_PROXY_BANK_URL = "https://raw.githubusercontent.com/InconigtoVPN/ProxyIP/refs/heads/main/proxyList.txt";
const DEFAULT_PROXY_BANK_URL2 = "https://raw.githubusercontent.com/InconigtoVPN/ProxyIP/refs/heads/main/SUBProxyList.txt";

const TELEGRAM_BOT_TOKEN = '7587041711:AAG_iznBF4CjpGvVxdbkN2u4wGndupRChfs';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const apiCheck = 'https://proxyip.biz.id/';


const ownerId = 8090616785; // Ganti dengan chat_id pemilik bot (angka tanpa tanda kutip)
const linkchanell = 'https://t.me/InconigtoMode00';
const linkgrup = 'https://t.me/+U-uHC0P-b_IyNDc1';
const linkowner = 'https://t.me/InconigtoMode';

const linkweb = 'https://inconigto.web.id';
const FAKE_HOSTNAME = 'inconigto.web.id';

// Informasi tambahan
const pathinfo = "t.me/Inconigto_Mode";
const nameWEB = "Inconigto-MODE";
const telegram = "InconigtoMode";


// Fungsi untuk menangani `/active`
async function handleActive(request) {
  const host = request.headers.get('Host');
  const webhookUrl = `https://${host}/webhook`;

  const response = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl }),
  });

  if (response.ok) {
    return new Response('Webhook set successfully', { status: 200 });
  }
  return new Response('Failed to set webhook', { status: 500 });
}

// Fungsi untuk menangani `/delete` (menghapus webhook)
async function handleDelete(request) {
  const response = await fetch(`${TELEGRAM_API_URL}/deleteWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    return new Response('Webhook deleted successfully', { status: 200 });
  }
  return new Response('Failed to delete webhook', { status: 500 });
}

// Fungsi untuk menangani `/info` (mendapatkan info webhook)
async function handleInfo(request) {
  const response = await fetch(`${TELEGRAM_API_URL}/getWebhookInfo`);

  if (response.ok) {
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  }
  return new Response('Failed to retrieve webhook info', { status: 500 });
}

// Fungsi untuk menangani `/webhook`
async function handleWebhook(request) {
  const update = await request.json();

  if (update.callback_query) {
    return await handleCallbackQuery(update.callback_query);
  } else if (update.message) {
    return await handleMessage(update.message);
  }

  return new Response('OK', { status: 200 });
}

// Fungsi untuk menangani `/sendMessage`
async function handleSendMessage(request) {
  const { chat_id, text } = await request.json();
  const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text }),
  });

  if (response.ok) {
    return new Response('Message sent successfully', { status: 200 });
  }
  return new Response('Failed to send message', { status: 500 });
}

// Fungsi untuk menangani `/getUpdates`
async function handleGetUpdates(request) {
  const response = await fetch(`${TELEGRAM_API_URL}/getUpdates`);

  if (response.ok) {
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  }
  return new Response('Failed to get updates', { status: 500 });
}

// Fungsi untuk menangani `/deletePending` - menarik pembaruan yang tertunda
async function handleDeletePending(request) {
  // Hapus webhook untuk menghindari pembaruan tertunda
  const deleteResponse = await fetch(`${TELEGRAM_API_URL}/deleteWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (deleteResponse.ok) {
    // Setelah menghapus webhook, atur webhook kembali
    const host = request.headers.get('Host');
    const webhookUrl = `https://${host}/webhook`;

    const setResponse = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    });

    if (setResponse.ok) {
      return new Response('Pending updates deleted by resetting webhook', { status: 200 });
    }
    return new Response('Failed to set webhook after deletion', { status: 500 });
  }

  return new Response('Failed to delete webhook', { status: 500 });
}

async function handleDropPending(request) {
  const response = await fetch(`${TELEGRAM_API_URL}/getUpdates`);

  if (response.ok) {
    const data = await response.json();

    if (data.result && data.result.length > 0) {
      // Hanya mengambil pembaruan dan tidak memprosesnya
      return new Response('Dropped pending updates successfully', { status: 200 });
    }
    return new Response('No pending updates found', { status: 200 });
  }

  return new Response('Failed to get pending updates', { status: 500 });
}


// Routing utama sebelum mencapai handler default
async function routeRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === '/active') {
    return await handleActive(request);
  }

  if (url.pathname === '/delete') {
    return await handleDelete(request);
  }

  if (url.pathname === '/info') {
    return await handleInfo(request);
  }

  if (url.pathname === '/webhook' && request.method === 'POST') {
    return await handleWebhook(request);
  }

  if (url.pathname === '/sendMessage') {
    return await handleSendMessage(request);
  }

  if (url.pathname === '/getUpdates') {
    return await handleGetUpdates(request);
  }

  if (url.pathname === '/deletePending') {
    return await handleDeletePending(request);
  }

  if (url.pathname === '/dropPending') {
    return await handleDropPending(request);
  }

  return null;
}

const getEmojiFlag = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return ''; // Validasi input
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map(char => 0x1F1E6 + char.charCodeAt(0) - 65)
  );
};

async function handleCallbackQuery(callbackQuery) {
  const callbackData = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  const afrcloud = FAKE_HOSTNAME; // Ganti dengan host default yang benar

  try {
    if (callbackData.startsWith('create_vless')) {
      const [_, ip, port, isp] = callbackData.split('|');
      await handleVlessCreation(chatId, ip, port, isp, afrcloud);
    } else if (callbackData.startsWith('create_trojan')) {
      const [_, ip, port, isp] = callbackData.split('|');
      await handleTrojanCreation(chatId, ip, port, isp, afrcloud);
    } else if (callbackData.startsWith('create_ss')) {
      const [_, ip, port, isp] = callbackData.split('|');
      await handleShadowSocksCreation(chatId, ip, port, isp, afrcloud);
    }

    // Konfirmasi callback query ke Telegram
    await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQuery.id,
      }),
    });
  } catch (error) {
    console.error('Error handling callback query:', error);
  }

  return new Response('OK', { status: 200 });
}


let userChatIds = [];

// Function to handle incoming messages
async function handleMessage(message) {
  const text = message.text;
  const chatId = message.chat.id;

  try {
    // Menangani perintah /start
    if (text === '/start') {
      await handleStartCommand(chatId);

      // Menambahkan pengguna ke daftar jika belum ada
      if (!userChatIds.includes(chatId)) {
        userChatIds.push(chatId);
      }

    // Menangani perintah /info
    } else if (text === '/info') {
      await handleGetInfo(chatId);

    // Menangani perintah /listwildcard
    } else if (text === '/listwildcard') {
      await handleListWildcard(chatId);

    // Menangani perintah /getrandomip
    } else if (text === '/getrandomip') {
      await handleGetRandomIPCommand(chatId);

    // Menangani perintah /getrandom <CountryCode>
    } else if (text.startsWith('/getrandom')) {
      const countryId = text.split(' ')[1]; // Mengambil kode negara setelah "/getrandom"
      if (countryId) {
        await handleGetRandomCountryCommand(chatId, countryId);
      } else {
        await sendTelegramMessage(chatId, '⚠️ Harap tentukan kode negara setelah `/getrandom` (contoh: `/getrandom ID`, `/getrandom US`).');
      }

    // Menangani perintah /broadcast
    } else if (text.startsWith('/broadcast')) {
      await handleBroadcastCommand(message);

    // Menangani format IP:Port
    } else if (isValidIPPortFormat(text)) {
      await handleIPPortCheck(text, chatId);

    // Pesan tidak dikenali atau format salah
    } else {
      await sendTelegramMessage(chatId, '⚠️ Format tidak valid. Gunakan format IP:Port yang benar (contoh: 192.168.1.1:80).');
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    // Log the error and send an error message to the user
    console.error('Error processing message:', error);
    await sendTelegramMessage(chatId, '⚠️ Terjadi kesalahan dalam memproses perintah. Silakan coba lagi nanti.');
    return new Response('Error', { status: 500 });
  }
}


// Fungsi untuk menangani perintah /broadcast
async function handleBroadcastCommand(message) {
  const chatId = message.chat.id;
  const text = message.text;

  // Memeriksa apakah pengirim adalah pemilik bot
  if (chatId !== ownerId) {
    await sendTelegramMessage(chatId, '⚠️ Anda bukan pemilik bot ini.');
    return;
  }

  // Mengambil pesan setelah perintah /broadcast
  const broadcastMessage = text.replace('/broadcast', '').trim();
  if (!broadcastMessage) {
    await sendTelegramMessage(chatId, '⚠️ Harap masukkan pesan setelah perintah /broadcast.');
    return;
  }

  // Mengirim pesan ke semua pengguna yang terdaftar
  if (userChatIds.length === 0) {
    await sendTelegramMessage(chatId, '⚠️ Tidak ada pengguna untuk menerima pesan broadcast.');
    return;
  }

  for (const userChatId of userChatIds) {
    try {
      await sendTelegramMessage(userChatId, broadcastMessage);
    } catch (error) {
      console.error(`Error mengirim pesan ke ${userChatId}:`, error);
    }
  }

  await sendTelegramMessage(chatId, `✅ Pesan telah disebarkan ke ${userChatIds.length} pengguna.`);
}

// Fungsi untuk mengirim pesan ke pengguna melalui Telegram API
async function sendTelegramMessage(chatId, message) {
  const url = `${TELEGRAM_API_URL}/sendMessage`;

  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown', // Untuk memformat teks
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('Gagal mengirim pesan:', result);
    }
  } catch (error) {
    console.error('Error saat mengirim pesan:', error);
  }
}

// Function to handle the /start command
async function handleStartCommand(chatId) {
  const welcomeMessage = `
🎉 Selamat datang di Inconigto Mode || YūshaBot ! 🎉

💡 Cara Penggunaan:
1️⃣ Kirimkan Proxy IP:Port dalam format yang benar.
       Contoh: \`192.168.1.1:8080\`
2️⃣ Bot akan mengecek status Proxy untuk Anda.

✨ Anda bisa memilih opsi untuk membuat VPN Tunnel CloudFlare Gratis Menggunakan ProxyIP yang sudah di Cek dengan format:
- 🌐 VLESS
- 🔐 TROJAN
- 🛡️ Shadowsocks

🚀 Mulai sekarang dengan mengirimkan Proxy IP:Port Anda!

📌 Daftar Commands : /info
👨‍💻 ME : [Incognito Mode](${linkowner})
🌐 WEB : [VPN Tunnel CloudFlare](${linkweb})
📺 CHANNEL : [Inconigto Mode || Seishin](${linkchanell})
👥 GROUP : [Incognito Mode || Kuragari](${linkgrup})
  `;
  await sendTelegramMessage(chatId, welcomeMessage);
}

async function handleGetInfo(chatId) {
  const InfoMessage = `
🎉 Commands di Incognito Bot! 🎉

1️⃣ \`/getrandomip\`
2️⃣ \`/getrandom <Country>\`
3️⃣ \`/listwildcard\`

📌 Daftar Commands : /info
👨‍💻 ME : [Incognito Mode](${linkowner})
🌐 WEB : [VPN Tunnel CloudFlare](${linkweb})
📺 CHANNEL : [Inconigto Mode || Seishin](${linkchanell})
👥 GROUP : [Incognito Mode || Kuragari](${linkgrup})
  `;
  await sendTelegramMessage(chatId, InfoMessage);
}
 

async function handleListWildcard(chatId) {
  const afrcloud = `${FAKE_HOSTNAME}`;
  const infoMessage = `
🎉 List Wildcard VPN Tunnel Incognito Bot! 🎉

1️⃣ \`graph.instagram.com.${afrcloud}\`
2️⃣ \`ava.game.naver.com.${afrcloud}\`
3️⃣ \`support.zoom.us.${afrcloud}\`
4️⃣ \`cache.netflix.com.${afrcloud}\`
5️⃣ \`zaintest.vuclip.com.${afrcloud}\`
6️⃣ \`cdn.appsflayer.com.${afrcloud}\`
7️⃣ 
8️⃣ 
9️⃣ 
🔟 

📌 Daftar Commands : /info
👨‍💻 ME : [Incognito Mode](${linkowner})
🌐 WEB : [VPN Tunnel CloudFlare](${linkweb})
📺 CHANNEL : [Inconigto Mode || Seishin](${linkchanell})
👥 GROUP : [Incognito Mode || Kuragari](${linkgrup})

  `;
  await sendTelegramMessage(chatId, infoMessage);
}


// Function to handle the /getrandomip command
async function handleGetRandomIPCommand(chatId) {
  try {
    // Fetching the Proxy IP list from the GitHub raw URL
    const proxyBankUrl = DEFAULT_PROXY_BANK_URL2;
    const response = await fetch(proxyBankUrl);
    const data = await response.text();

    // Split the data into an array of Proxy IPs
    const proxyList = data.split('\n').filter(line => line.trim() !== '');

    // Randomly select 10 Proxy IPs
    const randomIPs = [];
    for (let i = 0; i < 20 && proxyList.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * proxyList.length);
      randomIPs.push(proxyList[randomIndex]);
      proxyList.splice(randomIndex, 1); // Remove the selected item from the list
    }

    // Format the random IPs into a message
    const message = `🔑 **Here are 20 random Proxy IPs:**\n\n` +
      randomIPs.map(ip => {
        const [ipAddress, port, country, provider] = ip.split(',');
        // Replace dots with spaces in the provider name
        const formattedProvider = provider.replace(/\./g, ' ');
        return `📍**IP:PORT : **\`${ipAddress}:${port}\`**\n🌍 **Country :** ${country}\n💻 **ISP :** ${formattedProvider}\n`;
      }).join('\n');

    await sendTelegramMessage(chatId, message);
  } catch (error) {
    console.error('Error fetching proxy list:', error);
    await sendTelegramMessage(chatId, '⚠️ There was an error fetching the Proxy list. Please try again later.');
  }
}

// Function to handle the /getrandom <Country> command
async function handleGetRandomCountryCommand(chatId, countryId) {
  try {
    const proxyBankUrl = DEFAULT_PROXY_BANK_URL2;
    const response = await fetch(proxyBankUrl);
    const data = await response.text();
    const proxyList = data.split('\n').filter(line => line.trim() !== '');
    const filteredProxies = proxyList.filter(ip => {
      const [ipAddress, port, country, provider] = ip.split(',');
      return country.toUpperCase() === countryId.toUpperCase(); // Country case-insensitive comparison
    });
    const randomIPs = [];
    for (let i = 0; i < 20 && filteredProxies.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * filteredProxies.length);
      randomIPs.push(filteredProxies[randomIndex]);
      filteredProxies.splice(randomIndex, 1); // Remove the selected item from the list
    }
    if (randomIPs.length === 0) {
      await sendTelegramMessage(chatId, `⚠️ No proxies found for country code **${countryId}**.`);
      return;
    }
    const message = `🔑 **Here are 20 random Proxy IPs for country ${countryId}:**\n\n` +
      randomIPs.map(ip => {
        const [ipAddress, port, country, provider] = ip.split(',');
        // Replace dots with spaces in the provider name
        const formattedProvider = provider.replace(/\./g, ' ');
        return `📍**IP:PORT : **\`${ipAddress}:${port}\`**\n🌍 **Country :** ${country}\n💻 **ISP :** ${formattedProvider}\n`;
      }).join('\n');

    await sendTelegramMessage(chatId, message);
  } catch (error) {
    console.error('Error fetching proxy list:', error);
    await sendTelegramMessage(chatId, '⚠️ There was an error fetching the Proxy list. Please try again later.');
  }
}

async function handleIPPortCheck(ipPortText, chatId) {
  const [ip, port] = ipPortText.split(':');
  const result = await checkIPPort(ip, port, chatId);
  await sendTelegramMessage(chatId, result);
}


function isValidIPPortFormat(input) {
  const regex = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
  return regex.test(input);
}

async function checkIPPort(ip, port, chatId) {
  try {
    // Send temporary message to indicate checking process
    await sendTelegramMessage(chatId, `🔍 Checking ${ip}:${port}...`);

    // Fetch data from the API
    const response = await fetch(`${apiCheck}${ip}:${port}`);
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);

    const data = await response.json();

    // Extract information directly from the API response
    const { proxy, port: p, org, asn, country = "Unknown", flag = "🏳️", latitude, longitude, timezone } = data;
    const status = data.proxyip ? "✅ Active" : "❌ Inactive";

    // Format the message result
    const resultMessage = `
🌍 **IP & Port Check Result**:
━━━━━━━━━━━━━━━━━━━━━━━
📡 **IP**: ${proxy}
🔌 **Port**: ${p}
💻 **ISP**: ${org}
🏢 **ASN**: ${asn}
🌏 **Country**: ${country} ${flag}
🚦 **Status**: ${status}
📍 **Coordinates**: ${latitude}, ${longitude}
🕰️ **Timezone**: ${timezone}
━━━━━━━━━━━━━━━━━━━━━━━

👨‍💻 ME : [Incognito Mode](${linkowner})
    `;

    // Send the result message to the chat
    await sendTelegramMessage(chatId, resultMessage);

    // Send an inline keyboard with the details
    await sendInlineKeyboard(chatId, proxy, p, org, flag );

  } catch (error) {
    // Error handling
    await sendTelegramMessage(chatId, `⚠️ Error: ${error.message}`);
  }
}


async function handleShadowSocksCreation(chatId, ip, port,isp, afrcloud) {
  const path = `/${pathinfo}/${ip}/${port}`;
  const ssname = `${isp}-[Tls]-[SS]-[${nameWEB}]`
  const ssname2 = `${isp}-[NTls]-[SS]-[${nameWEB}]`
  const ssTls = `ss://${btoa(`none:${crypto.randomUUID()}`)}@${afrcloud}:443?encryption=none&type=ws&host=${afrcloud}&path=${encodeURIComponent(path)}&security=tls&sni=${afrcloud}#${encodeURIComponent(ssname)}`;
  const ssNTls = `ss://${btoa(`none:${crypto.randomUUID()}`)}@${afrcloud}:80?encryption=none&type=ws&host=${afrcloud}&path=${encodeURIComponent(path)}&security=none&sni=${afrcloud}#${encodeURIComponent(ssname2)}`;

  const proxies = `
proxies:

  - name: ${ssname}
    server: ${afrcloud}
    port: 443
    type: ss
    cipher: none
    password: ${crypto.randomUUID()}
    plugin: v2ray-plugin
    client-fingerprint: chrome
    udp: true
    plugin-opts:
      mode: websocket
      host: ${afrcloud}
      path: ${path}
      tls: true
      mux: false
      skip-cert-verify: true
    headers:
      custom: value
      ip-version: dual
      v2ray-http-upgrade: false
      v2ray-http-upgrade-fast-open: false
`;

  const message = `
⚜️ Success Create ShadowSocks ⚜️

Type : ShadowSocks 
ISP : \`${isp}\`
ProxyIP : \`${ip}:${port}\` 

🔗 **Links Vless** :\n
1️⃣ **TLS** : \`${ssTls}\`\n
2️⃣ **Non-TLS** : \`${ssNTls}\`

📄 **Proxies Config**:
\`\`\`
${proxies}
\`\`\`

👨‍💻 ME : [Incognito Mode](${linkowner})
  `;

  // Kirim pesan melalui Telegram
  await sendTelegramMessage(chatId, message);
}

async function handleVlessCreation(chatId, ip, port, isp, afrcloud) {
  const path = `/${pathinfo}/${ip}/${port}`;
  const vlname = `${isp}-[Tls]-[VL]-[${nameWEB}]`
  const vlname2 = `${isp}-[NTls]-[VL]-[${nameWEB}]`
  const vlessTLS = `vless://${crypto.randomUUID()}@${afrcloud}:443?path=${encodeURIComponent(path)}&security=tls&host=${afrcloud}&type=ws&sni=${afrcloud}#${encodeURIComponent(vlname)}`;
  const vlessNTLS = `vless://${crypto.randomUUID()}@${afrcloud}:80?path=${encodeURIComponent(path)}&security=none&host=${afrcloud}&type=ws&sni=${afrcloud}#${encodeURIComponent(vlname2)}`;
  
  const message = `
⚜️ Success Create VLESS ⚜️

Type : VLESS 
ISP : \`${isp}\`
ProxyIP : \`${ip}:${port}\` 


🔗 **Links Vless** :\n
1️⃣ **TLS** : \`${vlessTLS}\`\n
2️⃣ **Non-TLS** : \`${vlessNTLS}\`


📄 **Proxies Config** :
\`\`\`
proxies:
          
  - name: ${vlname}
    server: ${afrcloud}
    port: 443
    type: vless
    uuid: ${crypto.randomUUID()}
    cipher: auto
    tls: true
    client-fingerprint: chrome
    udp: true
    skip-cert-verify: true
    network: ws
    servername: ${afrcloud}
    alpn:
       - h2
       - h3
       - http/1.1
    ws-opts:
      path: ${path}
      headers:
        Host: ${afrcloud}
      max-early-data: 0
      early-data-header-name: Sec-WebSocket-Protocol
      ip-version: dual
      v2ray-http-upgrade: false
      v2ray-http-upgrade-fast-open: false
\`\`\`

👨‍💻 ME : [Incognito Mode](${linkowner})
  `;

  await sendTelegramMessage(chatId, message);
}

async function handleTrojanCreation(chatId, ip, port, isp, afrcloud) {
  const path = `/${pathinfo}/${ip}/${port}`;;
  const trname = `${isp}-[Tls]-[TR]-[${nameWEB}]`
  const trname2 = `${isp}-[NTls]-[TR]-[${nameWEB}]`
  const trojanTLS = `trojan://${crypto.randomUUID()}@${afrcloud}:443?path=${encodeURIComponent(path)}&security=tls&host=${afrcloud}&type=ws&sni=${afrcloud}#${encodeURIComponent(trname)}`;
  const trojanNTLS = `trojan://${crypto.randomUUID()}@${afrcloud}:80?path=${encodeURIComponent(path)}&security=none&host=${afrcloud}&type=ws&sni=${afrcloud}${encodeURIComponent(trname2)}`;

  const message = `
⚜️ Success Create Trojan ⚜️

Type : Trojan 
ISP : \`${isp}\`
ProxyIP : \`${ip}:${port}\` 

🔗 **Links Trojan** :\n
1️⃣ **TLS** : \`${trojanTLS}\`\n
2️⃣ **Non-TLS** : \`${trojanNTLS}\`

📄 **Proxies Config** :
\`\`\`
proxies:
       
  - name: ${trname}
    server: ${afrcloud}
    port: 443
    type: trojan
    password: ${crypto.randomUUID()}
    tls: true
    client-fingerprint: chrome
    udp: true
    skip-cert-verify: true
    network: ws
    sni: ${afrcloud}
    alpn:
       - h2
       - h3
       - http/1.1
    ws-opts:
      path: ${path}
      headers:
        Host: ${afrcloud}
      max-early-data: 0
      early-data-header-name: Sec-WebSocket-Protocol
      ip-version: dual
      v2ray-http-upgrade: false
      v2ray-http-upgrade-fast-open: false
\`\`\`

👨‍💻 ME : [Incognito Mode](${linkowner})
`;

  await sendTelegramMessage(chatId, message);
}

async function sendInlineKeyboard(chatId, ip, port, isp, flag) {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: 'Pilih opsi berikut untuk membuat VPN Tunnel:',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Create VLESS', callback_data: `create_vless|${ip}|${port}|${isp}|${flag}` },
              { text: 'Create Trojan', callback_data: `create_trojan|${ip}|${port}|${isp}|${flag}` },
            ],
            [
              { text: 'Create ShadowSocks', callback_data: `create_ss|${ip}|${port}|${isp}|${flag}` },
            ],
          ],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send inline keyboard:', errorText);
    } else {
      console.log('Inline keyboard sent successfully.');
    }
  } catch (error) {
    console.error('Error sending inline keyboard:', error);
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////




// Konstanta WebSocket
const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;

async function getProxyList(env, forceReload = false) {
  try {
    // Cek apakah cache kosong atau ada permintaan untuk memuat ulang
    if (!cachedProxyList.length || forceReload) {
      const proxyBankUrl = env.PROXY_BANK_URL || DEFAULT_PROXY_BANK_URL;
      const response = await fetch(proxyBankUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch proxy list: ${response.status}`);
      }

      // Parsing daftar proxy
      const proxyLines = (await response.text()).split("\n").filter(Boolean);
      cachedProxyList = proxyLines.map((line) => {
        const [proxyIP, proxyPort, country, org] = line.split(",");
        return { proxyIP, proxyPort, country, org };
      });
    }

    return cachedProxyList;
  } catch (error) {
    console.error("Error fetching proxy list:", error);
    return []; // Mengembalikan array kosong jika terjadi error
  }
}

async function checkIPAndPort(ip, port) {
  const apiUrl = `${apiCheck}${ip}:${port}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const result = {
      ip,
      port,
      status: data.proxyip === true ? 'ACTIVE' : 'NON-ACTIVE',  // Mengubah nilai proxyip ke ACTIVE atau NON-ACTIVE
    };

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json;charset=utf-8" },
    });

  } catch (error) {
    const result = {
      ip,
      port,
      status: 'NON-ACTIVE',  // Menganggap NON-ACTIVE jika terjadi error
    };

    return new Response(JSON.stringify(result, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json;charset=utf-8" },
    });
  }
}



export default {
  async fetch(request, env, ctx) {
    try {

      const routeResponse = await routeRequest(request);
      if (routeResponse) {
        return routeResponse;
      }

      const url = new URL(request.url);
      const upgradeHeader = request.headers.get("Upgrade");

      const inconigto = url.hostname;
      const type = url.searchParams.get("type") || "mix";
      const tls = url.searchParams.get("tls") !== "false";
      const wildcard = url.searchParams.get("wildcard") === "true";
      const bugs = url.searchParams.get("bug") || inconigto;
      const inconigtomode = wildcard ? `${bugs}.${inconigto}` : inconigto;
      const country = url.searchParams.get("country");
      const limit = parseInt(url.searchParams.get("limit"), 10);
      let configs;

      // Jika path diakses dengan format IP:PORT, lakukan pengecekan IP dan port
      if (url.pathname.startsWith("/")) {
        const pathParts = url.pathname.slice(1).split(":");
        if (pathParts.length === 2) {
          const [ip, port] = pathParts;
          return await checkIPAndPort(ip, port);
        }
      }

      // Map untuk menyimpan proxy per kode negara
      const proxyState = new Map();

      // Fungsi untuk memperbarui proxy setiap menit
      async function updateProxies() {
        const proxies = await getProxyList(env);
        const groupedProxies = groupBy(proxies, "country");

        for (const [countryCode, proxies] of Object.entries(groupedProxies)) {
          const randomIndex = Math.floor(Math.random() * proxies.length);
          proxyState.set(countryCode, proxies[randomIndex]);
        }
      }

      // Jalankan pembaruan proxy setiap menit
      ctx.waitUntil(
        (async function periodicUpdate() {
          await updateProxies();
          setInterval(updateProxies, 60000);
        })()
      );

      // Penanganan WebSocket
      if (upgradeHeader === "websocket") {
        if (!url.pathname.startsWith(`/${pathinfo}/`)) {
          console.log(`Blocked request (Invalid Path): ${url.pathname}`);
          return new Response(null, { status: 403 });
        }

        const cleanPath = url.pathname.replace(`/${pathinfo}/`, "");
        const pathMatch = cleanPath.match(/^([A-Z]{2})(\d+)?$/);

        if (pathMatch) {
          const countryCode = pathMatch[1];
          const index = pathMatch[2] ? parseInt(pathMatch[2], 10) - 1 : null;
          const proxies = await getProxyList(env);
          const filteredProxies = proxies.filter((proxy) => proxy.country === countryCode);
          if (filteredProxies.length === 0) {
            return new Response(null, { status: 403 });
          }
          let selectedProxy =
            index === null ? proxyState.get(countryCode) || filteredProxies[0] : filteredProxies[index];
          proxyIP = `${selectedProxy.proxyIP}:${selectedProxy.proxyPort}`;
          return await websockerHandler(request);
        }
        const ipPortMatch = cleanPath.match(/^(.+[^.\d\w]\d+)$/);
        
        if (ipPortMatch) {
          proxyIP = ipPortMatch[1].replace(/[^.\d\w]+/g, ":");
          return await websockerHandler(request);
        }
        return new Response(null, { status: 403 });
      }

      // Routing untuk subscription generator
      switch (url.pathname) {
        case "/sub/clash":
          configs = await generateClashSub(type, bugs, inconigtomode, tls, country, limit);
          break;
        case "/sub/v2rayng":
          configs = await generateV2rayngSub(type, bugs, inconigtomode, tls, country, limit);
          break;
        case "/sub/v2ray":
          configs = await generateV2raySub(type, bugs, inconigtomode, tls, country, limit);
          break;
        case "/sub":
          return new Response(await handleSubRequest(url.hostname), {
            headers: { "Content-Type": "text/html" },
          });
        default:
          const hostname = request.headers.get("Host");
          const result = getAllConfig(hostname, await getProxyList(env, true));
          return new Response(result, {
            status: 200,
            headers: { "Content-Type": "text/html;charset=utf-8" },
          });
      }

      return new Response(configs);
    } catch (err) {
      return new Response(`An error occurred: ${err.toString()}`, {
        status: 500,
      });
    }
  },
};


// Helper function: Group proxies by country
function groupBy(array, key) {
  return array.reduce((result, item) => {
    if (!result[item[key]]) {
      result[item[key]] = [];
    }
    result[item[key]].push(item);
    return result;
  }, {});
}


function getAllConfig(hostName, proxyList) {

  const encodePath = (pathinfo, proxyIP, proxyPort) => {
    // Remove spaces and then encode
    const cleanedProxyIP = proxyIP.trim(); // Remove leading and trailing spaces
    return `%2F${encodeURIComponent(pathinfo)}%2F${encodeURIComponent(cleanedProxyIP)}%2F${encodeURIComponent(proxyPort)}`;
  };

  const encodePathRT = (pathinfo, country) => {
    return `%2F${encodeURIComponent(pathinfo)}%2F${encodeURIComponent(country)}`;
  };

  const encodeSpace = (string) => {
    return encodeURIComponent(string).replace(/\s+/g, ''); // Remove spaces entirely
  };

  const proxyListElements = proxyList.map(({ proxyIP, proxyPort, country, org }, index) => {
    const pathcode = `${encodePath(pathinfo, proxyIP, proxyPort)}`;
    const ispcode = `${getEmojiFlag(country)} (${country}) ${org}`;
    const encodeisp = encodeSpace(ispcode);
    const clashpath = `/${pathinfo}/${proxyIP}/${proxyPort}`;

    const status = `${proxyIP}:${proxyPort}`;
    
    const vlessTls = `vless://${crypto.randomUUID()}@${hostName}:443?encryption=none&security=tls&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=${pathcode}#${encodeisp}-[Tls]-[VL]-[${nameWEB}]`;
    const vlessNTls = `vless://${crypto.randomUUID()}@${hostName}:80?encryption=none&security=none&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=${pathcode}#${encodeisp}-[NTls]-[VL]-[${nameWEB}]`;
    const trojanTls = `trojan://${crypto.randomUUID()}@${hostName}:443?encryption=none&security=tls&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=${pathcode}#${encodeisp}-[Tls]-[TR]-[${nameWEB}]`;
    const trojanNTls = `trojan://${crypto.randomUUID()}@${hostName}:80?encryption=none&security=none&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=${pathcode}#${encodeisp}-[NTls]-[TR]-[${nameWEB}]`;
    const ssTls = `ss://${btoa(`none:${crypto.randomUUID()}`)}@${hostName}:443?encryption=none&type=ws&host=${hostName}&path=${pathcode}&security=tls&sni=${hostName}#${encodeisp}-[Tls]-[SS]-[${nameWEB}]`;
    const ssNTls = `ss://${btoa(`none:${crypto.randomUUID()}`)}@${hostName}:80?encryption=none&type=ws&host=${hostName}&path=${pathcode}&security=none&sni=${hostName}#${encodeisp}-[NTls]-[SS]-[${nameWEB}]`;

	  const RTpath = `${encodePathRT(pathinfo, country)}`;
    const RTname = `${getEmojiFlag(country)} (${country})`;
    const RTvlessTls = `vless://${crypto.randomUUID()}@${hostName}:443?encryption=none&security=tls&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=${RTpath}#${RTname}-[Tls]-[VL]-[${nameWEB}]`;
    const RTtrojanTls = `trojan://${crypto.randomUUID()}@${hostName}:443?encryption=none&security=tls&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=${RTpath}#${RTname}-[Tls]-[TR]-[${nameWEB}]`;
    const RTssTls = `ss://${btoa(`none:${crypto.randomUUID()}`)}@${hostName}:443?encryption=none&type=ws&host=${hostName}&path=${RTpath}&security=tls&sni=${hostName}#${RTname}-[Tls]-[SS]-[${nameWEB}]`;
    
    const vlname = `${getEmojiFlag(country)} (${country}) ${org}-[Tls]-[VL]-[${nameWEB}]`
    const trname = `${getEmojiFlag(country)} (${country}) ${org}-[Tls]-[TR]-[${nameWEB}]`
    const ssname = `${getEmojiFlag(country)} (${country}) ${org}-[Tls]-[SS]-[${nameWEB}]`
    
    const clashVLTls = `
#InconigtoVPN
proxies:
- name: ${vlname}
  server: ${hostName}
  port: 443
  type: vless
  uuid: ${crypto.randomUUID()}
  cipher: auto
  tls: true
  client-fingerprint: chrome
  udp: false
  skip-cert-verify: true
  network: ws
  servername: ${hostName}
  alpn:
    - h2
    - h3
    - http/1.1
  ws-opts:
    path: ${clashpath}
    headers:
      Host: ${hostName}
    max-early-data: 0
    early-data-header-name: Sec-WebSocket-Protocol
    ip-version: dual
    v2ray-http-upgrade: false
    v2ray-http-upgrade-fast-open: false
    `;

    const clashTRTls =`
#InconigtoVPN
proxies:      
- name: ${trname}
  server: ${hostName}
  port: 443
  type: trojan
  password: ${crypto.randomUUID()}
  tls: true
  client-fingerprint: chrome
  udp: false
  skip-cert-verify: true
  network: ws
  sni: ${hostName}
  alpn:
    - h2
    - h3
    - http/1.1
  ws-opts:
    path: ${clashpath}
    headers:
      Host: ${hostName}
    max-early-data: 0
    early-data-header-name: Sec-WebSocket-Protocol
    ip-version: dual
    v2ray-http-upgrade: false
    v2ray-http-upgrade-fast-open: false
    `;

    const clashSSTls =`
#InconigtoVPN
proxies:
- name: ${ssname}
  server: ${hostName}
  port: 443
  type: ss
  cipher: none
  password: ${crypto.randomUUID()}
  plugin: v2ray-plugin
  client-fingerprint: chrome
  udp: false
  plugin-opts:
    mode: websocket
    host: ${hostName}
    path: ${clashpath}
    tls: true
    mux: false
    skip-cert-verify: true
  headers:
    custom: value
    ip-version: dual
    v2ray-http-upgrade: false
    v2ray-http-upgrade-fast-open: false
    `;

    // Combine all configurations into one string
    const allconfigs = [
      ssTls,
      ssNTls,
      vlessTls,
      vlessNTls,
      trojanTls,
      trojanNTls,
      RTvlessTls,
      RTtrojanTls,
      RTssTls,
    ].join('\n\n');
    
    // Encode the string for use in JavaScript
    const encodedAllconfigs = encodeURIComponent(allconfigs);
   
    return `
      <div class="content ${index === 0 ? "active" : ""}">
        <h2>${nameWEB}</h2>
        <hr class="config-divider" />
        <h2>VLESS TROJAN SHADOWSOCKS</h2>
        <h2>CloudFlare</h2>
        <hr class="config-divider"/>

        <center><span class="flag-emoji">${getEmojiFlag(country)}</span></center>
        <center><h1><strong></strong>${org} </h1></center>
        <center><h1><strong></strong>${proxyIP}:${proxyPort}</h1></center>
        <center><button class="button" onclick="fetchAndDisplayAlert('${status}')">Proxy Status</button></center>

        <hr class="config-divider" />
        <strong><h2>VLESS</h2></strong>
        <h1>Vless Tls Rotate</h1>
        <pre>${RTvlessTls}</pre>
        <button onclick="copyToClipboard('${RTvlessTls}')">Vless TLS Rotate</button><br>
        
        <h1>Vless Tls</h1>
        <pre>${vlessTls}</pre>
        <button onclick="copyToClipboard('${vlessTls}')">Vless TLS</button><br>
        <h1>Vless NTls</h1>
        <pre>${vlessNTls}</pre>
        <button onclick="copyToClipboard('${vlessNTls}')">Vless N-TLS</button><br>
        <h1>Clash Vless TLS</h1>
        <pre>${clashVLTls}</pre>
        <button onclick="copyToClipboard(\`${clashVLTls}\`)">Clash Vless TLS</button>
        
        <hr class="config-divider" />
    
        <strong><h2>TROJAN</h2></strong>
        <h1>Trojan Tls Rotate</h1>
        <pre>${RTtrojanTls}</pre>
        <button onclick="copyToClipboard('${RTtrojanTls}')">Trojan TLS Rotate</button><br>
        
        <h1>Trojan TLS</h1>
        <pre>${trojanTls}</pre>
        <button onclick="copyToClipboard('${trojanTls}')">Trojan TLS</button>
        <h1>Trojan N-TLS</h1>
        <pre>${trojanNTls}</pre>
        <button onclick="copyToClipboard('${trojanNTls}')">Trojan N-TLS</button>
        <h1>Clash Trojan TLS</h1>
        <pre>${clashTRTls}</pre>
        <button onclick="copyToClipboard(\`${clashTRTls}\`)">Clash Trojan TLS</button>
    
        <hr class="config-divider" />
    
        <strong><h2>SHADOWSOCKS</h2></strong>
        <h1>Shadowsocks Tls Rotate</h1>
        <pre>${RTssTls}</pre>
        <button onclick="copyToClipboard('${RTssTls}')">Shadowsocks TLS Rotate</button><br>
        
        <h1>Shadowsocks TLS</h1>
        <pre>${ssTls}</pre>
        <button onclick="copyToClipboard('${ssTls}')">Shadowsocks TLS</button>
        <h1>Shadowsocks N-TLS</h1>
        <pre>${ssNTls}</pre>
        <button onclick="copyToClipboard('${ssNTls}')">Shadowsocks N-TLS</button>
        <h1>Clash Shadowsocks TLS</h1>
        <pre>${clashSSTls}</pre>
        <button onclick="copyToClipboard(\`${clashSSTls}\`)">Clash Shadowsocks TLS</button>
    
        <hr class="config-divider" />
        <h2>All Configs</h2>
        <center><button onclick="copyToClipboard(decodeURIComponent('${encodedAllconfigs}'))">Copy All Configs</button></center>
        <hr class="config-divider" /> 
        <h2>Generate SUB</h2>
        <center><button onclick="window.open('https://${hostName}/sub')">Generate Sub Link</button></center>
        <hr class="config-divider" /> 
      </div>`;
    })
    .join("");
  return `
    <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <title>${nameWEB} | VPN Tunnel | CloudFlare</title>
      
      <!-- SEO Meta Tags -->
      <meta name="description" content="Akun Vless Gratis. ${nameWEB} offers free Vless accounts with Cloudflare and Trojan support. Secure and fast VPN tunnel services.">
      <meta name="keywords" content="${nameWEB}, Free Vless, Vless CF, Trojan CF, Cloudflare, VPN Tunnel, Akun Vless Gratis">
      <meta name="author" content="${nameWEB}">
      <meta name="robots" content="index, follow"> <!-- Enable search engines to index the page -->
      <meta name="robots" content="noarchive"> <!-- Prevent storing a cached version of the page -->
      <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1"> <!-- Improve visibility in search snippets -->
      
      <!-- Social Media Meta Tags -->
      <meta property="og:title" content="${nameWEB} | Free Vless & Trojan Accounts">
      <meta property="og:description" content="${nameWEB} provides free Vless accounts and VPN tunnels via Cloudflare. Secure, fast, and easy setup.">
      <meta property="og:image" content="https://raw.githubusercontent.com/akulelaki696/bg/refs/heads/main/20250106_010158.jpg"> <!-- Image to appear in previews -->
      <meta property="og:url" content="https://${hostName}"> <!-- Your website URL -->
      <meta property="og:type" content="website">
      <meta property="og:site_name" content="${nameWEB}">
      <meta property="og:locale" content="en_US"> <!-- Set to your language/locale -->
      
      <!-- Twitter Card Meta Tags -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${nameWEB} | Free Vless & Trojan Accounts">
      <meta name="twitter:description" content="Get free Vless accounts and fast VPN services via Cloudflare with ${nameWEB}. Privacy and security guaranteed.">
      <meta name="twitter:image" content="https://raw.githubusercontent.com/akulelaki696/bg/refs/heads/main/20250106_010158.jpg"> <!-- Image for Twitter -->
      <meta name="twitter:site" content="@InconigtoVPN">
      <meta name="twitter:creator" content="@InconigtoVPN">
      
      <!-- Telegram Meta Tags -->
      <meta property="og:image:type" content="image/jpeg"> <!-- Specify the image type for Telegram and other platforms -->
      <meta property="og:image:secure_url" content="https://raw.githubusercontent.com/akulelaki696/bg/refs/heads/main/20250106_010158.jpg"> <!-- Secure URL for image -->
      <meta property="og:audio" content="URL-to-audio-if-any"> <!-- Optionally add audio for Telegram previews -->
      <meta property="og:video" content="URL-to-video-if-any"> <!-- Optionally add video for Telegram previews -->
      
      <!-- Additional Meta Tags -->
      <meta name="theme-color" content="#000000"> <!-- Mobile browser theme color -->
      <meta name="format-detection" content="telephone=no"> <!-- Prevent automatic phone number detection -->
      <meta name="generator" content="${nameWEB}">
      <meta name="google-site-verification" content="google-site-verification-code"> <!-- Google verification -->
      
      <!-- Open Graph Tags for Rich Links -->
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="og:image:alt" content="${nameWEB} Image Preview">
      
      <!-- Favicon and Icon links -->
      <link rel="icon" href="https://raw.githubusercontent.com/AFRcloud/BG/main/icons8-film-noir-80.png" type="image/png">
      <link rel="apple-touch-icon" href="https://raw.githubusercontent.com/AFRcloud/BG/main/icons8-film-noir-80.png">
      <link rel="manifest" href="/manifest.json">
        

      
      <style>
      html, body {
        height: 100%;
        width: 100%;
        overflow: hidden;
        background-color: #1a1a1a;
        font-family: 'Roboto', Arial, sans-serif;
        margin: 0;
      }
    
      body {
        display: flex;
        background: url('https://raw.githubusercontent.com/bitzblack/ip/refs/heads/main/shubham-dhage-5LQ_h5cXB6U-unsplash.jpg') no-repeat center center fixed;
        background-size: cover;
        justify-content: center;
        align-items: center;
      }

      .flag-emoji {
        font-size: 5rem;
      }

      .popup {
        width: 100vw;
        height: 90vh;
        border-radius: 15px;
        background-color: rgba(0, 0, 0, 0.0);
        backdrop-filter: blur(5px);
        display: grid;
        grid-template-columns: 1.5fr 3fr;
        overflow: hidden;
        animation: popupEffect 1s ease-in-out;
      }
      @keyframes popupEffect {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
           
      .tab-label {
        padding: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        background-color: #f0f0f0;
        margin-bottom: 5px;
        border-radius: 5px;
        position: relative;
      }
      
      .tab-label:hover {
        background-color: rgba(0, 0, 0, 0.5);
      }
      
      .tab-label .flag-icon {
        font-size: 1.3rem;  /* Adjust the flag size */
        margin-right: 10px;
      }
      
      
      input[type="radio"]:checked + label {
        background-color: rgba(0, 0, 0, 0.5);  /* Active tab color */
        color: #fff;
      }

      .tabs {
        background-color: rgba(0, 0, 0, 0.5);
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        overflow-y: auto;
        overflow-x: hidden;
        border-right: 5px solid #00FFFF;
        box-shadow: inset 0 0 15px rgba(0, 255, 255, 0.3);
      }
    
      .author-link {
        position: absolute;
        bottom: 10px;
        right: 10px;
        font-weight: bold;
        font-style: italic;
        color: #00FFFF;
        font-size: 1rem;
        text-decoration: none;
        z-index: 10;
      }
    
      .author-link:hover {
        color: #0FF;
        text-shadow: 0px 0px 10px rgba(0, 255, 255, 0.8);
      }
    
      label {
        font-size: 14px;
        cursor: pointer;
        color: #00FFFF;
        padding: 12px;
        background: linear-gradient(90deg, #000, #333);
        border-radius: 10px;
        text-align: left;
        transition: background 0.3s ease, transform 0.3s ease;
        box-shadow: 0px 4px 8px rgba(0, 255, 255, 0.4);
        white-space: normal;
        overflow-wrap: break-word;
      }
    
      label:hover {
        background: #00FFFF;
        color: #000;
        transform: translateY(-4px);
        box-shadow: 0px 8px 16px rgba(0, 255, 255, 0.2);
      }
    
      input[type="radio"] {
        display: none;
      }
    
      .tab-content {
        padding: 0px 0px 0px 10px;
        overflow-y: auto;
        color: #00FFFF;
        font-size: 12px;
        background-color: rgba(0, 0, 0, 0.8);
        height: 100%;
        box-sizing: border-box;
        border-radius: 10px;
        box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.2);
      }
    

      .content {
        display: none;
        padding-right: 15px;
        
      }
    
      .content.active {
        display: block;
        animation: fadeIn 0.5s ease;
      }
    
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    
      h1 {
        font-size: 18px;
        color: #00FFFF;
        margin-bottom: 10px;
        text-shadow: 0px 0px 10px rgba(0, 255, 255, 0.5);
      }
    
      h2 {
        font-size: 22px;
        color: #00FFFF;
        text-align: center;
        text-shadow: 0px 0px 10px rgba(0, 255, 255, 0.5);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 8px;
      }
    
      pre {
        background-color: rgba(0, 0, 0, 0.2);
        padding: 5px;
        border-radius: 5px;
        font-size: 12px;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: #00FFFF;
        border: 1px solid #00FFFF;
        box-shadow: 0px 6px 10px rgba(0, 255, 255, 0.4);
      }

   
      .config-divider {
        border: none;
        height: 2px;
        background: linear-gradient(to right, transparent, #00FFFF, transparent);
        margin: 40px 0;
      }
    
      .config-description {
        font-weight: bold;
        font-style: italic;
        color: #00FFFF;
        font-size: 14px;
        text-align: justify;
        margin: 0 10px;
      }
    
      button {
        padding: 9px 12px;
        border: none;
        border-radius: 5px;
        background-color: #00FFFF;
        color: #111;
        cursor: pointer;
        font-weight: bold;
        display: block;
        text-align: left;
        box-shadow: 0px 6px 10px rgba(0, 255, 255, 0.4);
        transition: background-color 0.3s ease, transform 0.3s ease;
      }
    
      button:hover {
        background-color: #0FF;
        transform: translateY(-3px);
        box-shadow: 0px 6px 10px rgba(0, 255, 255, 0.4);
      }
    
      #search {
        background: #333;
        color: #00FFFF;
        border: 1px solid #00FFFF;
        border-radius: 6px;
        padding: 5px;
        margin-bottom: 10px;
        width: 100%;
        box-shadow: 0px 4px 8px rgba(0, 255, 255, 0.3);
      }
    
      #search::placeholder {
        color: #00FFFF;
      }
    
      .watermark {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 1rem;
        color: #00FFFF;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        font-weight: bold;
        text-align: center;
      }
    
      .watermark a {
        color: #00FFFF;
        text-decoration: none;
        font-weight: bold;
      }
    
      .watermark a:hover {
        color: #00FFFF;
      }
    
      @media (max-width: 768px) {
        .header h1 { font-size: 32px; }
        .config-section h3 { font-size: 24px; }
        .config-block h4 { font-size: 20px; }
      }

    </style>
    
  </head>
  <body>
  <div class="popup">
  <div class="tabs">
    <!-- Search input field -->
    <input type="text" id="search" placeholder="Search by Country" oninput="filterTabs()">

    <!-- Tabs generation -->
    ${proxyList
      .map(
        ({ country, org }, index) => `
          <input type="radio" id="tab${index}" name="tab" ${index === 0 ? "checked" : ""}>
          <label for="tab${index}" class="tab-label" data-country="${country.toLowerCase()}">
            <span class="flag-icon">${getEmojiFlag(country)}</span> ${org}
          </label>
        `
      )
      .join("")}
  </div>

  <!-- Tab content -->
  <div class="tab-content">
    ${proxyListElements}
  </div>
</div>

    <br>
    <a href="https://t.me/${telegram}" class="author-link" target="_blank">@${telegram}</a>
    <script>
  function filterTabs() {
    const query = document.getElementById('search').value.toLowerCase();
    const labels = document.querySelectorAll('.tab-label');
    labels.forEach(label => {
      const isVisible = label.dataset.country.includes(query);
      label.style.display = isVisible ? "block" : "none";
    });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showPopup("Copied to clipboard!");
        })
        .catch((err) => {
            console.error("Failed to copy to clipboard:", err);
        });
  }

  function fetchAndDisplayAlert(path) {
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(\`HTTP error! Status: \${response.status}\`);
            }
            return response.json();
        })
        .then(data => {
            const status = data.status || "Unknown status";
            showPopup(\`Proxy Status: \${status}\`);
        })
        .catch((err) => {
            alert("Failed to fetch data or invalid response.");
        });
  }

  function showPopup(message) {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.style.position = 'fixed';
    popup.style.top = '10%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)'; // Center the popup
    popup.style.backgroundColor = 'rgba(0, 255, 255, 0.8)'; // Neon Blue Transparent Background
    popup.style.color = 'black';
    popup.style.padding = '10px';
    popup.style.border = '3px solid black';
    popup.style.fontSize = '14px';
    popup.style.width = '130px'; // Consistent width
    popup.style.height = '20px'; // Consistent height
    popup.style.borderRadius = '15px'; // Rounded corners
    popup.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)'; // Strong shadow for depth
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.5s ease, transform 0.5s ease'; // Smooth transitions for opacity and transform
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';
    popup.style.textAlign = 'center';
    popup.style.zIndex = '1000'; // Ensure it's on top

    // Adding a little bounce animation when it appears
    popup.style.transform = 'translate(-50%, -50%) scale(0.5)'; // Start smaller for zoom effect
    document.body.appendChild(popup);

    // Apply animation for smooth transition
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translate(-50%, -50%) scale(1)'; // Zoom in effect
    }, 100);

    // Hide the popup after 2 seconds
    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%, -50%) scale(0.5)'; // Shrink back for zoom effect
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 100); // Remove the popup after animation ends
    }, 3000);
  }

  document.querySelectorAll('input[name="tab"]').forEach((tab, index) => {
    tab.addEventListener('change', () => {
      document.querySelectorAll('.content').forEach((content, idx) => {
        content.classList.toggle("active", idx === index);
      });
    });
  });
  
  document.addEventListener('DOMContentLoaded', function () {
    const country = getCountry();  // Fungsi untuk mengambil negara
    const emoji = getEmojiFlag(country);  // Fungsi yang mengembalikan emoji bendera
  
    const button = document.querySelector('.flagButton');  // Mengambil elemen tombol dengan kelas 'flagButton'
    
    // Buat canvas untuk menggambar emoji sebagai gambar
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fontSize = 80;  // Ukuran font emoji bendera
    canvas.width = fontSize * 2;  // Menyesuaikan lebar canvas
    canvas.height = fontSize;     // Menyesuaikan tinggi canvas
    
    // Menggambar emoji bendera ke canvas dengan template literal untuk font size
    ctx.font = \`\${fontSize}px sans-serif\`;  // Ini sudah benar, tanpa \
  
    ctx.fillText(emoji, 10, fontSize * 0.8);  // Posisi X, Y untuk emoji
    
    // Mengonversi canvas menjadi data URL
    const emojiImage = canvas.toDataURL();
    
    // Menetapkan emoji yang dihasilkan sebagai background image tombol
    button.style.backgroundImage = \`url('\${emojiImage}')\`;
  
    const textElement = document.createElement('span');
    textElement.classList.add('text');
    textElement.textContent = 'Click Me';
    button.appendChild(textElement);  // Menambahkan teks di atas background
  });
  
  



</script>


  
  </body>
</html>
  `;
}




async function handleSubRequest(hostnem) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>${nameWEB} | VPN Tunnel | CloudFlare</title>

<!-- SEO Meta Tags -->
<meta name="description" content="Akun Vless Gratis. ${nameWEB} offers free Vless accounts with Cloudflare and Trojan support. Secure and fast VPN tunnel services.">
<meta name="keywords" content="${nameWEB}, Free Vless, Vless CF, Trojan CF, Cloudflare, VPN Tunnel, Akun Vless Gratis">
<meta name="author" content="${nameWEB}">
<meta name="robots" content="index, follow"> <!-- Enable search engines to index the page -->
<meta name="robots" content="noarchive"> <!-- Prevent storing a cached version of the page -->
<meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1"> <!-- Improve visibility in search snippets -->

<!-- Social Media Meta Tags -->
<meta property="og:title" content="${nameWEB} | Free Vless & Trojan Accounts">
<meta property="og:description" content="${nameWEB} provides free Vless accounts and VPN tunnels via Cloudflare. Secure, fast, and easy setup.">
<meta property="og:image" content="https://raw.githubusercontent.com/akulelaki696/bg/refs/heads/main/20250106_010158.jpg"> <!-- Image to appear in previews -->
<meta property="og:url" content="https://vip.rtmq.fun"> <!-- Your website URL -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="${nameWEB}">
<meta property="og:locale" content="en_US"> <!-- Set to your language/locale -->

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${nameWEB} | Free Vless & Trojan Accounts">
<meta name="twitter:description" content="Get free Vless accounts and fast VPN services via Cloudflare with ${nameWEB}. Privacy and security guaranteed.">
<meta name="twitter:image" content="https://raw.githubusercontent.com/akulelaki696/bg/refs/heads/main/20250106_010158.jpg"> <!-- Image for Twitter -->
<meta name="twitter:site" content="@InconigtoVPN">
<meta name="twitter:creator" content="@InconigtoVPN">

<!-- Telegram Meta Tags -->
<meta property="og:image:type" content="image/jpeg"> <!-- Specify the image type for Telegram and other platforms -->
<meta property="og:image:secure_url" content="https://raw.githubusercontent.com/akulelaki696/bg/refs/heads/main/20250106_010158.jpg"> <!-- Secure URL for image -->
<meta property="og:audio" content="URL-to-audio-if-any"> <!-- Optionally add audio for Telegram previews -->
<meta property="og:video" content="URL-to-video-if-any"> <!-- Optionally add video for Telegram previews -->

<!-- Additional Meta Tags -->
<meta name="theme-color" content="#000000"> <!-- Mobile browser theme color -->
<meta name="format-detection" content="telephone=no"> <!-- Prevent automatic phone number detection -->
<meta name="generator" content="${nameWEB}">
<meta name="google-site-verification" content="google-site-verification-code"> <!-- Google verification -->

<!-- Open Graph Tags for Rich Links -->
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${nameWEB} Image Preview">

<!-- Favicon and Icon links -->
<link rel="icon" href="https://raw.githubusercontent.com/AFRcloud/BG/main/icons8-film-noir-80.png" type="image/png">
<link rel="apple-touch-icon" href="https://raw.githubusercontent.com/AFRcloud/BG/main/icons8-film-noir-80.png">
<link rel="manifest" href="/manifest.json">
<style>
    :root {
        --color-primary: #00d4ff; /* Biru neon */
        --color-secondary: #00bfff; /* Biru lebih terang */
        --color-background: #020d1a; /* Latar belakang lebih gelap */
        --color-card: rgba(0, 212, 255, 0.1); /* Kartu dengan sedikit transparansi */
        --color-text: #e0f4f4; /* Tetap dengan teks cerah */
        --transition: all 0.3s ease;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        outline: none;
    }

    body {
        display: flex;
        background: url('https://raw.githubusercontent.com/bitzblack/ip/refs/heads/main/shubham-dhage-5LQ_h5cXB6U-unsplash.jpg') no-repeat center center fixed;
        background-size: cover;
        justify-content: center;
        align-items: flex-start; /* Align items to the top */
        color: var(--color-text);
        min-height: 100vh;
        font-family: 'Arial', sans-serif;
        overflow-y: auto; /* Memungkinkan scrolling */
    }

    .container {
        width: 100%;
        max-width: 500px;
        padding: 2rem;
        max-height: 90vh; /* Batasi tinggi agar tidak melebihi viewport */
        overflow-y: auto; /* Membolehkan scroll jika konten lebih tinggi */
    }

    .card {
        background: var(--color-card);
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0, 212, 255, 0.1); /* Biru neon */
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 212, 255, 0.2); /* Biru neon */
        transition: var(--transition);
    }

    .card:hover {
        box-shadow: 0 20px 60px rgba(0, 212, 255, 0.3); /* Glow lebih kuat */
    }

    .title {
        text-align: center;
        color: var(--color-primary); /* Biru neon */
        margin-bottom: 1.5rem;
        font-size: 2rem;
        font-weight: 700;
        animation: titleFadeIn 1s ease-out;
    }

    @keyframes titleFadeIn {
        0% { opacity: 0; transform: translateY(-20px); }
        100% { opacity: 1; transform: translateY(0); }
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--color-text);
        font-weight: 500;
    }

    .form-control {
        width: 100%;
        padding: 0.75rem 1rem;
        background: rgba(0, 212, 255, 0.05); /* Biru neon */
        border: 2px solid rgba(0, 212, 255, 0.3); /* Biru neon */
        border-radius: 8px;
        color: var(--color-text);
        transition: var(--transition);
    }

    .form-control:focus {
        border-color: var(--color-secondary); /* Biru lebih terang */
        box-shadow: 0 0 8px 3px rgba(0, 255, 255, 0.7); /* Biru neon */
    }

    .btn {
        width: 100%;
        padding: 0.75rem;
        background: var(--color-primary); /* Biru neon */
        color: var(--color-background);
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition);
        position: relative;
        overflow: hidden;
    }

    .btn::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 300%;
        height: 300%;
        background: rgba(0, 255, 255, 0.3);
        transition: all 0.4s ease;
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
    }

    .btn:hover::after {
        transform: translate(-50%, -50%) scale(1);
    }

    .btn:hover {
        background: var(--color-secondary); /* Biru lebih terang */
        box-shadow: 0 0 20px 10px rgba(0, 255, 255, 0.3); /* Glow saat hover */
    }

    .result {
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(0, 212, 255, 0.1); /* Biru neon */
        border-radius: 8px;
        word-break: break-all;
        opacity: 0;
        animation: fadeIn 1s ease-out forwards;
    }

    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }

    .loading {
        display: none;
        text-align: center;
        color: var(--color-primary); /* Biru neon */
        margin-top: 1rem;
    }

    .copy-btns {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
    }

    .copy-btn {
        background: rgba(0, 212, 255, 0.2); /* Biru neon */
        color: var(--color-primary); /* Biru neon */
        padding: 0.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: var(--transition);
        position: relative;
        overflow: hidden;
    }

    .copy-btn::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 300%;
        height: 300%;
        background: rgba(0, 255, 255, 0.3);
        transition: all 0.4s ease;
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
    }

    .copy-btn:hover::after {
        transform: translate(-50%, -50%) scale(1);
    }

    .copy-btn:hover {
        background: rgba(0, 212, 255, 0.3); /* Biru neon */
        box-shadow: 0 0 15px 8px rgba(0, 255, 255, 0.3); /* Glow saat hover */
    }

    #error-message {
        color: #ff4444;
        text-align: center;
        margin-top: 1rem;
    }
</style>



</head>
<body>
    <div class="container">
        <div class="card">
            <h1 class="title">Sub Link Generator</h1>
            <form id="subLinkForm">
                <div class="form-group">
                    <label for="app">Aplikasi</label>
                    <select id="app" class="form-control" required>
                        <option value="v2ray">V2RAY</option>
                        <option value="v2rayng">V2RAYNG</option>
                        <option value="clash">CLASH</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="bug">Bug</label>
                    <input type="text" id="bug" class="form-control" placeholder="Contoh: quiz.int.vidio.com" required>
                </div>

                <div class="form-group">
                    <label for="configType">Tipe Config</label>
                    <select id="configType" class="form-control" required>
                        <option value="vless">VLESS</option>
                        <option value="trojan">TROJAN</option>
                        <option value="shadowsocks">SHADOWSOCKS</option>
                        <option value="mix">ALL CONFIG</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="tls">TLS</label>
                    <select id="tls" class="form-control">
                        <option value="true">TRUE</option>
                        <option value="false">FALSE</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="wildcard">Wildcard</label>
                    <select id="wildcard" class="form-control">
                        <option value="true">TRUE</option>
                        <option value="false">FALSE</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="country">Negara</label>
                    <select id="country" class="form-control">
                        <option value="all">ALL COUNTRY</option>
                        <option value="random">RANDOM</option>
                        <option value="af">AFGHANISTAN</option>
                        <option value="al">ALBANIA</option>
                        <option value="dz">ALJERIA</option>
                        <option value="ad">ANDORRA</option>
                        <option value="ao">ANGOLA</option>
                        <option value="ag">ANTIGUA DAN BARBUDA</option>
                        <option value="ar">ARGENTINA</option>
                        <option value="am">ARMENIA</option>
                        <option value="au">AUSTRALIA</option>
                        <option value="at">AUSTRIA</option>
                        <option value="az">AZERBAIJAN</option>
                        <option value="bs">BAHAMAS</option>
                        <option value="bh">BAHRAIN</option>
                        <option value="bd">BANGLADESH</option>
                        <option value="bb">BARBADOS</option>
                        <option value="by">BELARUS</option>
                        <option value="be">BELGIUM</option>
                        <option value="bz">BELIZE</option>
                        <option value="bj">BENIN</option>
                        <option value="bt">BHUTAN</option>
                        <option value="bo">BOLIVIA</option>
                        <option value="ba">BOSNIA DAN HERZEGOVINA</option>
                        <option value="bw">BOTSWANA</option>
                        <option value="br">BRAZIL</option>
                        <option value="bn">BRUNEI</option>
                        <option value="bg">BULGARIA</option>
                        <option value="bf">BURKINA FASO</option>
                        <option value="bi">BURUNDI</option>
                        <option value="cv">CAP VERDE</option>
                        <option value="kh">KAMBODJA</option>
                        <option value="cm">KAMERUN</option>
                        <option value="ca">KANADA</option>
                        <option value="cf">REPUBLIK AFRIKA TENGAH</option>
                        <option value="td">TADJIKISTAN</option>
                        <option value="cl">CHILE</option>
                        <option value="cn">CINA</option>
                        <option value="co">KOLOMBIA</option>
                        <option value="km">KOMOR</option>
                        <option value="cg">KONGO</option>
                        <option value="cd">KONGO (REPUBLIK DEMOKRATIS)</option>
                        <option value="cr">KOSTA RIKA</option>
                        <option value="hr">KROASIA</option>
                        <option value="cu">CUBA</option>
                        <option value="cy">SIPRUS</option>
                        <option value="cz">CZECHIA</option>
                        <option value="dk">DENMARK</option>
                        <option value="dj">DJIBOUTI</option>
                        <option value="dm">DOMINIKA</option>
                        <option value="do">REPUBLIK DOMINIKA</option>
                        <option value="ec">EKUADOR</option>
                        <option value="eg">MESIR</option>
                        <option value="sv">EL SALVADOR</option>
                        <option value="gn">GUINEA</option>
                        <option value="gq">GUINEA KULTURAL</option>
                        <option value="gw">GUINEA-BISSAU</option>
                        <option value="gy">GUYANA</option>
                        <option value="ht">HAITI</option>
                        <option value="hn">HONDURAS</option>
                        <option value="hu">HUNGARIA</option>
                        <option value="is">ISLANDIA</option>
                        <option value="in">INDIA</option>
                        <option value="id">INDONESIA</option>
                        <option value="ir">IRAN</option>
                        <option value="iq">IRAK</option>
                        <option value="ie">IRLANDIA</option>
                        <option value="il">ISRAEL</option>
                        <option value="it">ITALIA</option>
                        <option value="jm">JAMAIKA</option>
                        <option value="jp">JEPANG</option>
                        <option value="jo">YORDANIA</option>
                        <option value="kz">KAZAKHSTAN</option>
                        <option value="ke">KENYA</option>
                        <option value="ki">KIRIBATI</option>
                        <option value="kp">KOREA UTARA</option>
                        <option value="kr">KOREA SELATAN</option>
                        <option value="kw">KUWAIT</option>
                        <option value="kg">KYRGYZSTAN</option>
                        <option value="la">LAOS</option>
                        <option value="lv">LATVIA</option>
                        <option value="lb">LEBANON</option>
                        <option value="ls">LESOTHO</option>
                        <option value="lr">LIBERIA</option>
                        <option value="ly">LIBIYA</option>
                        <option value="li">LIECHTENSTEIN</option>
                        <option value="lt">LITUANIA</option>
                        <option value="lu">LUKSEMBURG</option>
                        <option value="mk">MAKEDONIA</option>
                        <option value="mg">MADAGASKAR</option>
                        <option value="mw">MALAWI</option>
                        <option value="my">MALAYSIA</option>
                        <option value="mv">MALDIVES</option>
                        <option value="ml">MALI</option>
                        <option value="mt">MALTA</option>
                        <option value="mh">MARSHAL ISLANDS</option>
                        <option value="mr">MAURITANIA</option>
                        <option value="mu">MAURITIUS</option>
                        <option value="mx">MEKSIKO</option>
                        <option value="fm">MICRONESIA</option>
                        <option value="md">MOLDOVA</option>
                        <option value="mc">MONACO</option>
                        <option value="mn">MONGOLIA</option>
                        <option value="me">MONTENEGRO</option>
                        <option value="ma">MAROKO</option>
                        <option value="mz">MOZAMBIQUE</option>
                        <option value="mm">MYANMAR</option>
                        <option value="na">NAMIBIA</option>
                        <option value="np">NEPAL</option>
                        <option value="nl">BELANDA</option>
                        <option value="nz">SELANDIA BARU</option>
                        <option value="ni">NICARAGUA</option>
                        <option value="ne">NIGER</option>
                        <option value="ng">NIGERIA</option>
                        <option value="no">NORWEGIA</option>
                        <option value="om">OMAN</option>
                        <option value="pk">PAKISTAN</option>
                        <option value="pw">PALAU</option>
                        <option value="pa">PANAMA</option>
                        <option value="pg">PAPUA NGUNI</option>
                        <option value="py">PARAGUAY</option>
                        <option value="pe">PERU</option>
                        <option value="ph">FILIPINA</option>
                        <option value="pl">POLAND</option>
                        <option value="pt">PORTUGAL</option>
                        <option value="qa">QATAR</option>
                        <option value="ro">ROMANIA</option>
                        <option value="ru">RUSIA</option>
                        <option value="rw">RWANDA</option>
                        <option value="kn">SAINT KITTS DAN NEVIS</option>
                        <option value="lc">SAINT LUCIA</option>
                        <option value="vc">SAINT VINCENT DAN GRENADINES</option>
                        <option value="ws">SAMOA</option>
                        <option value="sm">SAN MARINO</option>
                        <option value="st">SAO TOME DAN PRINCIPE</option>
                        <option value="sa">ARAB SAUDI</option>
                        <option value="sn">SENEGAL</option>
                        <option value="rs">SERBIA</option>
                        <option value="sc">SEYCHELLES</option>
                        <option value="sl">SIERRA LEONE</option>
                        <option value="sg">SINGAPURA</option>
                        <option value="sk">SLOVAKIA</option>
                        <option value="si">SLOVENIA</option>
                        <option value="so">SOMALIA</option>
                        <option value="za">AFRIKA SELATAN</option>
                        <option value="es">SPANYOL</option>
                        <option value="lk">SRI LANKA</option>
                        <option value="sd">SUDAN</option>
                        <option value="sr">SURINAME</option>
                        <option value="se">SWEDIA</option>
                        <option value="ch">SWISS</option>
                        <option value="sy">SYRIA</option>
                        <option value="tw">TAIWAN</option>
                        <option value="tj">TAJIKISTAN</option>
                        <option value="tz">TANZANIA</option>
                        <option value="th">THAILAND</option>
                        <option value="tg">TOGO</option>
                        <option value="tk">TOKELAU</option>
                        <option value="to">TONGA</option>
                        <option value="tt">TRINIDAD DAN TOBAGO</option>
                        <option value="tn">TUNISIA</option>
                        <option value="tr">TURKI</option>
                        <option value="tm">TURKMENISTAN</option>
                        <option value="tc">TURKS DAN CAICOS ISLANDS</option>
                        <option value="tv">TUVALU</option>
                        <option value="ug">UGANDA</option>
                        <option value="ua">UKRAINA</option>
                        <option value="ae">UNITED ARAB EMIRATES</option>
                        <option value="gb">INGGRIS</option>
                        <option value="us">AMERIKA SERIKAT</option>
                        <option value="uy">URUGUAY</option>
                        <option value="uz">UZBEKISTAN</option>
                        <option value="vu">VANUATU</option>
                        <option value="va">VATICAN</option>
                        <option value="ve">VENEZUELA</option>
                        <option value="vn">VIETNAM</option>
                        <option value="ye">YAMAN</option>
                        <option value="zm">ZAMBIA</option>
                        <option value="zw">ZIMBABWE</option>

                        
                    </select>
                </div>

                <div class="form-group">
                    <label for="limit">Jumlah Config</label>
                    <input type="number" id="limit" class="form-control" min="1" max="100" placeholder="Maks 100" required>
                </div>

                <button type="submit" class="btn">Generate Sub Link</button>
            </form>

            <div id="loading" class="loading">Generating Link...</div>
            <div id="error-message"></div>

            <div id="result" class="result" style="display: none;">
                <p id="generated-link"></p>
                <div class="copy-btns">
                    <button id="copyLink" class="copy-btn">Copy Link</button>
                    <button id="openLink" class="copy-btn">Buka Link</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Performance optimization: Use event delegation and minimize DOM queries
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('subLinkForm');
            const loadingEl = document.getElementById('loading');
            const resultEl = document.getElementById('result');
            const generatedLinkEl = document.getElementById('generated-link');
            const copyLinkBtn = document.getElementById('copyLink');
            const openLinkBtn = document.getElementById('openLink');
            const errorMessageEl = document.getElementById('error-message');
            const appSelect = document.getElementById('app');
            const configTypeSelect = document.getElementById('configType');

            // Cached selectors to minimize DOM lookups
            const elements = {
                app: document.getElementById('app'),
                bug: document.getElementById('bug'),
                configType: document.getElementById('configType'),
                tls: document.getElementById('tls'),
                wildcard: document.getElementById('wildcard'),
                country: document.getElementById('country'),
                limit: document.getElementById('limit')
            };

            // App and config type interaction
            appSelect.addEventListener('change', () => {
                const selectedApp = appSelect.value;
                const shadowsocksOption = configTypeSelect.querySelector('option[value="shadowsocks"]');
                
                if (selectedApp === 'surfboard') {
                    configTypeSelect.value = 'trojan';
                    configTypeSelect.querySelector('option[value="trojan"]').selected = true;
                    shadowsocksOption.disabled = true;
                } else {
                    shadowsocksOption.disabled = false;
                }
            });

            // Form submission handler
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Reset previous states
                loadingEl.style.display = 'block';
                resultEl.style.display = 'none';
                errorMessageEl.textContent = '';

                try {
                    // Validate inputs
                    const requiredFields = ['bug', 'limit'];
                    for (let field of requiredFields) {
                        if (!elements[field].value.trim()) {
                            throw new Error(\`Harap isi \${field === 'bug' ? 'Bug' : 'Jumlah Config'}\`);
                        }
                    }

                    // Construct query parameters
                    const params = new URLSearchParams({
                        type: elements.configType.value,
                        bug: elements.bug.value.trim(),
                        tls: elements.tls.value,
                        wildcard: elements.wildcard.value,
                        limit: elements.limit.value,
                        ...(elements.country.value !== 'all' && { country: elements.country.value })
                    });

                    // Generate full link (replace with your actual domain)
                    const generatedLink = \`/sub/\${elements.app.value}?\${params.toString()}\`;

                    // Simulate loading (remove in production)
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Update UI
                    loadingEl.style.display = 'none';
                    resultEl.style.display = 'block';
                    generatedLinkEl.textContent = \`https://\${window.location.hostname}\${generatedLink}\`;

                    // Copy link functionality
                    copyLinkBtn.onclick = async () => {
                        try {
                            await navigator.clipboard.writeText(\`https://\${window.location.hostname}\${generatedLink}\`);
                            alert('Link berhasil disalin!');
                        } catch {
                            alert('Gagal menyalin link.');
                        }
                    };

                    // Open link functionality
                    openLinkBtn.onclick = () => {
                        window.open(generatedLink, '_blank');
                    };

                } catch (error) {
                    // Error handling
                    loadingEl.style.display = 'none';
                    errorMessageEl.textContent = error.message;
                    console.error(error);
                }
            });
        });
    </script>
</body>
</html>
 `
return html
}

async function websockerHandler(request) {
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);

  webSocket.accept();

  let addressLog = "";
  let portLog = "";
  const log = (info, event) => {
    console.log(`[${addressLog}:${portLog}] ${info}`, event || "");
  };
  const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";

  const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);

  let remoteSocketWrapper = {
    value: null,
  };
  let udpStreamWrite = null;
  let isDNS = false;

  readableWebSocketStream
    .pipeTo(
      new WritableStream({
        async write(chunk, controller) {
          if (isDNS && udpStreamWrite) {
            return udpStreamWrite(chunk);
          }
          if (remoteSocketWrapper.value) {
            const writer = remoteSocketWrapper.value.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
            return;
          }

          const protocol = await protocolSniffer(chunk);
          let protocolHeader;

          if (protocol === "Trojan") {
            protocolHeader = parseTrojanHeader(chunk);
          } else if (protocol === "VLESS") {
            protocolHeader = parseVlessHeader(chunk);
          } else if (protocol === "Shadowsocks") {
            protocolHeader = parseShadowsocksHeader(chunk);
          } else {
            parseVmessHeader(chunk);
            throw new Error("Unknown Protocol!");
          }

          addressLog = protocolHeader.addressRemote;
          portLog = `${protocolHeader.portRemote} -> ${protocolHeader.isUDP ? "UDP" : "TCP"}`;

          if (protocolHeader.hasError) {
            throw new Error(protocolHeader.message);
          }

          if (protocolHeader.isUDP) {
            if (protocolHeader.portRemote === 53) {
              isDNS = true;
            } else {
              throw new Error("UDP only support for DNS port 53");
            }
          }

          if (isDNS) {
            const { write } = await handleUDPOutbound(webSocket, protocolHeader.version, log);
            udpStreamWrite = write;
            udpStreamWrite(protocolHeader.rawClientData);
            return;
          }

          handleTCPOutBound(
            remoteSocketWrapper,
            protocolHeader.addressRemote,
            protocolHeader.portRemote,
            protocolHeader.rawClientData,
            webSocket,
            protocolHeader.version,
            log
          );
        },
        close() {
          log(`readableWebSocketStream is close`);
        },
        abort(reason) {
          log(`readableWebSocketStream is abort`, JSON.stringify(reason));
        },
      })
    )
    .catch((err) => {
      log("readableWebSocketStream pipeTo error", err);
    });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

async function protocolSniffer(buffer) {
  if (buffer.byteLength >= 62) {
    const trojanDelimiter = new Uint8Array(buffer.slice(56, 60));
    if (trojanDelimiter[0] === 0x0d && trojanDelimiter[1] === 0x0a) {
      if (trojanDelimiter[2] === 0x01 || trojanDelimiter[2] === 0x03 || trojanDelimiter[2] === 0x7f) {
        if (trojanDelimiter[3] === 0x01 || trojanDelimiter[3] === 0x03 || trojanDelimiter[3] === 0x04) {
          return "Trojan";
        }
      }
    }
  }

  const vlessDelimiter = new Uint8Array(buffer.slice(1, 17));
  // Hanya mendukung UUID v4
  if (arrayBufferToHex(vlessDelimiter).match(/^\w{8}\w{4}4\w{3}[89ab]\w{3}\w{12}$/)) {
    return "VLESS";
  }

  return "Shadowsocks"; // default
}

async function handleTCPOutBound(
  remoteSocket,
  addressRemote,
  portRemote,
  rawClientData,
  webSocket,
  responseHeader,
  log
) {
  async function connectAndWrite(address, port) {
    const tcpSocket = connect({
      hostname: address,
      port: port,
    });
    remoteSocket.value = tcpSocket;
    log(`connected to ${address}:${port}`);
    const writer = tcpSocket.writable.getWriter();
    await writer.write(rawClientData);
    writer.releaseLock();
    return tcpSocket;
  }

  async function retry() {
    const tcpSocket = await connectAndWrite(
      proxyIP.split(/[:=-]/)[0] || addressRemote,
      proxyIP.split(/[:=-]/)[1] || portRemote
    );
    tcpSocket.closed
      .catch((error) => {
        console.log("retry tcpSocket closed error", error);
      })
      .finally(() => {
        safeCloseWebSocket(webSocket);
      });
    remoteSocketToWS(tcpSocket, webSocket, responseHeader, null, log);
  }

  const tcpSocket = await connectAndWrite(addressRemote, portRemote);

  remoteSocketToWS(tcpSocket, webSocket, responseHeader, retry, log);
}

function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
  let readableStreamCancel = false;
  const stream = new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener("message", (event) => {
        if (readableStreamCancel) {
          return;
        }
        const message = event.data;
        controller.enqueue(message);
      });
      webSocketServer.addEventListener("close", () => {
        safeCloseWebSocket(webSocketServer);
        if (readableStreamCancel) {
          return;
        }
        controller.close();
      });
      webSocketServer.addEventListener("error", (err) => {
        log("webSocketServer has error");
        controller.error(err);
      });
      const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
      if (error) {
        controller.error(error);
      } else if (earlyData) {
        controller.enqueue(earlyData);
      }
    },

    pull(controller) {},
    cancel(reason) {
      if (readableStreamCancel) {
        return;
      }
      log(`ReadableStream was canceled, due to ${reason}`);
      readableStreamCancel = true;
      safeCloseWebSocket(webSocketServer);
    },
  });

  return stream;
}

function parseVmessHeader(vmessBuffer) {
  // https://xtls.github.io/development/protocols/vmess.html#%E6%8C%87%E4%BB%A4%E9%83%A8%E5%88%86
}

function parseShadowsocksHeader(ssBuffer) {
  const view = new DataView(ssBuffer);

  const addressType = view.getUint8(0);
  let addressLength = 0;
  let addressValueIndex = 1;
  let addressValue = "";

  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 3:
      addressLength = new Uint8Array(ssBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 4:
      addressLength = 16;
      const dataView = new DataView(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `Invalid addressType for Shadowsocks: ${addressType}`,
      };
  }

  if (!addressValue) {
    return {
      hasError: true,
      message: `Destination address empty, address type is: ${addressType}`,
    };
  }

  const portIndex = addressValueIndex + addressLength;
  const portBuffer = ssBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: portIndex + 2,
    rawClientData: ssBuffer.slice(portIndex + 2),
    version: null,
    isUDP: portRemote == 53,
  };
}

function parseVlessHeader(vlessBuffer) {
  const version = new Uint8Array(vlessBuffer.slice(0, 1));
  let isUDP = false;

  const optLength = new Uint8Array(vlessBuffer.slice(17, 18))[0];

  const cmd = new Uint8Array(vlessBuffer.slice(18 + optLength, 18 + optLength + 1))[0];
  if (cmd === 1) {
  } else if (cmd === 2) {
    isUDP = true;
  } else {
    return {
      hasError: true,
      message: `command ${cmd} is not support, command 01-tcp,02-udp,03-mux`,
    };
  }
  const portIndex = 18 + optLength + 1;
  const portBuffer = vlessBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);

  let addressIndex = portIndex + 2;
  const addressBuffer = new Uint8Array(vlessBuffer.slice(addressIndex, addressIndex + 1));

  const addressType = addressBuffer[0];
  let addressLength = 0;
  let addressValueIndex = addressIndex + 1;
  let addressValue = "";
  switch (addressType) {
    case 1: // For IPv4
      addressLength = 4;
      addressValue = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 2: // For Domain
      addressLength = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 3: // For IPv6
      addressLength = 16;
      const dataView = new DataView(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `invild  addressType is ${addressType}`,
      };
  }
  if (!addressValue) {
    return {
      hasError: true,
      message: `addressValue is empty, addressType is ${addressType}`,
    };
  }

  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: addressValueIndex + addressLength,
    rawClientData: vlessBuffer.slice(addressValueIndex + addressLength),
    version: new Uint8Array([version[0], 0]),
    isUDP: isUDP,
  };
}

function parseTrojanHeader(buffer) {
  const socks5DataBuffer = buffer.slice(58);
  if (socks5DataBuffer.byteLength < 6) {
    return {
      hasError: true,
      message: "invalid SOCKS5 request data",
    };
  }

  let isUDP = false;
  const view = new DataView(socks5DataBuffer);
  const cmd = view.getUint8(0);
  if (cmd == 3) {
    isUDP = true;
  } else if (cmd != 1) {
    throw new Error("Unsupported command type!");
  }

  let addressType = view.getUint8(1);
  let addressLength = 0;
  let addressValueIndex = 2;
  let addressValue = "";
  switch (addressType) {
    case 1: // For IPv4
      addressLength = 4;
      addressValue = new Uint8Array(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(
        "."
      );
      break;
    case 3: // For Domain
      addressLength = new Uint8Array(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(
        socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
      );
      break;
    case 4: // For IPv6
      addressLength = 16;
      const dataView = new DataView(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `invalid addressType is ${addressType}`,
      };
  }

  if (!addressValue) {
    return {
      hasError: true,
      message: `address is empty, addressType is ${addressType}`,
    };
  }

  const portIndex = addressValueIndex + addressLength;
  const portBuffer = socks5DataBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: portIndex + 4,
    rawClientData: socks5DataBuffer.slice(portIndex + 4),
    version: null,
    isUDP: isUDP,
  };
}

async function remoteSocketToWS(remoteSocket, webSocket, responseHeader, retry, log) {
  let header = responseHeader;
  let hasIncomingData = false;
  await remoteSocket.readable
    .pipeTo(
      new WritableStream({
        start() {},
        async write(chunk, controller) {
          hasIncomingData = true;
          if (webSocket.readyState !== WS_READY_STATE_OPEN) {
            controller.error("webSocket.readyState is not open, maybe close");
          }
          if (header) {
            webSocket.send(await new Blob([header, chunk]).arrayBuffer());
            header = null;
          } else {
            webSocket.send(chunk);
          }
        },
        close() {
          log(`remoteConnection!.readable is close with hasIncomingData is ${hasIncomingData}`);
        },
        abort(reason) {
          console.error(`remoteConnection!.readable abort`, reason);
        },
      })
    )
    .catch((error) => {
      console.error(`remoteSocketToWS has exception `, error.stack || error);
      safeCloseWebSocket(webSocket);
    });
  if (hasIncomingData === false && retry) {
    log(`retry`);
    retry();
  }
}

function base64ToArrayBuffer(base64Str) {
  if (!base64Str) {
    return { error: null };
  }
  try {
    base64Str = base64Str.replace(/-/g, "+").replace(/_/g, "/");
    const decode = atob(base64Str);
    const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
    return { earlyData: arryBuffer.buffer, error: null };
  } catch (error) {
    return { error };
  }
}

function arrayBufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function handleUDPOutbound(webSocket, responseHeader, log) {
  let isVlessHeaderSent = false;
  const transformStream = new TransformStream({
    start(controller) {},
    transform(chunk, controller) {
      for (let index = 0; index < chunk.byteLength; ) {
        const lengthBuffer = chunk.slice(index, index + 2);
        const udpPakcetLength = new DataView(lengthBuffer).getUint16(0);
        const udpData = new Uint8Array(chunk.slice(index + 2, index + 2 + udpPakcetLength));
        index = index + 2 + udpPakcetLength;
        controller.enqueue(udpData);
      }
    },
    flush(controller) {},
  });
  transformStream.readable
    .pipeTo(
      new WritableStream({
        async write(chunk) {
          const resp = await fetch("https://1.1.1.1/dns-query", {
            method: "POST",
            headers: {
              "content-type": "application/dns-message",
            },
            body: chunk,
          });
          const dnsQueryResult = await resp.arrayBuffer();
          const udpSize = dnsQueryResult.byteLength;
          const udpSizeBuffer = new Uint8Array([(udpSize >> 8) & 0xff, udpSize & 0xff]);
          if (webSocket.readyState === WS_READY_STATE_OPEN) {
            log(`doh success and dns message length is ${udpSize}`);
            if (isVlessHeaderSent) {
              webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
            } else {
              webSocket.send(await new Blob([responseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
              isVlessHeaderSent = true;
            }
          }
        },
      })
    )
    .catch((error) => {
      log("dns udp has error" + error);
    });

  const writer = transformStream.writable.getWriter();

  return {
    write(chunk) {
      writer.write(chunk);
    },
  };
}

function safeCloseWebSocket(socket) {
  try {
    if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
      socket.close();
    }
  } catch (error) {
    console.error("safeCloseWebSocket error", error);
  }
}
// Fungsi untuk mengonversi countryCode menjadi emoji bendera


async function generateClashSub(type, bug, inconigtomode, tls, country = null, limit = null) {
  const proxyListResponse = await fetch(DEFAULT_PROXY_BANK_URL2);
  const proxyList = await proxyListResponse.text();
  let ips = proxyList
    .split('\n')
    .filter(Boolean)
  if (country && country.toLowerCase() === 'random') {
    // Pilih data secara acak jika country=random
    ips = ips.sort(() => Math.random() - 0.5); // Acak daftar proxy
  } else if (country) {
    // Filter berdasarkan country jika bukan "random"
    ips = ips.filter(line => {
      const parts = line.split(',');
      if (parts.length > 1) {
        const lineCountry = parts[2].toUpperCase();
        return lineCountry === country.toUpperCase();
      }
      return false;
    });
  }
  
  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit); // Batasi jumlah proxy berdasarkan limit
  }
  
  let conf = '';
  let bex = '';
  let count = 1;
  
  for (let line of ips) {
    const parts = line.split(',');
    const proxyHost = parts[0];
    const proxyPort = parts[1] || 443;
    const emojiFlag = getEmojiFlag(line.split(',')[2]); // Konversi ke emoji bendera
    const sanitize = (text) => text.replace(/[\n\r]+/g, "").trim(); // Hapus newline dan spasi ekstra
    let ispName = sanitize(`${emojiFlag} [${line.split(',')[2]}] ${line.split(',')[3]} ${count ++}`);
    const UUIDS = `${generateUUIDv4()}`;
    const ports = tls ? '443' : '80';
    const snio = tls ? `\n  servername: ${inconigtomode}` : '';
    const snioo = tls ? `\n  cipher: auto` : '';
    if (type === 'vless') {
      bex += `  - ${ispName}\n`
      conf += `
- name: ${ispName}-[VL]-[${nameWEB}]
  server: ${bug}
  port: ${ports}
  type: vless
  uuid: ${UUIDS}${snioo}
  tls: ${tls}
  udp: false
  skip-cert-verify: true
  client-fingerprint: chrome
  network: ws${snio}
  alpn:
    - h2
    - h3
    - http/1.1
  ws-opts:
    path: /${pathinfo}/${proxyHost}/${proxyPort}
    headers:
      Host: ${inconigtomode}
    max-early-data: 0
    early-data-header-name: Sec-WebSocket-Protocol
    ip-version: dual
    v2ray-http-upgrade: false
    v2ray-http-upgrade-fast-open: false
    `;
    } else if (type === 'trojan') {
      bex += `  - ${ispName}\n`
      conf += `
- name: ${ispName}-[TR]-[${nameWEB}]
  server: ${bug}
  port: 443
  type: trojan
  password: ${UUIDS}
  tls: true
  client-fingerprint: chrome
  udp: false
  skip-cert-verify: true
  network: ws
  sni: ${inconigtomode}
  alpn:
    - h2
    - h3
    - http/1.1
  ws-opts:
    path: /${pathinfo}/${proxyHost}/${proxyPort}
    headers:
      Host: ${inconigtomode}
    max-early-data: 0
    early-data-header-name: Sec-WebSocket-Protocol
    ip-version: dual
    v2ray-http-upgrade: false
    v2ray-http-upgrade-fast-open: false
    `;
    } else if (type === 'shadowsocks') {
      bex += `  - ${ispName}\n`
      conf += `
- name: ${ispName}-[SS]-[${nameWEB}]
  type: ss
  server: ${bug}
  port: ${ports}
  cipher: none
  password: ${UUIDS}
  udp: false
  plugin: v2ray-plugin
  client-fingerprint: chrome
  plugin-opts:
    mode: websocket
    tls: ${tls}
    skip-cert-verify: true
    host: ${inconigtomode}
    path: /${pathinfo}/${proxyHost}/${proxyPort}
    mux: false
  headers:
    custom: value
    ip-version: dual
    v2ray-http-upgrade: false
    v2ray-http-upgrade-fast-open: false
    `;
    } else if (type === 'mix') {
      bex += `  - ${ispName}-[VL]-[${nameWEB}]\n  - ${ispName}-[TR]-[${nameWEB}]\n  - ${ispName}-[SS]-[${nameWEB}]\n`;
      conf += `
- name: ${ispName}-[VL]-[${nameWEB}]
  server: ${bug}
  port: ${ports}
  type: vless
  uuid: ${UUIDS}
  cipher: auto
  tls: ${tls}
  udp: false
  skip-cert-verify: true
  network: ws${snio}
  ws-opts:
    path: /${pathinfo}/${proxyHost}/${proxyPort}
    headers:
      Host: ${inconigtomode}
- name: ${ispName}-[TR]-[${nameWEB}]
  server: ${bug}
  port: 443
  type: trojan
  password: ${UUIDS}
  udp: false
  skip-cert-verify: true
  network: ws
  sni: ${inconigtomode}
  ws-opts:
    path: /${pathinfo}/${proxyHost}/${proxyPort}
    headers:
      Host: ${inconigtomode}
- name: ${ispName}-[SS]-[${nameWEB}]
  type: ss
  server: ${bug}
  port: ${ports}
  cipher: none
  password: ${UUIDS}
  udp: false
  plugin: v2ray-plugin
  plugin-opts:
    mode: websocket
    tls: ${tls}
    skip-cert-verify: true
    host: ${inconigtomode}
    path: /${pathinfo}/${proxyHost}/${proxyPort}
    mux: false
    headers:
      custom: ${inconigtomode}`;
    }
  }
  return `
proxies:
${conf}`;
}

async function generateV2rayngSub(type, bug, inconigtomode, tls, country = null, limit = null) {
  const proxyListResponse = await fetch(DEFAULT_PROXY_BANK_URL2);
  const proxyList = await proxyListResponse.text();
  
  let ips = proxyList.split('\n').filter(Boolean);

  if (country) {
    if (country.toLowerCase() === 'random') {
      ips = ips.sort(() => 0.5 - Math.random()); // Acak daftar proxy
    } else {
      ips = ips.filter(line => {
        const parts = line.split(',');
        return parts.length > 1 && parts[2].toUpperCase() === country.toUpperCase();
      });
    }
  }

  if (limit && !isNaN(limit)) {
    ips = ips.slice(0, limit); // Batasi jumlah proxy berdasarkan limit
  }

  // Fungsi untuk membuat format konfigurasi berdasarkan jenis
  function generateConfig(protocol, UUIDS, proxyHost, proxyPort, ispInfo) {
    const secure = tls ? "tls" : "none";
    const port = tls ? 443 : 80;
    const sni = tls ? `&sni=${inconigtomode}` : "";
    const security = tls ? "&security=tls" : "&security=none";

    const basePath = `%2F${pathinfo}%2F${proxyHost}%2F${proxyPort}`;
    const commonParams = `?encryption=none&type=ws&host=${inconigtomode}&path=${basePath}${security}${sni}`;

    const configs = {
      vless: `vless://${UUIDS}@${bug}:${port}${commonParams}&fp=randomized#${ispInfo}-[VL]-[${nameWEB}]`,
      trojan: `trojan://${UUIDS}@${bug}:${port}${commonParams}&fp=randomized#${ispInfo}-[TR]-[${nameWEB}]`,
      shadowsocks: `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:${port}${commonParams}#${ispInfo}-[SS]-[${nameWEB}]`
    };

    return configs[protocol] || "";
  }

  const conf = ips.map(line => {
    const parts = line.split(',');
    const [proxyHost, proxyPort = 443, countryCode, isp] = parts;
    const UUIDS = generateUUIDv4();
    const ispInfo = `[${countryCode}] ${isp}`;

    if (type === "mix") {
      return ["vless", "trojan", "shadowsocks"].map(proto =>
        generateConfig(proto, UUIDS, proxyHost, proxyPort, ispInfo)
      ).join("\n");
    }
    return generateConfig(type, UUIDS, proxyHost, proxyPort, ispInfo);
  }).join("\n");

  return btoa(conf.replace(/ /g, '%20'));
}


async function generateV2raySub(type, bug, inconigtomode, tls, country = null, limit = null) {
  const proxyList = (await (await fetch(DEFAULT_PROXY_BANK_URL2)).text()).split('\n').filter(Boolean);
  let ips = country ? (country.toLowerCase() === 'random' ? proxyList.sort(() => Math.random() - 0.5) : proxyList.filter(line => line.split(',')[2]?.toUpperCase() === country.toUpperCase())) : proxyList;
  if (limit && !isNaN(limit)) ips = ips.slice(0, limit);
  
  return ips.map(line => {
    const [proxyHost, proxyPort = 443, countryCode, isp] = line.split(',');
    const UUIDS = generateUUIDv4();
    const information = encodeURIComponent(`${getEmojiFlag(countryCode)} (${countryCode}) ${isp}`);
    const baseConfig = `${UUIDS}@${bug}:${tls ? 443 : 80}?${tls ? 'security=tls&sni' : 'security=none&sni'}=${inconigtomode}&fp=randomized&type=ws&host=${inconigtomode}&path=%2F${pathinfo}%2F${proxyHost}%2F${proxyPort}`;
    
    switch (type) {
      case 'vless': return `vless://${baseConfig}#${information}-[VL]-[${nameWEB}]`;
      case 'trojan': return `trojan://${baseConfig}#${information}-[TR]-[${nameWEB}]`;
      case 'shadowsocks': return `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:${tls ? 443 : 80}?encryption=none&type=ws&host=${inconigtomode}&path=%2F${pathinfo}%2F${proxyHost}%2F${proxyPort}&${tls ? 'security=tls' : 'security=none'}&sni=${inconigtomode}#${information}-[SS]-[${nameWEB}]`;
      case 'mix': return [
        `vless://${baseConfig}#${information}-[VL]-[${nameWEB}]`,
        `trojan://${baseConfig}#${information}-[TR]-[${nameWEB}]`,
        `ss://${btoa(`none:${UUIDS}`)}%3D@${bug}:${tls ? 443 : 80}?encryption=none&type=ws&host=${inconigtomode}&path=%2F${pathinfo}%2F${proxyHost}%2F${proxyPort}&${tls ? 'security=tls' : 'security=none'}&sni=${inconigtomode}#${information}-[SS]-[${nameWEB}]`
      ].join('\n');
    }
  }).join('\n');
}


function generateUUIDv4() {
  const randomValues = crypto.getRandomValues(new Uint8Array(16));
  randomValues[6] = (randomValues[6] & 0x0f) | 0x40;
  randomValues[8] = (randomValues[8] & 0x3f) | 0x80;
  return [
    randomValues[0].toString(16).padStart(2, '0'),
    randomValues[1].toString(16).padStart(2, '0'),
    randomValues[2].toString(16).padStart(2, '0'),
    randomValues[3].toString(16).padStart(2, '0'),
    randomValues[4].toString(16).padStart(2, '0'),
    randomValues[5].toString(16).padStart(2, '0'),
    randomValues[6].toString(16).padStart(2, '0'),
    randomValues[7].toString(16).padStart(2, '0'),
    randomValues[8].toString(16).padStart(2, '0'),
    randomValues[9].toString(16).padStart(2, '0'),
    randomValues[10].toString(16).padStart(2, '0'),
    randomValues[11].toString(16).padStart(2, '0'),
    randomValues[12].toString(16).padStart(2, '0'),
    randomValues[13].toString(16).padStart(2, '0'),
    randomValues[14].toString(16).padStart(2, '0'),
    randomValues[15].toString(16).padStart(2, '0'),
  ].join('').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}
