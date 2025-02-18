'use client';
import React from 'react';
import {useTranslations} from 'next-intl';
const AboutPage: React.FC = () => {
  const t = useTranslations('AboutPage');
  return (
    <h1>{t('title')}</h1>
  );
};

export default AboutPage;
