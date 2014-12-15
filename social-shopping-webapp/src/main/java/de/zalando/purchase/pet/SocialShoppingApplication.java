package de.zalando.purchase.pet;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.web.SpringBootServletInitializer;

import org.springframework.cloud.netflix.hystrix.EnableHystrix;
import org.springframework.cloud.netflix.hystrix.dashboard.EnableHystrixDashboard;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Author: clohmann Date: 16.07.14 Time: 12:34
 */
@Configuration
@EnableAutoConfiguration(exclude = {DataSourceAutoConfiguration.class})
@EnableHystrix
@EnableHystrixDashboard
@ComponentScan({ "de.zalando.purchase.pet", "de.zalando.purchase.masterdata" })
public class SocialShoppingApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(final SpringApplicationBuilder application) {
        return application.showBanner(true).sources(SocialShoppingApplication.class);
    }

    public static void main(final String[] args) {

        final SpringApplicationBuilder builder = new SpringApplicationBuilder(SocialShoppingApplication.class);
        builder.showBanner(true);
        builder.run(args);
    }
}
