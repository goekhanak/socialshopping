package de.zalando.purchase.pet.web.rest.dto;

import com.google.common.base.Objects;

import ch.qos.logback.classic.Logger;

public class LoggerDTO {

    private String name;

    private String level;

    public LoggerDTO(final Logger logger) {
        this.name = logger.getName();
        this.level = logger.getEffectiveLevel().toString();
    }

    public String getName() {
        return name;
    }

    public void setName(final String name) {
        this.name = name;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(final String level) {
        this.level = level;
    }

    @Override
    public String toString() {

        return Objects.toStringHelper(this).add("name", name).add("level", level).toString();
    }
}
