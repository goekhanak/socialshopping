package de.zalando.purchase.pet.config;

import static com.google.common.collect.Maps.newHashMap;

import java.util.EnumSet;
import java.util.Map;

import javax.inject.Inject;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.boot.context.embedded.ServletContextInitializer;

import org.springframework.context.annotation.Configuration;

import org.springframework.core.env.Environment;

import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.servlet.InstrumentedFilter;
import com.codahale.metrics.servlets.MetricsServlet;

import de.zalando.purchase.pet.web.filter.FlowIdDecoratorFilter;
import de.zalando.purchase.pet.web.filter.gzip.GZipServletFilter;

/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
@Configuration
public class WebConfigurer extends WebMvcConfigurerAdapter implements ServletContextInitializer {

    private static final Logger LOG = LoggerFactory.getLogger(WebConfigurer.class);

    @Inject
    private Environment env;

    @Inject
    private MetricRegistry metricRegistry;

    private int loadOnStartup = 2;

    @Override
    public void onStartup(final ServletContext servletContext) {

        LOG.info("Web application configuration, using profiles: {}", (Object) env.getActiveProfiles());

        final EnumSet<DispatcherType> disps = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD,
                DispatcherType.ASYNC);

        initMetrics(servletContext, disps);

        initFlowIdDecoratorFilter(servletContext, disps);
        initGzipFilter(servletContext, disps);

        LOG.info("Web application fully configured");
    }

    /**
     * Initializes the GZip filter.
     */
    private void initGzipFilter(final ServletContext servletContext, final EnumSet<DispatcherType> disps) {

        LOG.debug("Registering GZip Filter");

        final FilterRegistration.Dynamic compressingFilter = servletContext.addFilter("gzipFilter",
                new GZipServletFilter());
        final Map<String, String> parameters = newHashMap();

        compressingFilter.setInitParameters(parameters);

        compressingFilter.addMappingForUrlPatterns(disps, true, "*.css");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.json");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.html");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.js");
        compressingFilter.addMappingForUrlPatterns(disps, true, PetConstants.REST_REQUEST_PREFIX + "/*");
        compressingFilter.addMappingForUrlPatterns(disps, true, "/metrics/*");

        compressingFilter.setAsyncSupported(true);
    }

    private void initFlowIdDecoratorFilter(final ServletContext servletContext, final EnumSet<DispatcherType> disps) {

        LOG.debug("Registering FlowId Decorator Filter");

        final FilterRegistration.Dynamic flowIdDecoratorFilter = servletContext.addFilter("FlowIdDecoratorFilter",
                new FlowIdDecoratorFilter());

        flowIdDecoratorFilter.addMappingForUrlPatterns(disps, true, PetConstants.REST_REQUEST_PREFIX + "/*");
        flowIdDecoratorFilter.setAsyncSupported(true);
    }

    /**
     * Initializes Metrics.
     */
    private void initMetrics(final ServletContext servletContext, final EnumSet<DispatcherType> disps) {
        LOG.debug("Initializing Metrics registries");
        servletContext.setAttribute(InstrumentedFilter.REGISTRY_ATTRIBUTE, metricRegistry);
        servletContext.setAttribute(MetricsServlet.METRICS_REGISTRY, metricRegistry);

        LOG.debug("Registering Metrics Filter");

        final FilterRegistration.Dynamic metricsFilter = servletContext.addFilter("webappMetricsFilter",
                new InstrumentedFilter());

        metricsFilter.addMappingForUrlPatterns(disps, true, "/*");
        metricsFilter.setAsyncSupported(true);

        LOG.debug("Registering Metrics Servlet");

        final ServletRegistration.Dynamic metricsAdminServlet = servletContext.addServlet("metricsServlet",
                new MetricsServlet());

        metricsAdminServlet.addMapping("/metrics/metrics/*");
        metricsAdminServlet.setAsyncSupported(true);
        metricsAdminServlet.setLoadOnStartup(loadOnStartup++);
    }
}
