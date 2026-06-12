import Redis from 'ioredis';
import { deletePod } from '../kubernetes/pod.js';
import { deleteService } from '../kubernetes/service.js';

const redis = new Redis(process.env.REDIS_URL);

const subscriber = new Redis(process.env.REDIS_URL);

export async function createSandboxKey(sandboxId){
    await redis.set(`sandbox:${sandboxId}`, JSON.stringify({
        status: 'active',
    }), 'EX', 60 * 20); // Key expires in 1200 seconds (20 minutes)
}

subscriber.config('SET', 'notify-keyspace-events', 'Ex'); // Enable key expiration events (event ko listen karenge jab key expire hoga)

subscriber.subscribe('__keyevent@0__:expired'); // Subscribe to key expiration events

subscriber.on('message', async(channel, key) => {
    console.log(`Key expired: ${key}`); // Log the expired key

    /**
     *  sandbox:019e4104-020b-764e-b366-74ee0429d36a
     */
    const sandboxId = key.split(':')[ 1 ];
    await deletePod(sandboxId);
    await deleteService(sandboxId);
})

export default { subscriber };