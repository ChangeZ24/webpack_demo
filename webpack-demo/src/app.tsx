import { Vue, Component } from "vue-property-decorator";
import { VNode } from "vue/types/umd";

@Component
export default class AppTsx extends Vue {
  msg = "hello tsx";

  render(): VNode {
    //添加VNode作为返回值类型
    return <div>{this.msg}</div>;
  }
}
