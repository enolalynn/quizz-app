import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Answer } from "./answer";

export enum QuestionType {
  BOOLEAN = "boolean",
  BLANK = "blank",
  CHOICES = "choices",
}

export type correctAnswer = string | boolean | string[];
@Entity("questions")
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; // 1 + 1 =

  @Column({
    type: "enum",
    enum: QuestionType,
    enumName: "answer_type",
  })
  questionType: QuestionType;

  // testing branch
  @Column({
    type: "simple-json",
    nullable: true,
  })
  correctAnswer: correctAnswer;

  @Column({
    default: 0,
    type: "numeric",
  })
  score: number;

  @Column({
    nullable: false,
    type: "numeric",
    unique: true,
  })
  rank: number;

  @OneToMany(() => Answer, (asnwer) => asnwer.question)
  answers: Answer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
