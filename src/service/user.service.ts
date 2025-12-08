import { Repository } from "typeorm";
import { User, UserProfile } from "../model/user";

interface createUserPayload {
  username: string;
  email: string;
  password: string;
}
export interface IUserService {
  userFindByEmail: (email: string) => Promise<User | null>;
  userFindById: (id: number) => Promise<User | null>;
  createUser: (payload: createUserPayload) => Promise<User>;
}

export class UserService implements IUserService {
  constructor(private userRepository: Repository<User>) {
    // default value
  }
  userFindByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }
  userFindById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async createUser(payload: createUserPayload) {
    const newUser = this.userRepository.create({
      email: payload.email,
      password: payload.password,
      username: payload.username,
    });
    const user = await this.userRepository.save(newUser);
    return user;
  }
}
