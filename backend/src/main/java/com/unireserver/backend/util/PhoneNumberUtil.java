package com.unireserver.backend.util;

public final class PhoneNumberUtil {

    private PhoneNumberUtil() {
    }

    public static String normalizeSriLankanPhone(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        String digits = value.replaceAll("\\D", "");

        if (digits.startsWith("94") && digits.length() == 11) {
            digits = "0" + digits.substring(2);
        }

        if (!digits.matches("^07\\d{8}$")) {
            throw new IllegalArgumentException("Phone number must be a valid Sri Lankan mobile number");
        }

        return digits;
    }

    public static String formatSriLankanPhone(String normalizedPhone) {
        String digits = normalizeSriLankanPhone(normalizedPhone);
        return digits.substring(0, 3) + " " + digits.substring(3, 6) + " " + digits.substring(6);
    }
}
