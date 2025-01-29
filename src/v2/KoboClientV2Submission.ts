import {ApiClient} from '../api-client/ApiClient'
import {Kobo, Logger} from '../Kobo'
import {
  KoboUpdateDataParams,
  KoboUpdateDataParamsData,
  KoboClientV2SubmissionFixedUpdated,
} from './KoboClientV2SubmissionFixedUpdated'
import {queuify} from '../helper/Utils'
import {map} from '@alexandreannic/ts-utils'
import axios from 'axios'
import {KoboClientV2} from './KoboClientV2'
import {KoboError} from '../KoboError'

export class KoboClientV2Submission {
  constructor(
    private api: ApiClient,
    private log: Logger,
    private parent: KoboClientV2,
    private editSdk = new KoboClientV2SubmissionFixedUpdated(api, log),
  ) {}

  static readonly parseDate = (_: Date) => _.toISOString()

  static readonly makeDateFilter = (name: string, operator: 'gte' | 'lte', date: Date) => {
    return {[name]: {['$' + operator]: KoboClientV2Submission.parseDate(date)}}
  }

  /**
   * Set to 20k for a safe margin (API max is 30k).
   */
  private static readonly MAX_KOBO_PAGESIZE = 2e4

  readonly getEditLinkUrl = ({formId, submissionId}: {formId: Kobo.FormId; submissionId: Kobo.SubmissionId}) => {
    return this.api.get<{url: string; detail?: string}>(
      `/v2/assets/${formId}/data/${submissionId}/enketo/edit/?return_url=false`,
    )
  }

  readonly delete = ({formId, ids}: {formId: Kobo.Form.Id; ids: Kobo.SubmissionId[]}): Promise<{detail: string}> => {
    return this.api.delete(`/v2/assets/${formId}/data/bulk/`, {
      body: {
        payload: {submission_ids: ids},
      },
    })
  }

  readonly updateValidation = queuify({
    extractDataFromParams: (_) => _.submissionIds,
    reconcileParams: (submissionIds, params) => {
      return [{...params[0], submissionIds}] as const
    },
    run: ({
      formId,
      submissionIds,
      status,
    }: {
      formId: Kobo.FormId
      submissionIds: Kobo.Submission.Id[]
      status: Kobo.Submission.Validation
    }): Promise<Kobo.ApiRes.UpdateValidation> => {
      return this.api.patch(`/v2/assets/${formId}/data/validation_statuses/`, {
        body: {
          payload: {
            submission_ids: submissionIds,
            'validation_status.uid': status,
          },
        },
      })
    },
  })

  readonly updateByQuestionName = async ({
    formId,
    submissionIds,
    questionName,
    newValue,
  }: {
    formId: Kobo.FormId
    submissionIds: Kobo.SubmissionId[]
    questionName: string
    newValue: string
  }) => {
    // return this.api.patch(`/v2/assets/${formId}/data/${submissionId}/`, {
    //   body: {
    //     'start': new Date().toISOString(),
    //   }
    // })
    const form = await this.parent.form.get({formId, use$autonameAsName: true})
    const question = form.content.survey.find((_) => _.name === questionName)
    if (!question) throw new KoboError(`Question ${questionName} not found in form ${formId}`)
    return this.api.patch(`/v2/assets/${formId}/data/bulk/`, {
      body: {
        payload: {
          submission_ids: submissionIds,
          data: {[question.$xpath]: newValue},
        },
      },
    })
  }

  /**
   * Queues update requests to avoid overloading the Kobo API, which silently reject high-volume submissions.
   * @param params.data An object where keys must match question names. The function automatically formats and adds the full $xpath.
   */
  readonly update = <TData extends KoboUpdateDataParamsData>(params: KoboUpdateDataParams<TData>): Promise<void> => {
    return this.editSdk.enqueue(params)
  }

  private readonly getRaw = (form: Kobo.Form.Id, {limit, offset, ...params}: Kobo.Submission.Filter = {}) => {
    const fetchPage = async ({
      limit = KoboClientV2Submission.MAX_KOBO_PAGESIZE,
      offset = 0,
      accumulated = [],
    }: {
      limit?: number
      offset?: number
      accumulated?: Array<Kobo.Submission>
    }): Promise<Kobo.Paginate<Kobo.Submission>> => {
      const start = map(params.start, (_) => KoboClientV2Submission.makeDateFilter('_submission_time', 'gte', _))
      const end = map(params.end, (_) => KoboClientV2Submission.makeDateFilter('_submission_time', 'lte', _))
      const query = start && end ? {$and: [start, end]} : (start ?? end)
      const response = await this.api.get<Kobo.Paginate<Kobo.Submission.MetaData & Record<string, any>>>(
        `/v2/assets/${form}/data`,
        {
          qs: {
            limit: limit,
            start: offset,
            query: query ? JSON.stringify(query) : undefined,
          },
        },
      )
      const results = [...accumulated, ...response.results]
      return results.length >= response.count
        ? {count: response.count, results}
        : fetchPage({offset: offset + response.results.length, accumulated: results})
    }
    return fetchPage({limit, offset})
  }

  /**
   * The Kobo API limits retrieval to a maximum of 30k submissions per request.
   * This function breaks the API calls into smaller chunks to ensure all submissions are retrieved.
   */
  readonly get = async ({
    formId,
    filters = {},
  }: {
    formId: Kobo.Form.Id
    filters?: Kobo.Submission.Filter
  }): Promise<Kobo.Paginate<Kobo.Submission>> => {
    return await this.getRaw(formId, filters).then((res) => {
      return {
        ...res,
        results: res.results
          .map((_) => {
            _._id = '' + _._id
            _._submission_time = new Date(_._submission_time)
            if (_.start) _.start = new Date(_.start)
            if (_.end) _.end = new Date(_.end)
            return _
          })
          .sort((a, b) => {
            return a._submission_time.getTime() - b._submission_time.getTime()
          }),
      }
    })
  }

  readonly getAttachement = ({
    formId,
    attachmentId,
    submissionId,
  }: {
    formId: Kobo.FormId
    submissionId: Kobo.SubmissionId
    attachmentId: string
  }) => {
    return axios
      .create()
      .request({
        url: this.api.params.baseUrl + `/v2/assets/${formId}/data/${submissionId}/attachments/${attachmentId}/`,
        method: 'GET',
        headers: this.api.params.headers,
        responseType: 'arraybuffer',
      })
      .then((_) => _.data)
  }
}
