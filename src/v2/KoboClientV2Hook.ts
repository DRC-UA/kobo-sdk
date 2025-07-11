import {Kobo, Logger, UUID} from '../Kobo'
import {IApiClient} from '../KoboClient'
import {KoboError} from '../KoboError'

export class KoboClientV2Hook {
  constructor(
    private api: IApiClient,
    private log: Logger,
  ) {
  }

  readonly get = ({formId}: {formId: Kobo.FormId}): Promise<Kobo.Paginate<Kobo.Hook>> => {
    return this.api.get(`/v2/assets/${formId}/hooks/`)
  }

  /**
   * Hook's name can be duplicated. In such case, this endpoint will delete the latest.
   */
  readonly deleteByName = async ({
    formId,
    name,
  }: {
    formId: Kobo.FormId
    name: string,
  }) => {
    const match = await this.get({formId}).then(_ => _.results.find(_ => _.name === name))
    if (!match) throw new KoboError(`Hook ${name} not found.`)
    return this.deleteById({formId, id: match.uid})
  }

  readonly deleteById = ({
    formId,
    id,
  }: {
    formId: Kobo.FormId
    id: UUID,
  }) => {
    return this.api.delete<void>(`/v2/assets/${formId}/hooks/${id}/`)
  }

  readonly create = ({
    formId,
    destinationUrl,
    name,
    authLevel = 'no_auth',
    emailNotification = true,
  }: {
    name: string
    formId: Kobo.FormId
    destinationUrl: string
    authLevel?: 'no_auth'
    emailNotification?: boolean
  }) => {
    return this.api.post(`/v2/assets/${formId}/hooks/`, {
      body: {
        name,
        endpoint: destinationUrl,
        active: true,
        subset_fields: [],
        email_notification: emailNotification,
        export_type: 'json',
        auth_level: authLevel,
        settings: {custom_headers: {}},
        payload_template: '',
      },
    })
  }
}
