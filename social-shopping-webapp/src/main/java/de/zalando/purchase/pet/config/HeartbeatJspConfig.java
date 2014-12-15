package de.zalando.purchase.pet.config;

import java.io.IOException;
import java.io.PrintWriter;

import java.util.concurrent.atomic.AtomicBoolean;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.boot.context.embedded.ServletRegistrationBean;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HeartbeatJspConfig {

    @Bean
    ServletRegistrationBean heartbeatJspServlet() {
        return new ServletRegistrationBean(new HeartbeatServlet(), "/heartbeat.jsp");
    }

    static class HeartbeatServlet extends HttpServlet {

        private static final long serialVersionUID = -2371125622440903002L;

        @Override
        protected void doGet(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException,
            IOException {
            try(final PrintWriter writer = resp.getWriter()) {
                writer.write(DeployModeHolder.isDeployMode() ? "Deploy: Zalando JVM is in Updateprocess"
                                                             : "OK: Zalando JVM is running");
            }
        }
    }

    public static final class DeployModeHolder {
        private static final AtomicBoolean DEPLOY_MODE = new AtomicBoolean(false);

        public static void toggle() {
            synchronized (DEPLOY_MODE) {
                DEPLOY_MODE.set(!DEPLOY_MODE.get());
            }
        }

        public static void setDeployMode(final boolean deployMode) {
            synchronized (DEPLOY_MODE) {
                DEPLOY_MODE.set(deployMode);
            }
        }

        public static boolean isDeployMode() {
            return DEPLOY_MODE.get();
        }
    }

}
