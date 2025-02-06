import {Obj, seq} from '@alexandreannic/ts-utils'
import {Kobo} from '../Kobo'

type Data = any //Record<string, Date | string | number | null | undefined | Data[] | Record<string, any>>
// type NestedData = Record<string, Date | string | number | null | undefined | Data[] | Data>

export type QuestionIndex = Record<string, Kobo.Form.Question>

export class KoboSubmissionFormatter {
  static readonly formatForApiBody = ({
    data,
    output,
    questionIndex,
    tag,
  }: {
    questionIndex: QuestionIndex
    output: 'toInsert' | 'toUpdate'
    data: Data
    tag?: string
  }): Data => {
    if (output === 'toInsert') {
      return seq([data])
        .map((_) => this.removeMetaData(_))
        .map(this.removePath)
        .map((_) => this.mapValues(_, questionIndex))
        .map((_) => this.setFullQuestionPath(_, questionIndex))
        .map(this.nestKeyWithPath)
        .map((_) => (tag ? this.tagData(tag, _) : _))
        .last()!
    } else {
      return seq([data])
        .map((_) => this.removeMetaData(_))
        .map(this.removePath)
        .map((_) => this.mapValues(_, questionIndex))
        .map((_) => this.setFullQuestionPath(_, questionIndex))
        .map((_) => (tag ? this.tagData(tag, _) : _))
        .last()!
    }
  }

  private static readonly tagData = (tag: string, data: Data): Data => {
    // _IP_ADDED_FROM_XLS
    return {
      ...data,
      [tag]: 'true',
    }
  }

  static readonly removeMetaData = (
    data: Record<string, any>,
    exceptions: (keyof Kobo.Submission.MetaData)[] = [],
  ): Data => {
    return Object.keys(data).reduce((acc, k) => {
      if (!this.metaKeys.has(k as any) || exceptions.includes(k as any)) {
        acc[k] = data[k]
      }
      return acc
    }, {} as any)
  }

  static readonly buildQuestionIndex = (form: Kobo.Form): QuestionIndex =>
    seq(form.content.survey).groupByFirst((_) => _.name)

  static readonly nestKeyWithPath = (input: Data): Data => {
    const obj = this.removeRedondanceInPath(input)
    const result: any = {}

    for (const [path, value] of Object.entries(obj)) {
      const keys = path.split('/')
      let current = result

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (i === keys.length - 1) {
          current[key] = Array.isArray(value) ? value.map((item) => this.nestKeyWithPath(item)) : value
        } else {
          current[key] = current[key] || {}
          current = current[key]
        }
      }
    }

    return result
  }

  private static readonly removeRedondanceInPath = (data: any, currentPath?: string): any => {
    return seq(Object.entries(data)).reduceObject(([k, v]) => {
      const cleanedPath = currentPath ? k.replace(currentPath + '/', '') : k
      if (Array.isArray(v)) {
        return [cleanedPath, v.map((_) => this.removeRedondanceInPath(_, k))] as any
      }
      return [cleanedPath, v]
    })
  }

  static readonly removePath = (data: Data): Data => {
    return seq(Object.entries(data)).reduceObject(([k, v]) => {
      if (this.metaKeys.has(k as any)) return [k, v]
      const nameWithoutGroup = k.replace(/^.*\//, '')
      if (Array.isArray(v)) {
        return [nameWithoutGroup, v.map(this.removePath)]
      }
      // if (typeof v === 'object' && v !== null && !(v instanceof Date)) {
      //   return [nameWithoutGroup, removeGroup(v)] as any
      // }
      return [nameWithoutGroup, v]
    })
  }

  static readonly setFullQuestionPath = (data: Data, questionIndex: QuestionIndex): Data => {
    return seq(Object.entries(data)).reduceObject(([k, v]) => {
      const question = questionIndex[k]
      const nameWithGroup = question?.$xpath ?? k
      if (Array.isArray(v)) {
        return [nameWithGroup, v.map((_) => this.setFullQuestionPath(_, questionIndex))]
      }
      return [nameWithGroup, v]
    })
  }

  private static readonly mapValues = (data: Data, questionIndex: QuestionIndex): Data => {
    return seq(Object.entries(data)).reduceObject(([k, v]) => {
      const type = questionIndex[k]?.type
      const mappedValue = type ? this.mapValue(type, v) : v
      if (Array.isArray(v)) {
        return [k, v.map((_) => this.mapValues(_, questionIndex))]
      }
      return [k, mappedValue]
    })
  }

  private static readonly mapValue = (type: string, value: any): any => {
    if (value == null || value === '') return null

    switch (type) {
      case 'integer':
      case 'decimal':
        return Number.isInteger(value) ? Number(value) : Number(value)
      case 'date':
      case 'datetime':
      case 'start':
      case 'end':
        return this.formatDate(value)
      default:
        return String(value).trim()
    }
  }

  static readonly formatDate = (value: any): string | null => {
    const parsedDate = new Date(value)
    return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().split('T')[0]
  }

  static readonly metaKeys: Set<keyof Kobo.Submission.MetaData> = new Set([
    'formhub/uuid',
    'meta/instanceId',
    'meta/instanceID',
    '_id',
    '__version__',
    '_xform_id_string',
    '_uuid',
    '_attachments',
    '_status',
    '_geolocation',
    '_submission_time',
    '_tags',
    '_notes',
    '_validation_status',
    '_submitted_by',
  ])

  static readonly isolateAnswersFromMetaData = (data: Record<string, any>): Kobo.Submission.Split => {
    const answers: any = {}
    Obj.keys(data).forEach((key) => {
      if (!this.metaKeys.has(key as any)) {
        answers[key] = data[key]
        delete data[key]
      }
    })
    return {...data, answers} as any
  }
}
