interface ResetPasswordConfirmationDTO {
  readonly token: string;
  readonly code: string;
  readonly password: string;
}

export { ResetPasswordConfirmationDTO };
