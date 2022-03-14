// Vue.component('single-slider', {
// 	props: ['channel', 'device_id', 'token', 'in_title', 'out_title', 'in_or_out'],
// 	data: function () {
// 		return {
// 			mute: this.channel.mute, //静音
// 			sliderNum: Number, //音量
// 			newValue: 0, //监听器传入的新值
// 			sliderNum_temp: Number, //传递给子组件的中间变量
// 		};
// 	},
// 	created: function () {
// 		this.obj_key_judge();
// 	},
// 	methods: {
// 		// 因为读取数组不同，属性名不同
// 		obj_key_judge() {
// 			if (this.in_or_out == 0) {
// 				this.sliderNum = this.channel.digitalgain;
// 				this.sliderNum_temp = this.channel.digitalgain;
// 			} else {
// 				this.sliderNum = this.channel.gain;
// 				this.sliderNum_temp = this.channel.gain;
// 			}
// 		},
// 		// 封装的请求方法
// 		request: function (method, url, data, key, token, func) {
// 			axios({
// 				method: method,
// 				url: url,
// 				data: {
// 					client: 'PC',
// 					user: '',
// 					version: '1.0.1',
// 					data: data,
// 					key: key,
// 				},
// 				headers: { token: token },
// 			}).then((res) => {
// 				if (res.data.code == 1000) {
// 					if (res.data.data) {
// 						func(res);
// 					} else {
// 						this.$message.error('数据为空');
// 					}
// 				} else {
// 					this.$alert(res.data.message, '提示', {
// 						confirmButtonText: '确定',
// 						callback: () => {
// 							if (res.data.code == 3005 || res.data.code == 3006) {
// 								window.location.href = '../test demo/login/login.html';
// 							}
// 						},
// 					});
// 				}
// 			});
// 		},
// 		// 静音
// 		soundOff: function () {
// 			if (this.mute == 0) {
// 				this.mute = 1;
// 			} else {
// 				this.mute = 0;
// 			}
// 			let channelsData = [];
// 			let obj = {};
// 			obj.mute = this.mute;
// 			obj.number = this.channel.number;
// 			obj.volume = this.sliderNum;
// 			channelsData.push(obj);
// 			this.request('post', channelControlUrl, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
// 		},
// 		// 命令下发
// 		order_set: function () {
// 			// 根据输入改变滑块
// 			let channelsData = [];
// 			let obj = {};
// 			obj.mute = this.mute;
// 			obj.number = this.channel.number;
// 			obj.volume = this.sliderNum;
// 			channelsData.push(obj);
// 			this.request('post', channelControlUrl, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
// 		},
// 		command_send: function () {
// 			if (this.sliderNum.length > 0) {
// 				if (Number(this.sliderNum) < -12) {
// 					this.sliderNum = -12;
// 				} else if (Number(this.sliderNum) > 12) {
// 					this.sliderNum = 12;
// 				} else {
// 					this.sliderNum = Math.floor(Number(this.sliderNum) * 10 + 0.5) / 10;
// 				}
// 				this.sliderNum_temp = this.sliderNum;
// 				this.order_set();
// 			}
// 		},
// 		silderMove: function (e) {
// 			let _this = this;
// 			let nowY_temp;
// 			let content = document.getElementsByClassName('sliderContent')[0];
// 			let sliderBottom = content.offsetHeight - e.target.offsetTop - e.target.offsetHeight / 2;
// 			let mouseY = e.clientY;
// 			window.onmousemove = function (e) {
// 				let mouseH = mouseY - e.clientY;
// 				let nowY = mouseH + sliderBottom;
// 				if (nowY < 0) {
// 					nowY = 0;
// 				}
// 				if (nowY > content.offsetHeight) {
// 					nowY = content.offsetHeight;
// 				}
// 				nowY = (nowY / content.offsetHeight) * 24 - 12;
// 				nowY = Math.floor(nowY * 10 + 0.5) / 10;
// 				nowY_temp = nowY;
// 				_this.sliderNum = nowY;
// 				_this.sliderNum_temp = nowY;
// 			};
// 			window.onmouseup = function () {
// 				let channelsData = [];
// 				let obj = {};
// 				obj.mute = _this.mute;
// 				obj.number = _this.channel.number;
// 				obj.volume = nowY_temp;
// 				channelsData.push(obj);
// 				_this.request('post', channelControlUrl, { id: _this.device_id, channelsData: channelsData }, '123456', _this.token, function () {});
// 				window.onmousemove = false;
// 			};
// 		},
// 		sliderTurnTo: function (e) {
// 			let content = document.getElementsByClassName('sliderContent')[0];
// 			let nowY = content.offsetHeight - (e.clientY - Math.ceil(content.getBoundingClientRect().top));
// 			if (nowY < 0) {
// 				nowY = 0;
// 			}
// 			if (nowY > content.offsetHeight) {
// 				nowY = content.offsetHeight;
// 			}
// 			nowY = (nowY / content.offsetHeight) * 24 - 12;
// 			nowY = Math.floor(nowY * 10 + 0.5) / 10;
// 			this.sliderNum = nowY;
// 			this.sliderNum_temp = nowY;
// 			let channelsData = [];
// 			let obj = {};
// 			obj.mute = this.mute;
// 			obj.number = this.channel.number;
// 			obj.volume = nowY;
// 			channelsData.push(obj);
// 			this.request('post', channelControlUrl, { id: this.device_id, channelsData: channelsData }, '123456', this.token, function () {});
// 		},
// 		// 改变滑块进度条高度
// 		change_cover_height: function (par) {
// 			let temp = (par + 12) / 24;
// 			return `height:${temp * 100}%;`;
// 		},
// 		// 改变滑块离底部距离
// 		change_slider_bottom: function (par) {
// 			let temp = (par + 12) / 24;
// 			return `bottom:calc(${temp * 100}% - 18px);`;
// 		},
// 	},
// 	template: `
//         <div class="singleSliderContent">
//             <img src="./img/控制条.png" style="width: 100%;height: 100%;position: absolute;z-index: -99;object-fit: cover;">
//             <span :style="{color:in_or_out==0?'#02EEFF':'#2998ff'}" class="sliderName">{{in_or_out==0?in_title:out_title}} {{channel.number}}</span>
//             <div style="width: 100%;height: 2px;">
//                 <div style="background: #01112C;width: 100%;height: 1px;"></div>
//                 <div style="background: #1053A7;width: 100%;height: 1px;"></div>
//             </div>
//             <div class="sliderNum">
//                 <input @keyup.enter="command_send" v-model="sliderNum" maxlength="5" class="sliderNumInput" type="text">
//                 <img src="./img/显示数字背景框.png" style="position: absolute;width: 100%;height: 100%;z-index:-99;">
//             </div>
//             <div @click="soundOff" class="soundOff">
//                 <img :src="[mute==0?'./img/静音通常.png':'./img/静音.png']" style="position: absolute;width: 100%;height: 100%;z-index: -99;">
//                 <span :style="{fontSize: '12px',color:mute==0?'#ABCBFF':'#FFABCF'}">静音</span>
//             </div>
//             <div @mousedown="sliderTurnTo($event)" class="sliderContent">
//               <img src="./img/滑块条.png" style="width: 100%;height: 100%;position: absolute;z-index: -99;">
//               <div class="sliderBar"></div>
//               <div :style="change_cover_height(sliderNum_temp)" class="sliderCover"></div>
//               <div :style="change_slider_bottom(sliderNum_temp)" @mousedown.stop="silderMove($event)" class="sliderImg"></div>
//             </div>
//             <div style="height: 10.02%;width: 100%;"></div>
//         </div>
//     `,
// });

