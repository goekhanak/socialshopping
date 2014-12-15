package de.zalando.purchase.pet.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anySet;
import static org.mockito.Matchers.anySetOf;
import static org.mockito.Matchers.anyString;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static com.google.common.collect.Lists.newArrayList;

import static de.zalando.purchase.pet.util.builder.DefaultTestValues.MODEL_SKU;

import java.util.ArrayList;
import java.util.List;

import javax.xml.soap.SOAPException;

import org.hamcrest.Description;
import org.hamcrest.TypeSafeMatcher;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;

import org.junit.rules.ExpectedException;

import org.junit.runner.RunWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.context.annotation.Configuration;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.netflix.hystrix.exception.HystrixBadRequestException;

import de.zalando.catalog.domain.article.ArticleFacetType;
import de.zalando.catalog.domain.article.facet.ArticleModel;
import de.zalando.catalog.domain.article.facet.SalesConfig;
import de.zalando.catalog.domain.article.facet.SalesModel;
import de.zalando.catalog.domain.attribute.AttributeDefinition;
import de.zalando.catalog.domain.attribute.AttributeValue;
import de.zalando.catalog.domain.sku.ModelSku;
import de.zalando.catalog.domain.sku.SkuType;
import de.zalando.catalog.webservice.reading.ArticleReadWebService;
import de.zalando.catalog.webservice.writing.PurchasingWriteWebService;

import de.zalando.domain.TargetGroupSet;

import de.zalando.purchase.backend.webservice.dto.paging.CustomPageDTO;
import de.zalando.purchase.backend.webservice.dto.pet.ArticleTaskResult;
import de.zalando.purchase.backend.webservice.dto.pet.ArticleTaskSearchCriteria;
import de.zalando.purchase.backend.webservice.service.PurchasingPetWebService;
import de.zalando.purchase.pet.dto.PetArticleConfigDTO;
import de.zalando.purchase.pet.dto.PetArticleModelDTO;
import de.zalando.purchase.pet.exception.ArticleAlreadySubmittedException;
import de.zalando.purchase.pet.exception.ModelNotFoundException;
import de.zalando.purchase.pet.exception.SubmitArticleModelException;
import de.zalando.purchase.pet.exception.UnsupportedAttributeTypeException;
import de.zalando.purchase.pet.mapper.PetArticleMapper;
import de.zalando.purchase.pet.security.SecurityUtils;
import de.zalando.purchase.pet.security.ZEOSPrivileges;
import de.zalando.purchase.pet.util.SOAPFaultTestException;
import de.zalando.purchase.pet.util.builder.ArticleConfigBuilder;
import de.zalando.purchase.pet.util.builder.ArticleModelBuilder;
import de.zalando.purchase.pet.util.builder.AttributeDefinitionBuilder;
import de.zalando.purchase.pet.util.builder.PETArticleModelDTOBuilder;
import de.zalando.purchase.pet.util.builder.PetArticleConfigDTOBuilder;

