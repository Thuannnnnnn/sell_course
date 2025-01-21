import Sidebar from "@/components/SideBar";
import { useTranslations } from "next-intl";

export default function DashBoard() {
    const t = useTranslations('homePage')
  return (
    <Sidebar/>
  )
}
