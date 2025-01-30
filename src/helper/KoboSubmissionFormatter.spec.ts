import {KoboSubmissionFormatter} from './KoboSubmissionFormatter'
import {fixture} from './KoboSubmissionFormatter.fixture'
import {Kobo} from '../Kobo'

describe('Formatter', function () {
  it('removeMetaData', function () {
    expect(
      KoboSubmissionFormatter.removeMetaData(fixture.data.submission),
    ).toEqual({
      oblast: 'CEJ',
      'family/family_name': 'Volodymyr',
      'family/location': [
        {
          'family/location/raion/raion_iso': 'ISO2',
          'family/location/begin_repeat_s9iB96v5h': [
            {
              'family/location/begin_repeat_s9iB96v5h/room': 'kitchen bathroom',
            },
            {
              'family/location/begin_repeat_s9iB96v5h/room': 'kitchen bathroom bedroom',
            },
          ],
        },
      ],
    })
  })

  it('removeGroup', function () {
    expect(
      KoboSubmissionFormatter.removePath({
        'formhub/uuid': '399c8a914b694ca6acd45de92fa625fd',
        start: new Date('2025-01-11T07:39:29.205Z'),
        cal_office: 'mykovaiv',
        'consent_personal_data/consent': 'yes',
        'beneficiary_details/family_member': [
          {
            'beneficiary_details/family_member/gender': 'male',
            'beneficiary_details/family_member/age': '27',
          },
        ],
      }),
    ).toEqual({
      'formhub/uuid': '399c8a914b694ca6acd45de92fa625fd',
      start: new Date('2025-01-11T07:39:29.205Z'),
      cal_office: 'mykovaiv',
      consent: 'yes',
      family_member: [
        {
          gender: 'male',
          age: '27',
        },
      ],
    })
  })

  it('setGroup', function () {
    expect(
      KoboSubmissionFormatter.setFullQuestionPath(
        {
          oblast: 'CEJ',
          family_name: 'Volodymyr',
          location: [
            {
              number: '1',
              raion_name: 'zvenyhorodskyi',
              raion_iso: 'ISO1',
              rooms: [
                {
                  room: 'kitchen',
                },
                {
                  room: 'bathroom',
                },
              ],
            },
          ],
        },
        fixture.questionIndex,
      ),
    ).toEqual({
      oblast: 'CEJ',
      'family/family_name': 'Volodymyr',
      'family/location': [
        {
          'family/location/number': '1',
          'family/location/raion/raion_name': 'zvenyhorodskyi',
          'family/location/raion/raion_iso': 'ISO1',
          'family/location/rooms': [
            {
              'family/location/rooms/room': 'kitchen',
            },
            {
              'family/location/rooms/room': 'bathroom',
            },
          ],
        },
      ],
    })
  })

  it('flattenObject', function () {
    expect(
      (KoboSubmissionFormatter as any/**Bypass private*/).removeRedondanceInPath({
        'base/staffs': [{'base/staffs/name': 'Rich'}, {'base/staffs/name': 'Mat'}],
      }),
    ).toEqual({
      'base/staffs': [{name: 'Rich'}, {name: 'Mat'}],
    })
  })

  it('nestKeys', function () {
    expect(KoboSubmissionFormatter.nestKeyWithPath(fixture.data.submitBody.withSection)).toEqual({
      oblast: 'CEJ',
      family: {
        family_name: 'Volodymyr',
        location: [
          {
            number: '1',
            raion: {
              raion_name: 'zvenyhorodskyi',
              raion_iso: 'ISO1',
            },
            rooms: [
              {
                room: 'kitchen',
              },
              {
                room: 'bathroom',
              },
            ],
          },
          {
            number: '2',
            raion: {
              raion_name: 'zolotoniskyi',
              raion_iso: 'ISO2',
            },
            rooms: [
              {
                room: 'kitchen bathroom',
              },
              {
                room: 'kitchen bathroom bedroom',
              },
            ],
          },
        ],
      },
    })
  })

  it('format to insert', function () {
    expect(
      KoboSubmissionFormatter.prepareToSubmit({
        data: fixture.data.submitBody.withSection,
        questionIndex: fixture.questionIndex,
        output: 'toInsert',
      }),
    ).toEqual(
      {
        oblast: 'CEJ',
        family: {
          family_name: 'Volodymyr',
          location: [
            {
              number: 1,
              raion: {
                raion_name: 'zvenyhorodskyi',
                raion_iso: 'ISO1',
              },
              rooms: [
                {
                  room: 'kitchen',
                },
                {
                  room: 'bathroom',
                },
              ],
            },
            {
              number: 2,
              raion: {
                raion_name: 'zolotoniskyi',
                raion_iso: 'ISO2',
              },
              rooms: [
                {
                  room: 'kitchen bathroom',
                },
                {
                  room: 'kitchen bathroom bedroom',
                },
              ],
            },
          ],
        },
      },
    )
  })

  it('format to update with question names', function () {
    expect(
      KoboSubmissionFormatter.prepareToSubmit({
        data:
          {
            oblast: 'CEJ',
            family_name: 'Volodymyr2',
          },
        questionIndex: fixture.questionIndex,
        output: 'toUpdate',
      }),
    ).toEqual(
      {
        oblast: 'CEJ',
        'family/family_name': 'Volodymyr2',
      },
    )
  })

  it('format to update with path', function () {
    expect(
      KoboSubmissionFormatter.prepareToSubmit({
        data:
          {
            oblast: 'CEJ',
            'family/family_name': 'Volodymyr2',
          },
        questionIndex: fixture.questionIndex,
        output: 'toUpdate',
      }),
    ).toEqual(
      {
        oblast: 'CEJ',
        'family/family_name': 'Volodymyr2',
      },
    )
  })

  it('isolateAnswersFromMetaData', function () {
    const res = KoboSubmissionFormatter.isolateAnswersFromMetaData(fixture.data.submission)
    expect(res).toEqual({
      answers: {
        oblast: 'CEJ',
        'family/family_name': 'Volodymyr',
        'family/location': [
          {
            'family/location/raion/raion_iso': 'ISO2',
            'family/location/begin_repeat_s9iB96v5h': [
              {
                'family/location/begin_repeat_s9iB96v5h/room': 'kitchen bathroom',
              },
              {
                'family/location/begin_repeat_s9iB96v5h/room': 'kitchen bathroom bedroom',
              },
            ],
          },
        ],
      },
      _id: '280073',
      'formhub/uuid': '31c86c94c9004cd7ab5ff196e4fd82d7',
      __version__: 'vziaz4qYum34Hukdky2jfJ',
      'meta/instanceID': 'uuid:83b23c42-9d7b-4eca-9f4c-df42a28faa25',
      _xform_id_string: 'aBC7jcZzfPmzVpvdT9juNM',
      _uuid: '83b23c42-9d7b-4eca-9f4c-df42a28faa25',
      _attachments: [],
      _status: 'submitted_via_web' as unknown as Kobo.Submission.Status,
      _geolocation: [null, null] as Kobo.Submission.Geolocation,
      _submission_time: new Date('2025-01-22T13:16:16'),
      _tags: [],
      _notes: [],
      _validation_status: {},
      _submitted_by: 'meal_drc_ddg_ukr',
    })
  })
})
