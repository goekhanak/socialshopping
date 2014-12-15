package de.zalando.purchase.pet.mapper;

import static com.google.common.collect.Lists.newArrayList;
import static com.google.common.collect.Maps.newHashMap;

import java.util.HashMap;
import java.util.List;
import java.util.Set;

import javax.annotation.Nullable;

import javax.inject.Inject;

import org.springframework.stereotype.Service;

import com.google.common.collect.Sets;

import de.zalando.catalog.domain.article.facet.ArticleConfig;
import de.zalando.catalog.domain.article.facet.ArticleModel;
import de.zalando.catalog.domain.article.facet.SalesConfig;
import de.zalando.catalog.domain.article.facet.SalesModel;
import de.zalando.catalog.domain.article.facet.SupplierConfig;
import de.zalando.catalog.domain.article.facet.SupplierContainerConfig;
import de.zalando.catalog.domain.article.facet.SupplierContainerModel;
import de.zalando.catalog.domain.article.facet.SupplierModel;
import de.zalando.catalog.domain.attribute.ArticleState;
import de.zalando.catalog.domain.attribute.AttributeAccessProfileCode;
import de.zalando.catalog.domain.attribute.AttributeConstraint;
import de.zalando.catalog.domain.attribute.AttributeDefinition;
import de.zalando.catalog.domain.attribute.AttributeDefinitionCode;
import de.zalando.catalog.domain.attribute.AttributeValue;
import de.zalando.catalog.domain.attribute.AttributeValueOption;
import de.zalando.catalog.domain.attribute.AttributeValueTag;
import de.zalando.catalog.domain.silhouette.SilhouetteCode;
import de.zalando.catalog.domain.sku.SkuType;

import de.zalando.domain.ShopFrontendType;
import de.zalando.domain.TargetGroup;
import de.zalando.domain.TargetGroupDimension;
import de.zalando.domain.TargetGroupSet;

import de.zalando.purchase.masterdata.dto.enumaration.AgeGroup;
import de.zalando.purchase.masterdata.dto.enumaration.Gender;
import de.zalando.purchase.pet.dto.AbstractPetArticleDTO;
import de.zalando.purchase.pet.dto.AttributeValueDTO;
import de.zalando.purchase.pet.dto.PetArticleConfigDTO;
import de.zalando.purchase.pet.dto.PetArticleModelDTO;
import de.zalando.purchase.pet.exception.UnsupportedAttributeTypeException;
import de.zalando.purchase.pet.service.AttributeDefinitionService;

/**
 * @author  goekhan created on 8/20/14.
 */
@Service
public class PetArticleMapper {

    public static final String CATEGORY_MANAGEMENT_ACCESS_PROFILE_CODE = "CM";

    private static final AttributeAccessProfileCode ACCESS_PROFILE_CODE = new AttributeAccessProfileCode(
            CATEGORY_MANAGEMENT_ACCESS_PROFILE_CODE);

    @Inject
    private AttributeDefinitionService attributeDefinitionService;

    /**
     * Maps a {@link de.zalando.catalog.domain.article.facet.ArticleModel} to a
     * {@link de.zalando.purchase.pet.dto.PetArticleModelDTO}.
     *
     * @param   model {@link de.zalando.catalog.domain.article.facet.ArticleModel}
     *
     * @return  {@link de.zalando.purchase.pet.dto.PetArticleModelDTO}
     */
    public PetArticleModelDTO mapToModelDTO(final ArticleModel model) throws UnsupportedAttributeTypeException {

        final PetArticleModelDTO modelDto = new PetArticleModelDTO();

        modelDto.setModelSku(model.getSku().asString());
        modelDto.setName(model.getName());
        modelDto.setCommodityGroupCode(model.getCommodityGroupCode().getCode());

        final SilhouetteCode silhouetteCode = model.getSilhouetteCode();

        if (silhouetteCode != null) {
            modelDto.setSilhouetteCode(silhouetteCode.getCode());
        }

        final SupplierContainerModel supplierContainerModel = model.getFacet(SupplierContainerModel.class);
        final SupplierModel supplierModel = supplierContainerModel.getSupplierByCode(model.getMainSupplierCode());
        if (supplierModel != null) {
            modelDto.setSupplierArticleCode(supplierModel.getArticleCode());
        }

        fillModelDTOGenericAttr(model, modelDto);

        final SalesModel salesModel = model.getFacet(SalesModel.class);

        fillAttributesInDTO(modelDto, silhouetteCode, salesModel.getAttributeValues(), SkuType.MODEL);

        for (final ArticleConfig config : model.getChildren()) {
            modelDto.getConfigs().add(mapToConfigDTO(config));
        }

        modelDto.setInProduction(isInProduction(modelDto.getConfigs()));

        return modelDto;
    }

