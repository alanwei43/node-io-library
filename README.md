# Node IO 

Node IO 相关命令

## 安装

```bash
npm install -g @js-core/node-io-library
```

## 使用

```bash
# 递归列出当前目录下的文件及Hash
node-io tree ./ --hash

# 递归列出当前目录下文件名以js结尾的文件及Hash
node-io tree ./ --hash --file-filter "js$"

# 将 src/ 目录及其子目录下的文件展开全部放到 dest/ 根目录下
# 并忽略内容重复文件, 如果文件名重复, 将文件hash放在文件名里然后再拷贝到 dest/
node-io tidy src/ dest/ 

# 仅仅打印文件内容重复和文件名重复报告, 不执行拷贝
node-io tidy src/ --report
```