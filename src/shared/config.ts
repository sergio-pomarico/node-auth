import { config } from "dotenv";
import { get } from "env-var";
import { resolve } from "path";

const path = resolve(__dirname + "../../../.env");

config({ path });

export const env = {
  server: {
    port: get("PORT").required().asPortNumber(),
    resend: get("RESEND_API_KEY").required().asString(),
    url: get("SERVER_URL").required().asString(),
    logtail_key: get("BETTER_STACK_API_KEY").required().asString(),
    logtail_url: get("BETTER_STACK_API_URL").required().asString(),
  },
};

export type config = typeof env;
