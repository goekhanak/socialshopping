package de.zalando.purchase.pet.web.rest;

import javax.inject.Inject;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.MediaType;

import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.wordnik.swagger.annotations.Api;

import de.zalando.purchase.pet.security.SecurityUtils;

/**
 * REST controller for managing the current user's account.
 */
@Api(
    value = "LoginController",
    description =
        "Contains Endpoints for authenticating the user and getting details about the authenticated user as well."
)
@RestController
public class LoginController {

    private final Logger log = LoggerFactory.getLogger(LoginController.class);

    @Inject
    private SecurityUtils securityUtils;

    /**
     * GET /rest/authenticate -> check if the user is authenticated, and return its login.
     */
    @RequestMapping(
        value = "/rest/authenticate", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE
    )
    public String isAuthenticated(final HttpServletRequest request) {

        log.info("REST request to check if the current user is authenticated");

        return request.getRemoteUser();
    }

    /**
     * GET /rest/user -> get the current user.
     */
    @RequestMapping(value = "/rest/user", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public UserDetails getAccount() {

        return securityUtils.getCurrentUser();
    }
}
