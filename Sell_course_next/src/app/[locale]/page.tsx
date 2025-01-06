'use client';
import { useTranslations } from 'next-intl';
import logoJava from '../image/logoJava_img.jpg';
import logoJs from '../image/logoJS_img.jpg';
import logoCPlusPlus from '../image/logoC++_img.png';
import logoCSharp from '../image/logoC_img.jpg';
import logoNodeJs from '../image/logoNodeJs_img.png';
import logoSQL from '../image/logoSQL_img.jpg';
import { HiOutlineCheck } from "react-icons/hi";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
<<<<<<< HEAD
import Banner from '@/components/Banner';
=======
>>>>>>> 57f322b1f5a600d577e0a1a396d394660dd1850e
export default function HomePage() {
  const t = useTranslations('homePage')
  const tc = useTranslations('cardCourse')
  return (
<<<<<<< HEAD
    <>
    <Banner/>
=======
>>>>>>> 57f322b1f5a600d577e0a1a396d394660dd1850e
    <div className="main-container">
      <div className="header-section">
        <Swiper
          spaceBetween={10}
          slidesPerView={4}
          loop={true}
          breakpoints={{
            600: {
              slidesPerView: 1,
            },
            740: {
              slidesPerView: 2,
            },
            840: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4
            }
          }}
        >
          <SwiperSlide className='course-name'>
            <Image className='course-img' src={logoJs} alt="JavaScript" width={45} height={45} />
            JavaScript
          </SwiperSlide>
          <SwiperSlide className='course-name'>
            <Image src={logoSQL} alt="SQL" width={50} height={50} />
            SQL
          </SwiperSlide>
          <SwiperSlide className='course-name'>
            <Image className='course-img' src={logoCSharp} alt="C Sharp" width={50} height={50} />
            C#
          </SwiperSlide>
          <SwiperSlide className='course-name'>
            <Image className='course-img' src={logoJava} alt="Java" width={50} height={50} />
            Java
          </SwiperSlide>
          <SwiperSlide className='course-name'>
            <Image className='course-img' src={logoCPlusPlus} alt="C++" width={50} height={50} />
            C++
          </SwiperSlide>
          <SwiperSlide className='course-name'>
            <Image className='course-img' src={logoNodeJs} alt="NodeJs" width={50} height={50} />
            NodeJS
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="content-container">
        <h1 className="course-title">{t('homePageTitle')}</h1>
        <p className="course-description">
          {t('homePageContent')}
        </p>
        <div className="course-carousel">
        <Swiper
          spaceBetween={50}
          slidesPerView={4}
          loop={true}
          pagination={{ clickable: true }}
          breakpoints={{
            600: {
              slidesPerView: 1,
            },
            740: {
              slidesPerView: 2,
            },
            840: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4
            }
          }}
        >
          <SwiperSlide>
            <div className="course-card">
              <Image src={logoJs} alt="JavaScript" />
              <h2>JavaScript</h2>
              <ul>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('0')}</li>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('1')}</li>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('2')}</li>
              </ul>
              <p className="course-price"> {tc('3')} <strong>$100.00</strong></p>
              <button className="get-started-btn">{tc('4')}</button>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="course-card">
              <Image src={logoJs} alt="JavaScript" />
              <h2>JavaScript</h2>
              <ul>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('0')}</li>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('1')}</li>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('2')}</li>
              </ul>
              <p className="course-price"> {tc('3')} <strong>$100.00</strong></p>
              <button className="get-started-btn">{tc('4')}</button>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="course-card">
              <Image src={logoJs} alt="JavaScript" />
              <h2>JavaScript</h2>
              <ul>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('0')}</li>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('1')}</li>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('2')}</li>
              </ul>
              <p className="course-price"> {tc('3')} <strong>$100.00</strong></p>
              <button className="get-started-btn">{tc('4')}</button>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="course-card">
              <Image src={logoJs} alt="JavaScript" />
              <h2>JavaScript</h2>
              <ul>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('0')}</li>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('1')}</li>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('2')}</li>
              </ul>
              <p className="course-price"> {tc('3')} <strong>$100.00</strong></p>
              <button className="get-started-btn">{tc('4')}</button>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="course-card">
              <Image src={logoJs} alt="JavaScript" />
              <h2>JavaScript</h2>
              <ul>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('0')}</li>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('1')}</li>
                <li>
                  <div className='icon'>
                    <HiOutlineCheck className='icon-check'/>
                  </div>
                  {tc('2')}</li>
              </ul>
              <p className="course-price"> {tc('3')} <strong>$100.00</strong></p>
              <button className="get-started-btn">{tc('4')}</button>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      </div>
    </div>
    </>
  );
}
