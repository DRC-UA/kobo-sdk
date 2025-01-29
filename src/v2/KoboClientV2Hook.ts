import {Kobo, Logger} from '../Kobo'
import {ApiClient} from '../api-client/ApiClient'

export class KoboClientV2Hook {
  constructor(
    private api: ApiClient,
    private log: Logger,
  ) {}

  readonly get = ({formId}: {formId: Kobo.Form.Id}): Promise<Kobo.Paginate<Kobo.Hook>> => {
    return this.api.get(`/v2/assets/${formId}/hooks/`)
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
