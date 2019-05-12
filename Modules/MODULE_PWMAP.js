/**
 * @description Module for generating "PWMAP" file, and encrypting/decrypting password via "PWMAP" file
 * @functions generatePWMAP|pwmapEncrypt|pwmapDecrypt
 */
function ModulePWMAP() {
    let path_pwmap = "../.local/PWMAP.txt";
    let path_pwmap_tool = "../Tools/Generate_PWMAP.js";
    let pwmap_map = {};
    let config = {
        "code_length": 8, // 密文长度 - eg, 8 - "SCPrMtaB": "A"
        "code_amount": 10, // 密文数量 - eg, 3 - "...": "A", "...": "A", "...": "A"
        "separator": "_.|._",
        "encrypt_power": 2,
    };

    this.generatePWMAP = generatePWMAP;
    this.pwmapEncrypt = pwmapEncrypt;
    this.pwmapDecrypt = pwmapDecrypt;

    // main function(s) //

    function pwmapEncrypt(input) {

        checkPWMAPFile();
        let is_empty_input = !arguments.length;
        input = is_empty_input && userInput("请输入要加密的字符串") || input;
        let thread_monitor = monitorRunningTime("正在加密中 请稍候...");

        let encrypt_power = Math.min(parseInt(config.encrypt_power), 2) || 1;
        input = encrypt(input);
        encrypt_power--;
        while (encrypt_power--) input = encrypt(input.join(config.separator));

        thread_monitor.interrupt();

        let regexp = new RegExp(/[A-Za-z0-9`~!@#$%^&*()_+=\-\[\]}{'\\;:\/?.>,<| ]/);
        let encrypted = "[" + input.map(value => "\"" + value + "\"") + "]";
        is_empty_input && ~setClip(encrypted) && toast("密文数组已复制剪切板");
        return encrypted;

        // tool function(s) //

        function encrypt(str) {
            let result = [];
            for (let i = 0, len = str.length; i < len; i += 1) {
                if (str[i].match(regexp)) result.push(pickARandResult(str[i]));
                else encrypt("\\u" + str[i].charCodeAt(0).toString(16).toUpperCase());
            }
            return result;
        }

        function pickARandResult(str) {
            let tempArr = [];
            for (let name in pwmap_map) {
                pwmap_map.hasOwnProperty(name) && pwmap_map[name] === str && tempArr.push(name)
            }
            return tempArr[~~(Math.random() * config.code_amount)];
        }
    }

    function pwmapDecrypt(input) {

        checkPWMAPFile();
        let is_empty_input = !arguments.length;
        input = is_empty_input && userInput("请输入要解密的字符串数组") || input;
        let thread_monitor = monitorRunningTime("正在解密中 请稍候...");

        let decrypted = decrypt(input);
        thread_monitor.interrupt();
        is_empty_input && ~setClip(decrypted) && toast("解密字符串已复制剪切板");
        return decrypted;

        // tool function(s) //

        function decrypt(encrypted_arr) {
            if (typeof encrypted_arr === "undefined") return undefined;
            if (encrypted_arr === null) return encrypted_arr;

            let arr = encrypted_arr,
                skip_times = 0,
                result = "";
            if (typeof arr === "string") {
                if (!arr.length) return "";
                if (arr[0] !== "[") ~toast("输入的加密字符串不合法") && exit();
                arr = arr.slice(1, -1).split(/, ?/).map(value => value.replace(/^"([^]+)"$/g, "$1"));
            }

            while (1) {
                for (let i = 0, len = arr.length; i < len; i += 1) {
                    if (skip_times) {
                        skip_times--;
                        continue;
                    }
                    let decrypted_str = pwmap_map[arr[i]];
                    if (decrypted_str === undefined) return undefined;
                    if (decrypted_str === "\\" && pwmap_map[arr[i + 1]] === "u") {
                        let tmp_str = "";
                        for (let j = 0; j < 4; j += 1) tmp_str += pwmap_map[arr[i + j + 2]];
                        tmp_str = "%u" + tmp_str;
                        result += unescape(tmp_str);
                        skip_times = 5;
                    } else result += decrypted_str;
                }
                if (!result.match(new RegExp(config.separator))) break;
                arr = result.split(config.separator);
                result = "";
            }
            return result;
        }
    }

    /**
     @description 此工具用于生成或重新生成随机密文文件"PWMAP.txt"
     * 注意: 重新生成将覆盖已生成的密文文件且无法恢复 重新生成后 涉及密文的相关代码均需要重新设置
     */
    function generatePWMAP() {
        if (files.exists(path_pwmap)) if (!confirm("密文文件已存在\n继续操作将覆盖已有文件\n新的密文文件生成后\n涉及密文的全部相关代码\n均需重新设置才能解密\n确定要继续吗?")) exit();
        files.createWithDirs(path_pwmap);
        files.open(path_pwmap);

        let str_map = "~!@#$%^&*`'-_+=,./\\ 0123456789:;?AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz()[]<>{}|\"";
        let az_map = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";

        //// SAMPLE - "SCPrMtaB": "A" ////
        //// SAMPLE - "doaAisDd": "%" ////

        let result = {};

        for (let i = 0, len_i = str_map.length; i < len_i; i += 1) {
            for (let j = 0, len_j = config.code_amount; j < len_j; j += 1) {
                let code_str = "";
                for (let k = 0, len_k = config.code_length, len_map = az_map.length; k < len_k; k += 1) {
                    code_str += az_map[~~(Math.random() * len_map)];
                }
                result[code_str] = str_map[i];
            }
        }

        files.write(path_pwmap, JSON.stringify(result));
        toast("密文文件生成完毕");
    }

    // tool function(s) //

    function checkPWMAPFile() {
        let result = files.exists(path_pwmap);

        if (!result) {
            if (!files.exists(path_pwmap_tool)) {
                alert("密文文件及密文生成文件均不存在 请检查文件目录");
                exit();
            }
            toast("密文文件不存在\n已生成新的密文文件");
            generatePWMAP();
        }
        pwmap_map = JSON.parse(files.read(path_pwmap));
        return result;
    }

    function userInput(msg) {
        let input = "",
            safe_max_try_times = 20;
        while (safe_max_try_times--) {
            input = dialogs.rawInput(msg + "\n点击其他区域放弃输入");
            if (input === null) {
                exit();
            } else if (!input) {
                toast("输入内容无效");
                continue;
            }
            break;
        }
        if (safe_max_try_times < 0) ~toast("已达最大尝试次数") && exit();

        return input;
    }

    function monitorRunningTime(msg) {
        let thread = threads.start(function () {
            msg = msg || "运行中 请稍候...";
            sleep(1200);
            toast(msg);
            let count = 0;
            while (~sleep(1000) && ~count++) {
                if (count % 5) continue;
                toast(msg);
            }
        });
        return thread;
    }
}

module.exports = ModulePWMAP;
