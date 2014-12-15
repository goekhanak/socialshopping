package de.zalando.purchase.pet.service;

import static org.apache.commons.lang.StringUtils.isBlank;

import static de.zalando.catalog.domain.article.ArticleFacetType.SALES;
import static de.zalando.catalog.domain.article.ArticleFacetType.SUPPLIER;
import static de.zalando.catalog.domain.article.OptionType.TREND;

import java.util.List;

import javax.inject.Inject;

import javax.xml.ws.soap.SOAPFaultException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Stopwatch;
import com.google.common.collect.Sets;

import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;
import com.netflix.hystrix.contrib.javanica.annotation.HystrixProperty;
import com.netflix.hystrix.exception.HystrixBadRequestException;

import de.zalando.catalog.domain.article.OptionValueTypeCode;
import de.zalando.catalog.domain.article.facet.ArticleConfig;
import de.zalando.catalog.domain.article.facet.ArticleModel;
import de.zalando.catalog.domain.article.facet.SalesConfig;
import de.zalando.catalog.domain.article.facet.SalesModel;
import de.zalando.catalog.domain.attribute.ArticleState;
import de.zalando.catalog.domain.attribute.AttributeDefinition;
import de.zalando.catalog.domain.attribute.AttributeValue;
import de.zalando.catalog.domain.exception.SkuParsingFailedException;
import de.zalando.catalog.domain.silhouette.SilhouetteCode;
import de.zalando.catalog.domain.sku.ConfigSku;
import de.zalando.catalog.domain.sku.ModelSku;
import de.zalando.catalog.domain.sku.SkuType;
import de.zalando.catalog.webservice.reading.ArticleReadWebService;
import de.zalando.catalog.webservice.writing.PurchasingWriteWebService;

import de.zalando.domain.ShopFrontendType;
import de.zalando.domain.TargetGroup;
import de.zalando.domain.TargetGroupDimension;
import de.zalando.domain.TargetGroupSet;

import de.zalando.purchase.backend.webservice.dto.paging.CustomPageDTO;
import de.zalando.purchase.backend.webservice.dto.pet.ArticleTaskResult;
import de.zalando.purchase.backend.webservice.dto.pet.ArticleTaskSearchCriteria;
import de.zalando.purchase.backend.webservice.service.PurchasingPetWebService;
import de.zalando.purchase.masterdata.dto.enumaration.AgeGroup;
import de.zalando.purchase.masterdata.dto.enumaration.Gender;
import de.zalando.purchase.pet.dto.PetArticleConfigDTO;
import de.zalando.purchase.pet.dto.PetArticleModelDTO;
import de.zalando.purchase.pet.exception.ArticleAlreadySubmittedException;
import de.zalando.purchase.pet.exception.ModelNotFoundException;
import de.zalando.purchase.pet.exception.SubmitArticleModelException;
import de.zalando.purchase.pet.exception.UnsupportedAttributeTypeException;
import de.zalando.purchase.pet.mapper.PetArticleMapper;
import de.zalando.purchase.pet.security.SecurityUtils;
import de.zalando.purchase.pet.security.ZEOSPrivileges;

/**
 * @author  goekhan created on on 16/Sep/2014.
 */
@Service
public class ArticleEnrichmentService {

    private static final Logger LOG = LoggerFactory.getLogger(ArticleEnrichmentService.class);

    @Inject
    private PurchasingPetWebService purchasingPetWebService;

    @Inject
    private ArticleReadWebService articleReadWebService;

    @Inject
    private PurchasingWriteWebService purchasingWriteWebService;

    @Inject
    private PetArticleMapper petArticleMapper;

    @Inject
    private SecurityUtils securityUtils;

    /**
     * Checks if the all article tasks defined by the modelSku submitted. If so then throws a
     * {@link de.zalando.purchase.pet.exception.ArticleAlreadySubmittedException}.
     */
    public void checkIfArticleSubmittable(final String modelSku) throws ArticleAlreadySubmittedException {
        if (!purchasingPetWebService.isArticleSubmittable(modelSku)) {
            final ArticleAlreadySubmittedException articleAlreadySubmittedException =
                new ArticleAlreadySubmittedException(modelSku);
            LOG.info(articleAlreadySubmittedException.getMessage());
            throw articleAlreadySubmittedException;
        }
    }

    public CustomPageDTO<ArticleTaskResult> searchArticleTasks(final ArticleTaskSearchCriteria criteria) {

        if (securityUtils.currentUserHasPrivilege(ZEOSPrivileges.PRIVILEGE_ADMIN)) {
            criteria.setAdminUser(true);
        }

        criteria.setUserEmail(securityUtils.getCurrentUser().getUsername());

        LOG.info("purchasingPetWebService.getArticleTasks with criteria: {} ", criteria);

        return purchasingPetWebService.getArticleTasks(criteria);
    }

