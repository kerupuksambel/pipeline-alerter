export const removeBrackets = (input: string) => {
  return input.replace(/^[{[(<](.*)[}\])>]$/s, "$1");
};
