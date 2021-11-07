import { Mutation, Arg, Resolver, InputType, Field } from "type-graphql";
import { Author } from "../entity/author.entity";
import { getRepository, Repository } from "typeorm";
@InputType()
class AuthorInput {
  @Field()
  fullName!: string;
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
}
