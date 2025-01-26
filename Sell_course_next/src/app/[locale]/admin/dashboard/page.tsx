import Sidebar from "@/components/SideBar";
import { useTranslations } from "next-intl";

export default function DashBoard() {
  const t = useTranslations("HomePage");
  return (
    <div>
      <Sidebar />
      <div>{t("DashBoard")}</div>
      
    </div>
  );
}