/**
 * @author  goekhan created on on 16/Sep/2014.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration
public class ArticleEnrichmentServiceTest {

    public static final String INVALID_SKU = "ABC";
    public static final String USER_EMAIL = "some.buyer@zalando.de";
    public static final String ALTERNATIVE_SILHOUETTE_CODE = "alternative-silhouette";

    @Mock
    private ArticleReadWebService articleReadWebService;

    @Mock
    private PurchasingWriteWebService purchasingWriteWebService;

    @Mock
    private PurchasingPetWebService purchasingPetWebService;

    @Mock
    private PetArticleMapper petArticleMapper;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private final ArticleEnrichmentService articleEnrichmentService = new ArticleEnrichmentService();

    @Rule
    public final ExpectedException expectedException = ExpectedException.none();

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);

        when(articleReadWebService.getArticleModel(any(ModelSku.class), anySet())).thenReturn(new ArticleModel());
        when(purchasingPetWebService.isArticleSubmittable(anyString())).thenReturn(true);

        final ArticleModel articleModel = ArticleModelBuilder.defaultValues().withTargetGroupSet(TargetGroupSet.all())
                                                             .withArticleConfig(ArticleConfigBuilder.defaultValues()
                    .build()).build();
        when(articleReadWebService.getArticleModel(any(ModelSku.class), anySetOf(ArticleFacetType.class))).thenReturn(
            articleModel);

        final UserDetails user = new User(USER_EMAIL, "", new ArrayList<GrantedAuthority>());
        when(securityUtils.getCurrentUser()).thenReturn(user);
    }

    @Test
    public void testSearchArticleTestsAdminUser() {
        when(securityUtils.currentUserHasPrivilege(ZEOSPrivileges.PRIVILEGE_ADMIN)).thenReturn(true);

        final ArticleTaskSearchCriteria criteria = new ArticleTaskSearchCriteria();
        final CustomPageDTO<ArticleTaskResult> expectedSearchResult = new CustomPageDTO<ArticleTaskResult>();
        when(purchasingPetWebService.getArticleTasks(criteria)).thenReturn(expectedSearchResult);

        final CustomPageDTO<ArticleTaskResult> searchResult = articleEnrichmentService.searchArticleTasks(criteria);

        assertTrue(criteria.isAdminUser());
        assertEquals(USER_EMAIL, criteria.getUserEmail());
        assertEquals(expectedSearchResult, searchResult);
    }

    @Test
    public void testSearchArticleTestsNonAdminUser() {
        when(securityUtils.currentUserHasPrivilege(ZEOSPrivileges.PRIVILEGE_ADMIN)).thenReturn(false);

        final ArticleTaskSearchCriteria criteria = new ArticleTaskSearchCriteria();
        final CustomPageDTO<ArticleTaskResult> expectedSearchResult = new CustomPageDTO<ArticleTaskResult>();
        when(purchasingPetWebService.getArticleTasks(criteria)).thenReturn(expectedSearchResult);

        final CustomPageDTO<ArticleTaskResult> searchResult = articleEnrichmentService.searchArticleTasks(criteria);

        assertFalse(criteria.isAdminUser());
        assertEquals(USER_EMAIL, criteria.getUserEmail());
        assertEquals(expectedSearchResult, searchResult);
    }

    @Test
    public void updateArticleModel() throws ModelNotFoundException {
        final PetArticleConfigDTO configDTO = PetArticleConfigDTOBuilder.defaultValues().build();
        final PetArticleModelDTO modelDTO = PETArticleModelDTOBuilder.defaultValues().withConfig(configDTO).build();
        final ArticleModel model = ArticleModelBuilder.defaultValues().build();

        when(articleReadWebService.getArticleModel(any(ModelSku.class), anySetOf(ArticleFacetType.class))).thenReturn(
            model);
        articleEnrichmentService.updateArticleModel(modelDTO);

        verify(purchasingWriteWebService).updateArticleModelOnly(model);
        verify(purchasingWriteWebService).createOrUpdateModelFacetOnly(model.getFacet(SalesModel.class));
    }

    @Test
    public void updateArticleModelNoPreviousSilhouette() throws ModelNotFoundException {
        final PetArticleConfigDTO configDTO = PetArticleConfigDTOBuilder.defaultValues().build();
        final PetArticleModelDTO modelDTO = PETArticleModelDTOBuilder.defaultValues().withConfig(configDTO).build();
        final ArticleModel model = ArticleModelBuilder.defaultValues().withSilhouetteCode(null).build();

        when(articleReadWebService.getArticleModel(any(ModelSku.class), anySetOf(ArticleFacetType.class))).thenReturn(
            model);
        articleEnrichmentService.updateArticleModel(modelDTO);

        verify(purchasingWriteWebService).updateArticleModelOnly(model);
        verify(purchasingWriteWebService).createOrUpdateModelFacetOnly(model.getFacet(SalesModel.class));
    }

    @Test
    public void updateArticleModelDifferentSilhouette() throws ModelNotFoundException {
        final PetArticleConfigDTO configDTO = PetArticleConfigDTOBuilder.defaultValues().build();
        final PetArticleModelDTO modelDTO = PETArticleModelDTOBuilder.defaultValues().withConfig(configDTO).build();
        final ArticleModel model = ArticleModelBuilder.defaultValues().withSilhouetteCode(ALTERNATIVE_SILHOUETTE_CODE)
                                                      .build();

        when(articleReadWebService.getArticleModel(any(ModelSku.class), anySetOf(ArticleFacetType.class))).thenReturn(
            model);
        articleEnrichmentService.updateArticleModel(modelDTO);

        verify(purchasingWriteWebService).updateArticleModelOnly(model);
        verify(purchasingWriteWebService, times(2)).createOrUpdateModelFacetOnly(model.getFacet(SalesModel.class));
        verify(articleReadWebService, times(2)).getArticleModel(any(ModelSku.class), anySetOf(ArticleFacetType.class));
    }

    @Test
    public void testGetArticleModelInvalidModelSKU() throws ModelNotFoundException {

        expectedException.expect(HystrixBadRequestException.class);
        expectedException.expectCause(new CauseMatcher(ModelNotFoundException.class, INVALID_SKU));
        articleEnrichmentService.getArticleModel(INVALID_SKU);
    }

    @Test
    public void testGetArticleModelNonFoundModelSKU() throws SOAPException, ModelNotFoundException {

        when(articleReadWebService.getArticleModel(any(ModelSku.class), anySetOf(ArticleFacetType.class))).thenThrow(
            new SOAPFaultTestException());
        expectedException.expect(HystrixBadRequestException.class);
        expectedException.expectCause(new CauseMatcher(ModelNotFoundException.class, MODEL_SKU));

        articleEnrichmentService.getArticleModel(MODEL_SKU);
    }

    @Test
    public void testGetArticleModelForNullModelSKU() throws ModelNotFoundException {

        when(articleReadWebService.getArticleModel(any(ModelSku.class), anySetOf(ArticleFacetType.class))).thenReturn(
            null);
        expectedException.expect(HystrixBadRequestException.class);
        expectedException.expectCause(new CauseMatcher(ModelNotFoundException.class, MODEL_SKU));

        articleEnrichmentService.getArticleModel(MODEL_SKU);
    }

    private static class CauseMatcher extends TypeSafeMatcher<Throwable> {

        private final Class<? extends Throwable> type;
        private final String expectedMessage;

        public CauseMatcher(final Class<? extends Throwable> type, final String expectedMessage) {
            this.type = type;
            this.expectedMessage = expectedMessage;
        }

        @Override
        protected boolean matchesSafely(final Throwable item) {
            return item.getClass().isAssignableFrom(type) && item.getMessage().contains(expectedMessage);
        }

        @Override
        public void describeTo(final Description description) {
            description.appendText("expects type ").appendValue(type).appendText(" and a message ").appendValue(
                expectedMessage);
        }
    }

    @Test
    public void checkIfArticleSubmittableTrue() throws ArticleAlreadySubmittedException {
        when(purchasingPetWebService.isArticleSubmittable(MODEL_SKU)).thenReturn(true);
        articleEnrichmentService.checkIfArticleSubmittable(MODEL_SKU);
    }

    @Test(expected = ArticleAlreadySubmittedException.class)
    public void testIfArticleSubmittableFalse() throws ArticleAlreadySubmittedException {
        when(purchasingPetWebService.isArticleSubmittable(MODEL_SKU)).thenReturn(false);
        articleEnrichmentService.checkIfArticleSubmittable(MODEL_SKU);
    }

    @Test
    public void testSubmitValidationHappyCase() throws SubmitArticleModelException {
        final ArticleModel articleModel = ArticleModelBuilder.defaultValues().withTargetGroupSet(TargetGroupSet.all())
                                                             .build();
        articleEnrichmentService.validateArticleForSubmit(articleModel);
    }

    @Test(expected = SubmitArticleModelException.class)
    public void testSubmitValidationNoSilhouetteCode() throws SubmitArticleModelException {
        final ArticleModel articleModel = ArticleModelBuilder.defaultValues().withTargetGroupSet(TargetGroupSet.all())
                                                             .withSilhouetteCode(null).build();
        articleEnrichmentService.validateArticleForSubmit(articleModel);
    }

    @Test(expected = SubmitArticleModelException.class)
    public void testSubmitValidationNoGenericAttr() throws SubmitArticleModelException {
        final ArticleModel articleModel = ArticleModelBuilder.defaultValues().withTargetGroupSet(TargetGroupSet.none())
                                                             .build();
        articleEnrichmentService.validateArticleForSubmit(articleModel);
    }

    @Test(expected = SubmitArticleModelException.class)
    public void testSubmitValidationModelRequiredAttrMissing() throws SubmitArticleModelException {
        final ArticleModel articleModel = ArticleModelBuilder.defaultValues().withTargetGroupSet(TargetGroupSet.all())
                                                             .build();

        final List<AttributeValue<?>> modelAttributeValues = articleModel.getFacet(SalesModel.class)
                                                                         .getAttributeValues();
        final List<AttributeDefinition> missingAttributeList = newArrayList();
        missingAttributeList.add(AttributeDefinitionBuilder.defaultValues().build());

        when(petArticleMapper.getMissingMandatoryCMAttributes(articleModel.getSilhouetteCode(), modelAttributeValues,
                SkuType.MODEL)).thenReturn(missingAttributeList);

        articleEnrichmentService.validateArticleForSubmit(articleModel);
    }

    @Test(expected = SubmitArticleModelException.class)
    public void testSubmitValidationConfigRequiredAttrMissing() throws SubmitArticleModelException {
        final ArticleModel articleModel = ArticleModelBuilder.defaultValues().withTargetGroupSet(TargetGroupSet.all())
                                                             .build();

        final List<AttributeValue<?>> configAttributeValues = articleModel.getChildren().get(0)
                                                                          .getFacet(SalesConfig.class)
                                                                          .getAttributeValues();
        final List<AttributeDefinition> missingAttributeList = newArrayList();
        missingAttributeList.add(AttributeDefinitionBuilder.defaultValues().build());

        when(petArticleMapper.getMissingMandatoryCMAttributes(articleModel.getSilhouetteCode(), configAttributeValues,
                SkuType.CONFIG)).thenReturn(missingAttributeList);

        articleEnrichmentService.validateArticleForSubmit(articleModel);
    }

    @Test
    public void testSubmitValidationInProduction() throws SubmitArticleModelException {
        final ArticleModel articleModel = ArticleModelBuilder.defaultValues().withTargetGroupSet(TargetGroupSet.none())
                                                             .withArticleConfig(ArticleConfigBuilder.defaultValues()
                    .withInProduction(true).build()).build();
        articleEnrichmentService.validateArticleForSubmit(articleModel);
    }

    @Test
    public void testSubmitArticleModel() throws ModelNotFoundException, SubmitArticleModelException {
        articleEnrichmentService.submitArticleModel(MODEL_SKU);
        verify(purchasingPetWebService).submitArticleTask(MODEL_SKU, USER_EMAIL);
    }

    @Test
    public void mapToModelDTO() throws UnsupportedAttributeTypeException {

        final ArticleModel articleModel = ArticleModelBuilder.defaultValues().build();

        final PetArticleModelDTO modelDto = new PetArticleModelDTO();
        when(petArticleMapper.mapToModelDTO(articleModel)).thenReturn(modelDto);

        PetArticleModelDTO resultModelDto = articleEnrichmentService.mapToModelDTO(articleModel);
        assertTrue(resultModelDto.isSubmitable());
        assertEquals(modelDto, resultModelDto);
    }

    @Configuration
    static class TestConfig { }
}
