import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import React, { ChangeEvent, useTransition } from 'react';
import '../style/Header.css';
export default function LocalSwitcher() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const currentLocale = useLocale();
    const pathname = usePathname();

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        const newPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
        startTransition(() => {
            router.replace(newPath);
        });
    };
    return (
        <div>
            <select
                className="border rounded py-2 select-changeLang"
                onChange={onSelectChange}
                defaultValue={currentLocale}
                disabled={isPending}
                title='Change Language'
            >
                <option value="en">English</option>
                <option value="vn">Tiếng Việt</option>
            </select>
        </div>
    );
}
