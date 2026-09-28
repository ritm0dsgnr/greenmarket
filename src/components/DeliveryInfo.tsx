import { Icon, type SpriteIconName } from '@/components/Icon'
import { bindHangingWords } from '@/components/bindHangingWords'
import {
  siteBrand,
  siteMapsHref,
  sitePhoneDisplay,
  sitePhoneHref,
  siteStreet,
} from '@/components/siteContacts'

const pickupAddress = `г. Березовский, ${siteStreet}`
const t = bindHangingWords

function Mark({ name }: { name: SpriteIconName }) {
  return (
    <span className="info-mark">
      <Icon name={name} />
    </span>
  )
}

export function DeliveryInfo() {
  return (
    <section className="delivery-info" aria-labelledby="delivery-info-title">
      <header className="delivery-info__hero">
        <p className="delivery-info__eyebrow">{siteBrand}</p>
        <h1 className="delivery-info__title" id="delivery-info-title">
          {t('Доставка и оплата')}
        </h1>
        <ul className="delivery-info__facts">
          <li className="delivery-info__fact">
            <Mark name="card" />
            <p>{t('Доставка не входит в стоимость растений и оплачивается дополнительно.')}</p>
          </li>
          <li className="delivery-info__fact">
            <Mark name="camera" />
            <p>
              {t(
                'Перед отправкой мы сделаем фото/видео вашего заказа и согласуем с вами все детали.',
              )}
            </p>
          </li>
        </ul>
      </header>

      <section className="delivery-info__section" aria-labelledby="delivery-zones-title">
        <h2 className="delivery-info__section-title" id="delivery-zones-title">
          Доставка
        </h2>
        <div className="delivery-info__note">
          <Mark name="warning" />
          <p>
            <strong>ВАЖНО:</strong>{' '}
            {t(
              'Разгрузка осуществляется силами заказчика. Если есть необходимость в услугах грузчика - это нужно указать при оформлении заказа.',
            )}
          </p>
        </div>
        <ul className="delivery-info__zones">
          <li className="delivery-info__zone">
            <div className="delivery-info__zone-head">
              <Mark name="car" />
              <h3 className="delivery-info__zone-title">{t('По Березовскому')}</h3>
            </div>
            <div className="delivery-info__zone-body">
              <div className="delivery-info__copy">
                <p>
                  {t(
                    `Доставка по Березовскому осуществляется по условиям Яндекс такси, либо нашим грузчиком. Стоимость вы можете рассчитать в приложении Яндекс такси, указав адрес Садового центра: ${pickupAddress}.`,
                  )}
                </p>
              </div>
              <p className="delivery-info__accent">{t('Заказ можно оформить на любую сумму.')}</p>
            </div>
          </li>
          <li className="delivery-info__zone">
            <div className="delivery-info__zone-head">
              <Mark name="car" />
              <h3 className="delivery-info__zone-title">{t('По Екатеринбургу и пригороду')}</h3>
            </div>
            <div className="delivery-info__zone-body">
              <div className="delivery-info__copy">
                <p>
                  {t('Доставка по Екатеринбургу и пригороду осуществляется по условиям Яндекс такси.')}
                </p>
                <p>
                  {t(
                    `Стоимость доставки вы можете рассчитать самостоятельно в приложении Яндекс такси, указав адрес Садового центра: ${pickupAddress}. Оплату производите напрямую при заказе в приложении.`,
                  )}
                </p>
              </div>
              <p className="delivery-info__accent">{t('Заказ можно оформить на любую сумму.')}</p>
            </div>
          </li>
          <li className="delivery-info__zone">
            <div className="delivery-info__zone-head">
              <Mark name="truck" />
              <h3 className="delivery-info__zone-title">{t('На дальние расстояния')}</h3>
            </div>
            <div className="delivery-info__zone-body">
              <div className="delivery-info__copy">
                <p>
                  {t(
                    'Доставка на более дальние расстояния осуществляется транспортными компаниями до склада в вашем городе, либо адресно. Стоимость рассчитывается индивидуально, зависит от объёма и расстояния перевозки и оплачивается напрямую транспортной компании.',
                  )}
                </p>
              </div>
              <p className="delivery-info__accent delivery-info__accent--strong">
                {t('Минимальная сумма заказа 7000 руб.')}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section className="delivery-info__section" aria-labelledby="delivery-pickup-title">
        <h2 className="delivery-info__section-title" id="delivery-pickup-title">
          Самовывоз
        </h2>
        <div className="delivery-info__panel">
          <div className="delivery-info__copy">
            <p>
              {t(
                'Вы всегда можете забрать свой заказ самостоятельно из Садового центра. Перед поездкой уточните собран ли ваш заказ.',
              )}
            </p>
          </div>
          <a className="delivery-info__address" href={siteMapsHref} target="_blank" rel="noreferrer">
            <Mark name="pin" />
            <p>{t(`Адрес Садового центра: ${pickupAddress}.`)}</p>
          </a>
        </div>
      </section>

      <section className="delivery-info__section" aria-labelledby="delivery-pay-title">
        <h2 className="delivery-info__section-title" id="delivery-pay-title">
          Оплата
        </h2>
        <ul className="delivery-info__pays">
          <li className="delivery-info__pay">
            <Mark name="card" />
            <p>
              {t('Наличными или банковской картой при получении заказа в Садовом центре.')}
            </p>
          </li>
          <li className="delivery-info__pay">
            <Mark name="transfer" />
            <p>{t('Переводом при оформлении доставки (для физических лиц).')}</p>
          </li>
          <li className="delivery-info__pay">
            <Mark name="invoice" />
            <p>{t('По счёту при оформлении доставки (пока только для юридических лиц).')}</p>
          </li>
        </ul>
      </section>

      <section className="delivery-info__section" aria-labelledby="delivery-return-title">
        <h2 className="delivery-info__section-title" id="delivery-return-title">
          Возврат
        </h2>
        <div className="delivery-info__panel delivery-info__panel--return">
          <div className="delivery-info__copy">
            <p>
              {t(
                'На основании п.13 Постановления Правительства РФ от 31.12.2020 N 2463 растения обмену и возврату не подлежат.',
              )}
            </p>
            <p>
              {t(
                'Обмен и возврат товаров для сада с сохранённой упаковкой, возможен в течение 14 дней с момента оформления заказа.',
              )}
            </p>
          </div>
          <p className="delivery-info__contact">
            {t('По всем вопросам вы можете связаться с менеджером по телефону:')}{' '}
            <a className="delivery-info__phone" href={sitePhoneHref}>{`${sitePhoneDisplay}.`}</a>
          </p>
        </div>
      </section>
    </section>
  )
}
