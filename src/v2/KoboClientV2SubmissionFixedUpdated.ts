import {AxiosError} from 'axios'
import {Kobo, Logger} from '../Kobo'
import {ApiClient} from '../api-client/ApiClient'
import {chunkify} from '@alexandreannic/ts-utils'
import {KoboClientV2Submission} from './KoboClientV2Submission'
import {KoboSubmissionFormatter, QuestionIndex} from '../helper/KoboSubmissionFormatter'

export type KoboUpdateDataParamsData = Record<string, string | string[] | number | null | undefined>
export type KoboUpdateDataParams<TData extends KoboUpdateDataParamsData = any> = {
  formId: Kobo.FormId
  submissionIds: Kobo.SubmissionId[]
  data: TData
}

export class KoboClientV2SubmissionFixedUpdated {
  static readonly BATCH_SIZE = 20
  static readonly CONCURRENCY = 12

  constructor(
    private api: ApiClient,
    private log: Logger,
    private parent: KoboClientV2Submission,
  ) {}

  private queues: Map<Kobo.FormId, KoboUpdateDataParams[]> = new Map()
  private locks: Map<Kobo.FormId, Promise<void>> = new Map()

  async enqueue(params: KoboUpdateDataParams): Promise<void> {
    if (!this.queues.has(params.formId)) {
      this.queues.set(params.formId, [])
    }
    this.queues.get(params.formId)!.push(params)
    await this.processQueue(params.formId)
  }

  private async processQueue(formId: Kobo.FormId): Promise<void> {
    if (this.locks.get(formId)) {
      return this.locks.get(formId)
    }
    const form = await this.parent.parent.form.get({formId})
    const processing = (async () => {
      while (this.queues.get(formId)!.length > 0) {
        const params = this.queues.get(formId)!.shift()!
        try {
          await chunkify({
            concurrency: KoboClientV2SubmissionFixedUpdated.CONCURRENCY,
            size: KoboClientV2SubmissionFixedUpdated.BATCH_SIZE,
            data: params.submissionIds,
            fn: (ids) =>
              this.apiCall({
                ...params,
                submissionIds: ids,
                questionIndex: KoboSubmissionFormatter.buildQuestionIndex(form),
              }),
          })
        } catch (e) {
          this.locks.delete(formId)
        }
      }
    })()
    this.locks.set(formId, processing)
    await processing
    this.locks.delete(formId)
  }

  private readonly apiCall = async (
    params: KoboUpdateDataParams & {questionIndex: QuestionIndex},
  ): Promise<Kobo.Submission.UpdateResponse> => {
    const message = (status: 'Failed' | 'Success', e?: AxiosError) => {
      const name = params.formId
      const ids =
        `[${params.submissionIds[0]}]` + (params.submissionIds.length > 1)
          ? ` +${params.submissionIds.length - 1}]`
          : ''
      return `Update ${name} ${ids} ${JSON.stringify(params.data)}.` + (e ? ` ERR ${e.status}` : '')
    }
    const {formId, data, submissionIds} = params
    return this.api
      .patch<Kobo.Submission.UpdateResponse>(`/v2/assets/${formId}/data/bulk/`, {
        body: {
          payload: {
            submission_ids: submissionIds,
            data: KoboSubmissionFormatter.formatForApiBody({
              data,
              output: 'toUpdate',
              questionIndex: params.questionIndex,
            }),
          },
        },
      })
      .then((_) => {
        this.log.info(message('Success'))
        return _
      })
      .catch((e: AxiosError) => {
        this.log.error(message('Failed', e))
        throw e
      })
  }
}
