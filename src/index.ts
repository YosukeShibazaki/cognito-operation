import { config } from "dotenv";
config();

import { CognitoIdentityProviderClient, ListUsersCommand, AdminDeleteUserCommand, AdminUpdateUserAttributesCommand, AddCustomAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";
import { getCredentials } from "./credentials";

class Cognito {
  private client: CognitoIdentityProviderClient;
  constructor() {
    this.client = new CognitoIdentityProviderClient(getCredentials());
  }

  async listUsers(paginationToken?: string) {
    return await this.client.send(new ListUsersCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      PaginationToken: paginationToken,
    }));
  }

  async getBySub(sub: string) {
    const response = await this.client.send(new ListUsersCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Filter: `"sub"="${sub}"`,
    }));
    return response.Users ? response.Users[0] : null;
  }

  async deleteUser(sub: string) {
    const user = await this.getBySub(sub);
    if (!user) {
      throw new Error("User not existed");
    }
    await this.client.send(new AdminDeleteUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: user.Username!
    }));
  }

  async updateUser(sub: string, attrs: { Name: string, Value: string }[]) {
    const user = await this.getBySub(sub);
    if (!user) {
      throw new Error("User not existed");
    }
    await this.client.send(new AdminUpdateUserAttributesCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: user.Username!,
      UserAttributes: attrs,
    }));
  }

  // WORNING: 後からカスタム属性を削除することができない
  async addCustomAttrs(attrs: { Name: string, Value: string }[]) {
    await this.client.send(new AddCustomAttributesCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      CustomAttributes: attrs,
    }));
  }
}
const cognitoClient = new Cognito();

(async () => {
  const response = await cognitoClient.listUsers();
  const sub = response.Users ? response.Users[0].Attributes?.find((attr) => attr.Name === "sub")?.Value : undefined;
  if (!sub) {
    console.log("'sub' is not found");
    return;
  }
  const user = await cognitoClient.getBySub(sub);
  console.log(user);
})();
