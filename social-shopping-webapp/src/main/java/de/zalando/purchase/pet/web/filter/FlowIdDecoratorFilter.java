package de.zalando.purchase.pet.web.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import org.apache.commons.codec.binary.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;

import de.zalando.purchase.pet.config.PetConstants;

import de.zalando.zomcat.flowid.FlowId;

/**
 * Verwendet slf4j MDC, anstatt von das log4j. Ist dadurch kompatibel mit log4j UND logback
 *
 * @author  jbellmann, clohmann
 */
public class FlowIdDecoratorFilter implements Filter {

    private static final String M_FILTER_START_X_FLOW_ID = "__MONITORING_FILTER_X_FLOW_ID";

    private static final Logger LOG = LoggerFactory.getLogger(FlowIdDecoratorFilter.class);

    @Override
    public void init(final FilterConfig filterConfig) {
        // noop
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest servletRequest = (HttpServletRequest) request;

        String flowId = servletRequest.getHeader("x-flow-id");

        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        final Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            final String username = ((User) principal).getUsername();
            final String encodedUsername = new String(Base64.encodeBase64(username.getBytes("UTF-8")), "US-ASCII");
            MDC.put(PetConstants.LOG_AUDITOR_PLACEHOLDER, encodedUsername);
        }

        if (flowId == null) {
            flowId = FlowId.generateFlowId();
            LOG.debug("generated FlowId : {}", flowId);
        }

        MDC.put(PetConstants.LOG_FLOW_ID_PLACEHOLDER, flowId);
        servletRequest = new FlowIdRequestWrapper(servletRequest, flowId);

        try {
            chain.doFilter(servletRequest, response);
        } finally {
            MDC.clear();
        }
    }

    @Override
    public void destroy() {
        // not implemented yet
    }

    static class FlowIdRequestWrapper extends HttpServletRequestWrapper {

        public static final String X_FLOW_ID = "x-flow-id";

        private final String flowId;

        public FlowIdRequestWrapper(final HttpServletRequest request, final String flowId) {

            super(request);
            this.flowId = flowId;
        }

        @Override
        public String getHeader(final String name) {

            if (X_FLOW_ID.equals(name) || M_FILTER_START_X_FLOW_ID.equals(name)) {
                return flowId;
            }

            return super.getHeader(name);
        }
    }

}
