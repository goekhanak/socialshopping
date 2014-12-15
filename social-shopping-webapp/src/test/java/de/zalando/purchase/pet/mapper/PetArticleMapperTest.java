package de.zalando.purchase.pet.mapper;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import static de.zalando.purchase.pet.util.builder.DefaultTestValues.ATTRIBUTE_DEFINITION_CODE_CONFIG;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.ATTRIBUTE_DEFINITION_CODE_MODEL;

import java.util.ArrayList;

import org.junit.Before;
import org.junit.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.google.common.collect.Lists;

import de.zalando.catalog.domain.article.facet.ArticleConfig;
import de.zalando.catalog.domain.article.facet.ArticleModel;
import de.zalando.catalog.domain.article.facet.SalesConfig;
import de.zalando.catalog.domain.article.facet.SalesModel;
import de.zalando.catalog.domain.article.facet.SupplierConfig;
import de.zalando.catalog.domain.article.facet.SupplierContainerConfig;
import de.zalando.catalog.domain.article.facet.SupplierContainerModel;
import de.zalando.catalog.domain.article.facet.SupplierModel;
import de.zalando.catalog.domain.attribute.ArticleState;
import de.zalando.catalog.domain.attribute.AttributeDefinition;
import de.zalando.catalog.domain.sku.SkuType;

import de.zalando.domain.ShopFrontendType;

import de.zalando.purchase.pet.dto.PetArticleConfigDTO;
import de.zalando.purchase.pet.dto.PetArticleModelDTO;
import de.zalando.purchase.pet.exception.UnsupportedAttributeTypeException;
import de.zalando.purchase.pet.service.AttributeDefinitionService;
import de.zalando.purchase.pet.util.builder.ArticleModelBuilder;
import de.zalando.purchase.pet.util.builder.AttributeDefinitionBuilder;

/**
 * @author  goekhan created on 8/21/14.
 */
public class PetArticleMapperTest {

    @Mock
    private AttributeDefinitionService attributeDefinitionService;

    @InjectMocks
    private final PetArticleMapper petArticleMapper = new PetArticleMapper();

    private ArticleModel model;

    private ArticleConfig config;

    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);

        final AttributeDefinition configAttrDef = AttributeDefinitionBuilder.defaultValues().build();
        final AttributeDefinition modelAttrDef = AttributeDefinitionBuilder.defaultValues().withSkuType(SkuType.MODEL)
                                                                           .withAttributeDefinitionCode(
                ATTRIBUTE_DEFINITION_CODE_MODEL).build();
        final ArrayList<AttributeDefinition> attributeDefinitions = Lists.newArrayList(configAttrDef, modelAttrDef);
        Mockito.when(attributeDefinitionService.getAttributeDefinition(ATTRIBUTE_DEFINITION_CODE_MODEL)).thenReturn(
            modelAttrDef);
        Mockito.when(attributeDefinitionService.getAttributeDefinition(ATTRIBUTE_DEFINITION_CODE_CONFIG)).thenReturn(
            configAttrDef);
        Mockito.when(attributeDefinitionService.getAllAttributeDefinitions()).thenReturn(attributeDefinitions);

        model = ArticleModelBuilder.defaultValues().build();
        config = model.getChildren().get(0);
        config.setMainSupplierCode(null);
    }

    @Test
    public void verifyMapToModelDTO() throws UnsupportedAttributeTypeException {

        final PetArticleModelDTO modelDTO = petArticleMapper.mapToModelDTO(model);

        assertEquals(model.getSku().asString(), modelDTO.getModelSku());
        assertEquals(model.getName(), modelDTO.getName());
        assertEquals(model.getCommodityGroupCode().getCode(), modelDTO.getCommodityGroupCode());
        assertEquals(model.getSilhouetteCode().getCode(), modelDTO.getSilhouetteCode());
        assertEquals(model.getChildren().size(), modelDTO.getConfigs().size());

        final SupplierContainerModel supplierContainerModel = model.getFacet(SupplierContainerModel.class);
        final SupplierModel supplierModel = supplierContainerModel.getSupplierByCode(model.getMainSupplierCode());
        assertEquals(supplierModel.getArticleCode(), modelDTO.getSupplierArticleCode());

        final PetArticleConfigDTO configDTO = modelDTO.getConfigs().get(0);

        assertEquals(config.getSku().asString(), configDTO.getConfigSku());
        assertEquals(config.getMainColorCode().getCode(), configDTO.getMainColorCode());
        assertEquals(config.getSecondColorCode().getCode(), configDTO.getSecondColorCode());
        assertEquals(config.getThirdColorCode().getCode(), configDTO.getThirdColorCode());
        assertEquals(config.getMainMaterialCode().getCode(), configDTO.getMainMaterialCode());
        assertEquals(config.getPatternTypeCode().getCode(), configDTO.getPatternTypeCode());

        final SupplierContainerConfig supplierContainerConfig = config.getFacet(SupplierContainerConfig.class);
        final String mainSupplierCode = config.getMainSupplierCode() == null ? config
                .getParent().getMainSupplierCode() : config.getMainSupplierCode();
        final SupplierConfig supplierConfig = supplierContainerConfig.getSupplierByCode(mainSupplierCode);
        assertEquals(supplierConfig.getArticleCode(), configDTO.getSupplierArticleCode());

        final SalesModel salesModel = model.getFacet(SalesModel.class);
        // assertEquals(salesModel.getAttributeValues(), modelDTO.getAttributeValues());

        final SalesConfig salesConfig = config.getFacet(SalesConfig.class);

        if (salesConfig.getTrend1TypeCode() != null) {
            assertEquals(salesConfig.getTrend1TypeCode().getCode(), configDTO.getTrend1Code());
        }

        if (salesConfig.getTrend2TypeCode() != null) {
            assertEquals(salesConfig.getTrend2TypeCode().getCode(), configDTO.getTrend2Code());
        }

        final boolean ConfigInProduction = salesConfig.getArticleState(ShopFrontendType.ZALANDO_SHOP)
                != ArticleState.BEFORE_PRODUCTION;
        assertEquals(ConfigInProduction, configDTO.isInProduction());

        // assertEquals(salesConfig.getAttributeValues(), configDTO.getAttributeValues());

        assertTrue(modelDTO.isEnriched());
        assertTrue(configDTO.isEnriched());
    }

    @Test
    public void verifyMapToModelDTONotEnriched() throws UnsupportedAttributeTypeException {

        model.getFacet(SalesModel.class).getAttributeValues().clear();

        final ArticleConfig config = model.getChildren().get(0);
        config.getFacet(SalesConfig.class).getAttributeValues().clear();

        final PetArticleModelDTO modelDTO = petArticleMapper.mapToModelDTO(model);

        final PetArticleConfigDTO configDTO = modelDTO.getConfigs().get(0);

        assertFalse(modelDTO.isEnriched());
        assertFalse(configDTO.isEnriched());
    }

}
