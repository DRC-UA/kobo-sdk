export type Logger = {
  error: (_: string) => void
  info: (_: string) => void
  debug: (_: string) => void
}
export type UUID = string

export namespace Kobo {
  export namespace V1 {
    export type SubmitResponse = {
      message?: 'Successful submission.'
      formid?: Kobo.Submission.Id
      encrypted?: boolean
      instanceID?: string
      submissionDate?: string
      markedAsCompleteDate?: string
      error?: 'Duplicate submission'
    }

    export type KoboV1Form = {
      uuid: string
      id_string: Kobo.Submission.Id
    }
  }

  export interface Paginate<T> {
    count: number
    results: T[]
  }

  export type Hook = {
    url: string
    logs_url: string
    asset: number
    uid: string
    name: 'InfoPortal'
    endpoint: string
    active: true
    export_type: 'json'
    auth_level: 'no_auth'
    success_count: number
    failed_count: number
    pending_count: number
    settings: any
    date_modified: Date
    email_notification: boolean
    subset_fields: any[]
    payload_template: ''
  }

  export namespace ApiRes {
    export type UpdateValidation = {
      by_whom: string
      color: string
      label: string
      timestamp: number
      uid: Kobo.Submission.Validation
    }
  }

  export type FormId = Form.Id
  export type Form = Form.Form
  export namespace Form {
    export type Id = string
    export type Light = Exclude<Form, 'deployment__links'>

    export type Formula = string

    export type Question = {
      name: string
      $autoname: string
      $kuid: string
      $qpath: string
      $xpath: string
      required?: boolean
      relevant?: Formula
      default?: Formula
      constraint?: Formula
      constraint_message?: string[]
      label?: string[]
      hint?: string[]
      appearance?: 'multiline' | 'quick'
      file?: string
      type: QuestionType
      calculation: Formula
      choice_filter?: string
      select_from_list_name?: string
      repeat_count?: Formula
    }

    export type Choice = {
      $autovalue: string
      $kuid: string
      label: string[]
      list_name: string
      name: string
    }

    export enum DeploymentStatus {
      deployed = 'deployed',
      archived = 'archived',
      draft = 'draft',
    }

    export type File = {
      asset: string
      content: string
      date_created: string
      description: string
      file_type: string
      metadata: {
        filename: string
        hash: string
        mimetype: string
      }
      uid: string
      url: string
      user: string
      user__username: string
    }

    export type QuestionType =
      | 'file'
      | 'deviceid'
      | 'end_repeat'
      | 'begin_repeat'
      | 'begin_group'
      | 'select_one'
      | 'note'
      | 'datetime'
      | 'end_group'
      | 'username'
      | 'geopoint'
      | 'image'
      | 'today'
      | 'text'
      | 'calculate'
      | 'integer'
      | 'decimal'
      | 'select_multiple'
      | 'select_one_from_file'
      | 'date'
      | 'start'
      | 'end'

    export type Translated = 'label' | 'hint' | 'constraint_message' | 'media::image' | 'required_message'

    export interface Form {
      name: string
      deployment__links: {
        iframe_url: string
        offline_url: string
        preview_url: string
        single_iframe_url: string
        single_once_iframe_url: string
        single_once_url: string
        single_url: string
        url: string
      }
      content: {
        choices?: Choice[]
        schema: string
        settings: Partial<{version: string; default_language: string}>
        survey: Question[]
        translated: Translated[]
        translations: string[]
      }
      deployment_status: DeploymentStatus
      has_deployment: boolean
      date_created: Date
      date_modified: Date
      deployed_version_id: string
      deployment__active: boolean
      // deployment__identifier: "https://kc.humanitarianresponse.info/alexandre_annic_drc/forms/aRHsewShwZhXiy8jrBj9zf"
      deployment__submission_count: 0
      // downloads: [,…]
      // export_settings: []
      kind: 'asset'
      // owner: "https://kobo.humanitarianresponse.info/api/v2/users/alexandre_annic_drc/"
      owner__username: string
      // parent: null
      permissions: Permission[]
      // settings: {sector: {label: "Humanitarian - Coordination / Information Management",…},…}
      status: 'private'
      subscribers_count: 0
      // summary: {geo: false,…}
      tag_string: string
      uid: string
      url: string
      version_id: string
      files: File[]
    }
  }

