import type UserEntitiy from "@domain/entities/user";

export interface MFARepository {
  setup: (secret: string, userId: string) => Promise<UserEntitiy | null>;
  verify: (userId: string) => Promise<UserEntitiy | null>;
  reset: (userId: string) => Promise<boolean>;
}
