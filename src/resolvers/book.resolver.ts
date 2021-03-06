import {
  Mutation,
  Arg,
  Resolver,
  InputType,
  Field,
  Query,
  Args,
  UseMiddleware,
  Ctx,
} from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { Author } from "../entity/author.entity";
import { Book } from "../entity/book.entity";
import { Length } from "class-validator";
import { IContext, IsAuth } from "../middleware/auth.middleware";

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
  @UseMiddleware(IsAuth)
  async createBook(
    @Arg("input", () => BookInput) input: BookInput,
    @Ctx() context: IContext
  ) {
    console.log(context.payload);
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
        relations: ["author", "author.books"],
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  @Query(() => [Book])
  @UseMiddleware(IsAuth)
  async getAll(): Promise<Book[]> {
    try {
      return await this.bookRepository.find({
        relations: ["author", "author.books"],
      });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  @Query(() => Book)
  @UseMiddleware(IsAuth)
  async getBookById(
    @Arg("input", () => BookIdInput) input: BookIdInput
  ): Promise<Book | undefined> {
    try {
      const book = await this.bookRepository.findOne(input.id, {
        relations: ["author", "author.books"],
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
  @UseMiddleware(IsAuth)
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
  @UseMiddleware(IsAuth)
  async deleteBook(
    @Arg("bookId", () => BookIdInput) bookId: BookIdInput
  ): Promise<Boolean> {
    try {
      const result = await this.bookRepository.delete(bookId.id);
      if (result.affected === 0) throw new Error("Book does not exist");
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

  ///informe "semanal"
  //TODO: me faltaria agregar fecha(no creo).
  @Query(() => [Book])
  @UseMiddleware(IsAuth)
  public async getBookNotOnLoan(): Promise<Book[]> {
    try {
      return await this.bookRepository.find({
        relations: ["author", "author.books"],
        where: { isOnLoan: false },
      });
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
