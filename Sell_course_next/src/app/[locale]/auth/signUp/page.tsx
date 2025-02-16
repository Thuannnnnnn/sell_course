'use client';
import { useState } from "react";
import Banner from "@/components/Banner-SignUp";
import '../../../../style/SignUp.css';
import { useTranslations } from "next-intl";
import { verifyEmail } from "@/app/api/auth/SignUp/signUp";
import { Modal, Button } from "react-bootstrap";
import { useLocale } from 'next-intl';
export default function SignUp() {
    const t = useTranslations('signUpForm');
    const tl = useTranslations('signUpBanner');
    const [email, setEmail] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const currentLocale = useLocale();
    console.log(currentLocale);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email) {
            alert(t('emailRequired'));
            return;
        }
        try {
            const response = await verifyEmail(email, currentLocale);
            if (response.status === 200) {
                setShowModal(true);
                localStorage.setItem("emailSignUp", email,);
            }
            console.log('Verification response:', response);
        } catch (error) {
            console.error('Error verifying email:', error);
        }
    };

    const handleClose = () => setShowModal(false);
    return (
        <div>
            <Banner title={tl('title')} />
            <form onSubmit={handleSubmit}>
                <div className="input-form">
                    <label htmlFor="email">{t('emailLabel')}</label>
                    <input
                        type="email"
                        id="email"
                        placeholder={t('placeholderEmail')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="content-form">
                    <p>{t('policy')}</p>
                    <button type="submit">{t('button')}</button>
                    <button type="button">{t('googleBtn')}</button>
                </div>
            </form>
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <p>{t('modalMessage')}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        {t('closeModalBtn')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
