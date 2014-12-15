package de.zalando.purchase.pet.web.rest;

import java.security.Principal;

import javax.annotation.security.RolesAllowed;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.google.common.base.Stopwatch;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

import de.zalando.catalog.domain.article.facet.ArticleModel;

import de.zalando.purchase.backend.webservice.dto.paging.CustomPageDTO;
import de.zalando.purchase.backend.webservice.dto.pet.ArticleTaskResult;
import de.zalando.purchase.backend.webservice.dto.pet.ArticleTaskSearchCriteria;
import de.zalando.purchase.pet.dto.PetArticleModelDTO;
import de.zalando.purchase.pet.exception.ArticleAlreadySubmittedException;
import de.zalando.purchase.pet.exception.ModelNotFoundException;
import de.zalando.purchase.pet.exception.SubmitArticleModelException;
import de.zalando.purchase.pet.exception.UnsupportedAttributeTypeException;
import de.zalando.purchase.pet.security.ZEOSPrivileges;
import de.zalando.purchase.pet.service.ArticleEnrichmentService;

/**
 * Author: clohmann Date: 13.08.14 Time: 17:56
 */
@Api(
    value = "ArticleController",
    description = "Handles all operations regarding article manipulation via catalog-purchasing-client."
            + " Also handles search queries for ArticleTasks stored in purchasing-backend."
)
@RestController
@RequestMapping(value = "/rest/article", produces = MediaType.APPLICATION_JSON_VALUE)
public class ArticleController {

    private static final Logger LOG = LoggerFactory.getLogger(ArticleController.class);

    @Inject
    private ArticleEnrichmentService articleEnrichmentService;

    @RolesAllowed(ZEOSPrivileges.PRIVILEGE_EDIT)
    @RequestMapping(method = RequestMethod.GET, value = "/{modelSKU}")
    public ResponseEntity<PetArticleModelDTO> getArticleModel(@PathVariable("modelSKU") final String modelSku)
        throws ModelNotFoundException, UnsupportedAttributeTypeException, ArticleAlreadySubmittedException {

        LOG.info("REST request to get Article ModelSKU {}", modelSku);

        final Stopwatch stopwatch = Stopwatch.createStarted();

        final ArticleModel articleModel = articleEnrichmentService.getArticleModel(modelSku);

        LOG.info("articleEnrichmentService.getArticleModel(modelSku) takes {}", stopwatch.toString());

        final PetArticleModelDTO petArticleModelDTO;
        if (articleModel == null) {
            return new ResponseEntity<>(HttpStatus.REQUEST_TIMEOUT);
        } else {
            petArticleModelDTO = articleEnrichmentService.mapToModelDTO(articleModel);
        }

        return new ResponseEntity<>(petArticleModelDTO, HttpStatus.OK);
    }

    @RolesAllowed(ZEOSPrivileges.PRIVILEGE_EDIT)
    @RequestMapping(method = RequestMethod.POST, value = "/{modelSku}")
    public PetArticleModelDTO updateArticleModel(@RequestBody final PetArticleModelDTO modelDTO,
            @PathVariable("modelSku") final String modelSku) throws ModelNotFoundException,
        UnsupportedAttributeTypeException, ArticleAlreadySubmittedException {

        LOG.info("REST request to update Article Model {}", modelDTO);

        articleEnrichmentService.updateArticleModel(modelDTO);

        final ArticleModel articleModel = articleEnrichmentService.getArticleModel(modelDTO.getModelSku());
        return articleEnrichmentService.mapToModelDTO(articleModel);
    }

    @RolesAllowed(ZEOSPrivileges.PRIVILEGE_EDIT)
    @RequestMapping(method = RequestMethod.PUT, value = "/submit/{modelSku}")
    public void submitArticleModel(@PathVariable("modelSku") final String modelSku, final Principal principal)
        throws ModelNotFoundException, SubmitArticleModelException, ArticleAlreadySubmittedException {

        LOG.info("REST request to Submit Article Model {}", modelSku);
        articleEnrichmentService.checkIfArticleSubmittable(modelSku);

        articleEnrichmentService.submitArticleModel(modelSku);
    }

    @ApiOperation(
        value = "Sends search a criteria object via PurchasingPetWebService "
                + "to purchasing-backend and returns a paged result back to the frontend."
    )
    @RolesAllowed(ZEOSPrivileges.PRIVILEGE_EDIT)
    @RequestMapping(method = RequestMethod.GET)
    public CustomPageDTO<ArticleTaskResult> getArticleTasks(final ArticleTaskSearchCriteria criteria) {

        LOG.info("REST request to search Article Tasks for criteria: {} for user: {}", criteria);

        return articleEnrichmentService.searchArticleTasks(criteria);
    }
}
