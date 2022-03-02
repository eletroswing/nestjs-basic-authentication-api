interface SignupDTO {
  readonly email: string;
  readonly name: string;
  readonly username: string;
  readonly password: string;
  readonly redirecturl: string;
  readonly redirecterrorurl: string;
}

export { SignupDTO };
