const Commander = require("commander")
const command = require("./command")

const program = new Commander.Command()

program
    .description("感谢使用icegulp！")
    .version("v" + require("../package.json").version)

program
    .command("init <directory>")
    .action(directory => {
        command.init(directory)
    })

program
    .command("create -app <app>")
    .action(app => {
        command.createApp(app)
    })

program
    .command("create -page <app> <page>")
    .action((app, page) => {
        command.createPage(app, page)
    })

program
    .on("command:*", function (cmd, args) {
        let name = cmd[0]
        console.log(`错误：命令执行失败\n您可以执行 icegulp --help 或 icegulp -h 来查看所有支持的命令\n`)
    })

program.parse(process.argv)
