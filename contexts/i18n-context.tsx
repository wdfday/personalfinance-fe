"use client"

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react"
import { defaultLocale, locales, translations, type Locale } from "@/lib/i18n/translations"
import { useSettings } from "@/contexts/settings-context"

type TranslationOptions = {
  values?: Record<string, string | number>
  defaultValue?: string
}

interface I18nContextValue {
  locale: Locale
  availableLocales: Locale[]
  t: (key: string, options?: TranslationOptions) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function getMessage(dictionary: Record<string, any>, key: string) {
  return key.split(".").reduce<any>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return acc[part]
    }
    return undefined
  }, dictionary)
}

function interpolate(message: string, values?: Record<string, string | number>) {
  if (!values) return message
  return message.replace(/\{(\w+)\}/g, (_, token) => {
    const value = values[token]
    return value !== undefined ? String(value) : `{${token}}`
  })
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useSettings()
  const locale = locales.includes(settings.language as Locale)
    ? (settings.language as Locale)
    : defaultLocale
  const dictionary = translations[locale]

  const translate = useCallback(
    (key: string, options?: TranslationOptions) => {
      const message = getMessage(dictionary, key)
      if (typeof message === "string") {
        return interpolate(message, options?.values)
      }
      if (options?.defaultValue) {
        return interpolate(options.defaultValue, options.values)
      }
      return key
    },
    [dictionary],
  )

  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale || !locales.includes(newLocale)) {
        return
      }
      updateSettings({ language: newLocale })
    },
    [locale, updateSettings],
  )

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      availableLocales: locales,
      t: translate,
      setLocale,
    }),
    [locale, translate, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation(namespace?: string) {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider")
  }

  const scopedTranslate = useCallback(
    (key: string, options?: TranslationOptions) => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      return context.t(fullKey, options)
    },
    [context, namespace],
  )

  return {
    locale: context.locale,
    availableLocales: context.availableLocales,
    setLocale: context.setLocale,
    t: scopedTranslate,
  }
}

