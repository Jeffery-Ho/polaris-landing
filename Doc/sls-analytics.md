# SLS analytics

The landing page sends two SLS events after the visitor allows analytics:

| `eventType` | Purpose | Fields |
| --- | --- | --- |
| `landing_page_arrival` | Record a landing-page visit after the visitor allows analytics. | `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`, attribution context, `locale`, `page`, device context |
| `zip_download` | Record that a visitor triggered the local ZIP download action. It does not claim that the file was saved successfully. | `asset`, supported UTM fields, attribution context, `locale`, `page`, device context |

The current attribution context is copied to the ZIP event so download conversion can be queried without joining browser identifiers. Homepage visits without source parameters are grouped under `direct_share`; this category also includes bookmarks, manually entered URLs, and links whose parameters were removed.

The extension opens the same-origin `/entry/extension/` path. That small entry page stores the fixed source `polaris_extension` in tab-scoped `sessionStorage` and redirects to the homepage. The homepage consumes this value before consent, so it remains available if the visitor takes time to allow analytics. If storage is unavailable, the redirected homepage visit falls back to `direct_share`.

Both events include the following attribution fields:

| Field | Values |
| --- | --- |
| `attribution_source` | `polaris_extension`, the UTM source value, or `direct_share` |
| `attribution_status` | `first_party`, `utm`, `direct` |

Both events also include the following normalized device context:

| Field | Values |
| --- | --- |
| `device_class` | `mobile`, `tablet`, `desktop` |
| `browser_family` | `Arc`, `Chrome`, `Safari`, `Edge`, `Firefox`, `Opera`, `Other` |
| `os_family` | `iOS`, `iPadOS`, `Android`, `macOS`, `Windows`, `Linux`, `Other` |
| `viewport_bucket` | `narrow`, `medium`, `wide` |
| `browser_language` | `zh`, `en`, `other` |

Empty UTM fields are omitted. Values are limited to the six supported UTM keys and truncated to 256 characters. The raw User-Agent, device model, IP address, full URLs, AI conversation content, account information, and payment information are not included as event fields.

## Production deployment

The production resources are deployed in `cn-hangzhou`:

- Project: `polaris-ai-download`
- Logstore: `web-events` (standard, 30-day retention, WebTracking enabled)
- Indexed fields: `eventType`, `utm_source`, `utm_medium`, `utm_campaign`, `asset`, `device_class`, `browser_family`, `os_family`, `viewport_bucket`, `browser_language`, `attribution_source`, `attribution_status`
- RAM role: `sls-web-tracking`
- FC function: `get-sts-token` (Python 3.12, handler `index.handler`)
- HTTP trigger: `get-sts-token-http`, public HTTPS, anonymous access

The FC 3.0 console exposes the trigger method as `GET`; the public endpoint also passed an `OPTIONS` request through to the function and returned the CORS preflight response. The endpoint currently uses the FC-generated public domain because no custom domain was provided:

`https://get-sts-token-ezksivojtu.cn-hangzhou.fcapp.run/get_sts_token`

The function uses the `sls-web-tracking` execution role. FC injects short-lived runtime credentials through `ALIBABA_CLOUD_ACCESS_KEY_ID`, `ALIBABA_CLOUD_ACCESS_KEY_SECRET`, and `ALIBABA_CLOUD_SECURITY_TOKEN`; no long-lived AccessKey is stored in the function environment, repository, or browser.

## Frontend configuration

The deployed values in `support-config.js` are:

```js
sls: Object.freeze({
  host: "cn-hangzhou.log.aliyuncs.com",
  project: "polaris-ai-download",
  logstore: "web-events",
  stsTokenUrl: "https://get-sts-token-ezksivojtu.cn-hangzhou.fcapp.run/get_sts_token"
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

```sql
* | SELECT device_class, browser_family, os_family, count(*) AS mobile_downloads
  WHERE eventType = 'zip_download' AND device_class IN ('mobile', 'tablet')
  GROUP BY device_class, browser_family, os_family
  ORDER BY mobile_downloads DESC
```

The SLS search bar can narrow this same result to mobile devices with `eventType:zip_download and device_class:mobile`.

```sql
* | SELECT attribution_source, attribution_status, count(*) AS downloads
  WHERE eventType = 'zip_download'
  GROUP BY attribution_source, attribution_status
  ORDER BY downloads DESC
```

## Aliyun deployment checklist

1. Create the Project and `web-events` Logstore in the selected region.
2. Enable WebTracking on the Logstore and create indexes for `eventType`, `utm_source`, `utm_medium`, `utm_campaign`, `asset`, `device_class`, `browser_family`, `os_family`, `viewport_bucket`, `browser_language`, `attribution_source`, and `attribution_status`.
3. Create a RAM role restricted to `log:PostLogStoreLogs` and `log:PutLogs` for this Logstore.
4. Deploy `aliyun/fc/index.py` as an FC Python function with handler `index.handler`.
5. Bind the RAM role as the FC execution role and set `SLS_ROLE_ARN`, `SLS_REGION`, `SLS_PROJECT`, `SLS_LOGSTORE`, and `ALLOWED_ORIGIN`. The runtime credential variables are injected by FC and must not be manually populated.
6. Add a public HTTPS HTTP trigger, allow anonymous access, verify `GET` and `OPTIONS`, then copy the endpoint into `support-config.js`.

The FC source returns only short-lived STS credentials. Never commit its AccessKey environment values or a generated endpoint containing secrets.

The official setup and SDK references are [WebTracking collection](https://help.aliyun.com/zh/sls/use-the-web-tracking-feature-to-collect-logs) and [WebTracking JavaScript SDK](https://help.aliyun.com/zh/sls/developer-reference/use-web-tracking-sdk-for-javascript-to-collect-browser-logs).
