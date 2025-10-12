import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../../services/user.service";
import {
  signUpCompanyUserSchema,
  signUpIndividualUserSchema,
  signUpUserSchema,
} from "../../schemas/user.schema";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async signup(request: FastifyRequest, reply: FastifyReply) {
    const params = signUpUserSchema.parse(request.body);
    const user = await this.userService.signup(params);
    return reply.status(201).send(user);
  }

  async signupIndividual(request: FastifyRequest, reply: FastifyReply) {
    const params = signUpIndividualUserSchema.parse(request.body);
    const user = await this.userService.signupIndividual(params);
    return reply.status(201).send(user);
  }

  async signupCompany(request: FastifyRequest, reply: FastifyReply) {
    const params = signUpCompanyUserSchema.parse(request.body);
    const user = await this.userService.signupCompany(params);
    return reply.status(201).send(user);
  }
}
