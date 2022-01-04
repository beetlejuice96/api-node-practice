import { Arg, Field, InputType, Mutation, Resolver } from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { IsEmail, Length } from "class-validator";
import { hash } from "bcryptjs";

@InputType()
class UserInput {
  @Field()
  @Length(3, 64)
  fullName!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @Length(3, 254)
  password!: string;
}

@Resolver()
export class AuthResolver {
  userRepository: Repository<User>;
  constructor() {
    this.userRepository = getRepository(User);
  }

  @Mutation(() => User)
  async register(
    @Arg("input", () => UserInput) input: UserInput
  ): Promise<User | undefined> {
    try {
      const { password, email, fullName } = input;
      const userExists = await this.userRepository.findOne({
        where: { email },
      });
      if (userExists) {
        const error = new Error();
        error.message = "Email is not available";
        throw error;
      }

      const hashPassword = await hash(password, 10);
      const newUser = await this.userRepository.insert({
        fullName,
        email,
        password: hashPassword,
      });

      return this.userRepository.findOne(newUser.identifiers[0].id);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
