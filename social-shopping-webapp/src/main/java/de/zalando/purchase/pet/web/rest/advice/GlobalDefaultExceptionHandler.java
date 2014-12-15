package de.zalando.purchase.pet.web.rest.advice;

import org.springframework.http.HttpStatus;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import de.zalando.purchase.pet.exception.ArticleAlreadySubmittedException;
import de.zalando.purchase.pet.exception.ModelNotFoundException;
import de.zalando.purchase.pet.exception.SubmitArticleModelException;
import de.zalando.purchase.pet.exception.UnsupportedAttributeTypeException;

@ControllerAdvice
public class GlobalDefaultExceptionHandler {

    @ResponseStatus(HttpStatus.NOT_FOUND) // 404
    @ExceptionHandler(ModelNotFoundException.class)
    @ResponseBody
    public String handleOrderResponseNotFoundException(final ModelNotFoundException ex) {
        return ex.getMessage();
    }

    @ResponseStatus(HttpStatus.PRECONDITION_FAILED) // 412
    @ExceptionHandler(UnsupportedAttributeTypeException.class)
    @ResponseBody
    public String handleUserPoolsNotMatchWithOrderException(final UnsupportedAttributeTypeException ex) {
        return ex.getMessage();
    }

    @ResponseStatus(HttpStatus.PRECONDITION_FAILED) // 412
    @ExceptionHandler(SubmitArticleModelException.class)
    @ResponseBody
    public String handleUserPoolsNotMatchWithOrderException(final SubmitArticleModelException ex) {
        return ex.getMessage();
    }

    @ResponseStatus(HttpStatus.LOCKED) // 423
    @ExceptionHandler(ArticleAlreadySubmittedException.class)
    @ResponseBody
    public String handle(final ArticleAlreadySubmittedException ex) {
        return ex.getMessage();
    }
}
