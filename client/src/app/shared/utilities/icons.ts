import { IconsBasePath, IconFileExtension, IconFilledSuffix } from '@ervum/constants';
import { type IconNameType, type IconVariantsDescriptor, type NGStylesType, type Undefinable, type Nullable } from '@ervum/types';



/**
 * Resolves a canonical icon name or path into its stroked and filled CSS `url(...)` mask descriptors.
 */
export function ResolveIconVariants(IconName: (IconNameType | string)): (IconVariantsDescriptor) {
  const Trimmed: string = (IconName.trim());

  if ((Trimmed.length) === 0) {
    return {
      Stroked: '',
      Filled:  '',
    };
  }

  const BaseName: string = (
    Trimmed
      .replace(IconsBasePath, '')
      .replace(IconFileExtension, '')
      .replace(new RegExp(`${IconFilledSuffix}$`), '')
      .toLowerCase()
  );

  if ((BaseName.includes('/'))) {
    return {
      Stroked: `url(${BaseName}${IconFileExtension})`,
      Filled:  `url(${BaseName}${IconFilledSuffix}${IconFileExtension})`,
    };
  }

  return {
    Stroked: `url(${IconsBasePath}${BaseName}${IconFileExtension})`,
    Filled:  `url(${IconsBasePath}${BaseName}${IconFilledSuffix}${IconFileExtension})`,
  };
}

/**
 * Builds the `--icon-stroked` and `--icon-filled` CSS custom property map for a given icon name.
 */
export function GetIconVariantStyles(IconName: (Undefinable<string> | Nullable<string>)): (NGStylesType) {
  if (!IconName) {
    return { };
  }

  const Variants: IconVariantsDescriptor = ResolveIconVariants(IconName);

  if (!(Variants.Stroked)) {
    return { };
  }

  return {
    '--icon-stroked': (Variants.Stroked),
    '--icon-filled':  (Variants.Filled),
  };
}
