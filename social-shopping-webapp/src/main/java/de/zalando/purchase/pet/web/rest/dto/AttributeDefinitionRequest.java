package de.zalando.purchase.pet.web.rest.dto;

import java.io.Serializable;

/**
 * Author: clohmann Date: 25.09.14 Time: 17:30
 */
public class AttributeDefinitionRequest implements Serializable {

    private static final long serialVersionUID = -4032244514542839483L;

    private String silhouetteCode;

    private String skuType;

    public String getSilhouetteCode() {

        return silhouetteCode;
    }

    public void setSilhouetteCode(final String silhouetteCode) {

        this.silhouetteCode = silhouetteCode;
    }

    public String getSkuType() {

        return skuType;
    }

    public void setSkuType(final String skuType) {

        this.skuType = skuType;
    }

    public boolean isEmpty() {
        return this.silhouetteCode == null && this.skuType == null;
    }
}
