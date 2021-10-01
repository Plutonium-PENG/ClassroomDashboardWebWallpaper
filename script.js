//创建一大堆变量

//壁纸文件根文件夹
var ImageRootPath;
//壁纸文件路径数组
var ImagePaths = new Array();
//事件列表对象
var EventsData = new Array();
//横幅数组
var Banners = new Array();
//壁纸更换周期
var ImagesRefreshPeriod;
//横幅更换周期
var BannersRefreshPeriod;
//在事件或假期过期多久后隐藏
var HideExpiredHolidayEventsAfter;
//下次假期名称
var NextHolidayName;
//下次假期时间
var NextHolidayTime;
//时间表对象
var Schedules = new Object();
//状态表对象
var States = new Object();
//是否启用下次假期预告
var IsHolidayAvailable;
//是否启用横幅
var IsBannersAvailable;

//中介变量
var NextHolidayReamainingTime;
var CurrentStateReamainingTime;
setInterval(function () {
    var nowTimeString =
        GetTimeBlock("y") +
        "-" +
        GetTimeBlock("m") +
        "-" +
        GetTimeBlock("d") +
        "," +
        GetTimeBlock("h") +
        ":" +
        GetTimeBlock("min") +
        ":" +
        GetTimeBlock("s") +
        "," +
        GetTimeBlock("day_str");
    document.getElementById("CurrentTime").innerText = nowTimeString;

}, 500);

