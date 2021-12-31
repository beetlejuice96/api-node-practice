import {
  Mutation,
  Arg,
  Resolver,
  InputType,
  Field,
  Query,
  Args,
} from "type-graphql";
import { Author } from "../entity/author.entity";
import { getRepository, Repository } from "typeorm";
import { Length } from "class-validator";

@InputType()
class AuthorInput {
  @Field()
  fullName!: string;
}

@InputType()
class AuthorUpdateInput {
  @Field(() => Number)
  id!: number;

  @Field()
  @Length(3, 64)
  fullName?: string;
}

@InputType()
class AuthorIdInput {
  @Field(() => Number)
  id!: number;
}

@Resolver()
export class AuthorResolver {
  authorRepository: Repository<Author>;

  constructor() {
    this.authorRepository = getRepository(Author);
  }

  @Mutation(() => Author) // se encarga de guardar o generar datos en la bd. esta nos devuelve un objeto autor.
  async createAuthor(
    @Arg("input", () => AuthorInput) input: AuthorInput
  ): Promise<Author | undefined> {
    try {
      const createAuthor = await this.authorRepository.insert({
        fullName: input.fullName,
      });
      const result = await this.authorRepository.findOne(
        createAuthor.identifiers[0].id
      );
      return result;
    } catch {
      console.error;
    }
  }

  @Query(() => [Author]) // con los brackets le estamos indicando que vamos a obtener un array
  async getAllAuthors(): Promise<Author[]> {
    return await this.authorRepository.find({ relations: ["books"] });
  }

  @Query(() => Author)
  async getOneAuthor(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Author | undefined> {
    try {
      const author = await this.authorRepository.findOne(input.id);
      if (!author) {
        const error = new Error();
        error.message = "author does not exist";
        throw error;
      }
      return author;
    } catch (e) {
      throw new Error(e as string);
    }
  }

  @Mutation(() => Author)
  async updateAuthor(
    @Arg("input", () => AuthorUpdateInput) input: AuthorUpdateInput
  ): Promise<Author | undefined> {
    const authorExist = await this.authorRepository.findOne(input.id);

    if (!authorExist) {
      throw new Error("Author does not exist");
    }

    return await this.authorRepository.save({
      id: input.id,
      fullName: input.fullName,
    });
  }

  @Mutation(() => Boolean)
  async deleteOneAuthor(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Boolean> {
    // const authorExist = await this.authorRepository.findOne(input.id);

    // if (!authorExist) {
    //   throw new Error("Author does not exist");
    // }
    await this.authorRepository.delete(input.id);
    return true;
  }
}
