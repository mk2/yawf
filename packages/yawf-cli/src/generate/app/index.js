import inquirer from 'inquirer'
import path from 'path'
import { fs, tpl, pathr, genTpl } from '../../util'
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
  const appJs = await fs.readFile(tpl('app.js'))
  const babelConfigJs = await fs.readFile(tpl('babel.config.js'))
  const routesJs = await fs.readFile(tpl('config', 'routes.js'))
  const viewTemplate = await fs.readFile(tpl('config', 'viewTemplate.js'))
  const topJs = await fs.readFile(tpl('server', 'actions', 'top.js'))
  const topPug = await fs.readFile(tpl('views', 'top.pug'))

  packageJson.name = app_name
  await fs.writeFile(genTpl('package.json'), JSON.stringify(packageJson, null, '  '))
  await fs.writeFile(genTpl('babel.config.js'), babelConfigJs)
  await fs.writeFile(genTpl('app.js'), appJs)

  await fs.mkdir(genTpl('server', 'actions'), { recursive: true })
  await fs.writeFile(genTpl('server', 'actions', 'top.js'), topJs)

  await fs.mkdir(genTpl('server', 'models'), { recursive: true })
  await fs.mkdir(genTpl('server', 'hooks'), { recursive: true })

  await fs.mkdir(genTpl('config'), { recursive: true })
  await fs.writeFile(genTpl('config', 'route.js'), routesJs)
  await fs.writeFile(genTpl('config', 'viewTemplate.js'), viewTemplate)

  await fs.mkdir(genTpl('client'), { recursive: true })
  await fs.mkdir(genTpl('views'), { recursive: true })
  await fs.writeFile(genTpl('views', 'top.pug'), topPug)

  const npmInstallCmd = spawn('npm', ['install'], { stdio: 'inherit' })
  npmInstallCmd.on('close', () => {
    process.exit()
  })
}

