'use client';
import { useEffect, useState } from "react";
import Banner from "@/components/Banner-SignUp";
import '../../../../../style/SignUp.css';
import { useTranslations } from "next-intl";
import { register } from "@/app/api/auth/SignUp/route";
import { Modal, Button } from "react-bootstrap";
import { SignUpRequest } from "@/app/interface/SignUpInterface";
import { useRouter } from "next/navigation";
import { useLocale } from 'next-intl';
export default function SignUp() {
    const t = useTranslations('signUpForm');
    const tl = useTranslations('signUpBanner');
    const currentLocale = useLocale();
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [rePassword, setRePassword] = useState<string>("");
    const [gender, setGender] = useState<string>("");
    const [birthDay, setBirthDay] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const [status, setStatus]  = useState<number>(500);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email || !username || !password || !rePassword || !gender || !birthDay || !phoneNumber) {
            alert(t('allFieldsRequired'));
            return;
        }
        if (password !== rePassword) {
            alert(t('passwordMismatch'));
            return;
        }
        if (!token){
            return;
        }
        const payload: SignUpRequest = {
            token,
            email,
            username,
            password,
            gender,
            birthDay,
            phoneNumber
        }
        try {
            const response = await register(payload);
            if (response) {
                setShowModal(true);
                setStatus(response.status);
            }
            console.log('Verification response:', response);
        } catch (error) {
            console.error('Error verifying email:', error);
        }
    };

    useEffect(() => {
        const storedEmail = localStorage.getItem('emailSignUp');
        if (storedEmail) {
            setEmail(storedEmail);
        }
        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = queryParams.get('token');
        setToken(tokenFromUrl);
        console.log("Token from URL:", tokenFromUrl);
    }, []);

    const handleRedirect = () =>{
        router.push(`/${currentLocale}/auth/login`);
    }
    const handleClose = () => setShowModal(false);

    return (
        <div>
            <Banner title={tl('title')} />
            <form onSubmit={handleSubmit}>
                <div className="input-form">
                    <label htmlFor="username">{t('usernameLabel')}</label>
                    <input
                        type="text"
                        id="username"
                        placeholder={t('placeholderUsername')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label htmlFor="password">{t('passwordLabel')}</label>
                    <input
                        type="password"
                        id="password"
                        placeholder={t('placeholderPassword')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <label htmlFor="rePassword">{t('rePasswordLabel')}</label>
                    <input
                        type="password"
                        id="rePassword"
                        placeholder={t('placeholderRePassword')}
                        value={rePassword}
                        onChange={(e) => setRePassword(e.target.value)}
                    />
                    <label htmlFor="gender">{t('genderLabel')}</label>
                    <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    >
                        <option value="">{t('selectGender')}</option>
                        <option value="male">{t('male')}</option>
                        <option value="female">{t('female')}</option>
                        <option value="other">{t('other')}</option>
                    </select>
                    <label htmlFor="birthDay">{t('birthDayLabel')}</label>
                    <input
                        type="date"
                        id="birthDay"
                        placeholder={t('placeholderBirthDay')}
                        value={birthDay}
                        onChange={(e) => setBirthDay(e.target.value)}
                    />
                    <label htmlFor="phoneNumber">{t('phoneNumberLabel')}</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        placeholder={t('placeholderPhoneNumber')}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>
                <div className="content-form">
                    <p>{t('policy')}</p>
                    <button type="submit">{t('button')}</button>
                    <button type="button">{t('googleBtn')}</button>
                </div>
            </form>
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    {status === 201 ? (
                        <p>{t('modalMessageSuccess')}</p>
                    ) : (
                        <p>{t('modalMessageFail')}</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleRedirect}>
                        {t('closeModalBtn')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
