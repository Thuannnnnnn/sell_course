import React from 'react';
import '../style/DashBoardUser.css';
import { BsFillCartCheckFill } from 'react-icons/bs';
import { BsMortarboardFill } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import { MdDashboard } from 'react-icons/md';
import { PiListStarFill } from 'react-icons/pi';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashBoardUser() {
  const t = useTranslations('dashboardUser');
  const localActive = useLocale();
  const pathname = usePathname();
  const isActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };
  return (
    <div className="sidebar">
      <ul>
          <Link className='link-text' href={`/${localActive}/profile`}>
              <li className={isActive(`/${localActive}/profile`)}>
                <div className="icon-sidebar">
                  <MdDashboard />
                </div>
                <div>{t('dashboard')}</div>
              </li>
          </Link>
          <Link className='link-text' href={`/${localActive}/profile/myProfile`}>
            <li className={isActive(`/${localActive}/profile/myProfile`)}>
                <div className="icon-sidebar">
                  <FaUser />
                </div>
                <div>{t('myProfile')}</div>
              </li>
          </Link>
          <Link className='link-text' href={`/${localActive}/profile/enrolledCourse/enrolledPage`}>
              <li className={isActive(`/${localActive}/profile/enrolledCourse/enrolledPage`)}>
                <div className="icon-sidebar">
                  <BsMortarboardFill />
                </div>
                <div>{t('enrolledCourse')}</div>
              </li>
          </Link>
          <Link className='link-text' href={`/${localActive}/profile/wishList`}>
              <li className={isActive(`/${localActive}/profile/wishList`)}>
                <div className="icon-sidebar">
                  <PiListStarFill />
                </div>
                <div>{t('wishList')}</div>
              </li>
          </Link>
          <Link className='link-text' href={`/${localActive}/profile/orderHistory`}>
              <li className={isActive(`/${localActive}/profile/orderHistory`)}>
                <div className="icon-sidebar">
                  <BsFillCartCheckFill />
                </div>
                <div>{t('orderHistory')}</div>
              </li>
          </Link>
          <Link className='link-text' href={`/${localActive}/profile/setting/updateMyProfile`}>
              <li className={isActive(`/${localActive}/profile/setting/updateMyProfile`) || isActive (`/${localActive}/profile/setting/changePassword`)}>
                <div className="icon-sidebar">
                  <IoSettingsSharp />
                </div>
                <div>{t('setting')}</div>
              </li>
          </Link>
        {/* <li>
          <div className="icon-sidebar">
            <FaSignOutAlt />
          </div>
          <div>{t('logout')}</div>
        </li> */}
      </ul>
    </div>
  );
}