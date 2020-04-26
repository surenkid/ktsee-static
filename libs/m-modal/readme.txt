调用方式：
var modal = Modal({
	id:'modal',
	title:'提示',
	content:_html,
	complete:function(){
		// do something ...				
	},
	confirm:function(){
		// do something ...
	},
	cancel:function(){
		// do something ...
	}
})

属性	备注说明
id	string，例如："modal"
type	number，0：确认框，1：提示框
addClass	string，添加类名，例如：addClass="a"，addClass="b"
title	string，标题
backdrop	boolean值，true或者false
confirmButton	boolean值，true或者false
cancelButton	boolean值，true或者false
confirmText	string，确定按钮名称
cancelText	string，取消按钮名称
complete	function(){}，打开弹框后回调
confirm	function(){}，确定事件回调
cancel	function(){}，取消事件回调