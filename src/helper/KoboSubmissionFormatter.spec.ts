import {KoboSubmissionFormatter} from './KoboSubmissionFormatter'
import {Kobo} from '../Kobo'

describe('Formatter', function () {
  it('removeMetaData', function () {
    expect(
      KoboSubmissionFormatter.removeMetaData({
        _id: 280073,
        'formhub/uuid': '31c86c94c9004cd7ab5ff196e4fd82d7',
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
        __version__: 'vziaz4qYum34Hukdky2jfJ',
        'meta/instanceID': 'uuid:83b23c42-9d7b-4eca-9f4c-df42a28faa25',
        _xform_id_string: 'aBC7jcZzfPmzVpvdT9juNM',
        _uuid: '83b23c42-9d7b-4eca-9f4c-df42a28faa25',
        _attachments: [],
        _status: 'submitted_via_web',
        _geolocation: [null, null],
        _submission_time: '2025-01-22T13:16:16',
        _tags: [],
        _notes: [],
        _validation_status: {},
        _submitted_by: 'meal_drc_ddg_ukr',
      }),
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
      KoboSubmissionFormatter.removeGroup({
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
      uuid: '399c8a914b694ca6acd45de92fa625fd',
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
      KoboSubmissionFormatter.removeRedondanceInPath({
        'base/staffs': [{'base/staffs/name': 'Rich'}, {'base/staffs/name': 'Mat'}],
      }),
    ).toEqual({
      'base/staffs': [{name: 'Rich'}, {name: 'Mat'}],
    })
  })

  it('nestKeys', function () {
    expect(KoboSubmissionFormatter.nestKeyWithPath(fixture.data.withSection[0])).toEqual({
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
      KoboSubmissionFormatter.format({
        data: fixture.data.withSection,
        questionIndex: fixture.questionIndex,
        output: 'toInsert',
      }),
    ).toEqual([
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
    ])
  })

  it('format to update with question names', function () {
    expect(
      KoboSubmissionFormatter.format({
        data: [
          {
            oblast: 'CEJ',
            family_name: 'Volodymyr2',
          },
        ],
        questionIndex: fixture.questionIndex,
        output: 'toUpdate',
      }),
    ).toEqual([
      {
        oblast: 'CEJ',
        'family/family_name': 'Volodymyr2',
      },
    ])
  })

  it('format to update with path', function () {
    expect(
      KoboSubmissionFormatter.format({
        data: [
          {
            oblast: 'CEJ',
            'family/family_name': 'Volodymyr2',
          },
        ],
        questionIndex: fixture.questionIndex,
        output: 'toUpdate',
      }),
    ).toEqual([
      {
        oblast: 'CEJ',
        'family/family_name': 'Volodymyr2',
      },
    ])
  })

  const fixture = (() => {
    const data = {
      raw: [
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
            {
              number: '2',
              raion_name: 'zolotoniskyi',
              raion_iso: 'ISO2',
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
      ],
      withSection: [
        {
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
            {
              'family/location/number': '2',
              'family/location/raion/raion_name': 'zolotoniskyi',
              'family/location/raion/raion_iso': 'ISO2',
              'family/location/rooms': [
                {
                  'family/location/rooms/room': 'kitchen bathroom',
                },
                {
                  'family/location/rooms/room': 'kitchen bathroom bedroom',
                },
              ],
            },
          ],
        },
      ],
    }

    const dummyForm: Kobo.Form = {
      content: {
        survey: [
          {
            name: 'oblast',
            type: 'text',
            $xpath: 'oblast',
          },
          {
            name: 'family',
            type: 'begin_group',
            $xpath: 'family',
          },
          {
            name: 'family_name',
            type: 'text',
            $xpath: 'family/family_name',
          },
          {
            name: 'location',
            type: 'begin_repeat',
            $xpath: 'family/location',
          },
          {
            name: 'number',
            type: 'integer',
            $xpath: 'family/location/number',
          },
          {
            name: 'raion',
            type: 'begin_group',
            $xpath: 'family/location/raion',
          },
          {
            name: 'raion_name',
            type: 'select_one',
            $xpath: 'family/location/raion/raion_name',
            select_from_list_name: 'raion',
          },
          {
            name: 'raion_iso',
            type: 'text',
            $xpath: 'family/location/raion/raion_iso',
          },
          {
            type: 'end_group',
          },
          {
            type: 'begin_repeat',
            name: 'rooms',
            $xpath: 'family/location/rooms',
          },
          {
            name: 'room',
            type: 'select_multiple',
            $xpath: 'family/location/rooms/room',
            select_from_list_name: 'room',
          },
          {
            type: 'end_repeat',
          },
          {
            type: 'end_repeat',
          },
          {
            type: 'end_group',
          },
        ],
      },
    } as any
    const questionIndex = KoboSubmissionFormatter.buildQuestionIndex(dummyForm)
    const output = [
      {
        name: 'Gavin Belson',
        address: {
          street: 'Silicon Valley',
          family: [
            {
              job: 'imo mealo',
            },
            {
              job: 'mealo',
            },
          ],
          number: 16,
          country: {
            country_name: 'ua',
            code: 'UA',
          },
        },
      },
    ]
    return {
      questionIndex,
      data,
      dummyForm,
      output,
    }
  })()
})
