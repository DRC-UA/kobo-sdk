import {Kobo} from '../Kobo'
import {KoboSubmissionFormatter} from './KoboSubmissionFormatter'

export const fixture = (() => {
  const data = {
    submission: {
      _id: '280073',
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
      _status: 'submitted_via_web' as unknown as Kobo.Submission.Status,
      _geolocation: [null, null] as Kobo.Submission.Geolocation,
      _submission_time: new Date('2025-01-22T13:16:16'),
      _tags: [],
      _notes: [],
      _validation_status: {
        timestamp: undefined,
        uid: undefined,
        by_whom: undefined,
      },
      _submitted_by: 'meal_drc_ddg_ukr',
    },
    submitBody: {
      raw: {
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
      withSection: {
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
    },
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
