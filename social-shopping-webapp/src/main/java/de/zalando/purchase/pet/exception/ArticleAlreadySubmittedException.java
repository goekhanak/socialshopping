package de.zalando.purchase.pet.exception;

import de.zalando.zomcat.cxf.Loggable;

/**
 * @author  goekhan created on on 31/Oct/2014.
 */
public class ArticleAlreadySubmittedException extends Exception implements Loggable {

    private final String modelSku;

    public ArticleAlreadySubmittedException(final String modelSku) {
        super(String.format("Article with SKU: [%s] has already been submitted.", modelSku));
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
