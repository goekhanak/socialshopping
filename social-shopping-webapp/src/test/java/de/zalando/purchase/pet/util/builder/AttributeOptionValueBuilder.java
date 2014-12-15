package de.zalando.purchase.pet.util.builder;

import static de.zalando.purchase.pet.util.builder.DefaultTestValues.ATTRIBUTE_DEFINITION_CODE_CONFIG;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.ATTRIBUTE_OPTION_CODE;

import de.zalando.catalog.domain.attribute.AttributeDefinitionCode;
import de.zalando.catalog.domain.attribute.AttributeOptionCode;
import de.zalando.catalog.domain.attribute.AttributeValueOption;

/**
 * @author  goekhan created on 8/21/14.
 */
public class AttributeOptionValueBuilder {

    private AttributeValueOption optionValue;

    private String attributeDefinitionCode;

    private String attributeOptionCode;

    public AttributeOptionValueBuilder() {
        optionValue = new AttributeValueOption();
    }

    public AttributeValueOption build() {
        optionValue.setAttributeDefinitionCode(new AttributeDefinitionCode(attributeDefinitionCode));
        optionValue.setValue(new AttributeOptionCode(attributeOptionCode));

        return optionValue;
    }

    public static AttributeOptionValueBuilder defaultValues() {
        final AttributeOptionValueBuilder builder = new AttributeOptionValueBuilder();

        builder.withAttributeDefinitionCode(ATTRIBUTE_DEFINITION_CODE_CONFIG).withAttributeOptionCode(
            ATTRIBUTE_OPTION_CODE);

        return builder;
    }

    public AttributeOptionValueBuilder withAttributeDefinitionCode(final String attributeDefinitionCode) {
        this.attributeDefinitionCode = attributeDefinitionCode;
        return this;
    }

    public AttributeOptionValueBuilder withAttributeOptionCode(final String attributeOptionCode) {
        this.attributeOptionCode = attributeOptionCode;
        return this;
    }

}
