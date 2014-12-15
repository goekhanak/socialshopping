package de.zalando.purchase.pet.web.rest;

import static com.google.common.collect.Lists.newArrayList;

import static de.zalando.purchase.pet.config.PetConstants.LOCALES;

import java.util.List;

import javax.annotation.security.RolesAllowed;

import javax.inject.Inject;

import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.cache.annotation.Cacheable;

import org.springframework.http.MediaType;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import de.zalando.catalog.domain.productgroup.ProductGroup;
import de.zalando.catalog.domain.silhouette.Silhouette;
import de.zalando.catalog.webservice.reading.MasterDataReadWebService;

import de.zalando.purchase.backend.webservice.dto.pool.SubPoolSummaryDTO;
import de.zalando.purchase.backend.webservice.dto.supplier.SupplierSummaryDTO;
import de.zalando.purchase.backend.webservice.service.PurchasingPetWebService;
import de.zalando.purchase.masterdata.dto.BrandDTO;
import de.zalando.purchase.masterdata.dto.ColorDTO;
import de.zalando.purchase.masterdata.dto.CommodityGroupDTO;
import de.zalando.purchase.masterdata.dto.MaterialDTO;
import de.zalando.purchase.masterdata.dto.PatternDTO;
import de.zalando.purchase.masterdata.dto.TrendDTO;
import de.zalando.purchase.masterdata.service.MasterDataService;
import de.zalando.purchase.pet.security.SecurityUtils;
import de.zalando.purchase.pet.security.ZEOSPrivileges;

import de.zalando.translation.Translator;

/**
 * @author  goekhan created on 8/12/14.
 */
@RestController
@RequestMapping(value = "/rest/masterdata", produces = MediaType.APPLICATION_JSON_VALUE)
public class MasterDataResource {

    private static final Logger LOG = LoggerFactory.getLogger(MasterDataResource.class);

    @Autowired
    private PurchasingPetWebService purchasingPetWebService;

    @Autowired
    private MasterDataService masterDataService;

    @Autowired
    private MasterDataReadWebService masterDataReadWebService;

    @Autowired
    private Translator translator;

    @Inject
    private SecurityUtils securityUtils;

    @RequestMapping(value = "/supplier/all", method = RequestMethod.GET)
    @Cacheable("masterDataService.getSuppliers")
    public List<SupplierSummaryDTO> getSuppliers() {
        LOG.debug("REST get supplier summaries");

        return purchasingPetWebService.getSupplierSummaries();
    }

    @RequestMapping(value = "/brand/all", method = RequestMethod.GET)
    @Cacheable("masterDataService.getBrands")
    public List<BrandDTO> getBrands() {
        LOG.debug("REST get all brands");
        return masterDataService.fetchBrands();
    }

    @RequestMapping(value = "/commodity/secondlevel", method = RequestMethod.GET)
    @Cacheable("masterDataService.getCommodityGroupsUntilSecondLevel")
    public List<CommodityGroupDTO> getCommodityGroupsUntilSecondLevel(final String locale) {
        LOG.debug("REST get all commodity groups");

        return masterDataService.fetchCommodityGroupsUntilSecondLevel(locale);
    }

    @RequestMapping(value = "/commodity/all", method = RequestMethod.GET)
    @Cacheable("masterDataService.getCommodityGroups")
    public List<CommodityGroupDTO> getCommodityGroups(final String locale) {

        LOG.debug("REST get all commodity groups");
        return masterDataService.fetchCommodityGroups(locale);
    }

    @RequestMapping(value = "/sub_pool/all", method = RequestMethod.GET)
    @Cacheable("masterDataService.getSubPools")
    public List<SubPoolSummaryDTO> getSubPools() {
        LOG.debug("REST get all sub pools");
        return purchasingPetWebService.getSubPoolSummaries();
    }

    @RolesAllowed(ZEOSPrivileges.PRIVILEGE_EDIT)
    @RequestMapping(value = "/sub_pool/user", method = RequestMethod.GET)
    public List<SubPoolSummaryDTO> getUserSubPools(final HttpServletResponse response) {

        final String userEmail = securityUtils.getCurrentUser().getUsername();
        LOG.debug("REST get sup pools for user {}", userEmail);

        final List<SubPoolSummaryDTO> userSubPools = newArrayList();

        final List<Integer> userSubPoolIds = purchasingPetWebService.getSubPoolIdsForUser(userEmail);

        if (userSubPoolIds == null || userSubPoolIds.isEmpty()) {
            return userSubPools;
        }

        final List<SubPoolSummaryDTO> allSubPools = getSubPools();

        // filter the not user related sub pools
        for (final int subPoolId : userSubPoolIds) {
            for (final SubPoolSummaryDTO subPool : allSubPools) {
                if (subPoolId == subPool.getId()) {
                    userSubPools.add(subPool);
                    break;
                }
            }
        }

        return userSubPools;
    }

    @Cacheable("masterDataService.getAllProductGroups")
    @RequestMapping(value = "/product_group/all", method = RequestMethod.GET)
    public List<ProductGroup> getAllProductGroups() {
        LOG.debug("REST get all silhouettes excluding inactive");

        final List<ProductGroup> productGroups = masterDataReadWebService.getAllProductGroups();

        translator.translate(productGroups, LOCALES);

        return productGroups;
    }

    @Cacheable("masterDataService.getAllSilhouettes")
    @RequestMapping(value = "/silhouette/all", method = RequestMethod.GET)
    public List<Silhouette> getAllSilhouettes() {
        LOG.debug("REST get all silhouettes excluding inactive");

        final List<Silhouette> silhouettes = masterDataReadWebService.getAllSilhouettes(false);
        translator.translate(silhouettes, LOCALES);

        return silhouettes;
    }

    @Cacheable("masterDataService.getColors")
    @RequestMapping(value = "/color/all", method = RequestMethod.GET)
    public List<ColorDTO> getColors(final String locale) {
        LOG.debug("REST get all colors");
        return masterDataService.fetchColors(locale);
    }

    @Cacheable("masterDataService.getMaterials")
    @RequestMapping(value = "/material/all", method = RequestMethod.GET)
    public List<MaterialDTO> getMaterials(final String locale) {
        LOG.debug("REST get all materials");
        return masterDataService.fetchMaterials(locale);
    }

    @Cacheable("masterDataService.getPatterns")
    @RequestMapping(value = "/pattern/all", method = RequestMethod.GET)
    public List<PatternDTO> getPatterns(final String locale) {
        LOG.debug("REST get all patterns");
        return masterDataService.fetchPatterns(locale);
    }

    @Cacheable("masterDataService.getTrends")
    @RequestMapping(value = "/trend/all", method = RequestMethod.GET)
    public List<TrendDTO> getTrends(final String locale) {
        LOG.debug("REST get all patterns");
        return masterDataService.fetchTrends(locale);
    }

}
