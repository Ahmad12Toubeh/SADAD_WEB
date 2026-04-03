export const JORDAN_07_PHONE_REGEX = /^07\d{8}$/;

export const JORDAN_07_PHONE_HINT = "رقم الجوال يجب أن يكون أردنيًا ويبدأ بـ 07";

export function isValidJordan07Phone(value: string) {
  return JORDAN_07_PHONE_REGEX.test(value.trim());
}

export function sanitizeJordan07PhoneInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "07";
  }

  if (digits.startsWith("07")) {
    return digits.slice(0, 10);
  }

  if (digits.startsWith("7")) {
    return `0${digits}`.slice(0, 10);
  }

  if (digits.startsWith("0")) {
    return `07${digits.slice(1)}`.slice(0, 10);
  }

  return `07${digits}`.slice(0, 10);
}
