import {ApiClient} from '../api-client/ApiClient'
import {Kobo, Logger} from '../Kobo'

export class KoboClientV2Form {
  constructor(
    private api: ApiClient,
    private log: Logger,
  ) {}

  readonly getAll = ({limit = 2000}: {limit?: number} = {}) => {
    return this.api.get<Kobo.Paginate<Kobo.Form.Light>>(`/v2/assets/?q=asset_type%3Asurvey&limit=${limit}`)
  }

  readonly get = ({formId, use$autonameAsName}: {use$autonameAsName?: boolean; formId: Kobo.FormId}) => {
    return this.api.get<Kobo.Form>(`/v2/assets/${formId}`).then((_) => {
      if (use$autonameAsName)
        _.content.survey.forEach((q) => {
          q.name = q.$autoname ?? q.name
        })
      return _
    })
  }

  readonly getByVersion = ({formId, versionId}: {formId: Kobo.Form.Id; versionId: string}) => {
    return this.api.get<Kobo.Form>(`/v2/assets/${formId}/versions/${versionId}`)
  }

  readonly getVersions = ({formId}: {formId: Kobo.FormId}) => {
    return this.api.get<Kobo.Paginate<Kobo.Submission.Version>>(`/v2/assets/${formId}/versions`).then((_) => {
      _.results.forEach((r) => {
        r.date_modified = new Date(r.date_modified)
        r.date_deployed = new Date(r.date_deployed)
      })
      return _
    })
  }

  readonly updateDeployment = ({formId, active}: {formId: Kobo.FormId; active: boolean}) => {
    return this.api.patch(`/v2/assets/${formId}/deployment/`, {body: {active}})
  }
}
