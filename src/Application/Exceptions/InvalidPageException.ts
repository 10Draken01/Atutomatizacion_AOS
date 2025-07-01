export class InvalidPageException extends Error {
  constructor(finalPage: number) {
    super(`La página solicitada no es válida. Debe estar entre 1 y ${finalPage}.`);
    this.name = 'InvalidPageException';
  }
}