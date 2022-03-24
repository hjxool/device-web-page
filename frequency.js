let power_frequency = new Vue({
	el: '#power_frequency',
	data: {
		total_page_loading: false, //总页面加载遮罩
		// 发送请求所需公用参数
		resCommonParams: {
			loginToken: '', //保存跳转token
			deviceId: '', //保存跳转查询设备ID
			push_noise_feedback_url: push_noise_feedback_url, //噪声 反馈控制
			push_press_limit_url: push_noise_feedback_url, //压限控制
			push_low_height_url: push_low_height_url, //高低通控制
			push_filter_peq_url: push_filter_peq_url, //均衡控制
		},
		// 静态页面效果使用变量
		static_par: {
			option_focus: 0, //上方选项卡
			options: ['电平', '输入', '输出', '矩阵', '混音前增益', '预设'], //上方页面选择
			module_focus: 0, //输入输出模块选择
			// 输入输出模块名
			input_modules: [{ name: '输入延时' }, { name: '噪声门' }, { name: '反馈抑制' }, { name: '输入滤波' }, { name: '输入压限' }],
			output_modules: [{ name: '输出延时' }, { name: '输出滤波' }, { name: '输出压限' }],
			temp: 0, //临时输入框变量
			feedback: false, //反馈抑制开关
			delay_slider_height: 0, //延时滑块高度
			channel_name: '', //显示在输入输出页面的通道名
			filter_height_type: false, //高通类型显示
			filter_height_slope: false, //高通斜率显示
			filter_low_type: false, //低通
			filter_low_slope: false, //低通
			filter_peq_section: 1, //点击的是哪一个滤波波段
			fliter_peq_type: false, //均衡类型显示
		},
		// 请求数据存放处
		processor_detail: {
			Channel_output_list: [], //输出通道信息
			Channel_input_list: [], //输入通道信息
			noise_and_feedback: {}, //噪声门和反馈抑制信息
			//延时信息
			delay: {
				device_id: '',
				channel_name_no: '',
				time_delay: '',
			},
			//压限信息
			press_limit: {
				device_id: '',
				channel_name_no: '',
				status: '',
				threshold: '',
				slope: '',
				start_time: '',
				recover_time: '',
			},
			// 高通
			filter_height: {
				device_id: '',
				isInput: '',
				isHigh: 1,
				status: '',
				frequency: '',
				slope: '',
				type: '',
				channel_no: '',
			},
			// 低通
			filter_low: {
				device_id: '',
				isInput: '',
				isHigh: 0,
				status: '',
				frequency: '',
				slope: '',
				type: '',
				channel_no: '',
			},
			filter_peq: {}, //滤波均衡所有段的数据
			before_mix_gain: [], //混音前增益
		},
	},
	mounted: function () {
		this.resCommonParams.loginToken = window.sessionStorage.loginToken;
		this.resCommonParams.deviceId = '0x333333333333333333000000';
		this.request('post', processor_detail_url, { device_id: this.resCommonParams.deviceId }, '74935343174538', this.resCommonParams.loginToken, this.processor_param);
		this.total_page_loading = false;
	},
	methods: {
		// 封装的请求方法
		request(method, url, data, key, token, func) {
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
			// 先建立vue变量 再将获取的值存储进去 vue才能监听到变量的变化
			this.processor_detail.Channel_input_list = res.data.data.input;
			this.processor_detail.Channel_output_list = res.data.data.output;
		},
		// 改变音频条高度
		change_frequency_height: function (content) {
			let temp = (content.gain - -100) / (35 - -100);
			return `height:${temp * 100 * 0.87}%;`;
		},
		// 切换选项卡
		switch_option(index) {
			// this.total_page_loading = true;
			// 在此方法刚触发时 v-if的节点还没有渲染出来 得等this.static_par.option_focus切换过去再查找节点
			if (this.static_par.option_focus != index) {
				this.static_par.option_focus = index;
				switch (index) {
					case 0:
						this.total_page_loading = false;
						break;
					case 1:
						this.static_par.channel_name = `IN${this.processor_detail.Channel_input_list[0].channel_no}`;
						// 查询噪声 反馈信息
						this.request('post', get_noise_and_feedback_url, { device_id: this.resCommonParams.deviceId, channel_no: 1 }, '123456', this.resCommonParams.loginToken, (res) => {
							this.processor_detail.noise_and_feedback = res.data.data;
						});
						// 查询延时 压限信息
						this.request('post', delay_press_limit_url, { device_id: this.resCommonParams.deviceId, channel_name_no: 'channel_in_1' }, '123456', this.resCommonParams.loginToken, (res) => {
							this.processor_detail.delay.device_id = res.data.data.device_id;
							this.processor_detail.delay.channel_name_no = res.data.data.channel_name_no;
							this.processor_detail.delay.time_delay = res.data.data.time_delay;
							this.processor_detail.press_limit.device_id = res.data.data.device_id;
							this.processor_detail.press_limit.channel_name_no = res.data.data.channel_name_no;
							this.processor_detail.press_limit.status = res.data.data.status;
							this.processor_detail.press_limit.threshold = res.data.data.threshold;
							this.processor_detail.press_limit.slope = res.data.data.slope;
							this.processor_detail.press_limit.start_time = res.data.data.start_time;
							this.processor_detail.press_limit.recover_time = res.data.data.recover_time;
							this.total_page_loading = false;
						});
						// 查询滤波 高低通信息
						this.request('post', filter_low_height_url, { device_id: this.resCommonParams.deviceId, isInput: 1, channel_no: 1 }, '123456', this.resCommonParams.loginToken, (res) => {
							for (let i = 0; i < res.data.data.length; i++) {
								if (res.data.data[i].channel_name.indexOf('Low') == -1) {
									// 高通
									this.processor_detail.filter_height.device_id = res.data.data[i].device_id;
									this.processor_detail.filter_height.isInput = 1;
									this.processor_detail.filter_height.isInput = 1;
									this.processor_detail.filter_height.status = res.data.data[i].status;
									this.processor_detail.filter_height.frequency = res.data.data[i].frequency;
									this.processor_detail.filter_height.slope = res.data.data[i].slope;
									this.processor_detail.filter_height.type = res.data.data[i].type;
									this.processor_detail.filter_height.channel_no = res.data.data[i].channel_no;
								} else {
									// 低通
									this.processor_detail.filter_low.device_id = res.data.data[i].device_id;
									this.processor_detail.filter_low.isInput = 1;
									this.processor_detail.filter_low.isHigh = 0;
									this.processor_detail.filter_low.status = res.data.data[i].status;
									this.processor_detail.filter_low.frequency = res.data.data[i].frequency;
									this.processor_detail.filter_low.slope = res.data.data[i].slope;
									this.processor_detail.filter_low.type = res.data.data[i].type;
									this.processor_detail.filter_low.channel_no = res.data.data[i].channel_no;
								}
							}
						});
						// 查询滤波均衡
						this.request('post', filter_peq_url, { device_id: this.resCommonParams.deviceId, isInput: 1, channel_no: 1, paragraph_no: 1 }, '123456', this.resCommonParams.loginToken, (res) => {
							this.processor_detail.filter_peq = res.data.data[0];
						});
						this.static_par.module_focus = 0;
						this.$nextTick(() => {
							let obj = this.$refs.scroll_display;
							obj.scrollLeft = 0;
						});
						break;
					case 2:
						this.static_par.channel_name = `OUT${this.processor_detail.Channel_output_list[0].channel_no}`;
						// 查询延时 压限信息
						this.request('post', delay_press_limit_url, { device_id: this.resCommonParams.deviceId, channel_name_no: 'channel_out_1' }, '123456', this.resCommonParams.loginToken, (res) => {
							this.processor_detail.delay.device_id = res.data.data.device_id;
							this.processor_detail.delay.channel_name_no = res.data.data.channel_name_no;
							this.processor_detail.delay.time_delay = res.data.data.time_delay;
							this.processor_detail.press_limit.device_id = res.data.data.device_id;
							this.processor_detail.press_limit.channel_name_no = res.data.data.channel_name_no;
							this.processor_detail.press_limit.status = res.data.data.status;
							this.processor_detail.press_limit.threshold = res.data.data.threshold;
							this.processor_detail.press_limit.slope = res.data.data.slope;
							this.processor_detail.press_limit.start_time = res.data.data.start_time;
							this.processor_detail.press_limit.recover_time = res.data.data.recover_time;
							this.total_page_loading = false;
						});
						// 查询滤波 高低通信息
						this.request('post', filter_low_height_url, { device_id: this.resCommonParams.deviceId, isInput: 1, channel_no: 1 }, '123456', this.resCommonParams.loginToken, (res) => {
							for (let i = 0; i < res.data.data.length; i++) {
								if (res.data.data[i].channel_name.indexOf('Low') == -1) {
									// 高通
									this.processor_detail.filter_height.device_id = res.data.data[i].device_id;
									this.processor_detail.filter_height.isInput = 0;
									this.processor_detail.filter_height.isInput = 1;
									this.processor_detail.filter_height.status = res.data.data[i].status;
									this.processor_detail.filter_height.frequency = res.data.data[i].frequency;
									this.processor_detail.filter_height.slope = res.data.data[i].slope;
									this.processor_detail.filter_height.type = res.data.data[i].type;
									this.processor_detail.filter_height.channel_no = res.data.data[i].channel_no;
								} else {
									// 低通
									this.processor_detail.filter_low.device_id = res.data.data[i].device_id;
									this.processor_detail.filter_low.isInput = 0;
									this.processor_detail.filter_low.isHigh = 0;
									this.processor_detail.filter_low.status = res.data.data[i].status;
									this.processor_detail.filter_low.frequency = res.data.data[i].frequency;
									this.processor_detail.filter_low.slope = res.data.data[i].slope;
									this.processor_detail.filter_low.type = res.data.data[i].type;
									this.processor_detail.filter_low.channel_no = res.data.data[i].channel_no;
								}
							}
						});
						// 查询滤波均衡
						this.request('post', filter_peq_url, { device_id: this.resCommonParams.deviceId, isInput: 0, channel_no: 1, paragraph_no: 1 }, '123456', this.resCommonParams.loginToken, (res) => {
							this.processor_detail.filter_peq = res.data.data[0];
						});
						this.static_par.module_focus = 0;
						this.$nextTick(() => {
							let obj = this.$refs.scroll_display;
							obj.scrollLeft = 0;
						});
						break;
					case 3:
						// this.total_page_loading = true;
						break;
					case 4:
						this.request('post', before_mix_gain_url, { device_id: this.resCommonParams.deviceId }, '74935343174538', this.resCommonParams.loginToken, (res) => {
							this.processor_detail.before_mix_gain = res.data.data;
							// 给滑块输入框一个临时变量 让每个变量单独维护 在回车确认时再修改原值
							for (let i = 0; i < this.processor_detail.before_mix_gain.length; i++) {
								this.$set(this.processor_detail.before_mix_gain[i], 'temp_input', this.processor_detail.before_mix_gain[i].gain);
							}
						});
						break;
				}
			}
		},
		// 模块切换显示
		switch_module(index) {
			this.static_par.module_focus = index;
			// 跳转 将offsetLeft置为0
			let obj = this.$refs.scroll_display;
			obj.style.scrollBehavior = 'smooth';
			if (this.static_par.option_focus == 1) {
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
			} else if (this.static_par.option_focus == 2) {
				switch (index) {
					case 0:
						obj.scrollLeft = document.getElementById('delay').offsetLeft;
						break;
					case 1:
						obj.scrollLeft = document.getElementById('filter').offsetLeft;
						break;
					case 2:
						obj.scrollLeft = document.getElementById('press_limit').offsetLeft;
						break;
				}
			}
			obj.style.scrollBehavior = '';
		},
		// 横向滚动
    scroll_x (e) {
      let 
			if (this.static_par.option_focus == 1) {
				let obj = this.$refs.scroll_display;
				// 大于0为向下滚动 wheelDelta默认为40 系统设置滚动几行就是 40x行
				if (e.wheelDelta < 0) {
					obj.scrollLeft += 100;
				} else {
					obj.scrollLeft -= 100;
				}
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
			} else if (this.static_par.option_focus == 2) {
				let obj = this.$refs.scroll_display;
				// 大于0为向下滚动 wheelDelta默认为40 系统设置滚动几行就是 40x行
				if (e.wheelDelta < 0) {
					obj.scrollLeft += 100;
				} else {
					obj.scrollLeft -= 100;
				}
				let filter = document.getElementById('filter').offsetLeft;
				let press_limit = document.getElementById('press_limit').offsetLeft;
				let scrollLeft = obj.scrollLeft;
				if (scrollLeft < filter) {
					this.static_par.module_focus = 0;
				} else if (scrollLeft >= filter && scrollLeft < press_limit) {
					this.static_par.module_focus = 1;
				} else if (scrollLeft >= press_limit) {
					this.static_par.module_focus = 2;
				}
			}
    },
    scroll_input (e) {
      let obj = this.$refs.controlContent_input;
			if (e.wheelDelta < 0) {
				obj.scrollLeft += 100;
			} else {
				obj.scrollLeft -= 100;
			}
    },
    scroll_output (e) {
      let obj = this.$refs.controlContent_output;
			if (e.wheelDelta < 0) {
				obj.scrollLeft += 100;
			} else {
				obj.scrollLeft -= 100;
			}
    },
		// 反相
		reverse_off(input) {
			if (input.reverse_phase == 0) {
				input.reverse_phase = 1;
			} else {
				input.reverse_phase = 0;
			}
			let obj = {};
			obj.channel_no = input.channel_no;
			obj.reverse_phase = input.reverse_phase;
			obj.gain = input.gain;
			obj.mute = input.mute;
			this.request('post', push_before_mix_gain_url, { device_id: this.resCommonParams.deviceId, input: [obj] }, '123456', this.resCommonParams.loginToken, () => {});
		},
		// 静音
		soundOff: function (input) {
			if (input.mute == 0) {
				input.mute = 1;
			} else {
				input.mute = 0;
			}
			let obj = {};
			obj.channel_no = input.channel_no;
			obj.reverse_phase = input.reverse_phase;
			obj.gain = input.gain;
			obj.mute = input.mute;
			this.request('post', push_before_mix_gain_url, { device_id: this.resCommonParams.deviceId, input: [obj] }, '123456', this.resCommonParams.loginToken, () => {});
		},
		// 命令下发
		command_send: function (input) {
			let reg = /(^\-?\d+$)|(^\+?\d+$)|(^\-?\d+\.\d+$)|(^\+?\d+\.\d+$)/;
			if (reg.test(input.temp_input)) {
				if (input.temp_input < -70) {
					input.temp_input = -70;
				} else if (input.temp_input > 12) {
					input.temp_input = 12;
				} else {
					input.temp_input = Math.floor(input.temp_input * 10 + 0.5) / 10;
				}
				input.gain = input.temp_input;
				let obj = {};
				obj.channel_no = input.channel_no;
				obj.reverse_phase = input.reverse_phase;
				obj.gain = input.gain;
				obj.mute = input.mute;
				this.request('post', push_before_mix_gain_url, { device_id: this.resCommonParams.deviceId, input: [obj] }, '123456', this.resCommonParams.loginToken, () => {});
			}
		},
		// 混音滑块功能
		sliderTurnTo: function (e, input) {
			let content = this.$refs.slider[0];
			let nowY = content.offsetHeight - (e.clientY - Math.ceil(content.getBoundingClientRect().top));
			if (nowY < 0) {
				nowY = 0;
			}
			if (nowY > content.offsetHeight) {
				nowY = content.offsetHeight;
			}
			// 差值是以0为基准的
			nowY = (nowY / content.offsetHeight) * (12 - -70) + -70;
			nowY = Math.floor(nowY * 10 + 0.5) / 10;
			input.temp_input = nowY;
			input.gain = nowY;
			let obj = {};
			obj.channel_no = input.channel_no;
			obj.reverse_phase = input.reverse_phase;
			obj.gain = input.gain;
			obj.mute = input.mute;
			this.request('post', push_before_mix_gain_url, { device_id: this.resCommonParams.deviceId, input: [obj] }, '123456', this.resCommonParams.loginToken, () => {});
		},
		silderMove: function (e, input) {
			let content = this.$refs.slider[0];
			// 这里滑块是从底下往上渲染 与坐标系相反 所以是用总长-计算出来的尺寸
			let sliderBottom = content.offsetHeight - e.target.offsetTop - e.target.offsetHeight / 2;
			let mouseY = e.clientY;
			window.onmousemove = (e) => {
				let mouseH = mouseY - e.clientY;
				let nowY = mouseH + sliderBottom;
				if (nowY < 0) {
					nowY = 0;
				}
				if (nowY > content.offsetHeight) {
					nowY = content.offsetHeight;
				}
				nowY = (nowY / content.offsetHeight) * (12 - -70) + -70;
				nowY = Math.floor(nowY * 10 + 0.5) / 10;
				// sliderNum和sliderNum_temp不一样 前者是用于显示在面板上 后者用于回调改变滑块高度 两者没有关联关系 仅在面板输入时做了一次等值
				input.gain = nowY;
				input.temp_input = nowY;
			};
			window.onmouseup = () => {
				let obj = {};
				obj.channel_no = input.channel_no;
				obj.reverse_phase = input.reverse_phase;
				obj.gain = input.gain;
				obj.mute = input.mute;
				this.request('post', push_before_mix_gain_url, { device_id: this.resCommonParams.deviceId, input: [obj] }, '123456', this.resCommonParams.loginToken, () => {});
				window.onmousemove = false;
			};
		},
		// 改变滑块进度条高度
		change_cover_height: function (par) {
			if (this.static_par.option_focus == 1) {
				let temp = (par - 0) / (1000 - 0);
				return `height:${temp * 100}%;`;
			} else if (this.static_par.option_focus == 2) {
				let temp = (par - 0) / (2000 - 0);
				return `height:${temp * 100}%;`;
			} else if (this.static_par.option_focus == 4) {
				let temp = (par - -70) / (12 - -70);
				return `height:${temp * 100}%;`;
			}
		},
		// 改变滑块离底部距离
		change_slider_bottom: function (par) {
			if (this.static_par.option_focus == 1) {
				let temp = (par - 0) / (1000 - 0);
				return `bottom:calc(${temp * 100}% - 10px);`;
			} else if (this.static_par.option_focus == 2) {
				let temp = (par - 0) / (2000 - 0);
				return `bottom:calc(${temp * 100}% - 10px);`;
			} else if (this.static_par.option_focus == 4) {
				let temp = (par - -70) / (12 - -70);
				return `bottom:calc(${temp * 100}% - 18px);`;
			}
		},
		// 垂直滑块功能
		slider_turn_to(e) {
			let dom = e.currentTarget;
			let length = dom.offsetHeight - (e.clientY - dom.getBoundingClientRect().top);
			if (length < 0) {
				length = 0;
			}
			if (length > dom.offsetHeight) {
				length = dom.offsetHeight;
			}
			if (this.static_par.option_focus == 1) {
				length = (length / dom.offsetHeight) * (1000 - 0) + 0;
			} else if (this.static_par.option_focus == 2) {
				length = (length / dom.offsetHeight) * (2000 - 0) + 0;
			}
			length = Math.floor(length * 10 + 0.5) / 10;
			this.processor_detail.delay.time_delay = length;
			this.request('post', push_delay_url, { device_id: this.resCommonParams.deviceId, channel_name_no: this.processor_detail.delay.channel_name_no }, '123456', this.resCommonParams.loginToken, (res) => {});
		},
		slider_move(e) {
			let dom = this.$refs.delay_slider;
			let slider_bottom = dom.offsetHeight - e.currentTarget.offsetTop - e.currentTarget.offsetHeight / 2;
			let mouseY = e.clientY;
			window.onmousemove = (e) => {
				let mouseH = mouseY - e.clientY;
				let length = mouseH + slider_bottom;
				if (length < 0) {
					length = 0;
				}
				if (length > dom.offsetHeight) {
					length = dom.offsetHeight;
				}
				if (this.static_par.option_focus == 1) {
					length = (length / dom.offsetHeight) * (1000 - 0) + 0;
				} else if (this.static_par.option_focus == 2) {
					length = (length / dom.offsetHeight) * (2000 - 0) + 0;
				}
				length = Math.floor(length * 10 + 0.5) / 10;
				this.processor_detail.delay.time_delay = length;
			};
			window.onmouseup = (e) => {
				this.request('post', push_delay_url, { device_id: this.resCommonParams.deviceId, channel_name_no: this.processor_detail.delay.channel_name_no }, '123456', this.resCommonParams.loginToken, (res) => {});
				window.onmousemove = false;
			};
		},
		// 下发噪声门和反馈控制命令
		noise_feedback_control() {
			let params = {
				device_id: this.resCommonParams.deviceId,
				channel_no: this.processor_detail.noise_and_feedback.channel_no,
				noise_gate_status: this.processor_detail.noise_and_feedback.noise_gate_status,
				threshold: this.processor_detail.noise_and_feedback.threshold,
				start_time: this.processor_detail.noise_and_feedback.start_time,
				recover_time: this.processor_detail.noise_and_feedback.recover_time,
				feedback_suppressor_status: this.processor_detail.noise_and_feedback.feedback_suppressor_status,
			};
			this.request('post', push_noise_feedback_url, params, '123456', this.resCommonParams.loginToken, (res) => {});
		},
		// 噪声按钮
		noise_button() {
			if (this.processor_detail.noise_and_feedback.noise_gate_status == 0) {
				this.processor_detail.noise_and_feedback.noise_gate_status = 1;
			} else {
				this.processor_detail.noise_and_feedback.noise_gate_status = 0;
			}
			this.noise_feedback_control();
		},
		// 反馈抑制按钮
		feedback_button() {
			if (this.processor_detail.noise_and_feedback.feedback_suppressor_status == 0) {
				this.processor_detail.noise_and_feedback.feedback_suppressor_status = 1;
			} else {
				this.processor_detail.noise_and_feedback.feedback_suppressor_status = 0;
			}
			this.noise_feedback_control();
		},
		// 压限按钮
		press_limit_button() {
			if (this.processor_detail.press_limit.status == 0) {
				this.processor_detail.press_limit.status = 1;
			} else {
				this.processor_detail.press_limit.status = 0;
			}
			this.request('post', push_press_limit_url, this.processor_detail.press_limit, '123456', this.resCommonParams.loginToken, (res) => {});
		},
		// 高低通按钮
		low_height_button(flag) {
			// flag为1则为高通
			if (flag == 1) {
				if (this.processor_detail.filter_height.status == 1) {
					this.processor_detail.filter_height.status = 0;
				} else {
					this.processor_detail.filter_height.status = 1;
				}
				this.request('post', push_low_height_url, this.processor_detail.filter_height, '123456', this.resCommonParams.loginToken, (res) => {});
			} else if (flag == 0) {
				if (this.processor_detail.filter_low.status == 1) {
					this.processor_detail.filter_low.status = 0;
				} else {
					this.processor_detail.filter_low.status = 1;
				}
				this.request('post', push_low_height_url, this.processor_detail.filter_low, '123456', this.resCommonParams.loginToken, (res) => {});
			}
		},
		// 高低通类型
		low_height_type(type, flag) {
			// flag为1则为高通
			if (flag == 1) {
				this.processor_detail.filter_height.type = type;
				this.request('post', push_low_height_url, this.processor_detail.filter_height, '123456', this.resCommonParams.loginToken, (res) => {});
			} else if (flag == 0) {
				this.processor_detail.filter_low.type = type;
				this.request('post', push_low_height_url, this.processor_detail.filter_low, '123456', this.resCommonParams.loginToken, (res) => {});
			}
		},
		// 高低通斜率
		low_height_slope(slope, flag) {
			// flag为1则为高通
			if (flag == 1) {
				this.processor_detail.filter_height.slope = slope;
				this.request('post', push_low_height_url, this.processor_detail.filter_height, '123456', this.resCommonParams.loginToken, (res) => {});
			} else if (flag == 0) {
				this.processor_detail.filter_low.slope = slope;
				this.request('post', push_low_height_url, this.processor_detail.filter_low, '123456', this.resCommonParams.loginToken, (res) => {});
			}
		},
		// 点击查询固定波段的均衡
		res_filter_peq(index) {
			this.static_par.filter_peq_section = index;
			this.request('post', filter_peq_url, { device_id: this.resCommonParams.deviceId, isInput: this.processor_detail.filter_peq.isInput, channel_no: this.processor_detail.filter_peq.channel_no, paragraph_no: index }, '123456', this.resCommonParams.loginToken, (res) => {
				this.processor_detail.filter_peq = res.data.data[0];
			});
		},
		// 均衡启闭
		filter_peq_button() {
			if (this.processor_detail.filter_peq.status == 1) {
				this.processor_detail.filter_peq.status = 0;
			} else if (this.processor_detail.filter_peq.status == 0) {
				this.processor_detail.filter_peq.status = 1;
			}
			this.request('post', push_filter_peq_url, this.processor_detail.filter_peq, '123456', this.resCommonParams.loginToken, (res) => {});
		},
		// 均衡类型
		fliter_peq_type_select(type) {
			this.processor_detail.filter_peq.type = type;
			this.request('post', push_filter_peq_url, this.processor_detail.filter_peq, '123456', this.resCommonParams.loginToken, (res) => {});
		},
	},
});
