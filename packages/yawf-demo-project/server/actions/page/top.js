import dbHelper from '../../helpers/db'

export default async function(req, res) {
  const helper = new dbHelper()
  this.$debug('here')
  helper.test()
  res.render('top')
}
