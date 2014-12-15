package de.zalando.purchase.pet.util.builder;

import static de.zalando.purchase.pet.util.builder.DefaultTestValues.CONFIG_SKU;

import de.zalando.purchase.pet.dto.PetArticleConfigDTO;

/**
 * @author  goekhan created on on 14/Nov/2014.
 */
public class PetArticleConfigDTOBuilder {

    private final PetArticleConfigDTO configDTO;
    private String configSku;

    public PetArticleConfigDTOBuilder() {
        this.configDTO = new PetArticleConfigDTO();
    }

    public static PetArticleConfigDTOBuilder defaultValues() {
        final PetArticleConfigDTOBuilder builder = new PetArticleConfigDTOBuilder();
        builder.withConfigSku(CONFIG_SKU);

        return builder;
    }

    public PetArticleConfigDTO build() {
        configDTO.setConfigSku(configSku);
        return configDTO;
    }

    public PetArticleConfigDTOBuilder withConfigSku(final String configSku) {
        this.configSku = configSku;
        return this;
    }
}
