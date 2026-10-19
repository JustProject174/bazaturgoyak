/**
 * Генерирует js/config.js из .env для масштабирования и продажи клиентам.
 * Запуск: node scripts/generate-config.js
 * Требуется: файл .env в корне проекта (скопируйте из .env.example).
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const projectRoot = path.resolve(root, '..', '..');

// Выбор .env: приоритет — GOLDEN_SANDS_ENV_FILE (тот же файл, что и у dev-booking-up.sh), затем local|dev|prod, затем первый существующий
const envCandidates = [
  path.join(root, '.env'),
  path.join(projectRoot, '.env.local'),
  path.join(projectRoot, '.env.dev'),
  path.join(projectRoot, '.env.prod'),
  path.join(projectRoot, '.env'),
];
let envPath;
const envFileFromScript = process.env.GOLDEN_SANDS_ENV_FILE;
if (envFileFromScript && fs.existsSync(envFileFromScript)) {
  envPath = envFileFromScript;
} else {
  const envMode = process.env.GOLDEN_SANDS_ENV;
  if (envMode === 'local' && fs.existsSync(path.join(projectRoot, '.env.local'))) {
    envPath = path.join(projectRoot, '.env.local');
  } else if (envMode === 'dev' && fs.existsSync(path.join(projectRoot, '.env.dev'))) {
    envPath = path.join(projectRoot, '.env.dev');
  } else if (envMode === 'prod' && fs.existsSync(path.join(projectRoot, '.env.prod'))) {
    envPath = path.join(projectRoot, '.env.prod');
  } else {
    envPath = envCandidates.find((p) => fs.existsSync(p)) || path.join(root, '.env');
  }
}
const outPath = path.join(root, 'js', 'config.js');
const outPathRoot = path.join(root, 'config.js');

function parseEnv(content) {
  const env = {};
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    let trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('export ')) trimmed = trimmed.slice(7).trim();
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    let key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    const hashIdx = value.indexOf('#');
    if (hashIdx >= 0) value = value.slice(0, hashIdx).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1).replace(/\\(.)/g, '$1');
    }
    env[key] = value;
  }
  return env;
}

function buildConfig(env) {
  // На Vercel используем прокси /api (обход CORS). Реальный URL API — в env API_BASE_URL.
  const apiBaseUrl = process.env.VERCEL
    ? '/api'
    : (env.API_BASE_URL || 'https://api.justproject174.ru/api');
  return {
    apiBaseUrl,
    widgetUrl: (env.WIDGET_URL || 'https://widget.justproject174.ru/').replace(/\/+$/, '') + '/',
    apiEmail: env.API_EMAIL || '',
    apiPassword: env.API_PASSWORD || '',
    siteName: env.SITE_NAME || 'Золотые пески',
    phone: env.PHONE || '+79080686060',
    phoneFormatted: env.PHONE_FORMATTED || '+7 (908) 068-60-60',
    phoneTents: env.PHONE_TENTS || '+79026060123',
    phoneTentsFormatted: env.PHONE_TENTS_FORMATTED || '+7 (902) 606-01-23',
    maxUrl: process.env.MAX_URL || env.MAX_URL || 'https://web.max.ru/10641719',
    max: env.MAX_PHONE || env.PHONE || '+79080686060',
    maxFormatted: env.MAX_PHONE_FORMATTED || env.PHONE_FORMATTED || '+7 (908) 068-60-60',
    email: env.EMAIL || 'bazaturgoyak@mail.ru',
    emailReturns: env.EMAIL_RETURNS || 'bazaturgoyak@mail.ru',
    telegramBot: env.TELEGRAM_BOT || 'https://t.me/Zolotye_peski174_bot',
    telegramChannel: env.TELEGRAM_CHANNEL || 'https://t.me/bazaturgoyak',
    vkUrl: env.VK_URL || 'https://vk.com/zoloto214055450',
    address: env.ADDRESS || 'Челябинская область, г. Миасс, озеро Тургояк',
    coordinates: env.COORDINATES || '55.187969, 60.059069',
    yandexMapLl: env.YANDEX_MAP_LL || '60.059069,55.187969',
    signatureEmail: env.SIGNATURE_EMAIL || 'andrei.kruglichenko@kragor.tech',
    signatureName: env.SIGNATURE_NAME || 'Kragor',
    // Режим бронирования (консервация GS-29): "live" — виджет и API работают;
    // "placeholder" — онлайн-бронь и вызовы API отключены, показывается заглушка.
    // Расконсервация (GS-16): BOOKING_MODE=live в .env. Дефолт — placeholder.
    bookingMode: env.BOOKING_MODE === 'live' ? 'live' : 'placeholder',
  };
}

function generateJs(config) {
  const lines = [
    '/* eslint-disable */',
    '// Сгенерировано скриптом scripts/generate-config.js из .env. Не редактировать вручную при использовании .env.',
    'window.CONFIG = ' + JSON.stringify(config, null, 2) + ';',
    'if (typeof window.API_BASE_URL === \'undefined\') { window.API_BASE_URL = window.CONFIG.apiBaseUrl; }',
    'if (typeof window.WIDGET_URL === \'undefined\') { window.WIDGET_URL = window.CONFIG.widgetUrl; }',
  ];
  return lines.join('\n');
}

let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log(`Читаю переменные окружения из: ${envPath}`);
} catch (e) {
  console.warn(
    'Файл .env не найден ни в папке проекта, ни в корне репозитория. ' +
      'Используются значения по умолчанию. Скопируйте .env.example в .env или создайте общий .env(.local) в корне.',
  );
}

const env = parseEnv(envContent);
// Переменные окружения платформы (Vercel/Netlify/Render) переопределяют .env
const envKeys = ['API_BASE_URL', 'WIDGET_URL', 'API_EMAIL', 'API_PASSWORD', 'SITE_NAME', 'PHONE', 'PHONE_FORMATTED', 'PHONE_TENTS', 'PHONE_TENTS_FORMATTED', 'MAX_URL', 'MAX_PHONE', 'MAX_PHONE_FORMATTED', 'EMAIL', 'EMAIL_RETURNS', 'TELEGRAM_BOT', 'TELEGRAM_CHANNEL', 'VK_URL', 'ADDRESS', 'COORDINATES', 'YANDEX_MAP_LL', 'SIGNATURE_EMAIL', 'SIGNATURE_NAME', 'BOOKING_MODE'];
envKeys.forEach((k) => { if (process.env[k] !== undefined && process.env[k] !== '') env[k] = process.env[k]; });
const config = buildConfig(env);
const js = generateJs(config);

const jsDir = path.dirname(outPath);
if (!fs.existsSync(jsDir)) {
  fs.mkdirSync(jsDir, { recursive: true });
}
fs.writeFileSync(outPath, js, 'utf8');
fs.writeFileSync(outPathRoot, js, 'utf8');
console.log('Готово: js/config.js создан из', envPath);
console.log('  telegramBot:', config.telegramBot || '(не задан)');
process.exit(0);
