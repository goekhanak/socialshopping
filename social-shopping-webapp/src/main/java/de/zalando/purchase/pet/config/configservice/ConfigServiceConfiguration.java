package de.zalando.purchase.pet.config.configservice;

import javax.inject.Inject;

import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.core.env.Environment;

import de.zalando.appconfig.annotation.EnableWebserviceAppConfig;
import de.zalando.appconfig.impl.CompositeConfiguration;
import de.zalando.appconfig.resources.SpringEnvironmentResource;

import de.zalando.zomcat.appconfig.BaseApplicationConfigImpl;

/**
 * @author  clohmann Date: 15.04.14 Time: 15:37
 */
@Configuration
@EnableWebserviceAppConfig(
    packagesToScan = {"de.zalando.purchase.pet.config.configservice"}, disableValidation = true,
    disableBaseApplicationConfigBeanCreation = true
)
public class ConfigServiceConfiguration implements EnvironmentAware {

    @Inject
    private CompositeConfiguration compositeConfiguration;

    @Override
    public void setEnvironment(final Environment environment) {
        final SpringEnvironmentResource springEnvironmentResource = new SpringEnvironmentResource(environment);
        compositeConfiguration.getResources().add(springEnvironmentResource);
    }

    @Bean
    public BaseApplicationConfigImpl applicationConfig() {
        final BaseApplicationConfigImpl applicationConfig = new BaseApplicationConfigImpl();

        applicationConfig.setConfig(compositeConfiguration);
        return applicationConfig;
    }
}