$(function () {
    $("#LoadingProgressBar").animate({
        backgroundSize: '30%'
    }, 1000, "easeInOutCubic");
    $({
        ProgressCountNum: 0
    }).delay(1500).animate({
        ProgressCountNum: 30
    }, {
        duration: 1000,
        easing: "easeInOutCubic",
        step: function () {
            $('#LoadingProgressNumber').text(Math.floor(this.ProgressCountNum) + "%");
        },
        complete: function () {
            $('#LoadingProgressNumber').text(this.ProgressCountNum + "%");
        },
    });

    $("#StatusReadingConfigurationContainer").delay(3500).fadeIn(350, function () {
        $.ajax({
            url: "./config.json",
            type: "GET",
            dataType: "json",
            async: "true",
            success: function (data) {
                $({
                    ProgressCountNum: 30
                }).animate({
                    ProgressCountNum: 100
                }, {
                    duration: 1000,
                    easing: "easeInOutCubic",
                    step: function () {
                        $('#LoadingProgressNumber').text(Math.floor(this.ProgressCountNum) + "%");
                    },
                    complete: function () {
                        $('#LoadingProgressNumber').text(this.ProgressCountNum + "%");
                    }
                });

                $("#LoadingProgressBar").animate({
                    backgroundSize: '100%'
                }, 1000, "easeInOutCubic", function () {
                    $("#StatusReadingConfigurationContainer").css("background", "linear-gradient(-45deg,transparent 20px,#1FD678FF 0px)");
                });

                $("#LoadingContainer").delay(2000).animate({
                    opacity: '0'
                }, 1500, "easeInOutCubic", function () {
                    $("#LoadingContainer").css("display", "none");
                    $("#WallpaperContainer").css("display", "block");
                    $("#WallpaperContainer").animate({
                        opacity: '1'
                    }, 2000, "easeInOutCubic");
                });

                $("#Reload").click(function () {
                    location.reload();
                });

                $("#Info").click(function () {
                    $(location).attr("href", "./info.html")
                });

                //读取与配置
                $(function () {
                    //读取全部数据
                    ImageRootPath = data.ImageRootPath;
                    ImagesRefreshPeriod = data.ImagesRefreshPeriod;
                    Banners = data.Banners;
                    BannersRefreshPeriod = data.BannersRefreshPeriod;
                    IsHolidayAvailable = data.IsHolidayAvailable;
                    IsBannersAvailable = data.IsBannersAvailable;
                    NextHolidayName = data.NextHoliday.Name;
                    NextHolidayTime = data.NextHoliday.Time;
                    HideExpiredHolidayEventsAfter = data.HideExpiredHolidayEventsAfter;
                    Schedules = data.Schedules;
                    States = data.Lessons;
                    EventsData = data.Events;

                    //设置可选UI
                    if (!IsHolidayAvailable) {
                        $("#NextHolidayContainer").css("display", "none");
                    }
                    if (!IsBannersAvailable) {
                        $("#BannerContainer").css("display", "none");
                    }

                    //设置好横幅
                    SetBanner();
                    //设置好下次假期
                    SetNextHoliday();
                    //设置好当前状态
                    SetCurrentState();
                    //设置好倒计时钟
                    SetEvents();

                    //设置好壁纸
                    //从根文件夹中读取全部壁纸的名称并添加到数组
                    //傻逼跨域问题：此文件用apache配置好，在wallpaper engine 使用iframe 访问
                    $.ajax({
                        url: ImageRootPath,
                        type: "GET",
                        async: true,
                        success: function (data) 
                        {
                            //i不能删……
                            $(data).find("a").attr("href", function (i, val) 
                            {
                                //不明觉厉的正则表达式
                                //stackoverflow的老哥是真的牛逼
                                if (val.match(/\.(jpe?g|png|gif)$/i)) {
                                    ImagePaths.push(ImageRootPath + val);
                                    _ = i;
                                }
                            });
                            SetWallpaper();
                        }
                    });
                });
            }
        }).fail(function () {
            $({
                ProgressCountNum: 30
            }).animate({
                ProgressCountNum: 99
            }, {
                duration: 1000,
                easing: "easeInOutCubic",
                step: function () {
                    $('#LoadingProgressNumber').text(Math.floor(this.ProgressCountNum) + "%");
                },
                complete: function () {
                    $('#LoadingProgressNumber').text(this.ProgressCountNum + "%");
                }
            });

            $("#LoadingProgressBar").animate({
                backgroundSize: '99%'
            }, 1000, "easeInOutCubic", function () {
                $("#LoadingProgressBar").css("background-color", "rgba(204,204,204,0.20)");
                $("#LoadingProgressBar").css("background-image", "linear-gradient(0deg,#CCCCCC ,#CCCCCC)");
                $("#LoadingProgressBar").css("box-shadow", "0px 0px 15px 1px rgba(204,204,204,1)");
                $("#LoadingProgressBar").css("border", "#CCCCCC solid 2px");
            });
            $("#Header").animate({
                opacity: '0'
            }, 1500, "easeInOutCubic");
            $("#LoadingProgressNumber").css("color", "rgba(204,204,204,1)");
            $("#LoadingProgressNumber").css("textShadow", "0px 0px 10px rgba(204,204,204,1)");
            $(".ItemMessage").css("display", "block");
            $("#StatusReadingConfigurationContainer").css("background", "linear-gradient(-45deg,transparent 20px,#E81123FF 0px)");
            $("#StatusReadingConfigurationContainer_Title").css("color", "#FFF")
            $("#StatusReadingConfigurationContainer_Message").css("color", "#FFF")
        });
    });

});

//取得时间分块
function GetTimeBlock(type) {
    var nowTimestamp = new Date();
    switch (type) {
        case "y":
            return nowTimestamp.getFullYear();
        case "m":
            return nowTimestamp.getMonth() + 1;
        case "d":
            return nowTimestamp.getDate();
        case "h":
            return TimeFormatting(nowTimestamp.getHours());
        case "min":
            return TimeFormatting(nowTimestamp.getMinutes());
        case "s":
            return TimeFormatting(nowTimestamp.getSeconds());
        case "day_str":
            switch (nowTimestamp.getDay()) {
                case 0:
                    return "Sun";
                case 1:
                    return "Mon";
                case 2:
                    return "Tue";
                case 3:
                    return "Wed";
                case 4:
                    return "Thu";
                case 5:
                    return "Fri";
                case 6:
                    return "Sat";
            }
            case "day":
                return nowTimestamp.getDay();
            case "time":
                return nowTimestamp.getTime();
            default:
                return -10086;
    }
}

//时间格式化
function TimeFormatting(t) {
    if (t < 10) {
        t = "0" + t;
    }
    return t;
}

//生成[a,b]随机整数
function GenerateRandInt(Min, Max) {
    return parseInt(Math.random() * (Max - Min + 1) + Min);
}

