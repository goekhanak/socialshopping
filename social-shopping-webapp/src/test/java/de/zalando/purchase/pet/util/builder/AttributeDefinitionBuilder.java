package de.zalando.purchase.pet.util.builder;

import static com.google.common.collect.Lists.newArrayList;

import static de.zalando.purchase.pet.mapper.PetArticleMapper.CATEGORY_MANAGEMENT_ACCESS_PROFILE_CODE;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.ATTRIBUTE_DEFINITION_CODE_CONFIG;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.SILHOUETTE_CODE;

import java.util.List;

import de.zalando.catalog.domain.attribute.AttributeAccessProfileCode;
import de.zalando.catalog.domain.attribute.AttributeConstraint;
import de.zalando.catalog.domain.attribute.AttributeDefinition;
import de.zalando.catalog.domain.attribute.AttributeDefinitionCode;
import de.zalando.catalog.domain.silhouette.SilhouetteCode;
import de.zalando.catalog.domain.sku.SkuType;

/**
 * @author  goekhan created on 8/21/14.
 */
public class AttributeDefinitionBuilder {

    private AttributeDefinition attributeDefinition;

    private SkuType skuType;

    private String attributeDefinitionCode;

    private List<AttributeConstraint> constraints = newArrayList();

    private List<AttributeAccessProfileCode> accessProfileCodes = newArrayList();

    public AttributeDefinitionBuilder() {
        this.attributeDefinition = new AttributeDefinition();
    }

    public AttributeDefinition build() {
        attributeDefinition.setActive(true);
        attributeDefinition.setSkuType(skuType);
        attributeDefinition.setCode(new AttributeDefinitionCode(attributeDefinitionCode));
        attributeDefinition.setConstraints(constraints);
        attributeDefinition.setAccessProfileCodes(accessProfileCodes);

        return attributeDefinition;
    }

    public static AttributeDefinitionBuilder defaultValues() {
        final AttributeDefinitionBuilder builder = new AttributeDefinitionBuilder();

        AttributeConstraint constraint = new AttributeConstraint();
        constraint.setActive(true);
        constraint.setRequired(true);
        constraint.setSilhouetteCode(new SilhouetteCode(SILHOUETTE_CODE));

        builder.withAttributeDefinitionCode(ATTRIBUTE_DEFINITION_CODE_CONFIG)
               .withAccessProfileCode(CATEGORY_MANAGEMENT_ACCESS_PROFILE_CODE).withSkuType(SkuType.CONFIG)
               .withAttributeConstraint(constraint);
        return builder;
    }

    public AttributeDefinitionBuilder withSkuType(final SkuType skuType) {
        this.skuType = skuType;
        return this;
    }

    public AttributeDefinitionBuilder withAttributeDefinitionCode(final String attributeDefinitionCode) {
        this.attributeDefinitionCode = attributeDefinitionCode;
        return this;
    }

    public AttributeDefinitionBuilder withAccessProfileCode(final String accessProfileCode) {
        this.accessProfileCodes.add(new AttributeAccessProfileCode(accessProfileCode));
        return this;
    }

    public AttributeDefinitionBuilder withAttributeConstraint(final AttributeConstraint attributeConstraint) {
        this.constraints.add(attributeConstraint);
        return this;
    }
}
