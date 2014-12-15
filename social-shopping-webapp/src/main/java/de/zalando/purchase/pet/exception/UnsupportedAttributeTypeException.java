package de.zalando.purchase.pet.exception;

import de.zalando.catalog.domain.attribute.AttributeType;

import de.zalando.zomcat.cxf.Loggable;

/**
 * @author  goekhan created on on 18/Sep/2014.
 */
public class UnsupportedAttributeTypeException extends Exception implements Loggable {
    private static final long serialVersionUID = -4657413136547403898L;

    public UnsupportedAttributeTypeException(final String attributeDefinitionCode, final AttributeType attributeType) {
        super(String.format(
                "CM Attribute with AttributeDefinitionCode [%s] has unsupported Attribute Type: [%s]. for  ",
                attributeDefinitionCode, attributeType));
    }

    @Override
    public boolean isLoggingEnabled() {
        return true;
    }
}
