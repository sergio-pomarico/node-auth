import UserEntitiy from "@domain/entities/user";

export interface MFARepository {
  setup: (secret: string, userId: string) => Promise<UserEntitiy | null>;
}
