import express, { Express } from 'express';
import { APP_ENV } from './constants';
import cookieParser from 'cookie-parser';
import { getClientIp } from 'request-ip';

const app: Express = express();
const port = APP_ENV.PORT;
// app.set('trust proxy', 1);

app.use((req, res, next) => {
    const clientIp = getClientIp(req) ?? '';
    console.log('client ip:', clientIp, APP_ENV.IP_WHITE_LIST);
    if (APP_ENV.IP_WHITE_LIST.includes(clientIp) || (APP_ENV.IP_WHITE_LIST.length && APP_ENV.IP_WHITE_LIST[0] === '0.0.0.0')) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
});

app.use(cookieParser());
app.use(express.urlencoded({ extended: false, limit: '100mb' }));
app.use(express.json({ limit: '100mb' }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.header('Access-Control-Allow-Origin', `${req.headers.origin || '*'}`);
    res.header('Access-Control-Allow-Headers', 'Authorization,Content-Type,Accept,Origin,User-Agent,DNT,Cache-Control,X-Mx-ReqToken,X-Data-Type,X-Requested-With,X-Data-Type,X-Auth-Token,X-chainid,X-GATEWAY-API-KEY');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.setTimeout(100000000, () => {
        res.status(408);
    });
    req.method === 'OPTIONS' ? res.status(204).end() : next();
});

import IndexRouter from './routers/index';
import PaymentRouter from './routers/payment';

app.use('/v1/payment', PaymentRouter);
app.use('', IndexRouter);

app.listen(port, async () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
