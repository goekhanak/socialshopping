package de.zalando.purchase.pet.config.configservice;

import de.zalando.appconfig.proxy.annotation.AppConfigService;

/**
 * @author  clohmann Date: 15.04.14 Time: 18:05
 */
@AppConfigService(namespace = "purchasing.url")
public interface UrlConfig {

    String getPoView();

}