    /**
     * updates the model and its configs from modelDTO.
     *
     * @param   modelDTO {@link de.zalando.purchase.pet.dto.PetArticleModelDTO}
     *
     * @throws  ModelNotFoundException  when configSku does not exist at catalog.
     */
    public void updateArticleModel(final PetArticleModelDTO modelDTO) throws ModelNotFoundException {

        final String modelSku = modelDTO.getModelSku();
        ArticleModel articleModel = getArticleModel(modelSku);

        if (areAllConfigsBeforeProduction(articleModel.getChildren())) {

            if (removeAttributeValuesIfNeeded(modelDTO, articleModel)) {

                // refetch article model to avoid optimistic log exception
                articleModel = getArticleModel(modelSku);
            }

            articleModel.setSilhouetteCode(new SilhouetteCode(modelDTO.getSilhouetteCode()));

            final SalesModel salesModel = articleModel.getFacet(SalesModel.class);

            final List<AttributeValue<?>> updatedModelAttributedValues = petArticleMapper.mapToAttributeValues(
                    modelDTO.getAttributeValues(), salesModel.getAttributeValues());
            salesModel.setAttributeValues(updatedModelAttributedValues);

            fillGenericModelAttributes(modelDTO, articleModel);

            LOG.info("Updating Article Model {}", modelSku);

            purchasingWriteWebService.updateArticleModelOnly(articleModel);
            purchasingWriteWebService.createOrUpdateModelFacetOnly(salesModel);
        }

        for (final PetArticleConfigDTO configDTO : modelDTO.getConfigs()) {
            final ArticleConfig config = articleModel.getChildBySku(ConfigSku.valueOf(configDTO.getConfigSku()));
            updateArticleConfig(configDTO, config);
        }
    }

    /**
     * Remove model and config attribute values if model has an existing silhouette and new silhouette is different than
     * the existing one and there are existing attribute values.
     *
     * @return  true if one of the sales facets is updated therefore refetch article model needed otherwise false.
     */
    private boolean removeAttributeValuesIfNeeded(final PetArticleModelDTO modelDTO, final ArticleModel articleModel) {

        if (articleModel.getSilhouetteCode() == null) {                                               // when article has no existing silhouette
            return false;
        } else if (articleModel.getSilhouetteCode().getCode().equals(modelDTO.getSilhouetteCode())) { // when article silhouette does not change
            return false;
        } else {                                                                                      // when new silhouette code is different from the existing one

            boolean refetchArticleModelNeeded = false;
            final SalesModel salesModel = articleModel.getFacet(SalesModel.class);
            if (salesModel.getAttributeValues() != null && !salesModel.getAttributeValues().isEmpty()) {

                // model has existing attribute values needed to be removed
                LOG.info("Removing all AttributeValues for Article Model {}", articleModel.getSku().asString());
                salesModel.getAttributeValues().clear();
                purchasingWriteWebService.createOrUpdateModelFacetOnly(salesModel);
                refetchArticleModelNeeded = true;
            }

            for (final ArticleConfig articleConfig : articleModel.getChildren()) {
                final SalesConfig salesConfig = articleConfig.getFacet(SalesConfig.class);
                if (salesConfig.getAttributeValues() != null && !salesConfig.getAttributeValues().isEmpty()) {
                    salesConfig.getAttributeValues().clear();
                    LOG.info("Removing all AttributeValues for Article Config {}", articleConfig.getSku().asString());
                    purchasingWriteWebService.createOrUpdateConfigFacetOnly(salesConfig);
                    refetchArticleModelNeeded = true;
                }
            }

            return refetchArticleModelNeeded;
        }
    }

    /**
     * @param   configs {@link java.util.List} of {@link de.zalando.catalog.domain.article.facet.ArticleConfig}
     *
     * @return  true if are configs are at production state otherwise false.
     */
    private boolean areAllConfigsBeforeProduction(final List<ArticleConfig> configs) {

        for (final ArticleConfig config : configs) {
            final SalesConfig salesConfig = config.getFacet(SalesConfig.class);
            if (salesConfig.getArticleState(ShopFrontendType.ZALANDO_SHOP) != ArticleState.BEFORE_PRODUCTION) {
                return false;
            }
        }

        return true;
    }

