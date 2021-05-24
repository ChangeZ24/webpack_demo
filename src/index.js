document.write('hello webpack!');

__webpack_public_path__ = './lib/';
// 按需引入 girl.js 文件
import('./demo').then((result) => {
    result.default(); // 满足 demo 的需求
});