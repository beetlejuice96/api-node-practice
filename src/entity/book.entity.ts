import { Field, ObjectType } from "type-graphql";

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Author } from "./author.entity";

@ObjectType()
@Entity()
export class Book {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  isOnLoan!: boolean;

  @Field(() => Author)
  @ManyToOne(() => Author, (author) => author.books, { onDelete: "CASCADE" })
  author!: Author;

  @Field()
  @CreateDateColumn({ type: "timestamp" })
  createAt!: number;
}
