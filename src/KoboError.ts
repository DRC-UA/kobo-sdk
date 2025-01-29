export class KoboError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KoboError'
    Object.setPrototypeOf(this, KoboError.prototype)
  }
}
