package de.zalando.purchase.pet.util.builder;

import static com.google.common.collect.Lists.newArrayList;

import static de.zalando.purchase.pet.util.builder.DefaultTestValues.CONFIG_SKU;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.CONFIG_SUPPLIER_ARTICLE_CODE;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.MAIN_COLOR_CODE;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.MATERIAL_CODE;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.PATTERN_CODE;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.SECOND_COLOR_CODE;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.SUPPLIER_CODE;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.THIRD_COLOR_CODE;

import java.util.ArrayList;
import java.util.List;

import com.google.common.collect.Lists;

import de.zalando.catalog.domain.article.ConfigFacet;
import de.zalando.catalog.domain.article.OptionType;
import de.zalando.catalog.domain.article.OptionValueTypeCode;
import de.zalando.catalog.domain.article.facet.ArticleConfig;
import de.zalando.catalog.domain.article.facet.ProductionStatus;
import de.zalando.catalog.domain.article.facet.SalesConfig;
import de.zalando.catalog.domain.article.facet.SupplierConfig;
import de.zalando.catalog.domain.article.facet.SupplierContainerConfig;
import de.zalando.catalog.domain.article.material.MaterialCode;
import de.zalando.catalog.domain.attribute.AttributeValue;
import de.zalando.catalog.domain.color.ColorCode;
import de.zalando.catalog.domain.sku.ConfigSku;

import de.zalando.domain.ShopFrontendType;

/**
 * @author  goekhan created on 8/21/14.
 */

public class ArticleConfigBuilder {

    private final ArticleConfig articleConfig;

    private String seasonCode;

    private String configSku;

    private String mainColorCode;

    private String secondColorCode;

    private String thirdColorCode;

    private String materialCode;

    private String pattern;

    private String supplierArticleCode;

    private String mainSupplierCode;

    private boolean inProduction;

    private List<AttributeValue<?>> attributeValues = newArrayList();

    public ArticleConfigBuilder() {
        articleConfig = new ArticleConfig();

        final ArrayList<ConfigFacet> configFacets = newArrayList();
        configFacets.add(new SalesConfig());
        configFacets.add(new SupplierContainerConfig());
        articleConfig.setFacets(configFacets);

    }

    public static ArticleConfigBuilder newArticleConfig() {
        return new ArticleConfigBuilder();
    }

    public static ArticleConfigBuilder defaultValues() {
        final ArticleConfigBuilder builder = newArticleConfig();
        builder.withConfigSku(CONFIG_SKU).withMainColorCode(MAIN_COLOR_CODE).withSecondColorCode(SECOND_COLOR_CODE)
               .withThirdColorCode(THIRD_COLOR_CODE).withMaterialCode(MATERIAL_CODE).withPattern(PATTERN_CODE)
               .withMainSupplierCode(SUPPLIER_CODE).withSupplierArticleCode(CONFIG_SUPPLIER_ARTICLE_CODE)
               .withAttributeValue(AttributeOptionValueBuilder.defaultValues().build());
        return builder;
    }

    public ArticleConfig build() {

        articleConfig.setSku(ConfigSku.valueOf(configSku));
        articleConfig.setMainColorCode(new ColorCode(mainColorCode));
        articleConfig.setSecondColorCode(new ColorCode(secondColorCode));
        articleConfig.setThirdColorCode(new ColorCode(thirdColorCode));
        articleConfig.setMainMaterialCode(new MaterialCode(materialCode));
        articleConfig.setPatternTypeCode(new OptionValueTypeCode(OptionType.PATTERN, pattern));
        articleConfig.getFacet(SalesConfig.class).setAttributeValues(attributeValues);

        if (inProduction) {
            final List<ProductionStatus> productionStatusList = Lists.newArrayList();
            final ProductionStatus productionStatus = new ProductionStatus();
            productionStatus.setShopFrontendType(ShopFrontendType.ZALANDO_SHOP);
            productionStatusList.add(productionStatus);
            articleConfig.getFacet(SalesConfig.class).setProductionStatus(productionStatusList);
        }

        articleConfig.setMainSupplierCode(mainSupplierCode);

        final SupplierContainerConfig supplierContainerConfig = articleConfig.getFacet(SupplierContainerConfig.class);
        final SupplierConfig supplierConfig = new SupplierConfig();
        supplierConfig.setSupplierCode(mainSupplierCode);
        supplierConfig.setArticleCode(supplierArticleCode);

        final List<SupplierConfig> suppliers = newArrayList(supplierConfig);
        supplierContainerConfig.setSuppliers(suppliers);

        return articleConfig;
    }

    public ArticleConfigBuilder withSeasonCode(final String seasonCode) {
        this.seasonCode = seasonCode;
        return this;
    }

    public ArticleConfigBuilder withConfigSku(final String configSku) {
        this.configSku = configSku;
        return this;
    }

    public ArticleConfigBuilder withMainColorCode(final String mainColorCode) {
        this.mainColorCode = mainColorCode;
        return this;
    }

    public ArticleConfigBuilder withSecondColorCode(final String secondColorCode) {
        this.secondColorCode = secondColorCode;
        return this;
    }

    public ArticleConfigBuilder withThirdColorCode(final String thirdColorCode) {
        this.thirdColorCode = thirdColorCode;
        return this;
    }

    public ArticleConfigBuilder withMaterialCode(final String materialCode) {
        this.materialCode = materialCode;
        return this;
    }

    public ArticleConfigBuilder withPattern(final String pattern) {
        this.pattern = pattern;
        return this;
    }

    public ArticleConfigBuilder withMainSupplierCode(final String mainSupplierCode) {
        this.mainSupplierCode = mainSupplierCode;
        return this;
    }

    public ArticleConfigBuilder withAttributeValue(final AttributeValue<?> attributeValue) {
        this.attributeValues.add(attributeValue);
        return this;
    }

    public ArticleConfigBuilder withSupplierArticleCode(final String supplierArticleCode) {
        this.supplierArticleCode = supplierArticleCode;
        return this;
    }

    public ArticleConfigBuilder withInProduction(final boolean inProduction) {
        this.inProduction = inProduction;
        return this;
    }
}
