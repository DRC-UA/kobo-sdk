import {ApiClient} from '../api-client/ApiClient'
import {Kobo, Logger} from '../Kobo'
import {KoboError} from '../KoboError'
import retry from 'promise-retry'
import axios, {AxiosError} from 'axios'
import {KoboClientV1} from './KoboClientV1'
import {KoboSubmissionFormatter} from '../helper/KoboSubmissionFormatter'
import {js2xml} from 'xml-js'
import {v4 as uuidv4} from 'uuid'
import FormData from 'form-data'

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
    const formattedData = KoboSubmissionFormatter.formatForApiBody({
      data: data,
      output: 'toInsert',
      questionIndex: KoboSubmissionFormatter.buildQuestionIndex(form),
    })
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

  static readonly sanitizeFileName = (fileName: string): string => {
    return fileName.replaceAll(' ', '_').replaceAll(/[^0-9a-zA-Z-_.\u0400-\u04FF]/g, '')
  }
  readonly sanitizeFileName = KoboClientV1Submission.sanitizeFileName

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
    attachments,
    retries = 5,
  }: {
    attachments?: ({
      name: string
    } & (
      | {url: string; path?: never}
      | {path: string; url?: never}
      ))[]
    retries?: number
    data: Partial<T>
    formId: Kobo.FormId
  }): Promise<Kobo.V1.SubmitResponse> => {
    const form = await this.parent.parent.v2.form.get({formId})
    const formattedData = KoboSubmissionFormatter.formatForApiBody({
      data: data,
      output: 'toInsert',
      questionIndex: KoboSubmissionFormatter.buildQuestionIndex(form),
    })
    const uuid = await this.parent.form.getAll().then((_) => _.find((f) => f.id_string === formId)?.uuid)
    if (!uuid) throw new KoboError(`Form id ${formId} not found.`)

    const xml = KoboClientV1Submission.formatXml({
      formId,
      data: formattedData,
      instanceID: uuidv4(),
      formhubUuid: uuid,
      version: form.version_id,
    })


    const formData = new FormData()
    formData.append('xml_submission_file', Buffer.from(xml), {filename: uuid, contentType: 'application/xml'})

    if (attachments) {
      await Promise.all(attachments.map(async (attachment) => {
        const fileXmlName = KoboClientV1Submission.sanitizeFileName(attachment.name)
        if (attachment.url) {
          const response = await axios.get(attachment.url, {responseType: 'stream'})
          formData.append(fileXmlName, response.data, {
            filename: fileXmlName,
            contentType: response.headers['content-type'] || 'application/octet-stream',
          })
        } else if (attachment.path) {
          const isBrowser = typeof globalThis !== 'undefined' && 'window' in globalThis
          if (isBrowser) {
            throw new Error('Cannot read file from path in browser environment.')
          }
          const fs = require('node:fs')
          if (!fs.existsSync(attachment.path)) {
            throw new Error(`File does not exist: ${attachment.path}`)
          }
          formData.append(attachment.name, fs.createReadStream(attachment.path), {
            filename: attachment.name.normalize('NFC'),
          })
        }
      }))
    }

    return retry((retry, number) => {
        return this.api
          .post<Kobo.V1.SubmitResponse>(`/v1/submissions`, {
            body: formData,
          })
          .catch((e: AxiosError) => {
            return retry(e)
          })
      },
      {retries})
  }

  static readonly formatXml = ({
    formhubUuid,
    version,
    instanceID,
    data,
    formId,
  }: {
    version?: string
    formId: Kobo.FormId
    formhubUuid: string
    data: Record<string, any>
    instanceID: string
  }) => {
    const json = {
      [formId]: {
        _attributes: {
          id: formId,
          version: '1 (2021-03-25 18:06:48)',
        },
        ...data,
        formhub: {
          uuid: formhubUuid,
        },
        __version__: version,
        meta: {
          instanceID: 'uuid:' + instanceID,
        },
      },
    }
    return js2xml(json, {compact: true, spaces: 2})
  }

  readonly formatXml = KoboClientV1Submission.formatXml
}
