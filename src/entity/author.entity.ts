import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  Column,
  CreateDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Book } from "./book.entity";

@ObjectType() // es para poder devolver un objeto en el response del endpoint.
@Entity()
export class Author {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  fullName!: string;

  @Field({ nullable: true })
  @OneToMany(() => Book, (book) => book.author, { nullable: true })
  books!: Book;

  @Field(() => String) // ya que cuando creemos un autor todavia no vamos a tener libros asociados a este.
  @CreateDateColumn({ type: "timestamp" })
  createAt!: number;
}
