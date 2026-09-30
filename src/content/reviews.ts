export type ReviewSource = 'yandex' | '2gis'

export type ReviewReply = {
  text: string
  dateLabel: string
}

export type ReviewFixture = {
  id: string
  author: string
  rating: 5
  dateLabel: string
  text: string
  source: ReviewSource
  reply?: ReviewReply
}

export type ReviewScreenshot = {
  id: string
  src: string
  alt: string
  width: number
  height: number
}

export const reviewSourceLabels: Record<ReviewSource, string> = {
  yandex: 'Яндекс Карты',
  '2gis': '2ГИС',
}

/** Mobile screenshots from maps apps. Visual fixtures only, no network. */
export const reviewScreenshots: readonly ReviewScreenshot[] = [
  {
    id: 'eduard-nastya',
    src: '/img/reviews/01-eduard-nastya.jpg',
    alt: 'Отзывы Эдуарда Шварца и Nastya Y. на Яндекс Картах',
    width: 720,
    height: 1280,
  },
  {
    id: 'anna-kalinina',
    src: '/img/reviews/02-anna-kalinina.jpg',
    alt: 'Отзыв Анны Калининой на Яндекс Картах',
    width: 720,
    height: 1280,
  },
  {
    id: 'svetlana-maria',
    src: '/img/reviews/03-svetlana-maria.jpg',
    alt: 'Отзывы Светланы Саввиной и Марии Крайновой',
    width: 720,
    height: 1280,
  },
  {
    id: 'anastasia-timur',
    src: '/img/reviews/04-anastasia-timur.jpg',
    alt: 'Отзывы Анастасии Е.Е. и Тимура Балицкого на Яндекс Картах',
    width: 720,
    height: 1280,
  },
  {
    id: 'elena-s',
    src: '/img/reviews/05-elena-s.jpg',
    alt: 'Отзыв Elena S. на Яндекс Картах',
    width: 720,
    height: 1280,
  },
  {
    id: 'yuriy',
    src: '/img/reviews/06-yuriy.jpg',
    alt: 'Отзыв Юрия Фаридовича на Яндекс Картах',
    width: 720,
    height: 1280,
  },
  {
    id: 'alexandra',
    src: '/img/reviews/07-alexandra.jpg',
    alt: 'Отзыв Александры и ответ садового центра в 2ГИС',
    width: 720,
    height: 1280,
  },
  {
    id: 'marya-krasa',
    src: '/img/reviews/08-marya-krasa.jpg',
    alt: 'Отзыв Марьи Красы и ответ садового центра в 2ГИС',
    width: 720,
    height: 1280,
  },
  {
    id: 'maria-vologdina',
    src: '/img/reviews/09-maria-vologdina.jpg',
    alt: 'Отзыв Марии Вологдиной и ответ садового центра в 2ГИС',
    width: 720,
    height: 1280,
  },
] as const

