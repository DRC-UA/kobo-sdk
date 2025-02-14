import {KoboClientV2Form} from './KoboClientV2Form'
import {Kobo} from '../Kobo'
import {sdk} from '../submit.e2e'

describe('getPermissionSummary', () => {
  it('static', () => {
    const summary = KoboClientV2Form.getPermissionSummary(survey)
    expect(summary).toEqual([
        {
          userName: 'alesia_venetska_78',
          permissions: ['add_submissions', 'partial_submissions', 'view_asset'],
        },
        {userName: 'meal_drc_ddg_ukr', permissions: ['add_submissions']},
      ],
    )
  })
  const survey = {
    'permissions': [
      {
        'url': 'https://kobo.drc.ngo/api/v2/assets/a62ZpworuN4nFLznsUej8r/permission-assignments/pwLkZV42rnUTcs7suDbYH6/',
        'user': 'https://kobo.drc.ngo/api/v2/users/alesia_venetska_78/',
        'permission': 'https://kobo.drc.ngo/api/v2/permissions/add_submissions/',
        'label': 'Add submissions',
      },
      {
        'url': 'https://kobo.drc.ngo/api/v2/assets/a62ZpworuN4nFLznsUej8r/permission-assignments/pceUG9zQen4gPCc9zdfCwc/',
        'user': 'https://kobo.drc.ngo/api/v2/users/alesia_venetska_78/',
        'permission': 'https://kobo.drc.ngo/api/v2/permissions/partial_submissions/',
        'partial_permissions': [
          {
            'url': 'https://kobo.drc.ngo/api/v2/permissions/add_submissions/',
            'filters': [
              {
                'introduction/staff_to_insert_their_DRC_office': 'kharkiv',
              },
            ],
          },
          {
            'url': 'https://kobo.drc.ngo/api/v2/permissions/view_submissions/',
            'filters': [
              {
                'introduction/staff_to_insert_their_DRC_office': 'kharkiv',
              },
            ],
          },
          {
            'url': 'https://kobo.drc.ngo/api/v2/permissions/change_submissions/',
            'filters': [
              {
                'introduction/staff_to_insert_their_DRC_office': 'kharkiv',
              },
            ],
          },
          {
            'url': 'https://kobo.drc.ngo/api/v2/permissions/validate_submissions/',
            'filters': [
              {
                'introduction/staff_to_insert_their_DRC_office': 'kharkiv',
              },
            ],
          },
        ],
        'label': {
          'default': 'Act on submissions only from specific users',
          'view_submissions': 'View submissions only from specific users',
          'change_submissions': 'Edit submissions only from specific users',
          'delete_submissions': 'Delete submissions only from specific users',
          'validate_submissions': 'Validate submissions only from specific users',
        },
      },
      {
        'url': 'https://kobo.drc.ngo/api/v2/assets/a62ZpworuN4nFLznsUej8r/permission-assignments/pvgSA7AhJct7Sug3F6CHbs/',
        'user': 'https://kobo.drc.ngo/api/v2/users/alesia_venetska_78/',
        'permission': 'https://kobo.drc.ngo/api/v2/permissions/view_asset/',
        'label': 'View form',
      },
      {
        'url': 'https://kobo.drc.ngo/api/v2/assets/a62ZpworuN4nFLznsUej8r/permission-assignments/pMexPs72bwNeQgemFb3RWM/',
        'user': 'https://kobo.drc.ngo/api/v2/users/meal_drc_ddg_ukr/',
        'permission': 'https://kobo.drc.ngo/api/v2/permissions/add_submissions/',
        'label': 'Add submissions',
      },
    ],
  } as any as Kobo.Form

  it('e2e generating CSV', async () => {
    const forms = await sdk.v2.form.getAll()
    forms.results.forEach(form => {
      const permissions = sdk.v2.form.getPermissionSummary(form)
      permissions.forEach(permission => {
        console.log([form.name, permission.userName, permission.permissions.join(' ')].join(','))
      })
    })
  })
})
