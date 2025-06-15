export const removeNonNumericCharacters = (value: string) =>
  value?.replace(/[^0-9.-]/g, '');

export const alphanumericCharacters = (value: string) =>
  value?.replace(/[^a-zA-Z0-9 ]/g, '');
