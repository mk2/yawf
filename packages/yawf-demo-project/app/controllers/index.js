export default class {

  index(req, res) {
    res.render('index', { title: 'hello world', message: 'this is pug' })
  }

}
