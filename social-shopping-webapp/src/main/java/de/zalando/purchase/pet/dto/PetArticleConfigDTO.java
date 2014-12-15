package de.zalando.purchase.pet.dto;

import com.google.common.base.Objects;

/**
 * @author  goekhan created on 8/20/14.
 */
public class PetArticleConfigDTO extends AbstractPetArticleDTO {
    private static final long serialVersionUID = -7867223090292126065L;

    private String mainColorCode;
    private String secondColorCode;
    private String thirdColorCode;
    private String mainMaterialCode;
    private String patternTypeCode;

    /*Generic attributes */
    private String trend1Code;
    private String trend2Code;

    public String getMainColorCode() {
        return mainColorCode;
    }

    public void setMainColorCode(final String mainColorCode) {
        this.mainColorCode = mainColorCode;
    }

    public String getSecondColorCode() {
        return secondColorCode;
    }

    public void setSecondColorCode(final String secondColorCode) {
        this.secondColorCode = secondColorCode;
    }

    public String getThirdColorCode() {
        return thirdColorCode;
    }

    public void setThirdColorCode(final String thirdColorCode) {
        this.thirdColorCode = thirdColorCode;
    }

    public String getMainMaterialCode() {
        return mainMaterialCode;
    }

    public void setMainMaterialCode(final String mainMaterialCode) {
        this.mainMaterialCode = mainMaterialCode;
    }

    public String getPatternTypeCode() {
        return patternTypeCode;
    }

    public void setPatternTypeCode(final String patternTypeCode) {
        this.patternTypeCode = patternTypeCode;
    }

    public String getTrend1Code() {
        return trend1Code;
    }

    public void setTrend1Code(final String trend1Code) {
        this.trend1Code = trend1Code;
    }

    public String getTrend2Code() {
        return trend2Code;
    }

    public void setTrend2Code(final String trend2Code) {
        this.trend2Code = trend2Code;
    }

    public String getConfigSku() {
        return getSku();
    }

    public void setConfigSku(final String configSku) {
        setSku(configSku);
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this).add("", super.toString()).add("mainColorCode", mainColorCode)
                      .add("secondColorCode", secondColorCode).add("thirdColorCode", thirdColorCode)
                      .add("mainMaterialCode", mainMaterialCode).add("patternTypeCode", patternTypeCode)
                      .add("trend1Code", trend1Code).add("trend2Code", trend2Code).toString();
    }
}
