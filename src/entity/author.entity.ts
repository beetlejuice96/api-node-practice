import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Book } from "./book.entity";

@Entity()
export class Author {
  @Column("int")
  id!: number;

  @Column()
  fullName!: string;

  @OneToMany(() => Book, (book) => book)
  books!: Book;

  @CreateDateColumn({ type: "timestamp" })
  createAt!: number;
}
