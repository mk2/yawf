import { mixins } from '@yawf/yawf'

export default class extends mixins.orm.utilMixin() {
  test() {
    console.log(this.$db)
  }
}
