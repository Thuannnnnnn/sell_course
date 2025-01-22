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
    const t = useTranslations("dashBoard")
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
                <div>{t('user')}</div>
              </li>
              <li>
                <div className="icon-sidebar">
                    <BsMortarboardFill />
                </div>
                <div>{t('quizz')}</div>
              </li>
              <li>
                <div className="icon-sidebar">
                    <PiListStarFill />
                </div>
                <div>{t('course')}</div>
              </li>
              <li>
                <div className="icon-sidebar">
                    <BsFillCartCheckFill />
                </div>
                <div>{t('category')}</div>
              </li>
              <li>
                <div className="icon-sidebar">
                    <IoSettingsSharp />
                </div>
                <div>{t('report')}</div>
              </li>
              <li>
                <div className="icon-sidebar">
                    <FaSignOutAlt />
                </div>
                <div>{t('payment')}</div>
              </li>
            </ul>
          </div>
  )
}
