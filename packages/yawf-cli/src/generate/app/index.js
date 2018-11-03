import inquirer from 'inquirer'
import path from 'path'
import { fs, tpl, pathr, genTpl, writeTpl } from '../../util'
import spawn from 'cross-spawn'

const questions = [
  {
    type: 'input',
    name: 'app_name',
    message: 'Please write an app name for generate.',
    default: function() {
      return path.basename(process.cwd())
    }
  }
]

export default async function() {
  const {
    app_name
  } = await inquirer.prompt(questions)

  const packageJson = JSON.parse(await fs.readFile(tpl('package.json')))

  packageJson.name = app_name
  await fs.writeFile(genTpl('package.json'), JSON.stringify(packageJson, null, '  '))
  await writeTpl(tpl('babel.config.js'), genTpl('babel.config.js'))
  await writeTpl(tpl('app.js'), genTpl('app.js'))
  await writeTpl(tpl('dot.editorconfig'), genTpl('.editorconfig'))
  await writeTpl(tpl('dot.gitignore'), genTpl('.gitignore'))

  await fs.mkdir(genTpl('server', 'actions'), { recursive: true })
  await writeTpl(tpl('server', 'actions', 'top.js'), genTpl('server', 'actions', 'top.js'))

  await fs.mkdir(genTpl('server', 'models'), { recursive: true })
  await fs.mkdir(genTpl('server', 'hooks'), { recursive: true })

  await fs.mkdir(genTpl('config'), { recursive: true })
  await writeTpl(tpl('config', 'routes.js'), genTpl('config', 'routes.js'))
  await writeTpl(tpl('config', 'viewTemplate.js'), genTpl('config', 'viewTemplate.js'))

  await fs.mkdir(genTpl('client'), { recursive: true })
  await fs.mkdir(genTpl('views'), { recursive: true })
  await writeTpl(tpl('views', 'top.pug'), genTpl('views', 'top.pug'))

  const npmInstallCmd = spawn('npm', ['install'], { stdio: 'inherit' })
  npmInstallCmd.on('close', () => {
    process.exit()
  })
}

