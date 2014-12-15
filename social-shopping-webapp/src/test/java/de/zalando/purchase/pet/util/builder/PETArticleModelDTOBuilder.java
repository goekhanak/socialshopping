package de.zalando.purchase.pet.util.builder;

import static com.google.common.collect.Lists.newArrayList;
import static com.google.common.collect.Sets.newHashSet;

import static de.zalando.purchase.masterdata.dto.enumaration.AgeGroup.AGE_GROUP_ADULT;
import static de.zalando.purchase.masterdata.dto.enumaration.AgeGroup.AGE_GROUP_TEEN;
import static de.zalando.purchase.masterdata.dto.enumaration.Gender.GENDER_FEMALE;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.MODEL_SKU;
import static de.zalando.purchase.pet.util.builder.DefaultTestValues.SILHOUETTE_CODE;

import java.util.List;
import java.util.Set;

import de.zalando.purchase.masterdata.dto.enumaration.AgeGroup;
import de.zalando.purchase.masterdata.dto.enumaration.Gender;
import de.zalando.purchase.pet.dto.PetArticleConfigDTO;
import de.zalando.purchase.pet.dto.PetArticleModelDTO;

/**
 * @author  goekhan created on on 14/Nov/2014.
 */
public class PETArticleModelDTOBuilder {
    private final PetArticleModelDTO modelDTO;
    private String modelSku;
    private List<PetArticleConfigDTO> configs = newArrayList();
    private Set<AgeGroup> ageGroupSet = newHashSet();
    private Set<Gender> genderSet = newHashSet();
    private String silhouetteCode;

    public PETArticleModelDTOBuilder() {
        this.modelDTO = new PetArticleModelDTO();
    }

    public static PETArticleModelDTOBuilder defaultValues() {
        final PETArticleModelDTOBuilder builder = new PETArticleModelDTOBuilder();

        builder.withModelSku(MODEL_SKU);
        builder.withAgeGroup(AGE_GROUP_ADULT);
        builder.withAgeGroup(AGE_GROUP_TEEN);
        builder.withGender(GENDER_FEMALE);
        builder.withSilhouetteCode(SILHOUETTE_CODE);

        return builder;
    }

    public PetArticleModelDTO build() {
        modelDTO.setModelSku(modelSku);
        modelDTO.setAgeGroupSet(ageGroupSet);
        modelDTO.setGenderSet(genderSet);
        modelDTO.setConfigs(configs);
        modelDTO.setSilhouetteCode(silhouetteCode);

        return modelDTO;
    }

    public PETArticleModelDTOBuilder withModelSku(final String modelSku) {
        this.modelSku = modelSku;
        return this;
    }

    public PETArticleModelDTOBuilder withSilhouetteCode(final String silhouetteCode) {
        this.silhouetteCode = silhouetteCode;
        return this;
    }

    public PETArticleModelDTOBuilder withConfig(final PetArticleConfigDTO configDTO) {
        configs.add(configDTO);
        return this;
    }

    public PETArticleModelDTOBuilder withAgeGroup(final AgeGroup ageGroup) {
        ageGroupSet.add(ageGroup);
        return this;
    }

    public PETArticleModelDTOBuilder withGender(final Gender gender) {
        genderSet.add(gender);
        return this;
    }
}
