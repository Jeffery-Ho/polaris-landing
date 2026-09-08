import json
import os

from alibabacloud_credentials.client import Client as CredentialClient
from alibabacloud_sts20150401 import models as sts_models
from alibabacloud_sts20150401.client import Client as StsClient
from alibabacloud_tea_openapi.models import Config


def _response(status_code, body, origin):
    allowed_origin = os.environ.get("ALLOWED_ORIGIN", "").strip()
    headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Vary": "Origin",
    }

    if origin and origin == allowed_origin:
        headers.update(
            {
                "Access-Control-Allow-Origin": allowed_origin,
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Accept",
                "Access-Control-Max-Age": "3600",
            }
        )

    return {
        "statusCode": status_code,
        "headers": headers,
        "isBase64Encoded": False,
        "body": json.dumps(body),
    }


def _header(headers, name):
    expected = name.lower()

    for key, value in (headers or {}).items():
        if key.lower() == expected:
            return value or ""

    return ""


def _credential_value(credentials, *names):
    for name in names:
        value = getattr(credentials, name, None)

        if value:
            return value

    values = credentials.to_map()

    for name in names:
        value = values.get(name)

        if value:
            return value

    return ""


def handler(event, context):
    try:
        request = json.loads(event.decode("utf-8") if isinstance(event, bytes) else event)
    except (TypeError, ValueError):
        return _response(400, {"error": "invalid event"}, "")

    method = request.get("requestContext", {}).get("http", {}).get("method", "").upper()
    origin = _header(request.get("headers"), "origin")
    allowed_origin = os.environ.get("ALLOWED_ORIGIN", "").strip()

    if not allowed_origin or origin != allowed_origin:
        return _response(403, {"error": "origin not allowed"}, origin)

    if method == "OPTIONS":
        return _response(204, {}, origin)

    if method != "GET":
        return _response(405, {"error": "method not allowed"}, origin)

    role_arn = os.environ.get("SLS_ROLE_ARN", "").strip()
    region_id = os.environ.get("SLS_REGION", "cn-hangzhou").strip()
    project = os.environ.get("SLS_PROJECT", "").strip()
    logstore = os.environ.get("SLS_LOGSTORE", "").strip()

    if not role_arn or not project or not logstore:
        return _response(500, {"error": "server is not configured"}, origin)

    policy = {
        "Version": "1",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": ["log:PostLogStoreLogs", "log:PutLogs"],
                "Resource": [f"acs:log:*:*:project/{project}/logstore/{logstore}"],
            }
        ],
    }

    try:
        sts_client = StsClient(
            Config(
                region_id=region_id,
                credential=CredentialClient(),
            )
        )
        result = sts_client.assume_role(
            sts_models.AssumeRoleRequest(
                role_arn=role_arn,
                role_session_name="polaris-landing",
                duration_seconds=3600,
                policy=json.dumps(policy, separators=(",", ":")),
            )
        )
        credentials = result.body.credentials
        payload = {
            "AccessKeyId": _credential_value(credentials, "access_key_id", "accessKeyId", "AccessKeyId"),
            "AccessKeySecret": _credential_value(credentials, "access_key_secret", "accessKeySecret", "AccessKeySecret"),
            "SecurityToken": _credential_value(credentials, "security_token", "securityToken", "SecurityToken"),
            "Expiration": _credential_value(credentials, "expiration", "Expiration"),
        }

        if not all(payload[key] for key in ("AccessKeyId", "AccessKeySecret", "SecurityToken")):
            return _response(502, {"error": "STS response is incomplete"}, origin)

        return _response(200, payload, origin)
    except Exception:
        return _response(502, {"error": "unable to issue STS credentials"}, origin)
