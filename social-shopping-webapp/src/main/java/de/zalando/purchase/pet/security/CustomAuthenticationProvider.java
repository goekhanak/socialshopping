package de.zalando.purchase.pet.security;

import static com.google.common.collect.Lists.newArrayList;

import java.util.Collection;

import javax.inject.Inject;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.google.common.base.Strings;

import de.zalando.domain.exception.ServiceException;

import de.zalando.user.webservice.domain.AuthenticationResult;
import de.zalando.user.webservice.domain.Privilege;
import de.zalando.user.webservice.domain.UserDetailResult;
import de.zalando.user.webservice.service.AuthenticationWebService;

/**
 * Author: clohmann Date: 18.02.14 Time: 14:02
 */
public class CustomAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {

    private static final String UNDEFINED = "undefined";

    @Inject
    private AuthenticationWebService authenticationWebService;

    @Override
    protected void additionalAuthenticationChecks(final UserDetails userDetails,
            final UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
        // nothing to do atm
    }

    @Override
    protected UserDetails retrieveUser(final String username, final UsernamePasswordAuthenticationToken authentication)
        throws AuthenticationException {
        if (Strings.isNullOrEmpty(username)) {
            throw new UsernameNotFoundException("Username is null!");
        } else if (UNDEFINED.equals(username)) {
            throw new UsernameNotFoundException("Username is undefined!");
        }

        try {
            final String password = (String) authentication.getCredentials();

            checkIfUserExist(username);

            final AuthenticationResult result = authenticationWebService.authenticate(username, password);

            if (result == null) {
                throw new BadCredentialsException("Bad credentials");
            }

            final Collection<GrantedAuthority> grantedAuthorities = newArrayList();
            for (final Privilege privilege : result.getPrivileges()) {
                final GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(privilege.getName());
                grantedAuthorities.add(grantedAuthority);
            }

            return new User(result.getEmail(), "", grantedAuthorities);
        } catch (final ServiceException e) {
            throw new BadCredentialsException("Error while authenticating with service.");
        }
    }

    @Override
    public boolean supports(final Class<?> authentication) {
        return (UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication));
    }

    private void checkIfUserExist(final String username) throws ServiceException {
        UserDetailResult userDetailResult = authenticationWebService.getUserDetailByUserName(username);

        if (userDetailResult == null) {
            userDetailResult = authenticationWebService.getUserDetailByUserEmail(username);
        }

        // TODO add this exception to REST exception handler
        if (userDetailResult == null) {
            throw new UsernameNotFoundException("User with username " + username + "not found!");
        }
    }

}
