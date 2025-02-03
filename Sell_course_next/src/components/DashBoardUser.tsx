import React from 'react'
import '../style/DashBoardUser.css'
import { BsFillCartCheckFill } from "react-icons/bs";
import { FaSignOutAlt } from 'react-icons/fa'
import { BsMortarboardFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { IoSettingsSharp } from 'react-icons/io5'
import { MdDashboard } from 'react-icons/md'
import { PiListStarFill } from "react-icons/pi";
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link';

export default function DashBoardUser() {
    const t = useTranslations("dashboardUser")
    const localActive = useLocale();
  return (
        <div className="sidebar">
            <ul>
              <Link className='link-text' href={`/${localActive}/profile`}>
                <li className="active">
                  <div className="icon-sidebar">
                      <MdDashboard />
                  </div>
                  <div>{t('dashboard')}</div>
                </li>
              </Link>
              <Link className='link-text' href={`/${localActive}/profile/myProfile`}>
                <li >
                  <div className="icon-sidebar">
                      <FaUser />
                  </div>
                  <div>{t('myProfile')}</div>
                </li>
              </Link>
              <Link className='link-text' href={`/${localActive}/profile/endrolledCourse`}>
                <li>
                  <div className="icon-sidebar">
                      <BsMortarboardFill />
                  </div>
                  <div>{t('enrolledCourse')}</div>
                </li>
              </Link>
              <Link className='link-text' href={`/${localActive}/profile/wíhList`}>
                <li>
                  <div className="icon-sidebar">
                      <PiListStarFill />
                  </div>
                  <div>{t('wishList')}</div>
                </li>
              </Link>
              <Link className='link-text' href={`/${localActive}/profile/orderHistory`}>
                <li>
                  <div className="icon-sidebar">
                      <BsFillCartCheckFill />
                  </div>
                  <div>{t('orderHistory')}</div>
                </li>
              </Link>
              <Link className='link-text' href={`/${localActive}/profile/setting/updateMyProfile`}>
                <li>
                  <div className="icon-sidebar">
                      <IoSettingsSharp />
                  </div>
                  <div>{t('setting')}</div>
                </li>
              </Link>
              <li>
                <div className="icon-sidebar">
                    <FaSignOutAlt />
                </div>
                <div>{t('logout')}</div>
              </li>
            </ul>
          </div>
  )
}