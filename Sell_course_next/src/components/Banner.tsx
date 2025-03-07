'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import Image from 'next/image';
import banner_img from '../../public/banner_img.jpg';
import '../style/Banner.css';

const Banner = () => {
  const t = useTranslations('banner');

  return (
    <section >
      <div className='bannerSection' >
        <div>
          <h1 className='bannerTitle'> {t('bannerTitle')} </h1>
          <p className='bannerDecription'> {t('bannerDecription')} </p>
          <button> {t('bannerButtom')} </button>
        </div>
        <div>
          <Image className='imageBanner'
            src={banner_img}
            alt="Learning Banner"
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;
