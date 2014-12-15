package de.zalando.purchase.pet.exception;

import de.zalando.zomcat.cxf.Loggable;

/**
 * @author  goekhan created on on 19/Sep/2014.
 */
public class SubmitArticleModelException extends Exception implements Loggable {
    private static final long serialVersionUID = -4334173794011590124L;

    private String modelSku;

    public SubmitArticleModelException(final String modelSku, final String reason) {
        super(String.format("Article can not be submitted for model SKU: [%s] due to %s.", modelSku, reason));
        this.modelSku = modelSku;
    }

    @Override
    public boolean isLoggingEnabled() {
        return true;
    }

    public String getModelSku() {
        return modelSku;
    }
}
