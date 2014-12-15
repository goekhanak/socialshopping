package de.zalando.purchase.pet.security;

import static com.google.common.base.Preconditions.checkArgument;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.stereotype.Service;

import com.google.common.base.Preconditions;
import com.google.common.base.Strings;

/**
 * Utility class for Spring Security.
 */
@Service
public class SecurityUtils {

    /**
     * Get the login of the current user.
     */
    public String getCurrentLogin() {
        return getCurrentUser().getUsername();
    }

    /**
     * Checks if the current user has the privilege.
     *
     * @param   privilegeName
     *
     * @return  true is the current user has the privilege otherwise false
     */
    public boolean currentUserHasPrivilege(final String privilegeName) {
        checkArgument(!Strings.isNullOrEmpty(privilegeName));

        final UserDetails userDetails = getCurrentUser();
        Preconditions.checkNotNull(userDetails);

        for (final GrantedAuthority authority : userDetails.getAuthorities()) {
            if (privilegeName.equals(authority.getAuthority())) {
                return true;
            }
        }

        return false;
    }

    public UserDetails getCurrentUser() {
        final SecurityContext securityContext = SecurityContextHolder.getContext();
        if (securityContext.getAuthentication().getPrincipal() instanceof UserDetails) {
            return (UserDetails) securityContext.getAuthentication().getPrincipal();
        }

        return null;
    }

    /**
     * Check if a user is authenticated.
     *
     * @return  true if the user is authenticated, false otherwise
     */
    public boolean isAuthenticated() {
        final SecurityContext securityContext = SecurityContextHolder.getContext();

        final Collection<? extends GrantedAuthority> authorities = securityContext.getAuthentication().getAuthorities();

        if (authorities != null) {
            for (final GrantedAuthority authority : authorities) {
                if (authority.getAuthority().equals(AuthoritiesConstants.ANONYMOUS)) {
                    return false;
                }
            }
        }

        return true;
    }
}
