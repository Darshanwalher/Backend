import { k8sCoreApi } from "./config.js";

export async function createService(sandboxId) {

    const serviceManifest = {
        metadata: {
            name: `sandbox-service-${sandboxId}`,
            labels: {
                app: 'sandbox',
                sandboxId: sandboxId
            }
        },
        spec: {
            selector: {
                sandboxId: sandboxId
            },
            ports: [
                {
                    name: "http",
                    port: 80,
                    targetPort: 5173,
                    protocol: "TCP"
                },
                {
                    name: "agent",
                    port: 3000,
                    targetPort: 3000,
                    protocol: "TCP"
                }
            ],
            type: "ClusterIP"
        }
    };

    const response = await k8sCoreApi.createNamespacedService({
        namespace: 'default',
        body: serviceManifest
    });

    return response;
}

export async function deleteService(sandboxId) {
    const response = await k8sCoreApi.deleteNamespacedService({
        namespace: 'default',
        name: `sandbox-service-${sandboxId}`
    })

    return response;
}