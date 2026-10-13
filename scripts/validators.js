export const validators = {
  description: (val) => {
    if (!/^(?=.*[A-Za-z])\S(?:.*\S)?$/.test(val)) return "Must contain a letter, no leading/trailing spaces.";
    if (/\s{2,}/.test(val)) return "No double spaces allowed.";
    if (/\b([A-Za-z]{2,})\s+\1\b/i.test(val)) return "Duplicate word detected.";
    return null;
  },
  amount: (val) => {
    if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(val)) return "Must be a positive number with up to 2 decimals.";
    return null;
  },
  date: (val) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(val)) return "Invalid date format.";
    return null;
  },
  category: (val) => {
    if (!/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(val)) return "Letters, spaces, hyphens only.";
    return null;
  },
  currency: (val) => {
    if (!/^[A-Z]{3}$/.test(val)) return "Must be 3 uppercase letters.";
    return null;
  }
};