package de.zalando.purchase.pet.config.configservice;

import de.zalando.appconfig.proxy.annotation.AppConfigService;

/**
 * Author: clohmann Date: 31.07.14 Time: 11:52
 */
@AppConfigService(namespace = "pet.toggle.production")
public interface ToggleConfig {

    Boolean getRestriction();

}
