import {KoboClientV2} from './v2/KoboClientV2'
import {KoboClientV1} from './v1/KoboClientV1'
import {ApiClient, ApiClientParams, RequestOption} from './api-client/ApiClient'
import {Logger} from './Kobo'

const defaultLogger: Logger = console

export interface IApiClient {
  params: Pick<ApiClientParams, 'baseUrl' | 'headers'>
  
  get: <T = any>(uri: string, options?: RequestOption) => Promise<T>

  post: <T = any>(uri: string, options?: RequestOption) => Promise<T>

  delete: <T = any>(uri: string, options?: RequestOption) => Promise<T>

  put: <T = any>(uri: string, options?: RequestOption) => Promise<T>

  patch: <T = any>(uri: string, options?: RequestOption) => Promise<T>
}

export class KoboClient {
  constructor({
    urlv1,
    urlv2,
    token,
    client = (baseUrl: string) => new ApiClient({
      baseUrl: baseUrl + '/api',
      headers: {
        Authorization: KoboClient.makeAuthorizationHeader(token),
      },
    }),
    log = defaultLogger,
  }: {
    /** kc_url*/
    urlv1: string
    /** kf_url*/
    urlv2: string
    token: string
    client?: (baseUrl: string) => IApiClient
    log?: Logger
  }) {
    this.v1 = new KoboClientV1(client(urlv1), this, log)
    this.v2 = new KoboClientV2(client(urlv2), this, log)
  }

  readonly v1: KoboClientV1
  readonly v2: KoboClientV2
  static readonly makeAuthorizationHeader = (token: string) => `Token ${token}`
}
