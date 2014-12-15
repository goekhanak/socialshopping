/**
 *
 */
package de.zalando.purchase.pet.util;

import javax.xml.soap.SOAPException;
import javax.xml.soap.SOAPFactory;
import javax.xml.ws.soap.SOAPFaultException;

/**
 * @author  gaksakalli
 */
public class SOAPFaultTestException extends SOAPFaultException {
    private static final long serialVersionUID = -3693484471942315987L;
    private String message;

    /**
     * @throws  javax.xml.soap.SOAPException
     */
    public SOAPFaultTestException() throws SOAPException {
        super(SOAPFactory.newInstance().createFault());
    }

    /**
     * @param   message
     *
     * @throws  javax.xml.soap.SOAPException
     */
    public SOAPFaultTestException(final String message) throws SOAPException {
        this();
        this.message = message;
    }

    /* (non-Javadoc)
     * @see java.lang.Throwable#getMessage()
     */
    @Override
    public String getMessage() {
        return message;
    }

}