    /**
     * updates the articleConfig from configDTO.
     *
     * @param  configDTO {@link de.zalando.purchase.pet.dto.PetArticleConfigDTO}*
     * @param  config {@link de.zalando.catalog.domain.article.facet.ArticleConfig}
     */
    private void updateArticleConfig(final PetArticleConfigDTO configDTO, final ArticleConfig config) {

        final SalesConfig salesConfig = config.getFacet(SalesConfig.class);

        // the production status is only relevant for ShopFrontendType.ZALANDO_SHOP
        final ArticleState articleState = salesConfig.getArticleState(ShopFrontendType.ZALANDO_SHOP);
        if (articleState == ArticleState.BEFORE_PRODUCTION) {
            fillGenericConfigAtrributes(configDTO, salesConfig);

            final List<AttributeValue<?>> updatedConfigAttributeValues = petArticleMapper.mapToAttributeValues(
                    configDTO.getAttributeValues(), salesConfig.getAttributeValues());
            salesConfig.setAttributeValues(updatedConfigAttributeValues);

            LOG.info("Updating Article Config {}", config.getSku().asString());

            purchasingWriteWebService.createOrUpdateConfigFacetOnly(salesConfig);
        }
    }

    /**
     * fills generic config attributes (Trend1, Trend2) at salesConfig from configDTO.
     *
     * @param  configDTO {@link de.zalando.purchase.pet.dto.PetArticleConfigDTO}
     * @param  salesConfig {@link de.zalando.catalog.domain.article.facet.SalesConfig }
     */
    private void fillGenericConfigAtrributes(final PetArticleConfigDTO configDTO, final SalesConfig salesConfig) {

        if (isBlank(configDTO.getTrend1Code())) {
            salesConfig.setTrend1TypeCode(null);
        } else {
            salesConfig.setTrend1TypeCode(new OptionValueTypeCode(TREND, configDTO.getTrend1Code()));
        }

        if (isBlank(configDTO.getTrend2Code())) {
            salesConfig.setTrend2TypeCode(null);
        } else {
            salesConfig.setTrend2TypeCode(new OptionValueTypeCode(TREND, configDTO.getTrend2Code()));
        }
    }

    /**
     * fills gender and agegroup fields at model from modelDTO.
     *
     * @param  modelDTO {@link de.zalando.purchase.pet.dto.PetArticleModelDTO}
     * @param  articleModel {@link de.zalando.catalog.domain.article.facet.ArticleModel}
     */
    private void fillGenericModelAttributes(final PetArticleModelDTO modelDTO, final ArticleModel articleModel) {

        final TargetGroupSet updatedDomainSet = articleModel.getTargetGroupSet().filterByDimension(
                TargetGroupDimension.ARTICLE_DOMAIN);

        for (final Gender gender : modelDTO.getGenderSet()) {
            updatedDomainSet.add(TargetGroup.valueOf(gender.name()));
        }

        for (final AgeGroup ageGroup : modelDTO.getAgeGroupSet()) {
            updatedDomainSet.add(TargetGroup.valueOf(ageGroup.name()));
        }

        articleModel.setTargetGroupSet(updatedDomainSet);
    }

