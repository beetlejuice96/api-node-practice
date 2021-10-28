import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Author } from "./author.entity";

@Entity()
export class Book {
  @Column("int")
  id!: number;

  @Column()
  title!: string;

  @ManyToOne(() => Author, (author) => author.books)
  author!: Author;

  @CreateDateColumn({ type: "timestamp" })
  createAt!: number;
}
