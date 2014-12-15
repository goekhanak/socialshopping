package de.zalando.purchase.pet.dto;

import static com.google.common.collect.Lists.newArrayList;

import java.io.Serializable;

import java.util.List;

import com.google.common.base.Objects;

import de.zalando.catalog.domain.attribute.AttributeType;

/**
 * @author  goekhan created on on 16/Sep/2014.
 */
public class AttributeValueDTO implements Serializable {
    private static final long serialVersionUID = 3547121835288266168L;

    private String attributeDefinitionCode;
    private AttributeType type;
    private List<String> values;

    /**
     * Getter for property 'attributeDefinitionCode'.
     *
     * @return  Value for property 'attributeDefinitionCode'.
     */
    public String getAttributeDefinitionCode() {
        return attributeDefinitionCode;
    }

    /**
     * Setter for property 'attributeDefinitionCode'.
     *
     * @param  attributeDefinitionCode  Value to set for property 'attributeDefinitionCode'.
     */
    public void setAttributeDefinitionCode(final String attributeDefinitionCode) {
        this.attributeDefinitionCode = attributeDefinitionCode;
    }

    /**
     * Getter for property 'type'.
     *
     * @return  Value for property 'type'.
     */
    public AttributeType getType() {
        return type;
    }

    /**
     * Setter for property 'type'.
     *
     * @param  type  Value to set for property 'type'.
     */
    public void setType(final AttributeType type) {
        this.type = type;
    }

    /**
     * Getter for property 'values'.
     *
     * @return  Value for property 'values'.
     */
    public List<String> getValues() {
        if (values == null) {
            values = newArrayList();
        }

        return values;
    }

    /**
     * Setter for property 'values'.
     *
     * @param  values  Value to set for property 'values'.
     */
    public void setValues(final List<String> values) {
        this.values = values;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this).add("attributeDefinitionCode", attributeDefinitionCode).add("type", type)
                      .add("values", values).toString();
    }
}
