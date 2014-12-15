package de.zalando.purchase.pet.config;

import static com.google.common.base.Joiner.on;

import static de.zalando.purchase.pet.config.PetConstants.JMX_ENABLED;
import static de.zalando.purchase.pet.config.PetConstants.JVM_BUFFERS;
import static de.zalando.purchase.pet.config.PetConstants.JVM_FILES;
import static de.zalando.purchase.pet.config.PetConstants.JVM_GARBAGE;
import static de.zalando.purchase.pet.config.PetConstants.JVM_MEMORY;
import static de.zalando.purchase.pet.config.PetConstants.JVM_THREADS;
import static de.zalando.purchase.pet.config.PetConstants.METRICS_GRAPHITE_ENABLED;
import static de.zalando.purchase.pet.config.PetConstants.METRICS_GRAPHITE_FREQUENCY_IN_SECONDS;
import static de.zalando.purchase.pet.config.PetConstants.METRICS_GRAPHITE_HOST;
import static de.zalando.purchase.pet.config.PetConstants.METRICS_GRAPHITE_PORT;
import static de.zalando.purchase.pet.config.PetConstants.METRICS_GRAPHITE_PREFIX;
import static de.zalando.purchase.pet.config.PetConstants.METRICS_GRAPHITE_PROPERTIES_PREFIX;
import static de.zalando.purchase.pet.config.PetConstants.METRICS_PROPERTIES_PREFIX;
import static de.zalando.purchase.pet.config.PetConstants.SPRING_PROFILE_DEFAULT;

import java.lang.management.ManagementFactory;

import java.net.InetSocketAddress;

import java.util.concurrent.TimeUnit;

import javax.annotation.PostConstruct;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.bind.RelaxedPropertyResolver;

import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.core.env.Environment;

import com.codahale.metrics.JmxReporter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.graphite.Graphite;
import com.codahale.metrics.graphite.GraphiteReporter;
import com.codahale.metrics.jvm.BufferPoolMetricSet;
import com.codahale.metrics.jvm.FileDescriptorRatioGauge;
import com.codahale.metrics.jvm.GarbageCollectorMetricSet;
import com.codahale.metrics.jvm.MemoryUsageGaugeSet;
import com.codahale.metrics.jvm.ThreadStatesGaugeSet;

import com.ryantenney.metrics.spring.config.annotation.EnableMetrics;
import com.ryantenney.metrics.spring.config.annotation.MetricsConfigurerAdapter;

import de.zalando.zomcat.appconfig.BaseApplicationConfig;

/**
 * Author: clohmann Date: 22.07.14 Time: 15:01
 */
@Configuration
@EnableMetrics(proxyTargetClass = true)
public class MetricsConfiguration extends MetricsConfigurerAdapter implements EnvironmentAware {

    private static final Logger LOG = LoggerFactory.getLogger(MetricsConfiguration.class);

    private static final MetricRegistry METRIC_REGISTRY = new MetricRegistry();

    private RelaxedPropertyResolver propertyResolver;

    @Override
    public void setEnvironment(final Environment environment) {
        this.propertyResolver = new RelaxedPropertyResolver(environment, METRICS_PROPERTIES_PREFIX);
    }

    @Override
    @Bean
    public MetricRegistry getMetricRegistry() {
        return METRIC_REGISTRY;
    }

    @PostConstruct
    public void init() {
        LOG.debug("Registring JVM gauges");
        METRIC_REGISTRY.register(JVM_MEMORY, new MemoryUsageGaugeSet());
        METRIC_REGISTRY.register(JVM_GARBAGE, new GarbageCollectorMetricSet());
        METRIC_REGISTRY.register(JVM_THREADS, new ThreadStatesGaugeSet());
        METRIC_REGISTRY.register(JVM_FILES, new FileDescriptorRatioGauge());
        METRIC_REGISTRY.register(JVM_BUFFERS, new BufferPoolMetricSet(ManagementFactory.getPlatformMBeanServer()));
        if (propertyResolver.getProperty(JMX_ENABLED, Boolean.class, false)) {
            LOG.info("Initializing Metrics JMX reporting");

            final JmxReporter jmxReporter = JmxReporter.forRegistry(METRIC_REGISTRY).build();
            jmxReporter.start();
        }
    }

    @Configuration
    @ConditionalOnClass(Graphite.class)
    public static class GraphiteRegistry implements EnvironmentAware {

        private static final Logger LOG = LoggerFactory.getLogger(GraphiteRegistry.class);

        private static final String SEPARATOR = ".";

        @Inject
        private BaseApplicationConfig applicationConfig;

        private Environment environment;

        @Inject
        private MetricRegistry metricRegistry;

        private RelaxedPropertyResolver propertyResolver;

        @Override
        public void setEnvironment(final Environment environment) {
            this.propertyResolver = new RelaxedPropertyResolver(environment, METRICS_GRAPHITE_PROPERTIES_PREFIX);
            this.environment = environment;
        }

        @PostConstruct
        private void init() {
            final Boolean graphiteEnabled = propertyResolver.getProperty(METRICS_GRAPHITE_ENABLED, Boolean.class,
                    false);
            if (graphiteEnabled) {

                final String graphiteHost = propertyResolver.getRequiredProperty(METRICS_GRAPHITE_HOST);
                final Integer graphitePort = propertyResolver.getRequiredProperty(METRICS_GRAPHITE_PORT, Integer.class);
                final Graphite graphite = new Graphite(new InetSocketAddress(graphiteHost, graphitePort));
                final GraphiteReporter.Builder builder = GraphiteReporter.forRegistry(metricRegistry);
                builder.convertRatesTo(TimeUnit.SECONDS);
                builder.convertDurationsTo(TimeUnit.MILLISECONDS);

                final String graphitePrefix = propertyResolver.getRequiredProperty(METRICS_GRAPHITE_PREFIX);
                final String appInstanceKey = applicationConfig.getAppInstanceContext().getAppInstanceKey()
                                                               .toLowerCase();

                String env = null;

                if (applicationConfig.getAppInstanceContext().getEnvironment() == null) {
                    for (final String profile : environment.getActiveProfiles()) {
                        if (!profile.equals(SPRING_PROFILE_DEFAULT)) {
                            env = profile;
                            break;
                        }
                    }
                } else {
                    env = applicationConfig.getEnvironment().name();
                }

                final String environmentAndInstanceKeyPrefix = on(SEPARATOR).skipNulls().join(graphitePrefix, env,
                        appInstanceKey);
                LOG.info("Setting Graphite path prefix to : {}", environmentAndInstanceKeyPrefix);
                builder.prefixedWith(environmentAndInstanceKeyPrefix);

                final GraphiteReporter graphiteReporter = builder.build(graphite);
                graphiteReporter.start(propertyResolver.getRequiredProperty(METRICS_GRAPHITE_FREQUENCY_IN_SECONDS,
                        Long.class), TimeUnit.MINUTES);
            }
        }
    }
}