    /**
     * gets the article model for the given modelSku. Method is implemented as a Hystrix Command with a fallback method.
     * there is an issue in the actual version of hystrix-javanica which makes it impossible to define ignored
     * exceptions via the @HystrixCommand annotation. As a workaround for this, we explicitly throw a
     * HystrixBadRequestException with the wrapped exception in case of a business-model related error.
     *
     * @param   modelSku  String
     *
     * @return  {@link de.zalando.catalog.domain.article.facet.ArticleModel}
     *
     * @throws  ModelNotFoundException  when configSku does not exist at catalog.
     */
    //J-
    @HystrixCommand(
            fallbackMethod = "getArticleModelFallback",
//            ignoreExceptions = {SkuParsingFailedException.class, ModelNotFoundException.class},
            commandProperties = {
                    @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "15000"),
                    @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "1"),
                    @HystrixProperty(name = "circuitBreaker.sleepWindowInMilliseconds", value = "20000")
            }
    )
    //J+
    public ArticleModel getArticleModel(final String modelSku) throws ModelNotFoundException {
        final ModelSku sku;
        try {
            sku = ModelSku.valueOf(modelSku);
        } catch (final SkuParsingFailedException e) {
            throw new HystrixBadRequestException("Invalid SKU given!", new ModelNotFoundException(modelSku));
        }

        final ArticleModel articleModel;
        try {
            articleModel = articleReadWebService.getArticleModel(sku, Sets.newHashSet(SALES, SUPPLIER));
            if (articleModel == null) {
                throw new HystrixBadRequestException("No article found!", new ModelNotFoundException(modelSku));
            }
        } catch (final SOAPFaultException ex) {
            throw new HystrixBadRequestException("No article found!", new ModelNotFoundException(modelSku));
        }

        return articleModel;
    }

    private ArticleModel getArticleModelFallback(final String modelSku) {

        LOG.warn("SKU: {} failed. FALLBACK!!!", modelSku);
        return null;
    }

    public void submitArticleModel(final String modelSku) throws ModelNotFoundException, SubmitArticleModelException {

        final ArticleModel articleModel = getArticleModel(modelSku);

        validateArticleForSubmit(articleModel);

        final String userEmail = securityUtils.getCurrentUser().getUsername();

        LOG.info("Calling purchasingPetWebService.submitArticleTask() with modelSku: {} and userEmail{} ", modelSku,
            userEmail);

        purchasingPetWebService.submitArticleTask(modelSku, userEmail);
    }

    /**
     * Validates the article model and it's configs for submit.
     *
     * @throws  SubmitArticleModelException  if validation failed.
     */
    @VisibleForTesting
    void validateArticleForSubmit(final ArticleModel articleModel) throws SubmitArticleModelException {
        boolean modelInProduction = false;
        for (final ArticleConfig articleConfig : articleModel.getChildren()) {

            final SalesConfig salesConfig = articleConfig.getFacet(SalesConfig.class);
            final ArticleState articleState = salesConfig.getArticleState(ShopFrontendType.ZALANDO_SHOP);

            // validate only article configs which are not in production yet.
            if (articleState == ArticleState.BEFORE_PRODUCTION) {
                final List<AttributeDefinition> missingConfigCMAttributes =
                    petArticleMapper.getMissingMandatoryCMAttributes(articleModel.getSilhouetteCode(),
                        salesConfig.getAttributeValues(), SkuType.CONFIG);
                if (!missingConfigCMAttributes.isEmpty()) {
                    final String reason = String.format(
                            "Article config [%s] has empty mandatory  missing attributes: %s",
                            articleConfig.getSku().asString(), missingConfigCMAttributes);
                    throw new SubmitArticleModelException(articleModel.getSku().asString(), reason);
                }
            } else {
                modelInProduction = true;
            }
        }

        // validate only article models which are not in production yet.
        if (!modelInProduction) {
            validateArticleModelForSubmit(articleModel);
        }
    }

    /**
     * validates article model for Submit.
     *
     * @throws  SubmitArticleModelException  if validation failed.
     */
    private void validateArticleModelForSubmit(final ArticleModel articleModel) throws SubmitArticleModelException {
        if (articleModel.getSilhouetteCode() == null) {
            throw new SubmitArticleModelException(articleModel.getSku().asString(), "Article model has no Silhouette");
        }

        final TargetGroupSet targetGroupSet = articleModel.getTargetGroupSet();
        final TargetGroupSet genderSet = targetGroupSet.filterByDimension(TargetGroupDimension.GENDER);
        final TargetGroupSet ageGroupSet = targetGroupSet.filterByDimension(TargetGroupDimension.AGE_GROUP);
        if (genderSet.isEmpty() || ageGroupSet.isEmpty()) {
            throw new SubmitArticleModelException(articleModel.getSku().asString(),
                "Article model has no age group or gender");
        }

        final SalesModel salesModel = articleModel.getFacet(SalesModel.class);
        final List<AttributeDefinition> missingModelCMAttributes = petArticleMapper.getMissingMandatoryCMAttributes(
                articleModel.getSilhouetteCode(), salesModel.getAttributeValues(), SkuType.MODEL);
        if (!missingModelCMAttributes.isEmpty()) {
            final String reason = String.format("Article Model has empty mandatory missing attributes: %s",
                    missingModelCMAttributes);
            throw new SubmitArticleModelException(articleModel.getSku().asString(), reason);
        }
    }

    /**
     * Maps a {@link de.zalando.catalog.domain.article.facet.ArticleModel} to a
     * {@link de.zalando.purchase.pet.dto.PetArticleModelDTO}.
     *
     * @param   model {@link de.zalando.catalog.domain.article.facet.ArticleModel}
     *
     * @return  {@link de.zalando.purchase.pet.dto.PetArticleModelDTO}
     */
    public PetArticleModelDTO mapToModelDTO(final ArticleModel model) throws UnsupportedAttributeTypeException {
        final Stopwatch stopwatch = Stopwatch.createStarted();

        final PetArticleModelDTO petArticleModelDTO = petArticleMapper.mapToModelDTO(model);
        final boolean submittable = purchasingPetWebService.isArticleSubmittable(model.getSku().asString());
        petArticleModelDTO.setSubmitable(submittable);

        LOG.info("ArticleEnrichmentService.mapToModelDTO(model) takes {}", stopwatch.toString());

        return petArticleModelDTO;
    }
}
