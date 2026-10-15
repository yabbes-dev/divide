export class ProfileError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ProfileError";
    this.status = status;
  }
}
