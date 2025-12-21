import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function usePageTitle(titleKey: string) {
  const { t } = useTranslation()

  useEffect(() => {
    const title = t(titleKey)
    document.title = `POMASA - ${title}`
  }, [t, titleKey])
}
