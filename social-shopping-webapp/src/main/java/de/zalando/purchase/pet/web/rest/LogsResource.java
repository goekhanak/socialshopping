package de.zalando.purchase.pet.web.rest;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import de.zalando.purchase.pet.web.rest.dto.LoggerDTO;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.LoggerContext;

/**
 * Controller for view and managing Log Level at runtime.
 */
@RestController
@RequestMapping(value = "/rest/logs", produces = MediaType.APPLICATION_JSON_VALUE)
public class LogsResource {

    @RequestMapping(method = RequestMethod.GET)
    public List<LoggerDTO> getList() {
        final LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        final List<LoggerDTO> loggers = new ArrayList<>();
        for (final ch.qos.logback.classic.Logger logger : context.getLoggerList()) {
            loggers.add(new LoggerDTO(logger));
        }

        return loggers;
    }

    @RequestMapping(method = RequestMethod.PUT)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changeLevel(@RequestBody final LoggerDTO jsonLogger) {
        final LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        context.getLogger(jsonLogger.getName()).setLevel(Level.valueOf(jsonLogger.getLevel()));
    }
}
