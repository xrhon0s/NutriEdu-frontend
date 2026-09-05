export const passwordChecks = (password) => ({
  minLength: password.length >= 10,
  maxLength: new TextEncoder().encode(password).length <= 72,
  lowercase: /[a-z]/.test(password),
  uppercase: /[A-Z]/.test(password),
  number: /\d/.test(password),
  symbol: /[^A-Za-z0-9\s]/.test(password),
});

export const isPasswordValid = (password) =>
  password.length > 0 && Object.values(passwordChecks(password)).every(Boolean);
