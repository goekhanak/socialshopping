package de.zalando.purchase.pet.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.ehcache.EhCacheCacheManager;
import org.springframework.cache.ehcache.EhCacheManagerFactoryBean;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.core.io.ClassPathResource;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private static final Logger LOG = LoggerFactory.getLogger(CacheConfiguration.class);

    @Value("${ehcache.resourceFileName}")
    private String ehcacheResourceFileName;

    @Bean
    public EhCacheManagerFactoryBean ehCacheManagerFactoryBean() {
        final EhCacheManagerFactoryBean ehCacheManagerFactoryBean = new EhCacheManagerFactoryBean();
        ehCacheManagerFactoryBean.setConfigLocation(new ClassPathResource(ehcacheResourceFileName));
        return ehCacheManagerFactoryBean;
    }

    @Bean
    public CacheManager cacheManager() {
        LOG.info("Starting Ehcache");

        final EhCacheCacheManager cacheManager = new EhCacheCacheManager();
        cacheManager.setCacheManager(ehCacheManagerFactoryBean().getObject());
        return cacheManager;
    }
}
