// 电平显示组件
Vue.component('level-component', {
	template: `
    <div class="level_box">
      <div class="level_title">电平</div>
      <div class="level_display">
        <div class="level_bar">
          <span class="level_range">{{level_max}}</span>
          <div class="level_color_lump" ref="total_height">
            <div v-for="i,index in total_num" class="single_lump" :style="bg_draw(index)"></div>
          </div>
          <span class="level_range">{{level_min}}</span>
        </div>
      </div>
    </div>
  `,
	props: ['level_max', 'level_min', 'display_value'],
	data() {
		return {
			total_height: 0, //色块容器高度，组件
		};
	},
	mounted() {
		// this.total_height = $('.level_color_lump')[0].offsetHeight;
		this.total_height = this.$refs.total_height.offsetHeight;
		// v-for不能及时将节点渲染上去，但同时mounted已经执行，所以找不到节点
		// this.$nextTick(() => {
		// 	this.total_lump = $('.single_lump');
		// });
	},
	methods: {
		bg_draw(index) {
			let color;
			// 10是单位，一个小方格大小+间隔=10
			let max = Math.floor((this.total_height * 0.05) / 10 + 0.5);
			let mid = Math.floor((this.total_height * 0.1) / 10 + 0.5);
			let min = Math.floor((this.total_height * 0.15) / 10 + 0.5);
			if (index < max) {
				color = '#AB152E';
			} else if (index >= max && index < mid) {
				color = '#CB7E05';
			} else if (index >= mid && index < min) {
				color = '#BCB605';
			} else {
				color = '#23CB82';
			}
			// 显示效果时从下往上，但是节点渲染是从上往下，所以要用总数-基数
			let lump_opacity = '0.5'; //单独维护的色块透明度
			let total_num = Math.floor(this.total_height / 10);
			let percent = (this.display_value - Number(this.level_min)) / (Number(this.level_max) - Number(this.level_min));
			let rendering_num = Math.floor((this.total_height * percent) / 10 + 0.5);
			if (index + 1 > total_num - rendering_num) {
				lump_opacity = '1';
			}
			return { background: color, opacity: lump_opacity };
		},
	},
	computed: {
		total_num() {
			return Math.floor(this.total_height / 10);
		},
	},
});

