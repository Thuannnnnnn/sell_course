import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';

export default function Success() {
  const t = useTranslations('checkout');
  const locate = useLocale();
  return (
    <div className="container text-center mt-5">
      <FaCheckCircle className="text-success" size={200} />
      <h2 className="mt-3">{t('successTitle')}</h2>
      <p>{t('successMessage')}</p>
      <Link href={`/${locate}/`} passHref>
        <Button variant="success" className="btn my-3">{t('home_button')}</Button>
      </Link>
    </div>
  );
}
