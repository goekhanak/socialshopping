package de.zalando.purchase.pet.web.rest;

import java.util.List;

import javax.inject.Inject;

import org.springframework.http.MediaType;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import de.zalando.catalog.domain.attribute.AttributeDefinition;

import de.zalando.purchase.pet.service.AttributeDefinitionService;
import de.zalando.purchase.pet.web.rest.dto.AttributeDefinitionRequest;

/**
 * Author: clohmann Date: 17.09.14 Time: 09:28
 */
@RestController
@RequestMapping(
    value = {"/rest/masterdata/attributeDefinition", "/rest/masterdata/attribute_definition/all"},
    produces = MediaType.APPLICATION_JSON_VALUE
)
public class AttributeDefinitionController {

    @Inject
    private AttributeDefinitionService attributeDefinitionService;

    @RequestMapping(value = "/{attributeDefinitionCode}", method = RequestMethod.GET)
    public AttributeDefinition getAttributeDefinition(
            @PathVariable("attributeDefinitionCode") final String attributeDefinitionCode) {

        return attributeDefinitionService.getAttributeDefinition(attributeDefinitionCode);
    }

    @RequestMapping(method = RequestMethod.GET)
    public List<AttributeDefinition> getAttributeDefinitions(final AttributeDefinitionRequest request) {

        return attributeDefinitionService.getAttributeDefinitions(request);
    }
}
