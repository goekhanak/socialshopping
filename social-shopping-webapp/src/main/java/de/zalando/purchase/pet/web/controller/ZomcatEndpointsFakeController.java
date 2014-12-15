package de.zalando.purchase.pet.web.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.MediaType.TEXT_PLAIN_VALUE;

import static com.google.common.collect.Lists.newArrayList;
import static com.google.common.collect.Maps.newHashMap;

import java.io.IOException;
import java.io.PrintWriter;

import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.core.io.Resource;

import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import de.zalando.purchase.pet.config.HeartbeatJspConfig;

@Controller
class ZomcatEndpointsFakeController {

    public static final String DEPLOY = "DEPLOY";

    private static final String MAINTENANCE = "MAINTENANCE";

    private static final String NORMAL = "NORMAL";

    @Value("/META-INF/MANIFEST.MF")
    private Resource manifestFile;

    private boolean maintenanceMode;

    @ResponseBody
    @RequestMapping(value = "/status.info")
    String statusInfo() {

        return "";
    }

    @ResponseBody
    @RequestMapping(value = "/manifest.info", produces = TEXT_PLAIN_VALUE)
    String manifestInfo() throws IOException {

        return manifestFile.exists() ? IOUtils.toString(manifestFile.getInputStream()) : "";
    }

    @RequestMapping(value = "/toggleOperationMode")
    void toggleOperationMode(@RequestParam(value = "mode", required = false) final String mode,
            final HttpServletResponse response) throws IOException {

        if (mode == null) {
            maintenanceMode = !maintenanceMode;
            response.sendRedirect("jobs.monitor2");
        } else {
            maintenanceMode = MAINTENANCE.equals(mode);
            try(final PrintWriter writer = response.getWriter()) {
                writer.println(maintenanceMode ? MAINTENANCE : NORMAL);
            }
        }
    }

    @RequestMapping(value = "/toggleHeartbeatMode", produces = TEXT_PLAIN_VALUE)
    void toggleHeartbeatMode(@RequestParam(value = "mode", required = false) final String mode,
            final HttpServletResponse response) throws IOException {

        if (mode == null) {
            HeartbeatJspConfig.DeployModeHolder.toggle();
            response.sendRedirect("jobs.monitor2");
        } else {
            HeartbeatJspConfig.DeployModeHolder.setDeployMode(DEPLOY.equals(mode));
            try(final PrintWriter writer = response.getWriter()) {
                writer.println(HeartbeatJspConfig.DeployModeHolder.isDeployMode() ? DEPLOY : "OK");
            }
        }
    }

    @ResponseBody
    @RequestMapping(value = "/jobs.monitor", produces = APPLICATION_JSON_VALUE)
    Map<String, ?> jobsMonitor() {

        return jobsMonitor2();
    }

    @ResponseBody
    @RequestMapping(value = "/jobs.monitor2", produces = APPLICATION_JSON_VALUE)
    Map<String, ?> jobsMonitor2() {

        final Map<String, Object> result = newHashMap();
        result.put("jobs", newArrayList());
        result.put("operationMode", maintenanceMode ? MAINTENANCE : NORMAL);

        return result;
    }

    @RequestMapping({ "/triggerJob", "/toggleJobMode" })
    String redirectToJobsMonitor() {

        return "redirect:jobs.monitor2";
    }

    @RequestMapping("/ws")
    @ResponseBody
    void doNothing() {
        /*
         * There are frequent requests on /ws on all staging systems to test, wether there are Soap Webservice
         * endpoints defined. Accept requests but don't do anything
         */
    }

}