    /**
     * @return  true if any of configs is inProduction
     */
    private boolean isInProduction(final List<PetArticleConfigDTO> configs) {

        for (final PetArticleConfigDTO config : configs) {
            if (config.isInProduction()) {
                return true;
            }
        }

        return false;
    }

    /**
     * fills Gender, AgeGroup generic attributes in modelDto .
     *
     * @param  model {@link de.zalando.catalog.domain.article.facet.ArticleModel}
     * @param  modelDto {@link de.zalando.purchase.pet.dto.PetArticleModelDTO }
     */
    private void fillModelDTOGenericAttr(final ArticleModel model, final PetArticleModelDTO modelDto) {

        final TargetGroupSet targetGroupSet = model.getTargetGroupSet();
        final TargetGroupSet genderSet = targetGroupSet.filterByDimension(TargetGroupDimension.GENDER);

        for (final TargetGroup genderTargetGroup : genderSet) {
            modelDto.getGenderSet().add(Gender.valueOf(genderTargetGroup.name()));
        }

        final TargetGroupSet ageGroupSet = targetGroupSet.filterByDimension(TargetGroupDimension.AGE_GROUP);

        for (final TargetGroup ageGroup : ageGroupSet) {
            modelDto.getAgeGroupSet().add(AgeGroup.valueOf(ageGroup.name()));
        }
    }

    /**
     * Maps a {@link de.zalando.catalog.domain.article.facet.ArticleConfig} to a
     * {@link de.zalando.purchase.pet.dto.PetArticleConfigDTO}.
     *
     * @param   config {@link de.zalando.catalog.domain.article.facet.ArticleConfig}
     *
     * @return  {@link de.zalando.purchase.pet.dto.PetArticleConfigDTO}
     */
    private PetArticleConfigDTO mapToConfigDTO(final ArticleConfig config) throws UnsupportedAttributeTypeException {

        final PetArticleConfigDTO dto = new PetArticleConfigDTO();

        dto.setConfigSku(config.getSku().asString());

        dto.setMainColorCode(config.getMainColorCode().getCode());
        if (config.getSecondColorCode() != null) {
            dto.setSecondColorCode(config.getSecondColorCode().getCode());
        }

        if (config.getThirdColorCode() != null) {
            dto.setThirdColorCode(config.getThirdColorCode().getCode());
        }

        if (config.getMainMaterialCode() != null) {
            dto.setMainMaterialCode(config.getMainMaterialCode().getCode());
        }

        if (config.getPatternTypeCode() != null) {
            dto.setPatternTypeCode(config.getPatternTypeCode().getCode());
        }

        final SalesConfig salesConfig = config.getFacet(SalesConfig.class);

        if (salesConfig.getTrend1TypeCode() != null) {
            dto.setTrend1Code(salesConfig.getTrend1TypeCode().getCode());
        }

        if (salesConfig.getTrend2TypeCode() != null) {
            dto.setTrend2Code(salesConfig.getTrend2TypeCode().getCode());
        }

        // the production status is only relevant for ShopFrontendType.ZALANDO_SHOP
        final ArticleState articleState = salesConfig.getArticleState(ShopFrontendType.ZALANDO_SHOP);
        if (articleState != ArticleState.BEFORE_PRODUCTION) {
            dto.setInProduction(true);
        }

        fillSupplierArticleCode(config, dto);

        fillAttributesInDTO(dto, config.getParent().getSilhouetteCode(), salesConfig.getAttributeValues(),
            SkuType.CONFIG);

        return dto;
    }

