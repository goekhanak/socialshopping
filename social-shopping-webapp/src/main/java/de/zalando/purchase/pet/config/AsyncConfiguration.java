package de.zalando.purchase.pet.config;

import org.springframework.context.annotation.Configuration;

import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Author: clohmann Date: 25.09.14 Time: 12:11
 */
@EnableAsync
@EnableScheduling
@Configuration
public class AsyncConfiguration { }
