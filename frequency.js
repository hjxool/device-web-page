Vue.component('single-slider', {
	props: ['channel', 'device_id', 'token'],
	data: function () {
		return {
			mute: this.channel.mute, //静音
			sliderNum: this.channel.digitalgain, //音量
			newValue: 0, //监听器传入的新值
			sliderNum_temp: this.channel.digitalgain, //传递给子组件的中间变量
		};
	},
	created: function () {
		// this.order = _.debounce(this.order_set, 1000);
	},
	// watch: {
	//     sliderNum: function (newValue, oldValue) {
	//         this.newValue = newValue;
	//         let reg = /^(\-)?\d+(\.\d{1})?$/
	//         if (newValue.length > 0) {
	//             if (Number(newValue) != Number(oldValue) && reg.test(Number(newValue))) {
	//                 if (Number(newValue) < -12) {
	//                     this.sliderNum = -12;
	//                 } else if (Number(newValue) > 12) {
	//                     this.sliderNum = 12;
	//                 } else {
	//                     this.sliderNum = Math.floor(Number(newValue) * 10 + 0.5) / 10;
	//                 }
	//                 this.sliderNum_temp = this.sliderNum;
	//                 this.order();
	//             }
	//         }
	//     }
	// },
	methods: {
		// 封装的请求方法
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
		// 静音
		soundOff: function () {
			if (this.mute == 0) {
				this.mute = 1;
			} else {
				this.mute = 0;
			}
			let channelsData = [];
			let obj = {};
			obj.mute = this.mute;
			obj.number = this.channel.number;
			obj.volume = this.sliderNum;
			channelsData.push(obj);
			this.request('post', channelControlUrl, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
		},
		// 命令下发
		order_set: function () {
			// 根据输入改变滑块
			let channelsData = [];
			let obj = {};
			obj.mute = this.mute;
			obj.number = this.channel.number;
			obj.volume = this.sliderNum;
			channelsData.push(obj);
			this.request('post', channelControlUrl, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
		},
		command_send: function () {
			if (this.sliderNum.length > 0) {
				if (Number(this.sliderNum) < -12) {
					this.sliderNum = -12;
				} else if (Number(this.sliderNum) > 12) {
					this.sliderNum = 12;
				} else {
					this.sliderNum = Math.floor(Number(this.sliderNum) * 10 + 0.5) / 10;
				}
				this.sliderNum_temp = this.sliderNum;
				this.order_set();
			}
		},
	},
	template: `
        <div class="singleSliderContent">
            <img src="./img/控制条.png" style="width: 100%;height: 100%;position: absolute;z-index: -99;object-fit: cover;">
            <span style="color: #02EEFF;" class="sliderName">IN {{channel.number}}</span>
            <div style="width: 100%;height: 2px;">
                <div style="background: #01112C;width: 100%;height: 1px;"></div>
                <div style="background: #1053A7;width: 100%;height: 1px;"></div>
            </div>
            <div class="sliderNum">
                <input @keyup.enter="command_send" v-model="sliderNum" maxlength="5" class="sliderNumInput" type="text">
                <img src="./img/显示数字背景框.png" style="position: absolute;width: 100%;height: 100%;z-index:-99;">
            </div>
            <div @click="soundOff" class="soundOff">
                <img :src="[mute==0?'./img/静音通常.png':'./img/静音.png']" style="position: absolute;width: 100%;height: 100%;z-index: -99;">
                <span :style="{fontSize: '12px',color:mute==0?'#ABCBFF':'#FFABCF'}">静音</span>
            </div>
            <slider-bar @slider-num="sliderNum=$event;sliderNum_temp=$event" :sliderNum="sliderNum_temp" :mute="mute" :channel_number="channel.number" :device_id="device_id" :token="token"></slider-bar>
            <div style="height: 10.02%;width: 100%;"></div>
        </div>
    `,
});
Vue.component('slider-bar', {
	props: ['sliderNum', 'mute', 'channel_number', 'device_id', 'token'],
	data: function () {
		return {
			nowY: 0,
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
		silderMove: function (e) {
			let _this = this;
			let content = document.getElementsByClassName('sliderContent')[0];
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
				nowY = (nowY / content.offsetHeight) * 24 - 12;
				nowY = Math.floor(nowY * 10 + 0.5) / 10;
				_this.nowY = nowY;
				_this.$emit('slider-num', nowY);
			};
			window.onmouseup = function () {
				let channelsData = [];
				let obj = {};
				obj.mute = _this.mute;
				obj.number = _this.channel_number;
				obj.volume = _this.nowY;
				channelsData.push(obj);
				_this.request('post', channelControlUrl, { id: _this.device_id, channelsData: channelsData }, '123456', _this.token, function () {});
				window.onmousemove = false;
			};
		},
		sliderTurnTo: function (e) {
			let content = document.getElementsByClassName('sliderContent')[0];
			let nowY = content.offsetHeight - (e.clientY - Math.ceil(content.getBoundingClientRect().top));
			if (nowY < 0) {
				nowY = 0;
			}
			if (nowY > content.offsetHeight) {
				nowY = content.offsetHeight;
			}
			nowY = (nowY / content.offsetHeight) * 24 - 12;
			nowY = Math.floor(nowY * 10 + 0.5) / 10;
			this.nowY = nowY;
			this.$emit('slider-num', nowY);
			let channelsData = [];
			let obj = {};
			obj.mute = this.mute;
			obj.number = this.channel_number;
			obj.volume = this.nowY;
			channelsData.push(obj);
			this.request('post', channelControlUrl, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
		},
		// 改变滑块进度条高度
		change_cover_height: function (par) {
			let temp = (par + 12) / 24;
			return `height:${temp * 100}%;`;
		},
		// 改变滑块离底部距离
		change_slider_bottom: function (par) {
			let temp = (par + 12) / 24;
			return `bottom:calc(${temp * 100}% - 18px);`;
		},
	},
	template: `
        <div @mousedown="sliderTurnTo($event)" class="sliderContent">
            <img src="./img/滑块条.png" style="width: 100%;height: 100%;position: absolute;z-index: -99;">
            <div class="sliderBar"></div>
            <div :style="change_cover_height(sliderNum)" class="sliderCover"></div>
            <div :style="change_slider_bottom(sliderNum)" @mousedown.stop="silderMove($event)" class="sliderImg"></div>
        </div>
    `,
});

Vue.component('single-slider-out', {
	props: ['channel', 'device_id', 'token'],
	data: function () {
		return {
			mute: this.channel.mute, //静音
			sliderNum: this.channel.gain, //音量
			newValue: 0, //监听器传入的新值
			sliderNum_temp: this.channel.gain, //传递给子组件的中间变量
		};
	},
	methods: {
		// 封装的请求方法
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
		// 静音
		soundOff: function () {
			if (this.mute == 0) {
				this.mute = 1;
			} else {
				this.mute = 0;
			}
			let channelsData = [];
			let obj = {};
			obj.mute = this.mute;
			obj.number = this.channel.number;
			obj.volume = this.sliderNum;
			channelsData.push(obj);
			this.request('post', channelControlUrl, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
		},
		// 命令下发
		order_set: function () {
			let channelsData = [];
			let obj = {};
			obj.mute = this.mute;
			obj.number = this.channel.number;
			obj.volume = this.sliderNum;
			channelsData.push(obj);
			this.request('post', channelControlUrl, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
		},
		command_send: function () {
			if (this.sliderNum.length > 0) {
				if (Number(this.sliderNum) < -12) {
					this.sliderNum = -12;
				} else if (Number(this.sliderNum) > 12) {
					this.sliderNum = 12;
				} else {
					this.sliderNum = Math.floor(Number(this.sliderNum) * 10 + 0.5) / 10;
				}
				this.sliderNum_temp = this.sliderNum;
				this.order_set();
			}
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
                <input @keyup.enter="command_send" v-model="sliderNum" maxlength="5" class="sliderNumInput" type="text">
                <img src="./img/显示数字背景框.png" style="position: absolute;width: 100%;height: 100%;z-index:-99;">
            </div>
            <div @click="soundOff" class="soundOff">
                <img :src="[mute==0?'./img/静音通常.png':'./img/静音.png']" style="position: absolute;width: 100%;height: 100%;z-index: -99;">
                <span :style="{fontSize: '12px',color:mute==0?'#ABCBFF':'#FFABCF'}">静音</span>
            </div>
            <slider-bar-out @slider-num="sliderNum=$event;sliderNum_temp=$event" :sliderNum="sliderNum_temp" :mute="mute" :channel_number="channel.number" :device_id="device_id" :token="token"></slider-bar-out>
            <div style="height: 10.02%;width: 100%;"></div>
        </div>
    `,
});
Vue.component('slider-bar-out', {
	props: ['sliderNum', 'mute', 'channel_number', 'device_id', 'token'],
	data: function () {
		return {
			nowY: 0,
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
		silderMove: function (e) {
			let _this = this;
			let content = document.getElementsByClassName('sliderContent')[0];
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
				nowY = (nowY / content.offsetHeight) * 24 - 12;
				nowY = Math.floor(nowY * 10 + 0.5) / 10;
				_this.nowY = nowY;
				_this.$emit('slider-num', nowY);
			};
			window.onmouseup = function () {
				let channelsData = [];
				let obj = {};
				obj.mute = _this.mute;
				obj.number = _this.channel_number;
				obj.volume = _this.nowY;
				channelsData.push(obj);
				_this.request('post', channelControlUrl, { id: _this.device_id, channelsData: channelsData }, '123456', _this.token, function () {});
				window.onmousemove = false;
			};
		},
		sliderTurnTo: function (e) {
			let content = document.getElementsByClassName('sliderContent')[0];
			let nowY = content.offsetHeight - (e.clientY - Math.ceil(content.getBoundingClientRect().top));
			if (nowY < 0) {
				nowY = 0;
			}
			if (nowY > content.offsetHeight) {
				nowY = content.offsetHeight;
			}
			nowY = (nowY / content.offsetHeight) * 24 - 12;
			nowY = Math.floor(nowY * 10 + 0.5) / 10;
			this.nowY = nowY;
			this.$emit('slider-num', nowY);
			let channelsData = [];
			let obj = {};
			obj.mute = this.mute;
			obj.number = this.channel_number;
			obj.volume = this.nowY;
			channelsData.push(obj);
			this.request('post', channelControlUrl, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
		},
		// 改变滑块进度条高度
		change_cover_height: function (sliderNum) {
			let temp = (sliderNum + 12) / 24;
			return `height:${temp * 100}%;`;
		},
		// 改变滑块离底部距离
		change_slider_bottom: function (sliderNum) {
			let temp = (sliderNum + 12) / 24;
			return `bottom:calc(${temp * 100}% - 18px);`;
		},
	},
	template: `
        <div @click="sliderTurnTo($event)" class="sliderContent">
            <img src="./img/滑块条.png" style="width: 100%;height: 100%;position: absolute;z-index: -99;">
            <div class="sliderBar"></div>
            <div :style="change_cover_height(sliderNum)" style="background: #0A62E7;" class="sliderCover"></div>
            <div :style="change_slider_bottom(sliderNum)" @mousedown.stop="silderMove($event)" class="sliderImg"></div>
        </div>
    `,
});

let zhuanyeUrl = 'http://192.168.30.66:18113/';
let processor_detail_url = zhuanyeUrl + 'api/gds/channelDetail';
let channelControlUrl = zhuanyeUrl + 'api/gds/sendInstruction';

let power_frequency = new Vue({
	el: '#power_frequency',
	data: {
		total_page_loading: false, //总页面加载遮罩
		resCommonParams: {
			loginToken: '', //保存跳转token
			deviceId: '', //保存跳转查询设备ID
		},
		processor_detail: {
			Channel_output_list: [],
			Channel_input_list: [],
		},
	},
	created: function () {
		this.total_page_loading = true;
		this.resCommonParams.loginToken = window.sessionStorage.loginToken;
		this.resCommonParams.deviceId = '20211130_105309_3943920187403333';
		this.request('post', processor_detail_url, { id: this.resCommonParams.deviceId }, '74935343174538', this.resCommonParams.loginToken, this.processor_param);
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
		// 处理器详情
		processor_param: function (res) {
			console.log(res);
			this.processor_detail.Channel_input_list = res.data.data.Channel_input;
			this.processor_detail.Channel_output_list = res.data.data.Channel_output;
		},
		// 改变音频条高度
		change_frequency_height: function (content) {
			let temp = (content.level + 100) / 135;
			return `height:${temp * 100 * 0.87}%;`;
		},
	},
});
let token = window.sessionStorage.loginToken;
let id = '20211130_105309_3943920187403333';
let aaa = new WebSocket('ws://192.168.30.25:8086/sse', [token, id]);
aaa.onopen = function () {
	console.log(123);
};
aaa.onmessage = function () {
	console.log(456);
	aaa.close();
};
aaa.onclose = function () {
	console.log(789);
};