//设置横幅
function SetBanner() {
    $("#Banner").animate({
        opacity: 0
    }, 1000, "easeInOutQuint", function () {
        $("#Banner").text(Banners[GenerateRandInt(0, Banners.length - 1)]);
        $("#Banner").animate({
            opacity: 1
        }, 1000, "easeInOutQuint");
    });
    setInterval(function () {
        $("#Banner").animate({
            opacity: 0
        }, 1000, "easeInOutQuint", function () {
            $("#Banner").text(Banners[GenerateRandInt(0, Banners.length - 1)]);
            $("#Banner").animate({
                opacity: 1
            }, 1000, "easeInOutQuint");
        });
    }, BannersRefreshPeriod * 1000);
}

//设置壁纸
function SetWallpaper() {
    $("#MainBackground").css("background-image", "url(" + ImagePaths[GenerateRandInt(0, ImagePaths.length - 1)] + ")");
    setInterval(function () {
        $("#MainBackground").animate({
            opacity: 0
        }, 1500, "easeInOutQuint", function () {
            $("#MainBackground").css("background-image", "url(" + ImagePaths[GenerateRandInt(0, ImagePaths.length - 1)] + ")");
            $("#MainBackground").animate({
                opacity: 1
            }, 1500, "easeInOutQuint");
        });
    }, ImagesRefreshPeriod * 1000);
}

//设置下个假期
function SetNextHoliday() {
    setInterval(function () {
        NextHolidayReamainingTime = new Date(NextHolidayTime) - GetTimeBlock("time");
        //检查是否到期
        if (NextHolidayReamainingTime < 0) {
            //检查事件是否过期
            if (Math.abs(Math.ceil(NextHolidayReamainingTime / 1000)) >= HideExpiredHolidayEventsAfter) {
                $("#NextHolidayName").text("没有定义");
                $("NextHolidayName").css("color", "#CFCFCF")
                $("#NextHolidayRemainingTime").text("");
            }
            //到期但未过期
            else {
                $("#NextHolidayName").text(NextHolidayName);
                $("#NextHolidayName").css("color", "#F8F8FF");
                $("#NextHolidayRemainingTime").text("0");
                $("#NextHolidayRemainingTime").css("color", "#F8F8FF");
            }
        } else {
            $("#NextHolidayName").text(NextHolidayName);
            //小于60s
            if (NextHolidayReamainingTime <= 60 * 1000) {
                $("#NextHolidayRemainingTime").css("color", "#1DE781");
                $("#NextHolidayRemainingTime").text((NextHolidayReamainingTime / 1000).toFixed(1).toString());
            } else {
                //小于1h
                if (NextHolidayReamainingTime <= 60 * 60 * 1000) {
                    $("#NextHolidayRemainingTime").css("color", "#1DE781");
                    $("#NextHolidayRemainingTime").text(Math.ceil(NextHolidayReamainingTime / 1000 / 60).toString());
                }
                //大于1h
                else {
                    $("#NextHolidayRemainingTime").css("color", "#F8F8FF");
                    $("#NextHolidayRemainingTime").text(Math.ceil(NextHolidayReamainingTime / 1000 / 60 / 60 / 24).toString());
                }
            }
        }
    }, 100)
}

