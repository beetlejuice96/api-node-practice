import {
  Mutation,
  Arg,
  Resolver,
  InputType,
  Field,
  Query,
  Args,
} from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { Author } from "../entity/author.entity";
import { Book } from "../entity/book.entity";

@InputType()
class BookInput {
  @Field()
  title!: string;

  @Field()
  author!: number;
}

@InputType()
class BookIdInput {
  @Field()
  id!: string;
}

@InputType()
class BookUpdateInput {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => Number, { nullable: true })
  author?: number;
}

@Resolver()
export class BookResolver {
  bookRepository: Repository<Book>;
  authorRepository: Repository<Author>;

  constructor() {
    this.bookRepository = getRepository(Book);
    this.authorRepository = getRepository(Author);
  }

  @Mutation(() => Book)
  async createBook(@Arg("input", () => BookInput) input: BookInput) {
    try {
      const author: Author | undefined = await this.authorRepository.findOne(
        input.author
      );
      if (!author) {
        const error = new Error();
        error.message =
          "the author for this book does not exist, pealse double check";
        throw error;
      }
      const book = await this.bookRepository.insert({
        title: input.title,
        author: author,
      });
      return await this.bookRepository.findOne(book.identifiers[0].id, {
        relations: ["author"],
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  @Query(() => [Book])
  async getAll(): Promise<Book[]> {
    try {
      return await this.bookRepository.find({ relations: ["author"] });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  @Query(() => Book)
  async getBookById(
    @Arg("input", () => BookIdInput) input: BookIdInput
  ): Promise<Book | undefined> {
    try {
      const book = await this.bookRepository.findOne(input.id, {
        relations: ["author"],
      });
      if (!book) {
        const error = new Error();
        error.message = "Book does not exist";
        throw error;
      }
      return book;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  // @Mutation(() => Book)
  // async updateBook(
  //   @Arg("bookId", () => BookIdInput) bookId: BookIdInput,
  //   @Arg("input", () => BookUpdateInput) input: BookUpdateInput
  // ): Promise<Book | undefined> {

  // }
}
