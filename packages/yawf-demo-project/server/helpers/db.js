import { mixins } from '@yawf/yawf'

export default class extends mixins.ormHook.utilMixin() {
  test() {
    console.log(this.$db)
  }
}
