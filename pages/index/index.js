//index.js
//获取应用实例
var app = getApp(),
    url = app.globalData.url,
    booksData= app.globalData.booksData,
    navText=app.globalData.navText,
    booksCache = {},
    historyNum=-1;
Page({
  data: {
    books:null,
    detail:{},
    navText:navText,
    url:url,
    booksData:booksData,
    isListShow:true,
    isLoading:true,
    isSearch:false,
    searchVal:'',
    eventHistory:[],
    backDisable:true,
    forwordDisable:true
  },
  //事件处理函数 数据请求
  getBooks: function(url,data,cb) {
    wx.request({
      'url':url,
      'data':data,
      header: {
      'content-type': 'application/json'
  },
  success: function(res) {
    cb(res);
  }
    });
  },
  //导航点击获取list
  TapToGetbooks:function(e,k) {
    // 记录事件
    this.saveEvent("TapToGetbooks",[e,k]);
    //让list展示
    this.setData({
      isListShow:true,
      isLoading:true
    });
    //nav 的active变化
    var i = 0;
    for(var j = 0; j < navText.length; j++) {
      navText[j].flag ='';
    }
    if(e) {
      i=e.target.id;
    }
    if(k) {
      i = k;
    }else {
      navText[i].flag='active';
    }
    var that = this;
    var data = that.data.booksData[i].book;
    if(!booksCache[data.q]) {
      // list请求数据
    this.getBooks(that.data.url,data,function(res){
      booksCache[data.q] = res.data;
      var book = booksCache[data.q];
      book.type = i;
      that.setData({
        books:res.data,
        navText:navText,
        isLoading:false
      });
    });
    }else {
      var book = booksCache[data.q];
      book.type = i;
      this.setData({
        books:book,
        navText:navText,
        isLoading:false
      });
    }
  },
  //获取具体的信息
  getDetail:function(e) {
    // 记录事件
    this.saveEvent("getDetail",[e]);
    var that = this;
    this.setData({
      isListShow:false,
      detail:{}
    });
    var url = e.currentTarget.id;
    wx.request({
      'url':url,
      header: {
      'content-type': 'application/json'
  },
  success: function(res) {
    that.setData({
      detail:res.data
    });
  }
    });
  },
  onLoad: function () {
    this.TapToGetbooks();
    
  },
  // 分享
  onShareAppMessage: function () {
    return {
      title: '自定义分享标题',
      desc: '自定义分享描述',
      path: '/index'
    }
  },
  onReachBottom:function() {
      if(this.data.isListShow) {
        var data = this.data.booksData[this.data.books.type].book;
      data.start +=data.count;
      var booksData = this.data.booksData;
      booksData[this.data.books.type].book = data;
        this.setData({
          isLoading:true,
          booksData:booksData
        });
        //请求数据
      var that = this;
      this.getBooks(this.data.url,data,function(res){
        for(var i = 0; i < res.data.books.length; i++) {
          booksCache[data.q].books.push(res.data.books[i]);
        }
        var book = booksCache[data.q];
        book.type = that.data.books.type;
        that.setData({
          isLoading:false,
          books:book
        });
    });
      }
  },
  // 显示搜索框
  onPullDownRefresh:function() {
    this.setData({
      isSearch:true
    });
    wx.stopPullDownRefresh
  },
  //搜索功能
  search:function(e) {
    var val = this.data.searchVal;
    var data = this.data.booksData;
    data.push({
        book:{
        q:val,
        count:10,
        start:0
      }
      });
    this.setData({
      booksData:data
    });
    console.log(this.data.booksData);
    this.TapToGetbooks(e,this.data.booksData.length-1);
  },
  changeVal:function(e) {
    this.setData({
      searchVal:e.detail.value
    });
  },
  hideSearch:function() {
    console.log(this.data.searchVal);
    if(this.data.searchVal==='') {
      this.setData({
      isSearch:false
    });
    }
  },
  //前进后退功能
  // 记录事件
  saveEvent:function(name,arr) {
    var e = this.data.eventHistory;
    var flag = false;
    for(var i = 0; i < e.length; i++) {
      if(e[i].name==name&&arr[0]==e[i].params[0]) {
        flag = true;
      }
    }
    if(flag) {
      return;
    }
    e.length=historyNum+1;
    e.push({name:name,params:arr});
    historyNum++;
    this.watch();
    this.setData({
      eventHistory:e
    });
  },
  go:function() {
    var event = this.data.eventHistory;
    var i = event.length;
    if(historyNum<i-1) {
      historyNum++;
      var arr = event[historyNum].params;
      this[event[historyNum].name](arr[0],arr[1]);
      this.watch();
    }
  },
  back:function() {
    if(historyNum>0) {
      historyNum--;
      var event = this.data.eventHistory;
      var arr = event[historyNum].params;
      this[event[historyNum].name](arr[0],arr[1]);
      this.watch();
    }
  },
  // 监听historyNum和eventHistory的变化改变按钮状态
  watch:function() {
    if(historyNum<=0) {
      this.setData({
        backDisable:true
      });
    }else{
      this.setData({
        backDisable:false
      });
    }
    var i = this.data.eventHistory.length;
    if(historyNum>=i-1) {
      this.setData({
        forwordDisable:true
      });
    }else{
      this.setData({
        forwordDisable:false
      });
    }
  }
})