  export type Permission = Permission.T
  export namespace Permission {
    export enum Label {
      'Add submissions' = 'Add submissions',
      'Edit form' = 'Edit form',
      'Edit submissions' = 'Edit submissions',
      'Delete submissions' = 'Delete submissions',
      'Manage project' = 'Manage project',
      'Validate submissions' = 'Validate submissions',
      'View form' = 'View form',
      'View submissions' = 'View submissions',
    }

    export enum Code {
      add_submissions = 'add_submissions',
      change_asset = 'change_asset',
      change_submissions = 'change_submissions',
      delete_submissions = 'delete_submissions',
      manage_asset = 'manage_asset',
      validate_submissions = 'validate_submissions',
      view_asset = 'view_asset',
      view_submissions = 'view_submissions',
      partial_submissions = 'partial_submissions',
    }

    export type T = {
      label:
        | Label
        | {
        change_submissions: string // "Edit submissions only from specific users"
        default: string // "Act on submissions only from specific users"
        delete_submissions: string // "Delete submissions only from specific users"
        validate_submissions: string // "Validate submissions only from specific users"
        view_submissions: string // "View submissions only from specific users"
      }
      partial_permissions?: {
        filters: string // [{introduction/staff_code: "CEJ011"}]
        url: string // "https://kobo.drc.ngo/api/v2/permissions/add_submissions/"
      }[]
      permission: string // "https://kobo.drc.ngo/api/v2/permissions/change_asset/"
      url: string // "https://kobo.drc.ngo/api/v2/assets/a62ZpworuN4nFLznsUej8r/permission-assignments/p7H7SZR4KRqsJ9EesKMGpC/"
      user: string // "https://kobo.drc.ngo/api/v2/users/meal_drc_ddg_ukr/"
    }

    export type Level = 'full' | 'partial' | 'none'

    export type Summary = {
      userName: string
      permissions: Code[]
    }
  }

  export type Submission = Submission.Split
  export type SubmissionId = Submission.Id
  export namespace Submission {
    export type Raw = MetaData & Record<string, any>

    export type Split<T extends Record<string, any> = Record<string, any>> = MetaData & {answers: T}
    // export type Split<T extends Record<string, any> = Record<string, any>> = MetaData & {answers: T}

    export type Id = string
    export type UUID = string

    export type Filter = {
      start?: Date
      end?: Date
      limit?: number
      offset?: number
    }

    export type UpdateResponse = {
      count: number
      successes: number
      failures: number
      results: any[]
    }

    export interface Version {
      uid: string
      url: string
      content_hash: string
      date_deployed: Date
      date_modified: Date
    }

    export interface MetaData {
      _id: Id
      start?: Date
      end?: Date
      __version__?: string
      _xform_id_string: string
      _uuid: UUID
      _attachments?: Attachment[]
      _status: Status
      _geolocation: Geolocation
      _submission_time: Date
      _tags: Tags[]
      _notes: Notes[]
      _validation_status:
        | {
        timestamp: number
        uid: Validation
        by_whom: string
      }
        | {
        timestamp: undefined
        uid: undefined
        by_whom: undefined
      }
      _submitted_by: any
      'formhub/uuid': string
      'meta/instanceId'?: string
      'meta/instanceID'?: string
    }

    export interface Status {
      submitted_via_web: 'submitted_via_web'
    }

    export enum Validation {
      validation_status_on_hold = 'validation_status_on_hold',
      validation_status_approved = 'validation_status_approved',
      validation_status_not_approved = 'validation_status_not_approved',
      no_status = 'no_status',
    }

    export type Geolocation = [number, number] | [null, null]
    export type Tags = any
    export type Notes = any
    export type Attachment = {
      download_url: string
      filename: string
      download_small_url: string
      question_xpath: string
      id: number
    }
  }
}
