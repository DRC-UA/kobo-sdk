import {Logger} from '../Kobo'
import {KoboClientV2Submission} from './KoboClientV2Submission'
import {KoboClientV2Form} from './KoboClientV2Form'
import {KoboClientV2Hook} from './KoboClientV2Hook'
import {IApiClient, KoboClient} from '../KoboClient'

export class KoboClientV2 {
  constructor(
    private api: IApiClient,
    public parent: KoboClient,
    private log: Logger,
  ) {
    this.submission = new KoboClientV2Submission(api, log, this)
    this.form = new KoboClientV2Form(api, log)
    this.hook = new KoboClientV2Hook(api, log)
  }

  readonly submission: KoboClientV2Submission
  readonly form: KoboClientV2Form
  readonly hook: KoboClientV2Hook
}
