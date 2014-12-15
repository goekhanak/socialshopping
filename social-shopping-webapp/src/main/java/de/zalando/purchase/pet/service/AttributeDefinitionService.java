package de.zalando.purchase.pet.service;

import static com.google.common.collect.Lists.newArrayList;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.InitializingBean;

import org.springframework.scheduling.annotation.Scheduled;

import org.springframework.stereotype.Service;

import com.google.common.base.Optional;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Sets;

import de.zalando.catalog.domain.attribute.AttributeAccessProfileCode;
import de.zalando.catalog.domain.attribute.AttributeDefinition;
import de.zalando.catalog.domain.silhouette.SilhouetteCode;
import de.zalando.catalog.domain.sku.SkuType;
import de.zalando.catalog.webservice.reading.MasterDataReadWebService;

import de.zalando.purchase.pet.config.PetConstants;
import de.zalando.purchase.pet.web.rest.dto.AttributeDefinitionRequest;

import de.zalando.translation.Translator;

/**
 * Author: clohmann Date: 17.09.14 Time: 09:29
 */
@Service
public class AttributeDefinitionService implements InitializingBean {

    private static final Logger LOG = LoggerFactory.getLogger(AttributeDefinitionService.class);

    private static final AttributeAccessProfileCode CM_ACCESS_PROFILE_CODE = new AttributeAccessProfileCode("CM");

    @Inject
    private MasterDataReadWebService masterDataReadWebService;

    @Inject
    private Translator translator;

    private List<AttributeDefinition> attributeDefinitions = newArrayList();

    private LoadingCache<String, Optional<AttributeDefinition>> loadingCache;

    private final Set<String> attributeDefinitionCodes = Sets.newHashSet();

    public AttributeDefinition getAttributeDefinition(final String code) {

        try {
            return loadingCache.get(code).orNull();
        } catch (final ExecutionException e) {
            LOG.error("Could not get AttributeDefinition from Cache");
        }

        return null;
    }

    public List<AttributeDefinition> getAllAttributeDefinitions() {

        return attributeDefinitions;
    }

    public List<AttributeDefinition> getAttributeDefinitions(final AttributeDefinitionRequest request) {

        if (request == null || request.isEmpty()) {
            return getAllAttributeDefinitions();
        }

        try {
            final List<AttributeDefinition> silhouetteAttributeDefinitions = newArrayList();

            for (final String code : attributeDefinitionCodes) {
                boolean candidate = false;
                final AttributeDefinition attributeDefinition = loadingCache.get(code).orNull();
                if (attributeDefinition != null) {
                    final String silhouetteCode = request.getSilhouetteCode();

                    if (silhouetteCode != null) {
                        candidate = attributeDefinition.getConstraintBySilhouette(new SilhouetteCode(silhouetteCode))
                                != null;
                    }

                    if (request.getSkuType() != null) {
                        final SkuType skuType = SkuType.valueOf(request.getSkuType());
                        candidate = skuType == attributeDefinition.getSkuType();
                    }

                    if (candidate) {
                        silhouetteAttributeDefinitions.add(attributeDefinition);
                    }
                }
            }

            return silhouetteAttributeDefinitions;
        } catch (final ExecutionException e) {
            LOG.error("Could not get AttributeDefinitions from Cache");
        }

        return null;
    }

    @Scheduled(fixedDelay = 1000 * 60 * 15)
    private void getAttributeDefinitions() {

        final List<AttributeDefinition> filteredAttributeDefinitions = newArrayList();

        LOG.info("Retrieving masterDataReadWebService.getAllAttributeDefinitions(false)");

        final List<AttributeDefinition> allAttributeDefinitions = masterDataReadWebService.getAllAttributeDefinitions(
                false);
        for (final AttributeDefinition definition : allAttributeDefinitions) {
            if (definition.getAccessProfileCodes() != null
                    && definition.getAccessProfileCodes().contains(CM_ACCESS_PROFILE_CODE)) {
                filteredAttributeDefinitions.add(definition);
            }
        }

        if (!filteredAttributeDefinitions.isEmpty()) {
            attributeDefinitions = translator.translate(filteredAttributeDefinitions, PetConstants.LOCALES);
            if (loadingCache.size() == 0) {
                LOG.info("Initializing Attribute Definition Cache for the first time...");
                for (final AttributeDefinition attributeDefinition : attributeDefinitions) {
                    final String code = attributeDefinition.getCode().getCode();
                    loadingCache.put(code, Optional.of(attributeDefinition));
                    attributeDefinitionCodes.add(code);
                }
            }
        }
    }

    @Override
    public void afterPropertiesSet() {

        final CacheLoader<String, Optional<AttributeDefinition>> cacheLoader =
            new CacheLoader<String, Optional<AttributeDefinition>>() {

                @Override
                public Optional<AttributeDefinition> load(final String key) throws Exception {

                    for (final AttributeDefinition attributeDefinition : attributeDefinitions) {
                        if (key.equals(attributeDefinition.getCode().getCode())) {
                            attributeDefinitionCodes.add(key);
                            return Optional.of(attributeDefinition);
                        }
                    }

                    attributeDefinitionCodes.remove(key);
                    return Optional.absent();
                }
            };
        loadingCache = CacheBuilder.newBuilder().refreshAfterWrite(10, TimeUnit.MINUTES).build(cacheLoader);
    }
}
