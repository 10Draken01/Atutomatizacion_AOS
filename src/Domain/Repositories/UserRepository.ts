import { UserFounded } from "../../Application/DTOs/UserFounded";
import { User } from "../Entities/User";

export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}
