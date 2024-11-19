"use client";
import React from 'react';
import { useTranslations } from 'next-intl';

const Footer: React.FC = () => {
  const t = useTranslations('footer');

  return (
    <footer className="bg-dark text-light pt-4 pb-2">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-3">
            <h5>{t('headingF8')}</h5>
            <p>{t('description')}</p>
            <p>{t('phone')}</p>
            <p>{t('email')}</p>
            <p>{t('address')}</p>
          </div>

          <div className="col-md-2 mb-3">
            <h5>{t('about')}</h5>
            <ul className="list-unstyled">
              <li>{t('aboutList.0')}</li>
              <li>{t('aboutList.1')}</li>
              <li>{t('aboutList.2')}</li>
              <li>{t('aboutList.3')}</li>
            </ul>
          </div>
          <div className="col-md-3 mb-3">
            <h5>{t('products')}</h5>
            <ul className="list-unstyled">
              <li>{t('productList.0')}</li>
              <li>{t('productList.1')}</li>
              <li>{t('productList.2')}</li>
              <li>{t('productList.3')}</li>
              <li>{t('productList.4')}</li>
              <li>{t('productList.5')}</li>
            </ul>
          </div>
          <div className="col-md-2 mb-3">
            <h5>{t('tools')}</h5>
            <ul className="list-unstyled">
              <li>{t('toolsList.0')}</li>
              <li>{t('toolsList.1')}</li>
              <li>{t('toolsList.2')}</li>
              <li>{t('toolsList.3')}</li>
              <li>{t('toolsList.4')}</li>
              <li>{t('toolsList.5')}</li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h5>{t('companyName')}</h5>
            <p>{t('taxCode')}</p>
            <p>{t('foundingDate')}</p>
            <p>{t('activityField')}</p>
          </div>
        </div>

        <div className="text-center mt-3">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
