const fs = require("fs");
const glob = require("glob");
const path = require("path");
const join = path.join;

module.exports = {
    prompts: [
        {
            name: 'project_title',
            message: 'Project title',
            default: '{outFolder}'
        },
        {
            name: 'process_name',
            message: 'Process name',
            default: '{outFolder}'
        },
        {
            name: 'port',
            message: 'Port',
            default: 11000
        },
        {
            name: 'domain',
            message: 'Domain',
            default: '{outFolder}'
        },
        {
            name: 'database',
            message: 'Mongodb database name',
            default: '{outFolder}'
        },
        {
            name: 'socket',
            message: 'Use a WebSocket',
            type: 'list',
            choices: [
                'none',
                {
                    name: 'Socket.io',
                    value: 'io'
                },
                {
                    name: 'WebSocket raw',
                    value: 'ws'
                }
            ],
            default: 'none'
        },
        {
            name: 'auth',
            message: 'Use auth',
            type: 'checkbox',
            choices: [
                {
                    name: 'Email + Password',
                    value: 'email'
                },
                {
                    name: 'Phone + SMS',
                    value: 'phone'
                }
            ],
            default: []
        }
    ],
    async completed() {
        let replaceData = {
            __PORT__: this.answers.port,
            __DATABASE__: this.answers.database.toLowerCase(),
            __PROJECT_TITLE__: this.answers.project_title,
            __DOMAIN__: this.answers.domain.toLowerCase(),
            __PROCESS_NAME__: this.answers.process_name.toLowerCase()
        }

        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };

        let data;
        if (!this.answers.auth.includes("email") && this.answers.auth.includes("phone")) {
            fs.unlinkSync("./app/soc-routes/auth-email.js");
            fs.unlinkSync("./app/web-routes/api/email/auth.js");
            fs.rmdirSync("./app/web-routes/api/email");
            fs.renameSync("./app/soc-routes/auth-phone.js", "./app/soc-routes/auth.js");
            fs.renameSync("./app/web-routes/api/phone/auth.js", "./app/web-routes/api/auth.js");
            fs.rmdirSync("./app/web-routes/api/phone");
            data = fs.readFileSync("./app/web-routes/api/auth.js").toString();
            data = data.replaceAll("phone/auth", "auth");
            data = data.replaceAll("_phone", "");
            fs.writeFileSync("./app/web-routes/api/auth.js", data);
        } else if (!this.answers.auth.includes("phone") && this.answers.auth.includes("email")) {
            fs.unlinkSync("./app/soc-routes/auth-phone.js");
            fs.unlinkSync("./app/web-routes/api/phone/auth.js");
            fs.rmdirSync("./app/web-routes/api/phone");
            fs.renameSync("./app/soc-routes/auth-email.js", "./app/soc-routes/auth.js");
            fs.renameSync("./app/web-routes/api/email/auth.js", "./app/web-routes/api/auth.js");
            fs.rmdirSync("./app/web-routes/api/email");
            data = fs.readFileSync("./app/web-routes/api/auth.js").toString();
            data = data.replaceAll("email/auth", "auth");
            data = data.replaceAll("_email", "");
            fs.writeFileSync("./app/web-routes/api/auth.js", data);
        } else if (!this.answers.auth.includes("phone") && !this.answers.auth.includes("email")) {
            fs.unlinkSync("./app/soc-routes/auth-email.js");
            fs.unlinkSync("./app/web-routes/api/email/auth.js");
            fs.rmdirSync("./app/web-routes/api/email");
            fs.unlinkSync("./app/soc-routes/auth-phone.js");
            fs.unlinkSync("./app/web-routes/api/phone/auth.js");
            fs.rmdirSync("./app/web-routes/api/phone");
        }
        switch (this.answers.socket) {
            case "io":
                data = fs.readFileSync("./app/index.js").toString();
                data = data.replace("__SOCKET__", 'const socket = require("./core/socket");');
                data = data.replace("__SOCKET_INIT__", 'socket.init(server);');
                fs.writeFileSync("./app/index.js", data);
                fs.unlinkSync("./app/core/socket-ws.js");
                fs.renameSync("./app/core/socket-io.js", "./app/core/socket.js");
                break;
            case "ws":
                data = fs.readFileSync("./app/index.js").toString();
                data = data.replace("__SOCKET__", 'const socket = require("./core/socket");');
                data = data.replace("__SOCKET_INIT__", 'socket.init(server);');
                fs.writeFileSync("./app/index.js", data);
                fs.unlinkSync("./app/core/socket-io.js");
                fs.renameSync("./app/core/socket-ws.js", "./app/core/socket.js");
                break;
            default:
                data = fs.readFileSync("./app/index.js").toString();
                data = data.replace("__SOCKET__", '');
                data = data.replace("__SOCKET_INIT__", '');
                _routes = join(__dirname, "./app/soc-routes");
                for (let file of glob.sync(_routes + "/**/*.js")) {
                    fs.unlinkSync(file);
                }
                fs.writeFileSync("./app/index.js", data);
                fs.unlinkSync("./app/core/socket-ws.js");
                fs.unlinkSync("./app/core/socket-io.js");
                fs.rmdirSync("./app/soc-routes");
                break;
        }

        const routes = join(__dirname, "./app");

        for (let file of glob.sync(routes + "/**/*.js")) {
            data = fs.readFileSync(file).toString();
            for (let key in replaceData) {
                data = data.replaceAll(key, replaceData[key]);
            }
            fs.writeFileSync(file, data);
        }
        data = fs.readFileSync("./_package.json").toString();
        for (let key in replaceData)
            data = data.replaceAll(key, replaceData[key]);

        data = JSON.parse(data);
        if (this.answers.socket == "io")
            data.dependencies["socket.io"] = "^2.2.0";
        if (this.answers.socket == "ws")
            data.dependencies["websocket"] = "^1.0.29";
        fs.writeFileSync("./package.json", JSON.stringify(data));
        fs.unlinkSync("./_package.json");

        const ncu = require('npm-check-updates');
        ncu.run({
            jsonUpgraded: true,
            packageManager: 'npm',
        }).then((upgraded) => {
            console.log('dependencies to upgrade:', upgraded);
        });

        fs.unlinkSync("./init.js");
        fs.unlinkSync("./saofile.js");
        require('shelljs').rm('-rf', './.git');
        this.gitInit();
    }
}