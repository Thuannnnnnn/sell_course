import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useTransition } from 'react'
import '../style/Header.css';
export default function LocalSwitcher() {
     const [isPending, startTrtansition] = useTransition(); 
    const router = useRouter()
    const localActive = useLocale();
    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) =>{
        const nextLocate = e.target.value;
        startTrtansition(() =>{
            router.replace(`/${nextLocate}`)
        })
    }
  return (
    <div>
            <select
            className="border rounded py-2 select-changeLang" onChange={onSelectChange}
            defaultValue={localActive}
            disabled={isPending}
            title='Change Language'
            >
                <option value="en">English</option>
                <option value="vn">Tiếng Việt</option>
            </select>
    </div>
  )
}
