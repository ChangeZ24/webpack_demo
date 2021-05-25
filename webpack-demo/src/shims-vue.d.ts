declare module "*.vue" {
  // 声明所有的 .vue 文件导出的都是一个 Vue 实例
  import Vue from "vue";
  export default Vue;
}