    /**
     * Fill supplier article code of PetArticleConfigDTO from respective ArticleConfig.
     *
     * @param  config
     * @param  dto
     */
    private void fillSupplierArticleCode(final ArticleConfig config, final PetArticleConfigDTO dto) {
        final SupplierContainerConfig supplierContainerConfig = config.getFacet(SupplierContainerConfig.class);

        // sometimes config has null main supplier code
        final String mainSupplierCode = config.getMainSupplierCode() == null ? config
                .getParent().getMainSupplierCode() : config.getMainSupplierCode();

        final SupplierConfig supplierConfig = supplierContainerConfig.getSupplierByCode(mainSupplierCode);
        if (supplierConfig != null) {
            dto.setSupplierArticleCode(supplierConfig.getArticleCode());
        }
    }

    /**
     * Fills the attribute values of AbstractPetArticleDTO and set enriched flag true when the article fully enriched.
     *
     * @param  dto {@link de.zalando.purchase.pet.dto.AbstractPetArticleDTO}
     * @param  silhouetteCode {@link de.zalando.catalog.domain.silhouette.SilhouetteCode}
     * @param  attributeValues {@link java.util.List} of {@link de.zalando.catalog.domain.attribute.AttributeValue}
     * @param  skuType {@link de.zalando.catalog.domain.sku.SkuType}
     */
    private void fillAttributesInDTO(final AbstractPetArticleDTO dto, final SilhouetteCode silhouetteCode,
            @Nullable List<AttributeValue<?>> attributeValues, final SkuType skuType)
        throws UnsupportedAttributeTypeException {

        final HashMap<String, AttributeValueDTO> attrValuesMap = newHashMap();

        // SONAR-issue attributeValues can be null
        if (attributeValues == null) {
            attributeValues = newArrayList();
        }

        for (final AttributeValue<?> attrValue : attributeValues) {
            final String attrDefCode = attrValue.getAttributeDefinitionCode().getCode();

            if (isNotCategoryManagementAttribute(attrDefCode)) {
                continue;
            }

            if (attrValuesMap.containsKey(attrDefCode)) {
                attrValuesMap.get(attrDefCode).getValues().add(mapAttrValue(attrValue));
            } else {

                // SONAR-issue here new AttributeValueDTO in the loop make sense
                final AttributeValueDTO attrValueDTO = new AttributeValueDTO();
                attrValueDTO.setAttributeDefinitionCode(attrDefCode);
                attrValueDTO.setType(attrValue.getType());
                attrValueDTO.getValues().add(mapAttrValue(attrValue));
                if (!attrValueDTO.getValues().isEmpty()) {
                    attrValuesMap.put(attrDefCode, attrValueDTO);
                }
            }
        }

        dto.getAttributeValues().addAll(attrValuesMap.values());

        if (getMissingMandatoryCMAttributes(silhouetteCode, attributeValues, skuType).isEmpty()) {
            dto.setEnriched(true);
        }
    }

    /**
     * @return  true if the attribute is not Category Management attribute. Otherwise false.
     */
    private boolean isNotCategoryManagementAttribute(final String attrDefCode) {

        final AttributeDefinition attributeDefinition = attributeDefinitionService.getAttributeDefinition(attrDefCode);
        return attributeDefinition == null || attributeDefinition.getAccessProfileCodes() == null
                || !attributeDefinition.getAccessProfileCodes().contains(ACCESS_PROFILE_CODE);
    }

    private String mapAttrValue(final AttributeValue<?> attrValue) throws UnsupportedAttributeTypeException {

        switch (attrValue.getType()) {

            case OPTION :
                return ((AttributeValueOption) attrValue).getValue().getCode();

            case TAG :
                return ((AttributeValueTag) attrValue).getValue().getCode();

            default :
                throw new UnsupportedAttributeTypeException(attrValue.getAttributeDefinitionCode().getCode(),
                    attrValue.getType());
        }
    }

