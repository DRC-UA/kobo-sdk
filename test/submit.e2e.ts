import {KoboClient} from '../src'
import dotenv from 'dotenv'
import {z} from 'zod'
import {duration} from '@alexandreannic/ts-utils'

dotenv.config()

const envSchema = z.object({
  KOBO_URLV2: z.string(),
  KOBO_URLV1: z.string(),
  KOBO_TOKEN: z.string(),
  FORM_ID: z.string(),
})
const env = envSchema.parse(process.env)

const sdk = new KoboClient({
  urlv2: env.KOBO_URLV2,
  urlv1: env.KOBO_URLV1,
  token: env.KOBO_TOKEN,
})

describe.only('Real API Submission', () => {
  beforeAll(
    async () => {
      const res = await sdk.v1.submission.submitXml({
        formId: env.FORM_ID,
        data: {
          oblast: 'Kharkiv',
          date: new Date(2024, 0, 1),
          assistance: 'mpca nfi',
          family_name: 'IM',
          location: [
            {
              number: 10,
              raion_name: 'zvenyhorodskyi',
              raion_iso: 'ISO',
              begin_repeat_s9iB96v5h: [{room: 'bedroom'}, {room: 'kitchen bathroom'}],
            },
          ],
        },
      })
    },
    duration(20, 'second'),
  )

  it(
    'should submit',
    async function () {
      const answers = await sdk.v2.submission.getRaw({formId: env.FORM_ID})
      const last = answers.results[answers.results.length - 1]
      expect(last['date']).toEqual('2024-01-01')
      expect(last['oblast']).toEqual('Kharkiv')
      expect(last['family/assistance']).toEqual('mpca nfi')
      expect(last['family/family_name']).toEqual('IM')
      expect(last['family/location'][0]['family/location/number']).toEqual('10')
      expect(last['family/location'][0]['family/location/raion/raion_iso']).toEqual('ISO')
      expect(last['family/location'][0]['family/location/raion/raion_name']).toEqual('zvenyhorodskyi')
      expect(
        last['family/location'][0]['family/location/begin_repeat_s9iB96v5h'][0][
          'family/location/begin_repeat_s9iB96v5h/room'
        ],
      ).toEqual('bedroom')
      expect(
        last['family/location'][0]['family/location/begin_repeat_s9iB96v5h'][1][
          'family/location/begin_repeat_s9iB96v5h/room'
        ],
      ).toEqual('kitchen bathroom')
      expect(last['_id']).toBeDefined()
      expect(last['_uuid']).toBeDefined()
      expect(last['_submitted_by']).toBeDefined()
      expect(last['_status']).toEqual('submitted_via_web')
    },
    duration(20, 'second'),
  )

  it(
    'should update non repeated questions',
    async function () {
      const answers = await sdk.v2.submission.get({formId: env.FORM_ID}).then((_) => _.results)
      const last = answers[answers.length - 1]
      await sdk.v2.submission.update({
        formId: env.FORM_ID,
        submissionIds: [last._id],
        data: {
          assistance: 'nfi protection',
          date: new Date(2025, 0, 1).toDateString(),
          oblast: 'Mykolaiv',
          family_name: 'MEAL',
        },
      })
      const updatedSubmissions = await sdk.v2.submission
        .getRaw({formId: env.FORM_ID})
        .then((_) => _.results.find((_) => _._id === last._id))
      if (updatedSubmissions) {
        expect(updatedSubmissions['oblast']).toEqual('Mykolaiv')
        expect(updatedSubmissions['family/assistance']).toEqual('nfi protection')
        expect(updatedSubmissions['family/family_name']).toEqual('MEAL')
        expect(updatedSubmissions['date']).toEqual('2025-01-01')
      } else {
        expect(updatedSubmissions).toBeDefined()
      }
    },
    duration(20, 'second'),
  )

  it(
    'should delete all',
    async function () {
      const answers = await sdk.v2.submission.get({formId: env.FORM_ID})
      expect(answers.results.length).toBeGreaterThan(0)
      await sdk.v2.submission.delete({formId: env.FORM_ID, submissionIds: answers.results.map((_) => _._id)})
      const answersAfterDeletion = await sdk.v2.submission.get({formId: env.FORM_ID})
      expect(answersAfterDeletion.results.length).toEqual(0)
    },
    duration(20, 'second'),
  )
})
