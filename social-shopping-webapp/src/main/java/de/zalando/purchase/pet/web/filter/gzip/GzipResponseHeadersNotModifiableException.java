package de.zalando.purchase.pet.web.filter.gzip;

import javax.servlet.ServletException;

public class GzipResponseHeadersNotModifiableException extends ServletException {

    public GzipResponseHeadersNotModifiableException(final String message) {
        super(message);
    }
}
