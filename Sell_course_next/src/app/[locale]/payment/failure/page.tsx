import { useLocale, useTranslations } from 'next-intl';
import { FaTimesCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';
import { Button } from 'react-bootstrap';

export default function Failure() {
  const t = useTranslations('checkout');
  const locate = useLocale();
  return (
    <div className="container text-center mt-5">
      <FaTimesCircle className="text-danger" size={200} />
      <h2 className="mt-3">{t('failureTitle')}</h2>
      <p>{t('failureMessage')}</p>
      <Link href={`/${locate}/`} passHref>
        <Button variant="danger" className="btn mt-3">{t('home_button')}</Button>
      </Link>
    </div>
  );
}