let zhuanyeUrl = 'http://192.168.30.66:18113/';
let processor_detail_url = zhuanyeUrl + 'api/gds/channelDetail';
let channelControlUrl = zhuanyeUrl + 'api/gds/sendInstruction';

let power_frequency = new Vue({
	el: '#power_frequency',
	data: {
		total_page_loading: false, //总页面加载遮罩
		// 发送请求所需公用参数
		resCommonParams: {
			loginToken: '', //保存跳转token
			deviceId: '', //保存跳转查询设备ID
		},
		// 静态页面效果使用变量
		static_par: {
			option_focus: 0, //上方选项卡
			options: ['电平', '输入', '输出', '矩阵', '混音前增益', '预设'],
			module_focus: 0,
			input_modules: [{ name: '输入延时' }, { name: '噪声门' }, { name: '反馈抑制' }, { name: '输入滤波' }, { name: '输入压限' }],
			output_modules: [{ name: '输出延时' }, { name: '噪声门' }, { name: '反馈抑制' }, { name: '输出滤波' }, { name: '输出压限' }],
			temp: 0,
			feedback: false,
			filter_focus: 0,
		},
		// 请求数据存放处
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
		// 切换选项卡
		switch_option(index) {
			// 在此方法刚触发时 v-if的节点还没有渲染出来 得等this.static_par.option_focus切换过去再查找节点
			if (this.static_par.option_focus != index) {
				this.static_par.option_focus = index;
				this.$nextTick(() => {
					let obj = this.$refs.scroll_display;
					switch (index) {
						case 1:
							this.static_par.module_focus = 0;
							obj.scrollLeft = 0;
							break;
						case 2:
							this.static_par.module_focus = 0;
							obj.scrollLeft = 0;
							break;
					}
				});
			}
		},
		// 模块切换显示
		switch_module(index) {
			this.static_par.module_focus = index;
			// 跳转 将offsetLeft置为0
			let obj = this.$refs.scroll_display;
			obj.style.scrollBehavior = 'smooth';
			switch (index) {
				case 0:
					obj.scrollLeft = document.getElementById('delay').offsetLeft;
					break;
				case 1:
					obj.scrollLeft = document.getElementById('noise').offsetLeft;
					break;
				case 2:
					obj.scrollLeft = document.getElementById('feedback').offsetLeft;
					break;
				case 3:
					obj.scrollLeft = document.getElementById('filter').offsetLeft;
					break;
				case 4:
					obj.scrollLeft = document.getElementById('press_limit').offsetLeft;
					break;
			}
			obj.style.scrollBehavior = '';
		},
		// 横向滚动
		scroll_x(e) {
			let obj = this.$refs.scroll_display;
			// 大于0为向下滚动 wheelDelta默认为40 系统设置滚动几行就是 40x行
			if (e.wheelDelta < 0) {
				obj.scrollLeft += 100;
			} else {
				obj.scrollLeft -= 100;
			}
			if (this.static_par.option_focus == 1 || this.static_par.option_focus == 2) {
				// 检测滚动位置点亮导航栏
				let noise = document.getElementById('noise').offsetLeft;
				let feedback = document.getElementById('feedback').offsetLeft;
				let filter = document.getElementById('filter').offsetLeft;
				let press_limit = document.getElementById('press_limit').offsetLeft;
				let scrollLeft = obj.scrollLeft;
				if (scrollLeft < noise) {
					this.static_par.module_focus = 0;
				} else if (scrollLeft >= noise && scrollLeft < feedback) {
					this.static_par.module_focus = 1;
				} else if (scrollLeft >= feedback && scrollLeft < filter) {
					this.static_par.module_focus = 2;
				} else if (scrollLeft >= filter && scrollLeft < press_limit) {
					this.static_par.module_focus = 3;
				} else if (scrollLeft >= press_limit) {
					this.static_par.module_focus = 4;
				}
			}
		},
	},
});
