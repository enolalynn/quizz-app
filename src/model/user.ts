import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
} from "typeorm";

export enum RoleEnum {
  ADMIN = "admin",
  USER = "user",
  EDITOR = "editor",
}

export enum GenderEnum {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export interface UserProfile {
  dateOfBirth: Date;
  gender: GenderEnum;
  phone: string;
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated("uuid")
  uuid: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    default: RoleEnum.USER,
    type: "enum",
    enum: RoleEnum,
  })
  role: RoleEnum;

  @Column({
    name: "cars",
    type: "simple-array",
    default: [],
  })
  cars?: string[];

  @Column({
    name: "profile",
    type: "simple-json",
    nullable: true,
  })
  profile?: UserProfile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
