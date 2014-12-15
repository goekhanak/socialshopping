package de.zalando.purchase.pet.dto;

import static com.google.common.collect.Lists.newArrayList;
import static com.google.common.collect.Sets.newHashSet;

import java.util.List;
import java.util.Set;

import com.google.common.base.Objects;

import de.zalando.purchase.masterdata.dto.enumaration.AgeGroup;
import de.zalando.purchase.masterdata.dto.enumaration.Gender;

/**
 * @author  goekhan created on 8/20/14.
 */
public class PetArticleModelDTO extends AbstractPetArticleDTO {
    private static final long serialVersionUID = -6178021478129094579L;

    private String name;
    private String commodityGroupCode;
    private String silhouetteCode;

    // generic attributes
    private Set<Gender> genderSet;
    private Set<AgeGroup> ageGroupSet;

    private boolean submitable;

    private List<PetArticleConfigDTO> configs;

    public String getModelSku() {
        return getSku();
    }

    public void setModelSku(final String modelSku) {
        setSku(modelSku);
    }

    public String getName() {
        return name;
    }

    public void setName(final String name) {
        this.name = name;
    }

    public String getCommodityGroupCode() {
        return commodityGroupCode;
    }

    public void setCommodityGroupCode(final String commodityGroupCode) {
        this.commodityGroupCode = commodityGroupCode;
    }

    public String getSilhouetteCode() {
        return silhouetteCode;
    }

    public void setSilhouetteCode(final String silhouetteCode) {
        this.silhouetteCode = silhouetteCode;
    }

    public List<PetArticleConfigDTO> getConfigs() {
        if (configs == null) {
            configs = newArrayList();
        }

        return configs;
    }

    public void setConfigs(final List<PetArticleConfigDTO> configs) {
        this.configs = configs;
    }

    /**
     * Getter for property 'genderSet'.
     *
     * @return  Value for property 'genderSet'.
     */
    public Set<Gender> getGenderSet() {
        if (genderSet == null) {
            genderSet = newHashSet();
        }

        return genderSet;
    }

    /**
     * Setter for property 'genderSet'.
     *
     * @param  genderSet  Value to set for property 'genderSet'.
     */
    public void setGenderSet(final Set<Gender> genderSet) {
        this.genderSet = genderSet;
    }

    /**
     * Getter for property 'ageGroupSet'.
     *
     * @return  Value for property 'ageGroupSet'.
     */
    public Set<AgeGroup> getAgeGroupSet() {
        if (ageGroupSet == null) {
            ageGroupSet = newHashSet();
        }

        return ageGroupSet;
    }

    /**
     * Setter for property 'ageGroupSet'.
     *
     * @param  ageGroupSet  Value to set for property 'ageGroupSet'.
     */
    public void setAgeGroupSet(final Set<AgeGroup> ageGroupSet) {
        this.ageGroupSet = ageGroupSet;
    }

    /**
     * Getter for property 'submitable'.
     *
     * @return  Value for property 'submitable'.
     */
    public boolean isSubmitable() {
        return submitable;
    }

    /**
     * Setter for property 'submitable'.
     *
     * @param  submitable  Value to set for property 'submitable'.
     */
    public void setSubmitable(final boolean submitable) {
        this.submitable = submitable;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this).add("", super.toString()).add("name", name)
                      .add("commodityGroupCode", commodityGroupCode).add("silhouetteCode", silhouetteCode)
                      .add("genderSet", genderSet).add("ageGroupSet", ageGroupSet).add("submitable", submitable)
                      .add("configs", configs).toString();
    }
}
