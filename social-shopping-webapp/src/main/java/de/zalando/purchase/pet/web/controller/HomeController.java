package de.zalando.purchase.pet.web.controller;

import static de.zalando.purchase.pet.config.PetConstants.SPRING_PROFILE_INTEGRATION;
import static de.zalando.purchase.pet.config.PetConstants.SPRING_PROFILE_LIVE;
import static de.zalando.purchase.pet.config.PetConstants.SPRING_PROFILE_PATCH;
import static de.zalando.purchase.pet.config.PetConstants.SPRING_PROFILE_RELEASE;

import javax.inject.Inject;

import org.springframework.core.env.Environment;

import org.springframework.stereotype.Controller;

import org.springframework.ui.Model;

import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Author: clohmann Date: 17.07.14 Time: 12:22
 */
@Controller
public class HomeController {

    @Inject
    private Environment environment;

    @RequestMapping({ "/", "/index" })
    public String home(final Model model) {

        String envStyle = "dev";
        for (final String profile : environment.getActiveProfiles()) {
            if (SPRING_PROFILE_INTEGRATION.equals(profile)) {
                envStyle = SPRING_PROFILE_INTEGRATION;
                break;
            } else if (SPRING_PROFILE_RELEASE.equals(profile)) {
                envStyle = SPRING_PROFILE_RELEASE;
                break;
            } else if (SPRING_PROFILE_PATCH.equals(profile)) {
                envStyle = SPRING_PROFILE_PATCH;
                break;
            } else if (SPRING_PROFILE_LIVE.equals(profile)) {
                envStyle = SPRING_PROFILE_LIVE;
                break;
            }
        }

        model.addAttribute("environment", envStyle);
        return "index";
    }

}
