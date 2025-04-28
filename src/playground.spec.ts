import {KoboClient} from './KoboClient'

describe.only('test', () => {
  it('test', () => {
    new KoboClient({
      urlv2: 'https://kf.kobotoolbox.org',
      urlv1: 'https://kc.kobotoolbox.org',
      token: '8eafb975ac74bc2c8cfe57fb6879ea362368089c',
    }).v2.form.get({
      format: 'xml',
      formId: 'a3iHWW682WqSxEhtevpoFk',
    }).then(console.log)
  })
})
