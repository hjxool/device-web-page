// 左边
Vue.component('slider-bar', {
	props: ['channelNum'],
	methods: {
		// 滑块滑动触发事件
		silderMove: function (e) {
			let _this = this;
			// 记录初始点位置
			let content = document.getElementsByClassName('channelSliderContent')[0];
			let sliderBottom = content.offsetHeight - e.target.offsetTop - e.target.offsetHeight / 2;
			let mouseY = e.clientY;
			window.onmousemove = function (e) {
				// 记录点和鼠标相对浏览器的差值等于移动的距离
				let moveH = mouseY - e.clientY;
				let nowY = sliderBottom + moveH;
				if (nowY < 0) {
					nowY = 0;
				}
				if (nowY > content.offsetHeight) {
					nowY = content.offsetHeight;
				}
				nowY = (nowY / content.offsetHeight) * 68 - 56;
				nowY = Math.floor(nowY * 10 + 0.5) / 10;
				_this.$emit('channel-num', nowY);
			};
			window.onmouseup = function () {
				window.onmousemove = false;
			};
		},
		// 滑块跳转
		sliderTurnTo: function (e) {
			let content = document.getElementsByClassName('channelSliderContent')[0];
			let top = content.offsetHeight - (e.clientY - Math.ceil(content.getBoundingClientRect().top));
			if (top < 0) {
				top = 0;
			}
			if (top > content.offsetHeight) {
				top = content.offsetHeight;
			}
			top = (top / content.offsetHeight) * 68 - 56;
			top = Math.floor(top * 10 + 0.5) / 10;
			this.$emit('channel-num', top);
		},
		// 改变滑块进度条高度
		change_cover_height: function (channelNum) {
			let temp = (channelNum + 56) / 68;
			return `height:${temp * 100}%;`;
		},
		// 改变滑块离底部距离
		change_slider_bottom: function (channelNum) {
			let temp = (channelNum + 56) / 68;
			return `bottom:calc(${temp * 100}% - 18px);`;
		},
	},
	template: `
        <div @click="sliderTurnTo($event)" class="channelSliderContent">
            <img src="./img/滑块条.png" style="width: 100%;height: 100%;position: absolute;z-index: -99;">
            <div class="channelSliderBar"></div>
            <div :style="change_cover_height(channelNum)" class="channelSliderCover"></div>
            <div :style="change_slider_bottom(channelNum)" @mousedown="silderMove($event)" class="channelSlider"></div>
        </div>
    `,
});
Vue.component('single-channel', {
	props: ['channel', 'device_id', 'token'],
	data: function () {
		return {
			mute: this.channel.mute, //静音
			channelNum: this.channel.gain, //音量
			newValue: 0, //监听器传入的新值
			channelNum_temp: this.channel.gain, //传递给子组件的中间变量
		};
	},
	methods: {
		request: function (method, url, data, key, token, func) {
			axios({
				method: method,
				url: url,
				data: {
					client: 'PC',
					user: '',
					version: '1.0.1',
					data: data,
					key: key,
				},
				headers: { token: token },
			}).then((res) => {
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
						},
					});
				}
			});
		},
		// 静音按钮命令
		sound_off: function () {
			if (this.mute == 0) {
				this.mute = 1;
			} else {
				this.mute = 0;
			}
			let channelsData = [];
			let obj = {};
			obj.mute = this.mute;
			obj.number = this.channel.number;
			obj.gain = this.channelNum;
			channelsData.push(obj);
			this.request('post', sound_console_control_url, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
		},
		// 命令下发
		order_set: function () {
			let channelsData = [];
			let obj = {};
			obj.mute = this.mute;
			obj.number = this.channel.number;
			obj.gain = this.channelNum;
			channelsData.push(obj);
			this.request('post', sound_console_control_url, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
		},
		command_send: function () {
			if (this.channelNum.length > 0) {
				if (Number(this.channelNum) < -12) {
					this.channelNum = -12;
				} else if (Number(this.channelNum) > 12) {
					this.channelNum = 12;
				} else {
					this.channelNum = Math.floor(Number(this.channelNum) * 10 + 0.5) / 10;
				}
				this.channelNum_temp = this.channelNum;
				this.order_set();
			}
		},
	},
	template: `
        <div class="singleChannel">
            <img src="./img/控制条.png" style="width: 100%;height: 100%;position: absolute;z-index: -99;object-fit: cover;">
            <span class="channelName">IN {{channel.number}}</span>
            <div style="width: 100%;height: 2px;">
                <div style="background: #01112C;width: 100%;height: 1px;"></div>
                <div style="background: #1053A7;width: 100%;height: 1px;"></div>
            </div>
            <div class="channelNum">
                <input @keyup.enter="command_send" v-model="channelNum" maxlength="5" class="channelNumInput" type="text">
                <img src="./img/显示数字背景框.png" style="position: absolute;width: 100%;height: 100%;z-index:-99;">
                <!--<span style="font-size: 12px;color: #ABCBFF;">{{channelNum}}</span>-->
            </div>
            <div @click="sound_off" style="width: 82.6%;height: 8.52%;position: relative;display: flex;justify-content: center;align-items: center;cursor: pointer;">
                <img :src="[mute==1?'./img/静音.png':'./img/静音通常.png']" style="position: absolute;width: 100%;height: 100%;z-index: -99;">
                <span :style="{fontSize:'12px', color: mute==1? '#FFABCF' : '#ABCBFF'}">静音</span>
            </div>
            <slider-bar @channel-num="channelNum=$event;channelNum_temp=$event" :channelNum="channelNum_temp"></slider-bar>
            <div style="height: 10.02%;width: 100%;"></div>
        </div>
    `,
});
// 右边
Vue.component('slider-bar-right', {
	props: ['channelNum'],
	methods: {
		// 滑块滑动触发事件
		silderMove: function (e) {
			let _this = this;
			// 记录初始点位置
			let content = document.getElementsByClassName('channelSliderContent')[0];
			let sliderBottom = content.offsetHeight - e.target.offsetTop - e.target.offsetHeight / 2;
			let mouseY = e.clientY;
			window.onmousemove = function (e) {
				// 记录点和鼠标相对浏览器的差值等于移动的距离
				let moveH = mouseY - e.clientY;
				let nowY = sliderBottom + moveH;
				if (nowY < 0) {
					nowY = 0;
				}
				if (nowY > content.offsetHeight) {
					nowY = content.offsetHeight;
				}
				nowY = (nowY / content.offsetHeight) * 68 - 56;
				nowY = Math.floor(nowY * 10 + 0.5) / 10;
				_this.$emit('channel-num', nowY);
			};
			window.onmouseup = function () {
				window.onmousemove = false;
			};
		},
		// 滑块跳转
		sliderTurnTo: function (e) {
			let content = document.getElementsByClassName('channelSliderContent')[0];
			let top = content.offsetHeight - (e.clientY - Math.ceil(content.getBoundingClientRect().top));
			if (top < 0) {
				top = 0;
			}
			if (top > content.offsetHeight) {
				top = content.offsetHeight;
			}
			top = (top / content.offsetHeight) * 68 - 56;
			top = Math.floor(top * 10 + 0.5) / 10;
			this.$emit('channel-num', top);
		},
		// 改变滑块进度条高度
		change_cover_height: function (channelNum) {
			let temp = (channelNum + 56) / 68;
			return `height:${temp * 100}%;`;
		},
		// 改变滑块离底部距离
		change_slider_bottom: function (channelNum) {
			let temp = (channelNum + 56) / 68;
			return `bottom:calc(${temp * 100}% - 18px);`;
		},
	},
	template: `
        <div @click="sliderTurnTo($event)" class="channelSliderContent">
            <img src="./img/滑块条.png" style="width: 100%;height: 100%;position: absolute;z-index: -99;">
            <div class="channelSliderBar"></div>
            <div :style="change_cover_height(channelNum)" class="channelSliderCover"></div>
            <div :style="change_slider_bottom(channelNum)" @mousedown="silderMove($event)" class="channelSlider"></div>
        </div>
    `,
});
Vue.component('single-channel-right', {
	props: ['channel', 'device_id', 'token'],
	data: function () {
		return {
			mute: this.channel.mute, //静音
			channelNum: this.channel.gain, //音量
			newValue: 0, //监听器传入的新值
			channelNum_temp: this.channel.gain, //传递给子组件的中间变量
		};
	},
	methods: {
		request: function (method, url, data, key, token, func) {
			axios({
				method: method,
				url: url,
				data: {
					client: 'PC',
					user: '',
					version: '1.0.1',
					data: data,
					key: key,
				},
				headers: { token: token },
			}).then((res) => {
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
						},
					});
				}
			});
		},
		// 静音按钮命令
		sound_off: function () {
			if (this.mute == 0) {
				this.mute = 1;
			} else {
				this.mute = 0;
			}
			let channelsData = [];
			let obj = {};
			obj.mute = this.mute;
			obj.number = this.channel.number;
			obj.gain = this.channelNum;
			channelsData.push(obj);
			this.request('post', sound_console_control_url, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
		},
		// 命令下发
		order_set: function () {
			let channelsData = [];
			let obj = {};
			obj.mute = this.mute;
			obj.number = this.channel.number;
			obj.gain = this.channelNum;
			channelsData.push(obj);
			this.request('post', sound_console_control_url, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
		},
		command_send: function () {
			if (this.channelNum.length > 0) {
				if (Number(this.channelNum) < -12) {
					this.channelNum = -12;
				} else if (Number(this.channelNum) > 12) {
					this.channelNum = 12;
				} else {
					this.channelNum = Math.floor(Number(this.channelNum) * 10 + 0.5) / 10;
				}
				this.channelNum_temp = this.channelNum;
				this.order_set();
			}
		},
	},

	template: `
        <div class="singleChannel">
            <img src="./img/控制条.png" style="width: 100%;height: 100%;position: absolute;z-index: -99;object-fit: cover;">
            <span class="channelName" style="color:#2998FF;">Bus{{channel.number}}</span>
            <div style="width: 100%;height: 2px;">
                <div style="background: #01112C;width: 100%;height: 1px;"></div>
                <div style="background: #1053A7;width: 100%;height: 1px;"></div>
            </div>
            <div class="channelNum">
                <input @keyup.enter="command_send" v-model="channelNum" maxlength="5" class="channelNumInput" type="text">
                <img src="./img/显示数字背景框.png" style="position: absolute;width: 100%;height: 100%;z-index:-99;">
                <!--<span style="font-size: 12px;color: #ABCBFF;">{{channelNum}}</span>-->
            </div>
            <div @click="sound_off" style="width: 82.6%;height: 8.52%;position: relative;display: flex;justify-content: center;align-items: center;cursor: pointer;">
                <img :src="[mute==1?'./img/静音.png':'./img/静音通常.png']" style="position: absolute;width: 100%;height: 100%;z-index: -99;">
                <span :style="{fontSize:'12px', color: mute==1? '#FFABCF' : '#ABCBFF'}">静音</span>
            </div>
            <slider-bar-right @channel-num="channelNum=$event;channelNum_temp=$event" :channelNum="channelNum_temp"></slider-bar-right>
            <div style="height: 10.02%;width: 100%;"></div>
        </div>
    `,
});

let url = 'http://192.168.30.66:18113/';
let sound_console_url = url + 'api/dm/channelDetail';
let sound_console_control_url = url + 'api/dm/sendInstruction';

let sound = new Vue({
	el: '#sound',
	data: {
		channel_in: [], //输入通道
		channel_out: [], //输出通道
		loginToken: '', //保存跳转token
		deviceId: '', //保存跳转查询设备ID
	},
	created: function () {
		this.loginToken = window.sessionStorage.loginToken;
		this.deviceId = '0x022222222200000000000000';
		this.request('post', sound_console_url, { id: this.deviceId }, '74935343174538', this.loginToken, this.sound_console_detail);
	},
	methods: {
		request: function (method, url, data, key, token, func) {
			axios({
				method: method,
				url: url,
				data: {
					client: 'PC',
					user: '',
					version: '1.0.1',
					data: data,
					key: key,
				},
				headers: { token: token },
			}).then((res) => {
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
								// window.location.href = '../test demo/login/login.html';
							}
						},
					});
				}
			});
		},
		// 设备详情
		sound_console_detail: function (res) {
			this.channel_in = res.data.data.channel_in;
			this.channel_out = res.data.data.channel_out;
		},
	},
});
