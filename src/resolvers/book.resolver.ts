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
import { Length } from "class-validator";

@InputType()
class BookInput {
  @Field()
  @Length(3, 64)
  title!: string;

  @Field()
  author!: number;
}

@InputType()
class BookIdInput {
  @Field()
  id!: number;
}
@InputType()
class BookUpdateInput {
  @Field(() => String, { nullable: true })
  @Length(3, 64)
  title?: string;

  @Field(() => Number, { nullable: true })
  author?: number;
}

@InputType()
class BookUpdateParsedInput {
  @Field(() => String, { nullable: true })
  @Length(3, 64)
  title?: string;

  @Field(() => Author, { nullable: true })
  author?: Author;
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

  @Mutation(() => Boolean)
  async updateBook(
    @Arg("bookId", () => BookIdInput) bookId: BookIdInput,
    @Arg("input", () => BookUpdateInput) input: BookUpdateInput
  ): Promise<Boolean> {
    try {
      await this.bookRepository.update(bookId.id, await this.parseInput(input));
      return true;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  @Mutation(() => Boolean)
  async deleteBook(
    @Arg("bookId", () => BookIdInput) bookId: BookIdInput
  ): Promise<Boolean> {
    try {
      await this.bookRepository.delete(bookId.id);
      return true;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private async parseInput(input: BookUpdateInput) {
    try {
      const _input: BookUpdateParsedInput = {};
      if (input.title) {
        _input.title = input.title;
      }

      if (input.author) {
        const author = await this.authorRepository.findOne(input.author);
        if (!author) {
          throw new Error("Author does not exist");
        }
        _input.author = await this.authorRepository.findOne(input.author);
      }
      return _input;
    } catch (error) {
      throw new Error(error as string);
    }
  }
}
