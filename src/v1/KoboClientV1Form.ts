import {ApiClient} from '../api-client/ApiClient'
import {Kobo, Logger} from '../Kobo'
import {IApiClient} from '../KoboClient'

export class KoboClientV1Form {
  constructor(
    private api: IApiClient,
    private log: Logger,
  ) {}

  readonly getAll = async (): Promise<Kobo.V1.KoboV1Form[]> => {
    return this.api.get(`/v1/forms`)
  }
}
