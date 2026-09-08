# SLS analytics

The landing page sends two SLS events after the visitor allows analytics:

| `eventType` | Purpose | Fields |
| --- | --- | --- |
| `landing_page_arrival` | Record a landing-page visit that includes at least one supported UTM parameter. | `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`, `locale`, `page` |
| `zip_download` | Record a click on the local ZIP download action. | `asset`, supported UTM fields, `locale`, `page` |

The current UTM context is copied to the ZIP event so download conversion can be queried without joining browser identifiers. Empty UTM fields are omitted. Values are limited to the six supported UTM keys and truncated to 256 characters. Full URLs, AI conversation content, account information, and payment information are not sent.

## Frontend configuration

Set these values in `support-config.js` after the SLS resources and STS endpoint are deployed:

```js
sls: Object.freeze({
  host: "cn-hangzhou.log.aliyuncs.com",
  project: "polaris-landing-analytics",
  logstore: "web-events",
  stsTokenUrl: "https://<fc-domain>/get_sts_token"
})
```

Do not put a long-lived AccessKey ID or AccessKey Secret in this file. The STS endpoint returns temporary credentials to the browser and must allow CORS only from the deployed landing-page origin.

## SLS query examples

After enabling field indexes for the event fields, these queries can be used in the SLS query console:

```sql
* | SELECT utm_source, utm_medium, count(*) AS arrivals
  WHERE eventType = 'landing_page_arrival'
  GROUP BY utm_source, utm_medium
  ORDER BY arrivals DESC
```

```sql
* | SELECT utm_source, utm_medium, count(*) AS zip_downloads
  WHERE eventType = 'zip_download'
  GROUP BY utm_source, utm_medium
  ORDER BY zip_downloads DESC
```

## Aliyun deployment checklist

1. Create the Project and `web-events` Logstore in the selected region.
2. Enable WebTracking on the Logstore and create indexes for `eventType`, `utm_source`, `utm_medium`, and `asset`.
3. Create a RAM role restricted to `log:PostLogStoreLogs` and `log:PutLogs` for this Logstore.
4. Deploy `aliyun/fc/index.py` as an FC Python function with handler `index.handler` and install `aliyun/fc/requirements.txt`.
5. Set the FC environment variables `ALIBABA_CLOUD_ACCESS_KEY_ID`, `ALIBABA_CLOUD_ACCESS_KEY_SECRET`, `SLS_ROLE_ARN`, `SLS_REGION`, `SLS_PROJECT`, `SLS_LOGSTORE`, and `ALLOWED_ORIGIN`.
6. Add an HTTP trigger supporting `GET` and `OPTIONS`, configure HTTPS and CORS for the landing-page origin, then copy the endpoint into `support-config.js`.

The FC source returns only short-lived STS credentials. Never commit its AccessKey environment values or a generated endpoint containing secrets.

The official setup and SDK references are [WebTracking collection](https://help.aliyun.com/zh/sls/use-the-web-tracking-feature-to-collect-logs) and [WebTracking JavaScript SDK](https://help.aliyun.com/zh/sls/developer-reference/use-web-tracking-sdk-for-javascript-to-collect-browser-logs).
