package de.zalando.purchase.pet.config;

import javax.inject.Inject;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import org.springframework.core.env.Environment;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.StandardPasswordEncoder;

import de.zalando.purchase.pet.security.AjaxAuthenticationFailureHandler;
import de.zalando.purchase.pet.security.AjaxAuthenticationSuccessHandler;
import de.zalando.purchase.pet.security.AjaxLogoutSuccessHandler;
import de.zalando.purchase.pet.security.AuthoritiesConstants;
import de.zalando.purchase.pet.security.CustomAuthenticationProvider;
import de.zalando.purchase.pet.security.Http401UnauthorizedEntryPoint;
import de.zalando.purchase.pet.security.PetUserDetailsService;
import de.zalando.purchase.pet.security.ZEOSPrivileges;

@Configuration
@EnableWebSecurity
@ComponentScan(
    {
        "de.zalando.user.webservice.service", "de.zalando.catalog.webservice", "de.zalando.translation",
        "de.zalando.purchase.backend.webservice"
    }
)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Inject
    private AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler;

    @Inject
    private AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler;

    @Inject
    private AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler;

    @Inject
    private Http401UnauthorizedEntryPoint authenticationEntryPoint;

    @Inject
    private Environment env;

    @Bean
    public PetUserDetailsService userDetailsService() {
        return new PetUserDetailsService();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {

        return new CustomAuthenticationProvider();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new StandardPasswordEncoder();
    }

    @Inject
    public void configureGlobal(final AuthenticationManagerBuilder auth) throws Exception {

        auth.authenticationProvider(authenticationProvider());
        auth.userDetailsService(userDetailsService()).passwordEncoder(passwordEncoder());
    }

    @Override
    public void configure(final WebSecurity web) throws Exception {

        web.ignoring().antMatchers("/bower_components/**", "/i18n/**", "/images/**", "/styles/**", "/app/**",
            "/heartbeat.jsp", "/toggle*", "/status.info", "/manifest.info", "/jobs.monitor2", "/jobs.monitor", "/ws");
    }

    @Override
    protected void configure(final HttpSecurity http) throws Exception {

        //J-
        // @formatter:off
        http
            .exceptionHandling()
                .authenticationEntryPoint(authenticationEntryPoint)
                .and()
            .formLogin()
                .loginProcessingUrl("/authentication")
                .successHandler(ajaxAuthenticationSuccessHandler)
                .failureHandler(ajaxAuthenticationFailureHandler)
                .usernameParameter("j_username")
                .passwordParameter("j_password")
                .permitAll()
                .and()
            .logout()
                .logoutUrl("/logout")
                .logoutSuccessHandler(ajaxLogoutSuccessHandler)
                .deleteCookies("JSESSIONID")
                .permitAll()
                .and()
            .csrf()
                .disable()
            .headers()
                .frameOptions().disable();
        //for developement, we don't need authorization
        if (env.acceptsProfiles("dev")) {
            http.csrf().disable();
            http.authorizeRequests()
                    .antMatchers("/**").permitAll();
        } else {
            http.authorizeRequests()
                .antMatchers("/rest/authenticate").permitAll()
                .antMatchers("/rest/logs/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, ZEOSPrivileges.PRIVILEGE_ADMIN)
                .antMatchers("/metrics/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, ZEOSPrivileges.PRIVILEGE_ADMIN)
                .antMatchers("/health/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/trace/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/dump/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/shutdown/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/beans/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/info/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/autoconfig/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/env/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/trace/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .antMatchers("/api-docs/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, ZEOSPrivileges.PRIVILEGE_ADMIN)
                .antMatchers("/hystrix/**").hasAnyAuthority(AuthoritiesConstants.ADMIN, ZEOSPrivileges.PRIVILEGE_ADMIN);
        }
        // @formatter:on
        //J+
    }

    @EnableGlobalMethodSecurity(prePostEnabled = true, jsr250Enabled = true)
    private static class GlobalSecurityConfiguration extends GlobalMethodSecurityConfiguration { }
}
