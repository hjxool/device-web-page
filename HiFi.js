Vue.component('single-slider', {
    props: ['index', 'channel', 'device_id', 'token'],
    data: function () {
        return {
            mute: 0,//静音
            sliderNum: 0,//音量
            channelsData: [],//命令下发数据
        }
    },
    created: function () {
        this.order = _.debounce(this.order_set, 500);
    },
    mounted: function () {
        this.sliderNum = this.channel.volume;
        this.mute = this.channel.mute;
    },
    watch: {
        sliderNum: function (newValue) {
            if (newValue < -80) {
                this.sliderNum = -80;
            } else if (newValue > 18) {
                this.sliderNum = 18;
            } else {
                this.sliderNum = Math.floor(newValue);
            }
            // 根据输入改变滑块
            let sliderCover = document.getElementById(`sliderCover${this.index}`);
            let sliderImg = document.getElementById(`sliderImg${this.index}`);
            let content = document.getElementsByClassName('sliderContent')[0].offsetHeight;
            // let negativeNum = content * 0.8163;
            // if (this.sliderNum < 0 || this.sliderNum >= -80) {
            //     let tempNum = (this.sliderNum + 80) / 80 * negativeNum;
            //     sliderCover.style.height = `${tempNum}px`;
            //     sliderImg.style.bottom = `${(tempNum - 18)}px`;
            // } else if (this.sliderNum <= 18 || this.sliderNum >= 0) {
            //     let tempNum = this.sliderNum / 18 * (content - negativeNum) + negativeNum;
            //     sliderCover.style.height = `${tempNum}px`;
            //     sliderImg.style.bottom = `${(tempNum - 18)}px`;
            // }
            let tempNum = (this.sliderNum + 80) / 98 * content;
            sliderCover.style.height = `${tempNum}px`;
            sliderImg.style.bottom = `${(tempNum - 18)}px`;
            this.channelsData = [];
            let obj = {};
            obj.id = this.device_id;
            obj.mute = this.mute;
            obj.number = this.channel.number;
            obj.volume = this.sliderNum;
            this.channelsData.push(obj);
            this.order();
        }
    },
    methods: {
        // 封装的请求方法
        request: function (method, url, data, key, token, func) {
            axios({
                method: method,
                url: url,
                data: {
                    client: "PC",
                    user: "",
                    version: "1.0.1",
                    data: data,
                    key: key
                },
                headers: { 'token': token }
            }).then(res => {
                if (res.data.code == 1000) {
                    if (res.data.data) {
                        func(res);
                    } else {
                        this.$message.error('数据为空');
                    }
                } else {
                    this.$alert(res.data.message, '提示', {
                        confirmButtonText: '确定',
                        callback: () => {
                            if (res.data.code == 3005 || res.data.code == 3006) {
                                window.location.href = '../test demo/login/login.html';
                            }
                        }
                    });
                }
            });
        },
        // 静音
        soundOff: function () {
            if (this.mute == 0) {
                this.mute = 1;
            } else {
                this.mute = 0;
            }
            let channelsData = [];
            let obj = {};
            obj.id = this.device_id;
            obj.mute = this.mute;
            obj.number = this.channel.number;
            obj.volume = this.sliderNum;
            channelsData.push(obj);
            this.request('post', channelControlUrl, { channelsData: channelsData }, "123456", this.token, function () { });
        },
        // 命令下发
        order_set: function () {
            this.request('post', channelControlUrl, { channelsData: this.channelsData }, "123456", this.token, function () { console.log(789) });
        },
    },
    template: `
        <div class="singleSliderContent">
            <img src="./img/控制条.png" style="width: 100%;height: 100%;position: absolute;z-index: -99;object-fit: cover;">
            <span class="sliderName">OUT {{channel.number}}</span>
            <div style="width: 100%;height: 2px;">
                <div style="background: #01112C;width: 100%;height: 1px;"></div>
                <div style="background: #1053A7;width: 100%;height: 1px;"></div>
            </div>
            <div class="sliderNum">
                <input v-model="sliderNum" class="sliderNumInput" type="text">
                <img src="./img/显示数字背景框.png" style="position: absolute;width: 100%;height: 100%;z-index:-99;">
            </div>
            <div @click="soundOff" class="soundOff">
                <img :src="[mute==0?'./img/静音通常.png':'./img/静音.png']" style="position: absolute;width: 100%;height: 100%;z-index: -99;">
                <span :style="{fontSize: '12px',color:mute==0?'#ABCBFF':'#FFABCF'}">静音</span>
            </div>
            <slider-bar @slider-num="sliderNum=$event" :index="index"></slider-bar>
            <div style="height: 10.02%;width: 100%;"></div>
        </div>
    `
});
Vue.component('slider-bar', {
    props: ['index'],
    methods: {
        silderMove: function (e) {
            let _this = this;
            let content = document.getElementsByClassName('sliderContent')[0];
            let sliderCover = document.getElementById(`sliderCover${this.index}`);
            let sliderImg = document.getElementById(`sliderImg${this.index}`);
            let sliderBottom = content.offsetHeight - e.target.offsetTop - e.target.offsetHeight / 2;
            let mouseY = e.clientY;
            window.onmousemove = function (e) {
                let mouseH = mouseY - e.clientY;
                let nowY = mouseH + sliderBottom;
                if (nowY < 0) {
                    nowY = 0;
                }
                if (nowY > content.offsetHeight) {
                    nowY = content.offsetHeight;
                }
                // this.tempNum = nowY;
                sliderCover.style.height = `${nowY}px`;
                sliderImg.style.bottom = `${(nowY - 18)}px`;
                // 换算
                // let negativeNum = content.offsetHeight * 0.8163;
                // if (nowY < negativeNum) {
                //     nowY = nowY / negativeNum * 80 - 80;
                // } else {
                //     nowY = (nowY - negativeNum) / (content.offsetHeight - negativeNum) * 18;
                // }
                nowY = nowY / content.offsetHeight * 98 - 80;
                _this.$emit('slider-num', Math.floor(nowY));
            }
            window.onmouseup = function () {
                window.onmousemove = false;
            }
        },
        sliderTurnTo: function (e) {
            let content = document.getElementsByClassName('sliderContent')[0];
            let sliderCover = document.getElementById(`sliderCover${this.index}`);
            let sliderImg = document.getElementById(`sliderImg${this.index}`);
            let nowY = content.offsetHeight - (e.clientY - Math.ceil(content.getBoundingClientRect().top));
            if (nowY < 0) {
                nowY = 0;
            }
            if (nowY > content.offsetHeight) {
                nowY = content.offsetHeight;
            }
            // this.tempNum = nowY;
            sliderCover.style.height = `${nowY}px`;
            sliderImg.style.bottom = `${(nowY - 18)}px`;
            // 换算
            // let negativeNum = content.offsetHeight * 0.8163;
            // if (nowY < negativeNum) {
            //     nowY = nowY / negativeNum * 80 - 80;
            // } else {
            //     nowY = (nowY - negativeNum) / (content.offsetHeight - negativeNum) * 18;
            // }
            nowY = nowY / content.offsetHeight * 98 - 80;
            this.$emit('slider-num', Math.floor(nowY));
        },
    },
    // :style="{height:tempNum+'px'}"  :style="{bottom:(tempNum-18)+'px'}"
    template: `
        <div @click="sliderTurnTo($event)" class="sliderContent">
            <img src="./img/滑块条.png" style="width: 100%;height: 100%;position: absolute;z-index: -99;">
            <div class="sliderBar"></div>
            <div :id="['sliderCover'+index]" class="sliderCover"></div>
            <div :id="['sliderImg'+index]" @mousedown="silderMove($event)" class="sliderImg"></div>
        </div>
    `
});
let zhuanyeUrl = 'http://192.168.30.66:18113/';
let channelControlUrl = zhuanyeUrl + 'api/sendInstruction';//命令下发
let hifi = new Vue({
    el: '#hifi',
    data: {
        api: {
            channelDetailUrl: zhuanyeUrl + 'api/channelDetail',//通道详情
        },
        tableHead: {
            power_temp: '',//电源温度
            bodyTitles: ['CHANNEL', 'VOLT.', 'CURR.', 'TEMP.'],//表格头部
        },
        tableBody: {
            bodyDetailList: [],
        },
        resCommonParams: {
            loginToken: '',//保存跳转token
            deviceId: '',//保存跳转查询设备ID    
        },
        total_page_loading: false,//总页面加载动画
    },
    created: function () {
        this.total_page_loading = true;
        this.resCommonParams.loginToken = window.sessionStorage.loginToken;
        this.resCommonParams.deviceId = '20211101_113622_1036672643818084';
        // if (!window.location.search) {
        //     this.resCommonParams.loginToken = window.sessionStorage.loginToken;
        //     this.resCommonParams.deviceId = window.sessionStorage.deviceId;
        // } else {
        //     this.getToken();
        // }
        // this.replaceUrl();
        this.request('post', this.api.channelDetailUrl, { id: this.resCommonParams.deviceId }, "74935343174538", this.resCommonParams.loginToken, this.zhuanyeDeviceParam);
    },
    mounted: function () {
        this.total_page_loading = false;
    },
    methods: {
        // 封装的请求方法
        request: function (method, url, data, key, token, func) {
            axios({
                method: method,
                url: url,
                data: {
                    client: "PC",
                    user: "",
                    version: "1.0.1",
                    data: data,
                    key: key
                },
                headers: { 'token': token }
            }).then(res => {
                if (res.data.code == 1000) {
                    if (res.data.data) {
                        func(res);
                    } else {
                        this.$message.error('数据为空');
                    }
                } else {
                    this.$alert(res.data.message, '提示', {
                        confirmButtonText: '确定',
                        callback: () => {
                            if (res.data.code == 3005 || res.data.code == 3006) {
                                window.location.href = '../test demo/login/login.html';
                            }
                        }
                    });
                }
            });
        },
        //从地址栏获取token
        getToken: function () {
            let url = window.location.search;
            let str = url.substring(1).split('&');
            this.resCommonParams.loginToken = str[0].split('=')[1];
            this.resCommonParams.deviceId = str[1].split('=')[1];
        },
        // 改写url
        replaceUrl: function () {
            let url = window.location.href;
            let str = url.split('?')[0];
            window.history.replaceState(null, '', str);
        },
        // 请求回来的专业设备参数
        zhuanyeDeviceParam: function (res) {
            console.log(res)
            this.tableHead.power_temp = res.data.data.power_temp;
            this.tableBody.bodyDetailList = res.data.data.list;
            // this.total_page_loading = false;
        },
    }
});
