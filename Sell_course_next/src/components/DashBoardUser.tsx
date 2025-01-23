import React from 'react'
import '../style/DashBoardUser.css'
import { BsFillCartCheckFill } from "react-icons/bs";
import { FaSignOutAlt } from 'react-icons/fa'
import { BsMortarboardFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { IoSettingsSharp } from 'react-icons/io5'
import { MdDashboard } from 'react-icons/md'
import { PiListStarFill } from "react-icons/pi";
import { TbMessageReportFilled } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

export default function DashBoardUser() {
    const t = useTranslations("dashboardUser")
  return (
        <div className="sidebar">
            <ul>
              <li className="active">
                <div className="icon-sidebar">
                    <MdDashboard />
                </div>
                <div>{t('dashboard')}</div>
              </li>
              <li>
                <div className="icon-sidebar">
                    <FaUser />
                </div>
                <div>{t('myProfile')}</div>
              </li>
              <li>
                <div className="icon-sidebar">
                    <BsMortarboardFill />
                </div>
                <div>{t('enrolledCourse')}</div>
              </li>
              <li>
                <div className="icon-sidebar">
                    <PiListStarFill />
                </div>
                <div>{t('wishList')}</div>
              </li>
              <li>
                <div className="icon-sidebar">
                    <BsFillCartCheckFill />
                </div>
                <div>{t('orderHistory')}</div>
              </li>
              <li>
                <div className="icon-sidebar">
                    <IoSettingsSharp />
                </div>
                <div>{t('setting')}</div>
              </li>
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
