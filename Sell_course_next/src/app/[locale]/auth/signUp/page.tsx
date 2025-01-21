'use client'
import Banner from "@/components/Banner-SignUp"
import '../../../../style/SignUp.css'
import { useTranslations } from "next-intl";

export default function SignUp() {
    const t = useTranslations('signUpForm');
    const tl = useTranslations('signUpBanner');
    return (
        <div>
            <Banner title={tl('title')}/>
            <form action="">
                <div className="input-form">
                    <label htmlFor="email">Email</label>
                    <input type="email" placeholder={t('placeholderEmail')} />
                </div>
                <div className="content-form">
                    <p>{t('policy')}</p>
                    <button>{t('button')}</button>
                    <button>Google</button>
                </div>
            </form>
        </div>
    );
}