package de.zalando.purchase.pet.config;

import javax.inject.Inject;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.mangofactory.swagger.configuration.JacksonSwaggerSupport;
import com.mangofactory.swagger.configuration.SpringSwaggerConfig;
import com.mangofactory.swagger.plugin.EnableSwagger;
import com.mangofactory.swagger.plugin.SwaggerSpringMvcPlugin;

import com.wordnik.swagger.model.ApiInfo;

/**
 * Author: clohmann Date: 24.07.14 Time: 14:36
 */
@Configuration
@EnableSwagger
public class SwaggerConfiguration {

    private SpringSwaggerConfig springSwaggerConfig;

    @Inject
    public void setSpringSwaggerConfig(final SpringSwaggerConfig springSwaggerConfig) {
        this.springSwaggerConfig = springSwaggerConfig;
    }

    @Bean
    public SwaggerSpringMvcPlugin customImplementation() {
        return new SwaggerSpringMvcPlugin(this.springSwaggerConfig).apiInfo(apiInfo()).includePatterns("/rest/.*");
    }

    private ApiInfo apiInfo() {

        return new ApiInfo("Purchasing Article (Particle) Enrichment Application", "PET API", "Terms of service",
                "Backend/Purchasing", "Apps API Licence Type", "Apps API License URL");
    }

    @Bean
    public JacksonSwaggerSupport jacksonSwaggerSupport() {
        return new JacksonSwaggerSupport();
    }

}
