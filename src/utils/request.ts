export function getChainId(req: any) {
    const chainId: any = Array.isArray(req.headers['x-chainid']) ? req.headers['x-chainid'][0] : req.headers['x-chainid'];

    if (chainId) {
        return Number(chainId);
    }
    throw new Error('no x-chainid');
}
