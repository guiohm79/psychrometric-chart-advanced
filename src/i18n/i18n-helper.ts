/**
 * Internationalization Helper
 * Provides translation function and language detection
 */

import { translations, SupportedLanguage, TranslationStrings } from './translations';

/**
 * Translation helper class
 */
export class I18nHelper {
    private language: SupportedLanguage;

    constructor(language?: SupportedLanguage) {
        this.language = language || 'fr';
    }

    /**
     * Set the current language
     * @param language - Language code (fr, en, es, de)
     */
    setLanguage(language: SupportedLanguage): void {
        this.language = language;
    }

    /**
     * Get the current language
     * @returns Current language code
     */
    getLanguage(): SupportedLanguage {
        return this.language;
    }

    /**
     * Translate a key to the current language
     * Falls back to French if key not found in current language
     * @param key - Translation key
     * @returns Translated string
     */
    t(key: keyof TranslationStrings): string {
        return translations[this.language][key] || translations['fr'][key] || key;
    }

    /**
     * Get all translations for the current language
     * @returns Translation strings object
     */
    getAllTranslations(): TranslationStrings {
        return translations[this.language];
    }
}

/**
 * Create a new translation helper instance
 * @param language - Language code (fr, en, es, de)
 * @returns I18nHelper instance
 */
export function createI18nHelper(language?: SupportedLanguage): I18nHelper {
    return new I18nHelper(language);
}
