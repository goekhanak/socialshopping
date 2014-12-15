package de.zalando.purchase.pet.exception;

import de.zalando.zomcat.cxf.Loggable;

/**
 * @author  goekhan created on 8/20/14.
 */
public class ModelNotFoundException extends Exception implements Loggable {
    private static final long serialVersionUID = 240755736307654150L;

    private final String modelSku;

    public ModelNotFoundException(final String modelSku) {
        super(String.format("Article not found for model SKU: [%s].", modelSku));
        this.modelSku = modelSku;
    }

    @Override
    public boolean isLoggingEnabled() {
        return false;
    }

    public String getModelSku() {
        return modelSku;
    }
}
