import { fromEnv, fromIni } from "@aws-sdk/credential-providers";

export const getCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_SECRET_KEY) {
    return fromEnv();
  }
  if (process.env.AWS_PROFILE) {
    return fromIni({ profile: process.env.AWS_PROFILE })
  }
  return {};
}