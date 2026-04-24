package com.unireserver.backend.neranjana.util;

public class SearchUtils {
    public static String sanitizeKeyword(String keyword) {
        if (keyword == null) return "";
        return keyword.trim().replaceAll("[^a-zA-Z0-9 ]", "");
    }
}
