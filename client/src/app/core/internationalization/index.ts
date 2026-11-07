import { DefaultDictionary, TranslationDictionary } from './default';
import { SpanishDictionary } from './es';



export const Translations: Record<string, TranslationDictionary> = {
  'English': DefaultDictionary,
  'Spanish': SpanishDictionary,
};



export type { TranslationDictionary };