//刷新倒计时
function SetEvents()
{
    setInterval(() => 
    {
        $("#Event_1_Name").text(EventsData[0].Name);
        $("#Event_2_Name").text(EventsData[1].Name);
        $("#Event_3_Name").text(EventsData[2].Name);
        $("#Event_4_Name").text(EventsData[3].Name);
        $("#Event_5_Name").text(EventsData[4].Name);

        for (var i =0;i<=4;i++)
        {
            var s;
            leftTime = new Date(EventsData[i].Time).getTime() - new Date().getTime();
            //事件未到期
            if(leftTime >= 0)
            {
                s = TimeFormatting(Math.floor(leftTime / (1000 * 60 * 60 * 24))) +
                ":" +
                TimeFormatting(Math.floor(leftTime / (1000 * 60 * 60) % 24)) +
                ":" +
                TimeFormatting(Math.floor(leftTime / (1000 * 60) % 60)) +
                ":" +
                TimeFormatting(Math.floor(leftTime / 1000 % 60))
                switch (i) 
                {
                    case 0:
                        $("#Event_1_RemainingTime").text(s);
                    case 1:
                        $("#Event_2_RemainingTime").text(s);
                    case 2:
                        $("#Event_3_RemainingTime").text(s);
                    case 3:
                        $("#Event_4_RemainingTime").text(s);
                    case 4:
                        $("#Event_5_RemainingTime").text(s);
                }
            }
            else
            {
                //事件到期但未过期
                if ( leftTime <= 0 && Math.abs(leftTime) <= HideExpiredHolidayEventsAfter)
                {
                    s = "--:--:--:--"
                    switch (i) 
                    {
                        case 0:
                            $("#Event_1_RemainingTime").text(s);
                        case 1:
                            $("#Event_2_RemainingTime").text(s);
                        case 2:
                            $("#Event_3_RemainingTime").text(s);
                        case 3:
                            $("#Event_4_RemainingTime").text(s);
                        case 4:
                            $("#Event_5_RemainingTime").text(s);
                    }    
                }
                //事件过期
                else
                {
                    switch (i) 
                    {
                        case 0:
                            $("#Event_1_Container").css("display","none");
                            break;
                        case 1:
                            $("#Event_2_Container").css("display","none");
                            break;
                        case 2:
                            $("#Event_3_Container").css("display","none");
                            break;
                        case 3:
                            $("#Event_4_Container").css("display","none");
                            break;
                        case 4:
                            $("#Event_5_Container").css("display","none");
                            break;
                    }
                }
            }
        }
    }, 500);
}


function SetCurrentState() 
{
    //微软家的新款写法
    setInterval(() => {
        //eval转义搞死了，字符串的斜杠当除法把我整不会了QwQ
        var TodayString = GetTimeBlock("y")+"/"+GetTimeBlock("m")+"/"+GetTimeBlock("d")+" ";
        var TodayScheduleIndex = eval("Schedules."+GetTimeBlock("day_str")+".length-1");
        var NowTime = new Date().getTime();
        //是否早于时间表头
        if(NowTime <= new Date(TodayString+eval("Schedules."+GetTimeBlock("day_str")+"[0]")).getTime())
        {
            $("#CurrentState").text("没有定义。");
            $("#ProgressBar").css("display","none");
        }
        else
        {
            //是否晚于时间表尾
            if(NowTime >= new Date(TodayString+eval("Schedules."+GetTimeBlock("day_str")+"["+TodayScheduleIndex+"]")).getTime())
            {
                $("#CurrentState").text("没有定义。");
                $("#ProgressBar").css("display","none");
            }
            else
            {
                $("#ProgressBar").css("display","block");
                for(i = 0; eval("i <= Schedules." + GetTimeBlock("day_str") + ".length"); i++ )
                {
                    var StartTime = TodayString+eval("Schedules."+GetTimeBlock("day_str")+"["+ i +"]");
                    var DestinationTime = TodayString+eval("Schedules."+GetTimeBlock("day_str")+"["+ (i+1) +"]");
                    if(NowTime >= new Date(StartTime).getTime() && NowTime <= new Date(DestinationTime).getTime())
                    {
                        $("#CurrentState").text(eval("States."+GetTimeBlock("day_str")+"["+ i +"]"));
                        var p = (NowTime - new Date(StartTime).getTime())/(new Date(DestinationTime).getTime() - new Date(StartTime).getTime())*100;
                        var progress = p+"%";
                        $("#ProgressBar").animate({backgroundSize:progress},200,"easeInOutCubic");
                        
                        //剩余60s
                        if(new Date(DestinationTime).getTime()-NowTime <= 60*1000)
                        {
                            $("#RemainingTime").text( Math.floor((new Date(DestinationTime).getTime()-NowTime)/1000) )
                            $("#RemainingTime").css("color","#EFFD5B");
                        }
                        else
                        {
                            $("#RemainingTime").text( Math.ceil((new Date(DestinationTime).getTime()-NowTime)/1000/60))
                            $("#RemainingTime").css("color","aqua");
                        }
                        break;
                    }
                    else
                    {
                        continue;
                    }
                }
            }
        }

    }, 1000);
}