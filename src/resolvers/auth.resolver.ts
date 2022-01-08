import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { IsEmail, Length } from "class-validator";
import { hash, compareSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { environment } from "../config/environment";
import { EmailController } from "../controllers/email.controller";

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

@ObjectType() //no es input type nya que no es algo que espero de un input, si no mas bien una respuesta.
class LoginResponse {
  @Field()
  userId!: number;

  @Field()
  jwt!: string;
}

@InputType()
class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
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

  @Mutation(() => LoginResponse)
  async login(@Arg("input", () => LoginInput) input: LoginInput) {
    try {
      const { email, password } = input;
      const userFound = await this.userRepository.findOne({ where: { email } });
      if (!userFound) {
        const error = new Error();
        error.message = "Invalid credentials";
        throw error;
      }

      const isValidPassword: boolean = compareSync(
        password,
        userFound.password
      );

      if (!isValidPassword) {
        const error = new Error();
        error.message = "Invalid credentials";
        throw error;
      }

      const jwt: string = sign({ id: userFound.id }, environment.JWT_SECRET);
      return {
        userId: userFound.id,
        jwt: jwt,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Mutation(() => String)
  async recoveryPass(
    @Arg("email", () => String) email: String
  ): Promise<String | undefined> {
    try {
      const userExists = await this.userRepository.findOne({
        where: { email },
      });

      if (!userExists) {
        const error = new Error();
        error.message = "Email is not available";
        throw error;
      }

      const sender = new EmailController();
      sender.sendEmail(email as string);
      return "email sent successfully, check your email!";
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
