import { Request } from 'aws-sdk/global';

type NonFunction<T> = T extends () => void ? never : T;

type IAWSMethod<ThisT, ReturnT, ErrorT, ParamT> = (
  this: ThisT,
  arg: NonFunction<ParamT>,
  callback: (err: ErrorT, data: ReturnT) => any
) => Request<ReturnT, ErrorT>;

export function PromisifyAWS<MethodThisT, RetT, ErrT, ParamT>(
  mThis: MethodThisT,
  method: IAWSMethod<MethodThisT, RetT, ErrT, ParamT>,
  arg: NonFunction<ParamT>
) {
  return new Promise<RetT>((resolve, reject) => {
    method.call(mThis, arg, (err, data) =>
      data !== null ? resolve(data) : reject(err)
    );
  });
}
