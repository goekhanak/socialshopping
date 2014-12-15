package de.zalando.purchase.pet.dto;

import java.io.Serializable;

import java.util.List;

import com.google.common.base.Objects;
import com.google.common.collect.Lists;

/**
 * @author  goekhan created on 8/20/14.
 */
public abstract class AbstractPetArticleDTO implements Serializable {

    private static final long serialVersionUID = -3054161961363392068L;

    private String sku;
    private boolean enriched;
    private boolean inProduction;
    private String supplierArticleCode;

    private List<AttributeValueDTO> attributeValues;

    public boolean isEnriched() {
        return enriched;
    }

    public void setEnriched(final boolean enriched) {
        this.enriched = enriched;
    }

    public List<AttributeValueDTO> getAttributeValues() {
        if (attributeValues == null) {
            attributeValues = Lists.newArrayList();
        }

        return attributeValues;
    }

    public void setAttributeValues(final List<AttributeValueDTO> attributeValues) {
        this.attributeValues = attributeValues;
    }

    /**
     * Getter for property 'inProduction'.
     *
     * @return  Value for property 'inProduction'.
     */
    public boolean isInProduction() {
        return inProduction;
    }

    /**
     * Setter for property 'inProduction'.
     *
     * @param  inProduction  Value to set for property 'inProduction'.
     */
    public void setInProduction(final boolean inProduction) {
        this.inProduction = inProduction;
    }

    /**
     * Getter for property 'supplierArticleCode'.
     *
     * @return  Value for property 'supplierArticleCode'.
     */
    public String getSupplierArticleCode() {
        return supplierArticleCode;
    }

    /**
     * Setter for property 'supplierArticleCode'.
     *
     * @param  supplierArticleCode  Value to set for property 'supplierArticleCode'.
     */
    public void setSupplierArticleCode(final String supplierArticleCode) {
        this.supplierArticleCode = supplierArticleCode;
    }

    protected String getSku() {

        return sku;
    }

    protected void setSku(final String sku) {

        this.sku = sku;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this).add("sku", sku).add("enriched", enriched).add("inProduction", inProduction)
                      .add("attributeValues", attributeValues).add("supplierArticleCode", supplierArticleCode)
                      .toString();
    }
}
