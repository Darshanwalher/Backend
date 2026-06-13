import Redis from 'ioredis';
import { deletePod } from '../kubernetes/pod.js';
import { deleteService } from '../kubernetes/service.js';
import { k8sCoreApi } from '../kubernetes/config.js';

const redisOptions = {
    retryStrategy(times) {
        const delay = Math.min(times * 500, 5000);
        console.log(`Redis reconnecting... attempt ${times}, next retry in ${delay}ms`);
        return delay;
    },
    maxRetriesPerRequest: null,
};

const redis = new Redis(process.env.REDIS_URL, redisOptions);

redis.on('connect', () => {
    console.log('Redis client connected');
    // Enable key expiration events on standard Redis client
    redis.config('SET', 'notify-keyspace-events', 'Ex').catch(err => {
        console.error('Failed to configure notify-keyspace-events on Redis:', err.message);
    });
});
redis.on('error', (err) => console.error('Redis client error:', err.message));

const subscriber = new Redis(process.env.REDIS_URL, redisOptions);

subscriber.on('connect', () => console.log('Redis subscriber connected'));
subscriber.on('error', (err) => console.error('Redis subscriber error:', err.message));

export async function createSandboxKey(sandboxId){
    await redis.set(`sandbox:${sandboxId}`, JSON.stringify({
        status: 'active',
    }), 'EX', 60 * 20); // Key expires in 1200 seconds (20 minutes)
}

subscriber.subscribe('__keyevent@0__:expired'); // Subscribe to key expiration events

subscriber.on('message', async(channel, key) => {
    console.log(`Key expired: ${key}`); // Log the expired key

    /**
     *  sandbox:019e4104-020b-764e-b366-74ee0429d36a
     */
    const sandboxId = key.split(':')[ 1 ];
    await deletePod(sandboxId);
    await deleteService(sandboxId);
});

export async function reconcileSandboxes() {
    console.log("Starting sandbox reconciliation cleanup check...");
    try {
        const res = await k8sCoreApi.listNamespacedPod({
            namespace: 'default',
            labelSelector: 'sandboxId'
        });
        const pods = res.items || [];
        console.log(`Reconcile: Checking ${pods.length} sandbox pods...`);
        for (const pod of pods) {
            const sandboxId = pod.metadata.labels?.sandboxId;
            if (!sandboxId) continue;

            const keyExists = await redis.exists(`sandbox:${sandboxId}`);
            if (!keyExists) {
                console.log(`Reconcile: Redis key sandbox:${sandboxId} does not exist. Cleaning up sandbox pod and service...`);
                try {
                    await deletePod(sandboxId);
                    console.log(`Reconcile: Deleted pod sandbox-pod-${sandboxId}`);
                } catch (err) {
                    console.error(`Reconcile: Failed to delete pod sandbox-pod-${sandboxId}:`, err.message);
                }
                try {
                    await deleteService(sandboxId);
                    console.log(`Reconcile: Deleted service sandbox-service-${sandboxId}`);
                } catch (err) {
                    console.error(`Reconcile: Failed to delete service sandbox-service-${sandboxId}:`, err.message);
                }
            }
        }
    } catch (error) {
        console.error("Error during sandbox reconciliation:", error.message);
    }
}

let reconciliationStarted = false;
redis.on('connect', () => {
    if (!reconciliationStarted) {
        reconciliationStarted = true;
        reconcileSandboxes();
        setInterval(reconcileSandboxes, 60 * 1000);
    }
});

export default { subscriber };