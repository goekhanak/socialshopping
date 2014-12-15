package de.zalando.purchase.pet.config;

import java.util.Locale;

import com.google.common.collect.ImmutableList;

import de.zalando.purchase.config.Constants;

/**
 * Application constants.
 */
public class PetConstants extends Constants {

    /*
     * SECURITY
     */
    public static final String SPRING_SECURITY_REMEMBERME_KEY = "pet.security.rememberme.key";

    public static final ImmutableList<String> LOCALES = ImmutableList.of(Locale.GERMAN.getLanguage(),
            Locale.ENGLISH.getLanguage());
}
