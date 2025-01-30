import {ApiClient} from '../api-client/ApiClient'
import {Kobo, Logger} from '../Kobo'
import {KoboError} from '../KoboError'
import retry from 'promise-retry'
import {AxiosError} from 'axios'
import {KoboClientV1} from './KoboClientV1'
import {KoboSubmissionFormatter} from '../helper/KoboSubmissionFormatter'
import {js2xml, json2xml, xml2json} from 'xml-js'
import {v4 as uuidv4} from 'uuid'

export class KoboClientV1Submission {
  constructor(
    private api: ApiClient,
    private parent: KoboClientV1,
    private log: Logger,
  ) {
  }

  /**
   * @deprecated Submitting JSON data is unstable. I encountered a bug where submitted data couldn't be edited and instead created a duplicate submission.
   * https://community.kobotoolbox.org/t/posting-data-submissions-using-the-kobo-rest-api/437/7?u=alexandreannic
   * Use {@link submitXml} instead.
   */
  readonly submitJson = async <T extends Record<string, any>>({
    formId,
    data,
    retries = 5,
    uuid,
  }: {
    uuid?: string
    retries?: number
    data: Partial<T>
    formId: Kobo.FormId
  }): Promise<Kobo.V1.SubmitResponse> => {
    const form = await this.parent.parent.v2.form.get({formId})
    const formattedData = KoboSubmissionFormatter.prepareToSubmit({data: data, output: 'toInsert', questionIndex: KoboSubmissionFormatter.buildQuestionIndex(form)})
    const _uuid = uuid ?? (await this.parent.form.getAll().then((_) => _.find((f) => f.id_string === formId)?.uuid))
    if (!_uuid) throw new KoboError(`Form id ${formId} not found.`)
    return retry(
      (retry, number) => {
        return this.api
          .post<Kobo.V1.SubmitResponse>(`/v1/submissions.json`, {
            body: {
              id: formId,
              submission: {
                formhub: {uuid: _uuid},
                'meta/instanceID': 'uuid:4b2b56af-1ea9-4460-8b15-cbc2bc834334',
                ...formattedData,
              },
            },
          })
          .catch((e: AxiosError) => {
            this.log.info(`Failed to submit in ${formId}: ${e.status} ${e.message}. Retry ${number}.`)
            return retry(e)
          })
      },
      {retries},
    )
  }

  /**
   * Include an auto retry mechanism.
   * @param data Only use question's name as key (without begin_group's path). The function will take care of formatting.
   * For `begin_repeat` section use nested array as:
   * {
   *   location: 'Kharkiv',
   *   persons: [
   *    {name: 'Vlad'},
   *    {name: 'Masha'}
   *   ]
   * }
   */
  readonly submitXml = async <T extends Record<string, any>>({
    formId,
    data,
    retries = 5,
  }: {
    retries?: number
    data: Partial<T>
    formId: Kobo.FormId
  }): Promise<Kobo.V1.SubmitResponse> => {
    const form = await this.parent.parent.v2.form.get({formId})
    const formattedData = KoboSubmissionFormatter.prepareToSubmit({data: data, output: 'toInsert', questionIndex: KoboSubmissionFormatter.buildQuestionIndex(form)})
    const uuid = (await this.parent.form.getAll().then((_) => _.find((f) => f.id_string === formId)?.uuid))
    if (!uuid) throw new KoboError(`Form id ${formId} not found.`)

    const xml = KoboClientV1Submission.formatXml({
      formId,
      data: formattedData,
      instanceID: uuidv4(),
      formhubUuid: uuid,
      version: form.version_id,
    })
    const formData = new FormData()
    formData.append('xml_submission_file', new Blob([Buffer.from(xml)], {type: 'application/xml'}), uuid)

    return retry(
      (retry, number) => {
        return this.api
          .post<Kobo.V1.SubmitResponse>(`/v1/submissions`, {
            body: formData,
          })
          .catch((e: AxiosError) => {
            return retry(e)
          })
      },
      {retries},
    )
  }

  static readonly formatXml = ({formhubUuid, version, instanceID, data, formId}: {
    version?: string,
    formId: Kobo.FormId,
    formhubUuid: string,
    data: Record<string, any>,
    instanceID: string
  }) => {
    const json = {
      [formId]: {
        _attributes: {
          id: formId,
          version: '1 (2021-03-25 18:06:48)',
        },
        ...data,
        'formhub': {
          'uuid': formhubUuid,
        },
        __version__: version,
        'meta': {
          'instanceID': 'uuid:' + instanceID,
        },
      },
    }
    return js2xml(json, {compact: true, spaces: 2})
  }

  readonly formatXml = KoboClientV1Submission.formatXml
}