/** Site review cards. Visual fixtures for the on-site template. */
export const reviewFixtures: readonly ReviewFixture[] = [
  {
    id: 'marya-krasa',
    author: 'Марья Краса',
    rating: 5,
    dateLabel: '16 июня 2026',
    text: 'Отличное место, большой выбор растений и сопутствующих товаров. Отдельное спасибо Ольге за советы и рекомендации и ее юным помощникам за погрузку наших покупок🤩',
    source: '2gis',
    reply: {
      text: 'Мария, приятно неожиданно ))) И вам спасибо! Приезжайте еще!',
      dateLabel: '16 июня 2026',
    },
  },
  {
    id: 'timur-balitskiy',
    author: 'Тимур Балицкий',
    rating: 5,
    dateLabel: '9 августа 2025',
    text: 'Классный СЦ. Один из лучших, что я видел! Ольга очень компетентная и знающая свое дело специалист! Помогла с подбором растений и дизайном участка ! Остались довольны',
    source: 'yandex',
  },
  {
    id: 'maria-vologdina',
    author: 'Мария Вологдина',
    rating: 5,
    dateLabel: '24 августа 2025',
    text: 'Очень уютное местечко, видно что сделано с любовью. Милый продавец. А еще приятно было попасть на акцию -20% на растения. Рекомендую к посещению',
    source: '2gis',
    reply: {
      text: 'Мария, благодарим Вас за отзыв! Нам ооочень приятно!!! Ждём вас снова!',
      dateLabel: '21 октября 2025',
    },
  },
  {
    id: 'alexandra',
    author: 'Александра',
    rating: 5,
    dateLabel: '16 сентября 2024',
    text: 'Хорошие цены и очень отзывчивые, вежливые, приятные в общении сотрудники',
    source: '2gis',
    reply: {
      text: 'Александра, благодарим! Нам очень важно ваше мнение!)',
      dateLabel: '7 октября 2024',
    },
  },
  {
    id: 'anastasia-ee',
    author: 'Анастасия Е.Е.',
    rating: 5,
    dateLabel: '14 августа 2024',
    text: 'Большой выбор садовых растений цветов и деревьев!! А также мангалы беседки камни!)) Меня впечатлило 😎 Очень приятное место!)',
    source: 'yandex',
  },
  {
    id: 'eduard-shvarts',
    author: 'Эдуард Шварц',
    rating: 5,
    dateLabel: '14 июля 2023',
    text: 'Рекомендую. Покажут, посоветуют, расскажут. Приятные хозяева, как я понял сами работают. Лишнего не навязывают. Высокая экспертиза в вопросе. Советую',
    source: 'yandex',
  },
  {
    id: 'anna-kalinina',
    author: 'Анна Калинина',
    rating: 5,
    dateLabel: '10 июля 2023',
    text: 'Побывала в питомнике второй раз и ни разу не уходила с пустыми руками!!! Управляющая Ольга настоящий профессионал, знает все и даже больше 😄. Мне, как начинающему садоводу она дала очень много дельных советов. Помогла выбрать растения так что бы они радовали меня еще долгие годы. Я под глубоким впечатлением!!!! И само место очень атмосферное, уютное ❤️',
    source: 'yandex',
  },
  {
    id: 'svetlana-savvina',
    author: 'Светлана Саввина',
    rating: 5,
    dateLabel: '19 июля',
    text: 'очень качественный посадочный материал. .грамотные и вежливые сотрудники, большой выбор.. рекомендую!!',
    source: '2gis',
  },
  {
    id: 'yuriy-faridovich',
    author: 'Юрий Фаридович',
    rating: 5,
    dateLabel: '20 мая 2023',
    text: 'Большой выбор и мелких, и крупных уже в деревьев, в таких баулах с ручками, не знаю как называются, бери вдвоем и понес. Продавцы приветливые, хорошие. Есть и кашпо, вазоны, мелочь всякая. Рядом строительный магазин-площадка. Удобно расположено все.',
    source: 'yandex',
  },
  {
    id: 'elena-s',
    author: 'Elena S.',
    rating: 5,
    dateLabel: '14 мая 2023',
    text: 'Случайности не случайны - это точно. Благодарна всем сердцем тому случаю, который человека неосведомленного вывел на этот питомник. Управляющий Ольга - просто волшебная. Здесь как-то уютно, душевно и заботливо. Как говорят - атмосферно. Профессионально - это по умолчанию. И цены позволяют купить не одно-два дерева, а сразу воплотить достаточно масштабный замысел. Оля и Регина - вы лучшие!',
    source: 'yandex',
  },
  {
    id: 'maria-krainova',
    author: 'Мария Крайнова',
    rating: 5,
    dateLabel: '29 апреля',
    text: 'Чудесное место. Очень впечатлил выбор цветов и деревьев',
    source: '2gis',
  },
  {
    id: 'nastya-y',
    author: 'Nastya Y.',
    rating: 5,
    dateLabel: '26 мая 2023',
    text: 'Прекрасные розы, гортензии. Есть однолетники. Ели. Хороший выбор',
    source: 'yandex',
  },
] as const

export const reviewHighlight = {
  value: '5,0',
} as const
