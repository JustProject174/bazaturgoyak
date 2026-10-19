/**
 * Список объектов проката — из knowledgeBase.js (база знаний).
 * Цены на странице подставляются из API (CONFIG.apiBaseUrl).
 * Соответствие: apiTypeSlug — slug типа объекта в API для подстановки цены.
 */
window.PROKAT_DATA = {
  categories: [
    {
      id: 'boats',
      name: 'Лодки и плавсредства',
      slug: 'boats',
      icon: 'fa-ship',
      description: 'Надувные лодки, байдарки и сапборды для отдыха на воде. Спасательные жилеты включены.',
      items: [
        { id: 'sup', name: 'Сапборд', capacity: '1 человек', capacityNum: 1, description: 'Станд-ап падлборд для прогулок по озеру.', image: 'images/About/sup.webp', requiresDeposit: true, apiTypeSlug: 'SUP' },
        { id: 'kayak', name: 'Байдарка', capacity: '3 человека', capacityNum: 3, description: 'На 3 человек, 2 весла. Устойчивая модель для семьи.', image: 'images/Entertaiment/Beach1.jfif', requiresDeposit: true },
        { id: 'boat-2', name: 'Лодка надувная (2 места)', capacity: '2 человека', capacityNum: 2, description: 'Компактная надувная лодка для двоих.', image: 'images/Entertaiment/Beach1.jfif', requiresDeposit: true },
        { id: 'boat-4', name: 'Лодка надувная (4 места)', capacity: '4 человека', capacityNum: 4, description: 'Надувная лодка на четверых.', image: 'images/Entertaiment/Beach1.jfif', requiresDeposit: true },
      ],
    },
    {
      id: 'sports',
      name: 'Спортинвентарь',
      slug: 'sports',
      icon: 'fa-futbol',
      description: 'Мячи, ракетки и другой инвентарь для активного отдыха.',
      items: [
        { id: 'volleyball', name: 'Мяч волейбольный', capacity: '—', capacityNum: null, description: 'Для игры на волейбольной площадке.', image: 'images/Entertaiment/volleyball-net.jfif', requiresDeposit: false },
        { id: 'racket', name: 'Ракетки и мячи (бадминтон/теннис)', capacity: '—', capacityNum: null, description: 'Набор для игры в бадминтон или пляжный теннис.', image: 'images/Entertaiment/volleyball-net.jfif', requiresDeposit: false },
      ],
    },
    {
      id: 'other',
      name: 'Другое оборудование',
      slug: 'other',
      icon: 'fa-umbrella-beach',
      description: 'Шезлонги, зонты и прочий пляжный инвентарь.',
      items: [
        { id: 'sunbed', name: 'Шезлонг', capacity: '—', capacityNum: null, description: 'Аренда шезлонга на пляже.', image: 'images/Entertaiment/Beach1.jfif', requiresDeposit: false },
        { id: 'chair', name: 'Свои кресла/шезлонги (использование на территории)', capacity: '—', capacityNum: null, description: 'Плата за использование своих кресел на пляже (если парковка не на нашей платной стоянке).', image: 'images/Entertaiment/Beach1.jfif', requiresDeposit: false },
      ],
    },
  ],

  conditions: {
    deposit: 'Плавсредства выдаются под обеспечительный залог. Сумму и порядок возврата уточняйте при бронировании.',
    lifeJackets: 'Спасательные жилеты при аренде лодок и сапбордов включены в стоимость.',
    rules: [
      'Использовать инвентарь только по назначению и в разрешённой зоне.',
      'Соблюдать правила безопасности на воде: не выходить в ветер и при плохой видимости.',
      'Возвращать инвентарь в оговорённое время в исправном и чистом виде.',
    ],
    liability: 'Гость несёт ответственность за сохранность и целостность инвентаря. В случае утери или повреждения стоимость ремонта/замены удерживается из залога или взимается отдельно.',
  },

  contacts: {
    phone: '+7 (908) 068-60-60',
    phoneRaw: '+79080686060',
    phoneCamping: '+7 (902) 606-01-23',
    phoneCampingRaw: '+79026060123',
    telegram: 'https://t.me/Zolotye_peski174_bot',
    telegramProkatMessage: 'Здравствуйте! Интересует прокат инвентаря на базе Золотые пески (сап, лодка, байдарка и т.д.). Подскажите наличие и стоимость.',
    telegramBot: '@Zolotye_peski174_bot',
    whatsapp: 'https://wa.me/79080686060',
    bookingWidget: '', // заполняется из CONFIG.widgetUrl через apply-config.js
    workHours: '9:00–22:00',
  },
};
