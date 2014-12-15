package de.zalando.purchase.pet.util.builder;

import static com.google.common.collect.Lists.newArrayList;

import static de.zalando.purchase.pet.util.builder.DefaultTestValues.ARTICLE_COMMODITY_GROUP_CODE;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.ARTICLE_NAME;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.ATTRIBUTE_DEFINITION_CODE_MODEL;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.CONFIG_SUPPLIER_ARTICLE_CODE;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.MODEL_SKU;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.SILHOUETTE_CODE;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.SUPPLIER_CODE;

import java.util.ArrayList;
import java.util.List;

import de.zalando.catalog.domain.article.ModelFacet;
import de.zalando.catalog.domain.article.facet.ArticleConfig;
import de.zalando.catalog.domain.article.facet.ArticleModel;
import de.zalando.catalog.domain.article.facet.SalesModel;
import de.zalando.catalog.domain.article.facet.SupplierContainerModel;
import de.zalando.catalog.domain.article.facet.SupplierModel;
import de.zalando.catalog.domain.attribute.AttributeValue;
import de.zalando.catalog.domain.commodity.CommodityGroupCode;
import de.zalando.catalog.domain.silhouette.SilhouetteCode;
import de.zalando.catalog.domain.sku.ModelSku;

import de.zalando.domain.TargetGroupSet;

/**
 * @author  goekhan created on 8/21/14.
 */

public class ArticleModelBuilder {

    private final ArticleModel articleModel;

    private String modelSku;

    private String name;

    private String commodityGroupCode;

    private String silhouetteCode;

    private String supplierArticleCode;

    private TargetGroupSet targetGroupSet;

    private List<ArticleConfig> articleConfigs = newArrayList();

    private List<AttributeValue<?>> attributeValues = newArrayList();

    public ArticleModelBuilder() {
        articleModel = new ArticleModel();

        final ArrayList<ModelFacet> modelFacets = newArrayList();

        modelFacets.add(new SupplierContainerModel());
        modelFacets.add(new SalesModel());
        articleModel.setFacets(modelFacets);
    }

    public static ArticleModelBuilder newArticleModel() {
        return new ArticleModelBuilder();
    }

    public static ArticleModelBuilder defaultValues() {
        final ArticleModelBuilder builder = newArticleModel();
        //J-
        builder.withModelSku(MODEL_SKU).withName(ARTICLE_NAME).
                withCommodityGroupCode(ARTICLE_COMMODITY_GROUP_CODE)
               .withSilhouetteCode(SILHOUETTE_CODE)
               .withSupplierArticleCode(CONFIG_SUPPLIER_ARTICLE_CODE)
               .withTargetGroupSet(TargetGroupSet.none())
               .withAttributeValue(AttributeOptionValueBuilder.defaultValues()
                       .withAttributeDefinitionCode(ATTRIBUTE_DEFINITION_CODE_MODEL).build())
               .withArticleConfig(ArticleConfigBuilder.defaultValues()
               .build());
        //J+

        return builder;
    }

    public ArticleModel build() {
        articleModel.setSku(ModelSku.valueOf(modelSku));
        articleModel.setName(modelSku);
        articleModel.setCommodityGroupCode(new CommodityGroupCode(commodityGroupCode));
        if (silhouetteCode != null) {
            articleModel.setSilhouetteCode(new SilhouetteCode(silhouetteCode));
        }

        articleModel.setChildren(articleConfigs);
        articleModel.getFacet(SalesModel.class).setAttributeValues(attributeValues);
        articleModel.setMainSupplierCode(SUPPLIER_CODE);
        articleModel.setTargetGroupSet(targetGroupSet);

        final SupplierContainerModel supplierContainerModel = articleModel.getFacet(SupplierContainerModel.class);
        final SupplierModel supplierModel = new SupplierModel();
        supplierModel.setSupplierCode(articleModel.getMainSupplierCode());
        supplierModel.setArticleCode(supplierArticleCode);

        final List<SupplierModel> suppliers = newArrayList(supplierModel);
        supplierContainerModel.setSuppliers(suppliers);

        return articleModel;
    }

    public ArticleModelBuilder withName(final String articleName) {
        this.name = articleName;
        return this;
    }

    public ArticleModelBuilder withCommodityGroupCode(final String commodityGroupCode) {
        this.commodityGroupCode = commodityGroupCode;
        return this;
    }

    public ArticleModelBuilder withSilhouetteCode(final String silhouetteCode) {
        this.silhouetteCode = silhouetteCode;
        return this;
    }

    public ArticleModelBuilder withModelSku(final String modelSku) {
        this.modelSku = modelSku;
        return this;
    }

    public ArticleModelBuilder withSupplierArticleCode(final String supplierArticleCode) {
        this.supplierArticleCode = supplierArticleCode;
        return this;
    }

    public ArticleModelBuilder withArticleConfigs(final List<ArticleConfig> articleConfigs) {
        this.articleConfigs = articleConfigs;

        for (ArticleConfig config : articleConfigs) {
            withArticleConfig(config);
        }

        return this;
    }

    public ArticleModelBuilder withArticleConfig(final ArticleConfig articleConfig) {
        this.articleConfigs.add(articleConfig);
        articleConfig.setParent(articleModel);

        return this;
    }

    public ArticleModelBuilder withAttributeValue(final AttributeValue<?> attributeValue) {
        this.attributeValues.add(attributeValue);

        return this;
    }

    public ArticleModelBuilder withTargetGroupSet(final TargetGroupSet targetGroupSet) {
        this.targetGroupSet = targetGroupSet;

        return this;
    }
}