// 滑块组件
Vue.component('single-slider', {
	props: ['channel', 'token', 'in_title', 'out_title', 'in_or_out', 'slider_max', 'slider_min'],
	data: function () {
		return {
			sliderNum: Number, //音量
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
		};
	},
	mounted: function () {
		this.sliderNum = this.channel.gain;
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
		// 静音
		soundOff: function () {
			if (this.channel.mute == 0) {
				this.channel.mute = 1;
			} else {
				this.channel.mute = 0;
			}
			let obj = {};
			obj.mute = this.channel.mute;
			obj.channel_no = this.channel.channel_no;
			obj.gain = this.channel.gain;
			// in_or_out 1为输出 0为输入
			if (this.in_or_out == 0) {
				this.request('post', channelControlUrl, { device_id: this.channel.device_id, input: [obj], output: [] }, '123456', this.token, function () {});
			} else {
				this.request('post', channelControlUrl, { device_id: this.channel.device_id, input: [], output: [obj] }, '123456', this.token, function () {});
			}
		},
		// 命令下发
		order_set: function () {
			// 根据输入改变滑块
			let obj = {};
			obj.mute = this.channel.mute;
			obj.channel_no = this.channel.channel_no;
			obj.gain = this.channel.gain;
			// in_or_out 1为输出 0为输入
			if (this.in_or_out == 0) {
				this.request('post', channelControlUrl, { device_id: this.channel.device_id, input: [obj], output: [] }, '123456', this.token, function () {});
			} else {
				this.request('post', channelControlUrl, { device_id: this.channel.device_id, input: [], output: [obj] }, '123456', this.token, function () {});
			}
		},
		command_send: function () {
			let reg = /(^\-?\d+$)|(^\+?\d+$)|(^\-?\d+\.\d+$)|(^\+?\d+\.\d+$)/;
			if (reg.test(this.sliderNum)) {
				if (this.sliderNum < Number(this.slider_min)) {
					this.sliderNum = Number(this.slider_min);
				} else if (this.sliderNum > Number(this.slider_max)) {
					this.sliderNum = Number(this.slider_max);
				} else {
					this.sliderNum = Math.floor(this.sliderNum * 10 + 0.5) / 10;
				}
				this.channel.gain = this.sliderNum;
				this.order_set();
			}
		},
		silderMove: function (e) {
			let content = this.$refs.slider;
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
				nowY = (nowY / content.offsetHeight) * (Number(this.slider_max) - Number(this.slider_min)) + Number(this.slider_min);
				nowY = Math.floor(nowY * 10 + 0.5) / 10;
				// sliderNum和sliderNum_temp不一样 前者是用于显示在面板上 后者用于回调改变滑块高度 两者没有关联关系 仅在面板输入时做了一次等值
				this.sliderNum = nowY;
				this.channel.gain = nowY;
			};
			window.onmouseup = () => {
				let obj = {};
				obj.mute = this.channel.mute;
				obj.channel_no = this.channel.channel_no;
				obj.gain = this.channel.gain;
				// in_or_out 1为输出 0为输入
				if (this.in_or_out == 0) {
					this.request('post', channelControlUrl, { device_id: this.channel.device_id, input: [obj], output: [] }, '123456', this.token, function () {});
				} else {
					this.request('post', channelControlUrl, { device_id: this.channel.device_id, input: [], output: [obj] }, '123456', this.token, function () {});
				}
				window.onmousemove = false;
			};
		},
		sliderTurnTo: function (e) {
			let content = this.$refs.slider;
			let nowY = content.offsetHeight - (e.clientY - Math.ceil(content.getBoundingClientRect().top));
			if (nowY < 0) {
				nowY = 0;
			}
			if (nowY > content.offsetHeight) {
				nowY = content.offsetHeight;
			}
			// 差值是以0为基准的
			nowY = (nowY / content.offsetHeight) * (Number(this.slider_max) - Number(this.slider_min)) + Number(this.slider_min);
			nowY = Math.floor(nowY * 10 + 0.5) / 10;
			this.sliderNum = nowY;
			this.channel.gain = nowY;
			let obj = {};
			obj.mute = this.channel.mute;
			obj.channel_no = this.channel.channel_no;
			obj.gain = this.channel.gain;
			// in_or_out 1为输出 0为输入
			if (this.in_or_out == 0) {
				this.request('post', channelControlUrl, { device_id: this.channel.device_id, input: [obj], output: [] }, '123456', this.token, function () {});
			} else {
				this.request('post', channelControlUrl, { device_id: this.channel.device_id, input: [], output: [obj] }, '123456', this.token, function () {});
			}
		},
		// 改变滑块进度条高度
		change_cover_height: function (par) {
			let temp = (par - Number(this.slider_min)) / (Number(this.slider_max) - Number(this.slider_min));
			return `height:${temp * 100}%;`;
		},
		// 改变滑块离底部距离
		change_slider_bottom: function (par) {
			let temp = (par - Number(this.slider_min)) / (Number(this.slider_max) - Number(this.slider_min));
			return `bottom:calc(${temp * 100}% - 18px);`;
		},
		link_to_in_or_out() {
			// this.$emit('page_loading_event', true);
			let channel_name_temp;
			if (this.in_or_out == 0) {
				// 查询噪声 反馈信息
				this.request('post', get_noise_and_feedback_url, { device_id: this.channel.device_id, channel_no: this.channel.channel_no }, '123456', this.token, (res) => {
					this.$emit('noise_feedback_event', res.data.data);
				});
				// 查询延时 压限信息
				this.request('post', delay_press_limit_url, { device_id: this.channel.device_id, channel_name_no: `channel_in_${this.channel.channel_no}` }, '123456', this.token, (res) => {
					this.delay_press_assign(res.data.data);
					// this.$emit('page_loading_event', false);
				});
				// 查询滤波 高低通信息
				this.request('post', filter_low_height_url, { device_id: this.channel.device_id, isInput: 1, channel_no: this.channel.channel_no }, '123456', this.token, (res) => {
					for (let i = 0; i < res.data.data.length; i++) {
						if (res.data.data[i].channel_name.indexOf('Low') == -1) {
							// 高通
							this.filter_low_height(res.data.data[i], 1, 1);
						} else {
							// 低通
							this.filter_low_height(res.data.data[i], 1, 0);
						}
					}
					this.$emit('filter_height_event', this.filter_height);
					this.$emit('filter_low_event', this.filter_low);
				});
				// 查询滤波均衡
				this.request('post', filter_peq_url, { device_id: this.channel.device_id, isInput: 1, channel_no: this.channel.channel_no, paragraph_no: 1 }, '123456', this.token, (res) => {
					this.$emit('filter_peq_event', res.data.data[0]);
				});
				// 切换上方标签选项及文字显示内容
				channel_name_temp = `IN${this.channel.channel_no}`;
				this.$emit('option_focus', 1);
			} else if (this.in_or_out == 1) {
				//查询延时 压限信息
				this.request('post', delay_press_limit_url, { device_id: this.channel.device_id, channel_name_no: `channel_out_${this.channel.channel_no}` }, '123456', this.token, (res) => {
					this.delay_press_assign(res.data.data);
				});
				// 查询滤波 高低通信息
				this.request('post', filter_low_height_url, { device_id: this.channel.device_id, isInput: 0, channel_no: this.channel.channel_no }, '123456', this.token, (res) => {
					for (let i = 0; i < res.data.data.length; i++) {
						if (res.data.data[i].channel_name.indexOf('Low') == -1) {
							// 高通
							this.filter_low_height(res.data.data[i], 0, 1);
						} else {
							// 低通
							this.filter_low_height(res.data.data[i], 0, 0);
						}
					}
					this.$emit('filter_height_event', this.filter_height);
					this.$emit('filter_low_event', this.filter_low);
				});
				// 查询滤波均衡
				this.request('post', filter_peq_url, { device_id: this.channel.device_id, isInput: 0, channel_no: this.channel.channel_no, paragraph_no: 1 }, '123456', this.token, (res) => {
					this.$emit('filter_peq_event', res.data.data[0]);
				});
				// 切换上方标签选项及文字显示内容
				channel_name_temp = `OUT${this.channel.channel_no}`;
				this.$emit('option_focus', 2);
			}
			this.$emit('channel_name_event', channel_name_temp);
		},
		// 把同样的赋值语句合并
		delay_press_assign(res) {
			this.delay.device_id = res.device_id;
			this.delay.channel_name_no = res.channel_name_no;
			this.delay.time_delay = res.time_delay;
			this.press_limit.device_id = res.device_id;
			this.press_limit.channel_name_no = res.channel_name_no;
			this.press_limit.status = res.status;
			this.press_limit.threshold = res.threshold;
			this.press_limit.slope = res.slope;
			this.press_limit.start_time = res.start_time;
			this.press_limit.recover_time = res.recover_time;
			this.$emit('delay_event', this.delay);
			this.$emit('press_limit_event', this.press_limit);
		},
		filter_low_height(res, in_out, low_height) {
			if (low_height == 1) {
				this.filter_height.device_id = res.device_id;
				this.filter_height.isInput = in_out;
				this.filter_height.isHigh = low_height;
				this.filter_height.status = res.status;
				this.filter_height.frequency = res.frequency;
				this.filter_height.slope = res.slope;
				this.filter_height.type = res.type;
				this.filter_height.channel_no = res.channel_no;
			} else if (low_height == 0) {
				this.filter_low.device_id = res.device_id;
				this.filter_low.isInput = in_out;
				this.filter_low.isHigh = low_height;
				this.filter_low.status = res.status;
				this.filter_low.frequency = res.frequency;
				this.filter_low.slope = res.slope;
				this.filter_low.type = res.type;
				this.filter_low.channel_no = res.channel_no;
			}
		},
	},
	template: `
        <div class="single_slider_content" @mousedown="link_to_in_or_out">
          <div class="slider_name">{{in_or_out==0?in_title:out_title}} {{channel.channel_no}}</div>
          <div class="slider_display">
            <div @mousedown.stop="soundOff" class="soundOff">
              <img :src="[this.channel.mute==0?'./img/静音通常.png':'./img/静音.png']" style="position: absolute;width: 100%;height: 100%;">
              <span :style="{fontSize: '12px',color:this.channel.mute==0?'#ABCBFF':'#FFABCF',zIndex:'1'}">静音</span>
            </div>
            <div class="slider_num">
              <input @keyup.enter="command_send" v-model.number="sliderNum" maxlength="5" class="slider_num_input">
              <span style="font-size: 12px;color: #ABCBFF;">dB</span>
            </div>
            <div class="slider_box">
              <span class="slider_range">{{slider_max}}</span>
              <div @mousedown="sliderTurnTo($event)" class="slider" ref="slider">
                <img src="./img/滑块小.png" style="width: 100%;height: 100%;position: absolute;">
                <div class="slider_bar"></div>
                <div :style="change_cover_height(channel.gain)" class="slider_cover"></div>
                <div :style="change_slider_bottom(channel.gain)" @mousedown.stop="silderMove($event)" class="slider_img"></div>
              </div>
              <span class="slider_range">{{slider_min}}</span>
            </div>
          </div>
        </div>
    `,
});
// 横向滑块模组
Vue.component('row-slider', {
	template: `
    <div class="row_slider_box" ref="slider" @mousedown="slider_turn_to($event)">
      <div class="slider_bg"></div>
      <div class="slider_cover" :style="change_cover_width(slider_thumb)"></div>
      <div class="slider_thumb" :style="change_slider_left(slider_thumb)" @mousedown.stop="slider_move($event)">
        <img draggable="false" src="./img/滑块2.png" style="width:100%;height:100%;">
      </div>
    </div>
  `,
	props: ['channel', 'slider_max', 'slider_min', 'token', 'url_params', 'params', 'key_params'],
	data() {
		return {
			slider_thumb: this.channel,
		};
	},
	watch: {
		channel(val) {
			this.slider_thumb = val;
		},
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
		slider_turn_to(e) {
			let dom = this.$refs.slider;
			let length = e.clientX - dom.getBoundingClientRect().left;
			if (length < 0) {
				length = 0;
			}
			if (length > dom.offsetWidth) {
				length = dom.offsetWidth;
			}
			length = (length / dom.offsetWidth) * (Number(this.slider_max) - Number(this.slider_min)) + Number(this.slider_min);
			length = Math.floor(length * 10 + 0.5) / 10;
			this.slider_thumb = length;
			this.$emit('slider_num', length);
			this.request('post', this.url_params, this.params, this.key_params, this.token, (res) => {});
		},
		slider_move(e) {
			let dom = this.$refs.slider;
			// 算的是焦点位置 所以要加上滑块样式的中心点
			let slider_left = e.currentTarget.offsetLeft + e.currentTarget.offsetWidth / 2;
			let mouseX = e.clientX;
			window.onmousemove = (e) => {
				let mouseW = e.clientX - mouseX;
				let length = mouseW + slider_left;
				if (length < 0) {
					length = 0;
				}
				if (length > dom.offsetWidth) {
					length = dom.offsetWidth;
				}
				length = (length / dom.offsetWidth) * (Number(this.slider_max) - Number(this.slider_min)) + Number(this.slider_min);
				length = Math.floor(length * 10 + 0.5) / 10;
				this.slider_thumb = length;
				this.$emit('slider_num', length);
			};
			window.onmouseup = () => {
				this.request('post', this.url_params, this.params, this.key_params, this.token, (res) => {});
				window.onmousemove = false;
			};
		},
		change_cover_width(length) {
			let width = (length - Number(this.slider_min)) / (Number(this.slider_max) - Number(this.slider_min));
			return `width:${width * 100}%;`;
		},
		change_slider_left(length) {
			let left = (length - Number(this.slider_min)) / (Number(this.slider_max) - Number(this.slider_min));
			return `left:calc(${left * 100}% - 10px);`;
		},
	},
});
