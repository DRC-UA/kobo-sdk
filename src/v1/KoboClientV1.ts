import {Logger} from '../Kobo'
import {ApiClient} from '../api-client/ApiClient'
import {KoboClientV1Form} from './KoboClientV1Form'
import {KoboClientV1Submission} from './KoboClientV1Submission'
import {IApiClient, KoboClient} from '../KoboClient'

export class KoboClientV1 {
  constructor(
    private api: IApiClient,
    public parent: KoboClient,
    private log: Logger,
  ) {
    this.form = new KoboClientV1Form(api, log)
    this.submission = new KoboClientV1Submission(api, this, log)
  }

  readonly form: KoboClientV1Form
  readonly submission: KoboClientV1Submission
}
