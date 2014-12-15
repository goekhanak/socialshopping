package de.zalando.purchase.pet.security;

import java.util.Collection;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.google.common.collect.Lists;

import de.zalando.domain.exception.ServiceException;

import de.zalando.user.webservice.domain.Privilege;
import de.zalando.user.webservice.domain.UserDetailResult;
import de.zalando.user.webservice.service.AuthenticationWebService;

/**
 * Authenticate a user.
 */
public class PetUserDetailsService implements UserDetailsService {

    private final Logger log = LoggerFactory.getLogger(PetUserDetailsService.class);

    @Inject
    private AuthenticationWebService authenticationWebService;

    @Override
    public UserDetails loadUserByUsername(final String login) {

        log.info("Authenticating {}", login);
        try {
            final UserDetailResult result = authenticationWebService.getUserDetailByUserEmail(login);
            if (result == null) {
                throw new UsernameNotFoundException("User " + login + " was not found in the database");
            }

            final Collection<GrantedAuthority> grantedAuthorities = Lists.newArrayList();
            for (final Privilege privilege : result.getPrivileges()) {
                final GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(privilege.getName());
                grantedAuthorities.add(grantedAuthority);
            }

            return new org.springframework.security.core.userdetails.User(login, "", grantedAuthorities);
        } catch (final ServiceException e) {
            log.error("Error while getting user details from authentication service for user {}", login);
        }

        return null;
    }
}
