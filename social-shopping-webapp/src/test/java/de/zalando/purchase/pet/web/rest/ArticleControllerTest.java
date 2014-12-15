package de.zalando.purchase.pet.web.rest;

import static org.junit.Assert.assertEquals;

import static org.mockito.Matchers.anyString;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.lang.reflect.Method;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import org.junit.runner.RunWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import org.springframework.context.annotation.Configuration;

import org.springframework.http.ResponseEntity;

import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import org.springframework.web.method.HandlerMethod;
import org.springframework.web.method.annotation.ExceptionHandlerMethodResolver;
import org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver;
import org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod;

import de.zalando.catalog.domain.article.facet.ArticleModel;

import de.zalando.purchase.pet.dto.PetArticleModelDTO;
import de.zalando.purchase.pet.exception.ModelNotFoundException;
import de.zalando.purchase.pet.service.ArticleEnrichmentService;
import de.zalando.purchase.pet.web.rest.advice.GlobalDefaultExceptionHandler;

/**
 * @author  goekhan created on 8/20/14.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration
public class ArticleControllerTest {

    public static final String MODEL_SKU = "AD115A00U";
    public static final String INVALID_SKU = "ABC";

    @Mock
    private ArticleEnrichmentService articleEnrichmentService;

    private MockMvc mockMvc;

    @InjectMocks
    ArticleController articleController = new ArticleController();

    static final String REST_ARTICLE_PREFIX = "/rest/article/";

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);

        this.mockMvc = MockMvcBuilders.standaloneSetup(articleController)
                                      .setHandlerExceptionResolvers(createExceptionResolver()).build();

        Mockito.when(articleEnrichmentService.getArticleModel(anyString())).thenReturn(new ArticleModel());

    }

    @Test
    public void testGetArticleModel() throws Exception {

        final ArticleModel model = new ArticleModel();
        Mockito.when(articleEnrichmentService.getArticleModel(anyString())).thenReturn(model);

        final PetArticleModelDTO modelDto = new PetArticleModelDTO();
        Mockito.when(articleEnrichmentService.mapToModelDTO(model)).thenReturn(modelDto);

        try {
            final ResponseEntity<PetArticleModelDTO> responseEntity = articleController.getArticleModel(MODEL_SKU);
            assertEquals(modelDto, responseEntity.getBody());
        } catch (final ModelNotFoundException e) {
            Assert.fail("ModelNotFoundException should not be thrown!");
        }
    }

    @Test
    public void testGetArticleModelRest() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get(REST_ARTICLE_PREFIX + MODEL_SKU)).andExpect(status().isOk());
    }

    @Test
    public void testGetArticleModelInvalidModelSKURest() throws Exception {
        Mockito.when(articleEnrichmentService.getArticleModel(anyString())).thenThrow(new ModelNotFoundException(""));
        mockMvc.perform(MockMvcRequestBuilders.get(REST_ARTICLE_PREFIX + INVALID_SKU)).andExpect(status()
                .is4xxClientError());
    }

    private ExceptionHandlerExceptionResolver createExceptionResolver() {
        final ExceptionHandlerExceptionResolver exceptionResolver = new ExceptionHandlerExceptionResolver() {
            @Override
            protected ServletInvocableHandlerMethod getExceptionHandlerMethod(final HandlerMethod handlerMethod,
                    final Exception exception) {
                final Method method = new ExceptionHandlerMethodResolver(GlobalDefaultExceptionHandler.class)
                        .resolveMethod(exception);
                return new ServletInvocableHandlerMethod(new GlobalDefaultExceptionHandler(), method);
            }
        };
        exceptionResolver.afterPropertiesSet();
        return exceptionResolver;
    }

    @Configuration
    static class TestConfig { }

}