    /**
     * Get missing category management attributte definitions for a given silhouetteCode and list attribute value list.
     *
     * @param   silhouetteCode   String
     * @param   attributeValues {@link java.util.List} of {@link de.zalando.catalog.domain.attribute.AttributeValue}
     * @param   skuType {@link de.zalando.catalog.domain.sku.SkuType}
     *
     * @return  {@link java.util.List} of {@link de.zalando.catalog.domain.attribute.AttributeValue}
     */

    public List<AttributeDefinition> getMissingMandatoryCMAttributes(final SilhouetteCode silhouetteCode,
            final List<AttributeValue<?>> attributeValues, final SkuType skuType) {

        final List<AttributeDefinition> attributeDefinitions = attributeDefinitionService.getAllAttributeDefinitions();
        final List<AttributeDefinition> result = newArrayList();

        final Set<AttributeDefinitionCode> attributeValueDefinitionCodes = Sets.newHashSet();

        if (attributeValues != null) {
            for (final AttributeValue<?> attrValue : attributeValues) {
                attributeValueDefinitionCodes.add(attrValue.getAttributeDefinitionCode());
            }
        }

        for (final AttributeDefinition attributeDefinition : attributeDefinitions) {

            if (isMissingMandatoryAttribute(skuType, attributeValueDefinitionCodes, attributeDefinition,
                        silhouetteCode)) {
                result.add(attributeDefinition);
            }
        }

        return result;
    }

    /**
     * Returns true if the attributeDefinition is for the skuType and mandatory and CM attribute and there exists no
     * attribute value for this attribute.
     *
     * @param  skuType
     * @param  attributeValueDefinitionCodes
     * @param  attributeDefinition
     * @param  silhouetteCode
     */
    private boolean isMissingMandatoryAttribute(final SkuType skuType,
            final Set<AttributeDefinitionCode> attributeValueDefinitionCodes,
            final AttributeDefinition attributeDefinition, final SilhouetteCode silhouetteCode) {

        // Ignore attribute definition wrong sku type
        if (attributeDefinition.getSkuType() != skuType) {
            return false;
        }

        // Not CM Attribute
        if (!attributeDefinition.getAccessProfileCodes().contains(ACCESS_PROFILE_CODE)) {
            return false;
        }

        final AttributeConstraint attributeConstraint = attributeDefinition.getConstraintBySilhouette(silhouetteCode);

        // There is no constraint for the attribute value or it is not mandatory
        if (attributeConstraint == null || !attributeConstraint.isRequired()) {
            return false;
        }

        // There exists a attribute value therefore not missing
        if (attributeValueDefinitionCodes.contains(attributeDefinition.getCode())) {
            return false;
        }

        return true;
    }

    /**
     * @param   dtos {@link java.util.List} of {@link de.zalando.purchase.pet.dto.AttributeValueDTO}
     * @param   attributeValues {@link java.util.List} of {@link de.zalando.catalog.domain.attribute.AttributeValue}
     *
     * @return  {@link java.util.List} of {@link de.zalando.catalog.domain.attribute.AttributeValue}
     */
    public List<AttributeValue<?>> mapToAttributeValues(final List<AttributeValueDTO> dtos,
            final List<AttributeValue<?>> attributeValues) {

        final List<AttributeValue<?>> updatedAttributeValues = newArrayList();

        // Do not update non CM attributes keep them as they are
        if (attributeValues != null) {
            for (final AttributeValue<?> attributeValue : attributeValues) {
                if (isNotCategoryManagementAttribute(attributeValue.getAttributeDefinitionCode().getCode())) {
                    updatedAttributeValues.add(attributeValue);
                }
            }
        }

        // Update the edited attributes
        for (final AttributeValueDTO dto : dtos) {
            for (final String value : dto.getValues()) {

                // SONAR-issue here new AttributeDefinitionCode in the loop make sense
                final AttributeValue<?> attrValue = AttributeValue.valueOf(dto.getType(),
                        new AttributeDefinitionCode(dto.getAttributeDefinitionCode()), value);
                updatedAttributeValues.add(attrValue);
            }
        }

        return updatedAttributeValues;
    }

}
