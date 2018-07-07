const { http: { makeStandardError } } = parsony.getBundle();

const ERROR = {
  code:500,
  type:'internal_error',
  message:'A server error has occurred.'
};