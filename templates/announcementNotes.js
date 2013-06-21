function commonAnnouncementNote() 
{
	// 공통공지 내용이 다 안적혔으면 다 적으라고 하기
	commonContents = $("#commonAnnouncementContent").val();
	if(commonContents.length<1) {
		alert("내용을 적으쇼");
	} else { // 다음으로 
		$("#commonContentsThumbnail").html('<div class=\'commonAnnouncementContainer\'><img class=\'commonAnnouncementProfile\' src=\''+localStorage.userProfile_pic+'\' /><p class=\'commonContent \' style=\'margin-left:70px;\'>'+commonContents+'<p></div>');
		makeIndividualAnnouncementEntry();

		$.mobile.changePage( "#writeindividualAnnouncementNotePage");
	}
}

//현재 친구인 어머니들 정보를 읽어와서 동적으로 개별공지 적는 란 만들기
function makeIndividualAnnouncementEntry()
{
	$.ajax({
	type: "GET", // or POST
	url: "/getMyPartners",
	dataType: "json",
	success: function(msg){
			$("#individualCommentContainer").html("");

			var i=0;
			var textToInsert = [];
			for (a in msg) {
				if(msg[a]['currentFriend']==true) {
					textToInsert[i++] = '<p>'+msg[a].username;
					textToInsert[i++] = '</p>';
					textToInsert[i++] = '<textarea id=\"'+msg[a].email.split("@")[0]+'_individualComment\"></textarea>';
					textToInsert[i++] = '';
				}
			}
			textToInsert = textToInsert.join('');
			// 가져다 붙이기
			$('#individualCommentContainer').html('<p>'+textToInsert+'</p>');
			//alert('<p>'+textToInsert.join('')+'</p>');
			// 위젯 활성화
			//
			$('#writeindividualAnnouncementNotePage textarea').textinput();
		} 
	});
}

// 필요정보를 모아모아 알림장 발행 정보를 서버로 쏘기
function publishAnnouncementNote()
{
	// JSON 만들기
	var result = {"method":"publish","id":"","publisher_email":localStorage.userEmail,"published_date":makeStandardTimeStampOurs(getTimeStamp()),"content":$("#commonAnnouncementContent").val(),"individual_announcement":[]};
	$.ajax({
	type: "GET", // or POST
	url: "/getMyPartners",
	dataType: "json",
	success: function(msg){

			for(var a in msg){
				result.individual_announcement[a]= {"receiver_email": msg[a].email,"content":$("#"+msg[a].email.split("@")[0]+"_individualComment").val()};
			}
			
			// 요청 날리기
			$.ajax({
			type: "POST", // or POST
			url: "/publishAnnouncementNote",
			dataType: "json",
			data: result,
			success: function(msg){
					alert("성공! 목록으로 이동합니다.");
					$.mobile.changePage( "#timelinePage");
				} 
			});
		} 
	});	
}

function respondToAnnouncementNote(method){
	// JSON 만들기
	var result = {"parent_email":localStorage.userEmail,"common_announcement_id":localStorage.common_announcement_id,"method":method,"date":makeStandardTimeStampOurs(getTimeStamp())};
	if($("#respondTextInput")){
		result['response_message']=$("#respondTextInput").val();
	}
	if((method == 'reply')&&(result['response_message'].length<1)){
		alert('메시지를 입력하세요');
	} else {
		// 요청 날리기
		$.ajax({
		type: "POST", // or POST
		url: "/respondToAnnouncementNote",
		dataType: "json",
		data: result,
		success: function(msg){				
				fetchMyAnnouncementNotes();	
			} 
		});
	}
}


function makeOurTimeStampStandard(ourTimestampString)
{
	result="20"+ourTimestampString.substr(0,2)+"-"+ourTimestampString.substr(2,2)+"-";
	result = result +ourTimestampString.substr(4,2)+" ";
	result = result + ourTimestampString.substr(6,2) + ":" + ourTimestampString.substr(8,2)+":00"
	return result;	
}
function makeStandardTimeStampOurs(standardTimestampString)
{
	result=standardTimestampString.substr(2,2)+standardTimestampString.substr(5,2);
	result = result + standardTimestampString.substr(8,2)+standardTimestampString.substr(11,2);
	result = result + standardTimestampString.substr(14,2);
	return result;	
}

function when(input)
{
    today = new Date();                                         //get current date
    inputDate = new Date();
 //   var input;                                                  //string received by post
    var iYear, iMonth, iDate, iHour, iMinute, iSecond, iHourC, iMinuteC;
    var amPm = "오전";
    var day = new Array (7);
    day[0] = "일요일";
    day[1] = "월요일";
    day[2] = "화요일";
    day[3] = "수요일";
    day[4] = "목요일";
    day[5] = "금요일";
    day[6] = "토요일";

 //   input = "2011-07-18 13:05:10";

    iYear = parseInt(input.substring(0, 4));
    iMonth = parseInt(input.substring(5, 7));
    iDate = parseInt(input.substring(8, 10));
    iHour = parseInt(input.substring(11, 13));
    iMinute = parseInt(input.substring(14, 16));
    iSecond = parseInt(input.substring(17, 19));


    inputDate.setFullYear(iYear), inputDate.setMonth(iMonth - 1), inputDate.setDate(iDate),
        inputDate.setHours(iHour), inputDate.setMinutes(iMinute), inputDate.setSeconds(iSecond);

    if (iHour > 11) { amPm = "오후"; }
    
    if (iHour > 12) { iHourC = iHour - 12; }
    else if (iHour == 0) { iHourC = 12; }
	else { iHourC = iHour; }

    if (iMinute < 10) { 
    	iMinuteC = "0" + iMinute; 
    } else {
	    iMinuteC = iMinute;
    }
    var diff = (today - inputDate) / 1000;

    
    var timeGroup;
    if (diff < 60 && diff >= 0) { timeGroup = 1; }              //방금
    if (diff < 3300 && diff >= 60) { timeGroup = 2; }           //1~59분 전
    if (diff < 86400 && diff >= 3300) { timeGroup = 3; }        //1~23시간 전
    if (diff < 172800 && diff >= 86400) { timeGroup = 4; }      //어제
    if (diff < 345600 && diff >= 172800) { timeGroup = 5; }     //일~토요일
    if (diff >= 345600) { timeGroup = 6; }                      //?월 ?일
    if (diff < 0) { timeGroup = 7; }                            //오류

    switch (timeGroup) {
        case 1:
            return ("방금");
            break;
        case 2:
            var scaleMinute = diff / 60;
            return (Math.round(scaleMinute) + "분 전");
            break;
        case 3:
            var scaleHour = diff / 3600;
            return (Math.round(scaleHour) + "시간 전");
            break;
        case 4:
            return ("어제 " + amPm + " " + iHourC + ":" + iMinuteC);
            break;
        case 5:
            return (day[inputDate.getDay()] + " " + amPm + " " + iHourC + ":" + iMinuteC);
            break;
        case 6:
            return (iMonth + "월 " + iDate + "일 " + amPm + " " + iHourC + ":" + iMinuteC);
            break;
        case 7:
            return ("미래의 시각입니다. 오류<br />");
    }
   
}

// 현재 시각을 표준 양식으로 가져온다
function getTimeStamp() {
  var d = new Date();

  var s =
    leadingZeros(d.getFullYear(), 4) + '-' +
    leadingZeros(d.getMonth() + 1, 2) + '-' +
    leadingZeros(d.getDate(), 2) + ' ' +

    leadingZeros(d.getHours(), 2) + ':' +
    leadingZeros(d.getMinutes(), 2) + ':' +
    leadingZeros(d.getSeconds(), 2);

  return s;
}


function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

// 우리의 날짜 양식을 받는다.
function dateExpresstion(dateString)
{
	result=dateString.substr(0,2)+"년"+dateString.substr(2,2)+"월"+dateString.substr(4,2)+"일";
	return result;	
}

function fetchMyAnnouncementNotes() {
	$.ajax({
		type: "GET", // or POST
		url: "/getAnnouncementNotes",
		dataType: "json",
		success: function(msg){
			if(msg[0]=='로그인이 안되어서 응답을 못하겠습니다.'){
				if(localStorage.userEmail.length > 0 && localStorage.userPassword.length > 0) {
					console.log("fetch..로그인 안됨");
					userAuthentication(localStorage.userEmail,localStorage.userPassword);
					generateCommonAnnouncementCards();
				}
			} else { console.log("fetch..로그인 됨");
				localStorage.myAnnouncementNote = JSON.stringify(msg);	
				generateCommonAnnouncementCards();
				showAnnouncementNoteDetail();
			}
		}
	});
}



function generateCommonAnnouncementCards()
{
	var myArticles;
	var msg = JSON.parse(localStorage.myAnnouncementNote);
	myArticles = msg.articles;
	if(myArticles) {
		// 최근 알림장 순으로 정렬
		myArticles.sort(function(a,b){
			if (a.published_date > b.published_date)
				return -1;
			if (a.published_date < b.published_date)
				return 1;
			return 0;
		});
		
		var textToInsert = [];
		var i=0;
		var numOfMyArticles =  msg.total_common_announcement;						
	
		if (localStorage.userRole=='classTeacher') {
			for(var a=0;a<numOfMyArticles;a+=1) {
			
				textToInsert[i++] = '<div id=\'wrapper_timeline><div id=\'scroller_timeline\'>';
				textToInsert[i++] = '<a href=\'#announcementNoteDetailPage\' onclick=\'';
				textToInsert[i++] = 'localStorage.common_announcement_id='+myArticles[a]['id']+';\' data-transition=\'slide\'>';
				textToInsert[i++] = '<div class=\'commonAnnouncementCardContainer\'>';
				textToInsert[i++] = '<p style=\'margin-top:7px;\'><br/><span style=\'font-size:23px;\'>' + dateExpresstion(myArticles[a]['published_date']).substr(3,6) + '</span><br/>';
				if(myArticles[a]['content'].length>18) {
					textToInsert[i++] = myArticles[a]['content'].substr(0,17) + '…'+'</p>'; 
				} else {
					textToInsert[i++] = myArticles[a]['content'].substr(0,18) + '</p>'; 
				}
				// 보낸 사람 수 
				var numOfParent = myArticles[a]['individual_announcement'].length;
				// 안 읽은 사람 수 
				var numOfUnreadParent = 0;
				
				for(var j in myArticles[a]['individual_announcement']) {
					if(	myArticles[a]['individual_announcement'][j]['confirmed_date'] == null ) {
						numOfUnreadParent++;				
					}
				}
				
				textToInsert[i++] = '<div class=\"commonCardNotiIconContainer\">';
				var timeDifference = makeStandardTimeStampOurs(getTimeStamp()) - myArticles[a]['published_date'];			
				if(numOfUnreadParent != 0) {
					if(timeDifference < 400){
						textToInsert[i++] = '<p>안 본 사람 '+numOfUnreadParent+'명</p></div>';
					} else {
						textToInsert[i++] = '<p>바쁜사람 '+numOfUnreadParent+'명</p></div>';
					}
				} else {
						textToInsert[i++] = '<p><img src="static/img/check_true.png" /></p></div>';
				}
							
				textToInsert[i++] = '</div></a></div></div>';
			}		
		} else if (localStorage.userRole=='parent') {
			for(var a=0;a<numOfMyArticles;a+=1) {
				textToInsert[i++] = '<div id=\'wrapper_timeline><div id=\'scroller_timeline\'>';
				textToInsert[i++] = '<a href=\'#announcementNoteDetailPage\' onclick=\'';
				textToInsert[i++] = 'localStorage.common_announcement_id='+myArticles[a]['id']+';\' data-transition=\'slide\'>';
				textToInsert[i++] = '<div class=\'commonAnnouncementCardContainer\'>';
				textToInsert[i++] = '<p style=\'margin-top:7px;\'><br/><span style=\'font-size:23px;\'>' + dateExpresstion(myArticles[a]['published_date']).substr(3,6) + '</span><br/>';
				if(myArticles[a]['content'].length>18) {
					textToInsert[i++] = myArticles[a]['content'].substr(0,17) + '…'+'</p>'; 
				} else {
					textToInsert[i++] = myArticles[a]['content'].substr(0,18) + '</p>'; 
				}
				// confirmed date가 null 인 경우 신규 리본을 달고 회색 체크아이콘을 표시한다.
				if(myArticles[a]['individual_announcement'][0]){
					if(myArticles[a]['individual_announcement'][0]['confirmed_date'] == null) {
						textToInsert[i++] = '<img class=\'newItem\'src="static/img/newItem.png">';
						textToInsert[i++] = '<div class=\"commonCardNotiIconContainer\">';
						textToInsert[i++] = '<img src="static/img/check_false.png" /></div>';
					} else {
						textToInsert[i++] = '<div class=\"commonCardNotiIconContainer\">';
						textToInsert[i++] = '<img src="static/img/check_true.png" /></div>';
					}
				}
				textToInsert[i++] = '</div></a></div></div>';
			}			
		}
		$('#myCardsContainer').html(textToInsert.join(''));
	
	 	// 위젯 활성화
	 	$.mobile.activePage.find('#myCardsContainer ul').listview();
	}	
} 
	


// 나의 커버영역을 업데이트 ( 내 사진 , 아이사진, 현재년도)
function updateCoverSection()
{
	if(localStorage.userEmail.length > 0) {
		$.ajax({
			type: "GET", // or POST
			url: "/getMyPartners",
			dataType: "json",
			success: function(msg){
				if(msg[0]!='로그인이 안되어서 응답을 못하겠습니다.'){		
					var textToInsert = [];
					var i=0;
					var numOfMyPartners =  msg.length;	
					var main_profile_pic = "";
					var myPartners = JSON.parse(localStorage.myPartners);
					
					if(localStorage.userRole == 'parent') {
						main_profile_pic = localStorage.childProfile_pic;
						textToInsert[i++] = '<div class=\"dark_layer\"><a href=\"#childWikiViewPage\" style="color:black;"><div class=\"childCoverSection\" ';
						textToInsert[i++] = 'onclick=\"localStorage.wiki_child_id='+ myPartners[0]['child_id']+'\">';

					} else if (localStorage.userRole == 'classTeacher') {
						main_profile_pic = localStorage.userProfile_pic;
						textToInsert[i++] = '<div class=\"dark_layer\"><a href=\"#\" style="color:black;"><div class=\"childCoverSection\" >';

					}
					// 선생님이 일반적으로 한명이므로 첫번째 원소에서 아이정보 가져온다.	
					textToInsert[i++] = '<img class=\"profile_pic_on_cover\" src=\"';
					textToInsert[i++] = main_profile_pic + '\">';
					if(localStorage.userRole != 'parent') {
						textToInsert[i++] = '<span><strong>'+localStorage.userName+'</strong></span></div>';
					} else {
						textToInsert[i++] = '<span><strong>'+localStorage.childName+'</strong></span></div>';
					}
					textToInsert[i++] = '</a><div class=\"partner_pic_on_cover_container\">';			
					for(var a=0;a<numOfMyPartners;a+=1) {
						if(msg[a].currentFriend == true){
							textToInsert[i++] = '<img src=\"';
							if (localStorage.userRole=='classTeacher') {
								textToInsert[i++] = msg[a].childprofile_pic + '\">';
							} else if (localStorage.userRole=='parent') {
								textToInsert[i++] = msg[a].profile_pic + '\">';
							} 
						}
					}
					textToInsert[i++] = '<p>'+seasonExpression(makeStandardTimeStampOurs(getTimeStamp()))+'</p>';
					textToInsert[i++] = '</div></div>';
					$('.coverPhotoSection:first-child').html(textToInsert.join(''));
				}
			}
		});	
	} else {
		$('.coverPhotoSection:first-child').html("");
	}
	
}

function seasonExpression(ourTimestampString) {
	var year = "20" + ourTimestampString.substring(0,2);
	var month = ourTimestampString.substring(2,4);

	if (3 <= Number(month) & Number(month) <= 5) {
		return year + "년 봄";
	}
	else if (6 <= Number(month) & Number(month) <= 8) {
		return year + "년 여름";
	}
	else if (9 <= Number(month) & Number(month) <= 11) {
		return year + "년 가을";
	}
	else {
		return year + "년 겨울";
	}
}

function responseMSGModifyBegin(method) {
	var respondMessage;
	if( method == 'cancel') {
	// 팝업 닫고.
	$( "#responseMSGModifyPopup" ).popup( "close" );
	} else if ( method == 'delete') {
	// 현재 답글에 달린 정보를 보이지 않는 답변 창에 옮겨 적은 후
//	respondMessage = $(".individualContent:eq(1)").html().split("<span")[0].split("ng>")[2];
		
	//	지우는 Ajax 호출 날리기
	respondToAnnouncementNote(method);
	$( "#responseMSGModifyPopup" ).popup( "close" );
		// 성공 콜백으로 화면 업데이트
	}
	// 현재 답글 엘리먼트 display를 none 으로설적
//	$(".individualContent:eq(1)").attr("style","display:none;");
//	$(".commonAnnouncementProfile:eq(2)").attr("style","display:none;");
//	$(".responseMessageModifyEntry:eq(0)").attr("style","display:block;");
	
	// 답변 수정 엘리먼트를 toggle
}

// 일단 부모측의 알림장 디테일 화면 생성하기
function showAnnouncementNoteDetail()
{
	var msg = JSON.parse(localStorage.myAnnouncementNote);
	var myArticles = msg.articles;
	var common_announcement_id = localStorage.common_announcement_id;			
	var textToInsert = [];
	var i=0;
	var numOfMyArticles =  msg.total_common_announcement;							
	// 현재 내 파트너 중 이 메시지 수신자와 이메일이 일치하는 사람의 프로필 사진을 표시
	var myPartners = JSON.parse(localStorage.myPartners);	

	if (localStorage.userRole=='classTeacher') { 			 
		for(var a=0;a<numOfMyArticles;a+=1) {
			if(myArticles[a]['id']==common_announcement_id)
			{
				// 공통공지 영역 생성
				textToInsert[i++] = '<div id=\'wrapper0\'><div id=\'scroller0\'><div class=\'commonAnnouncementContainer\'>';
				textToInsert[i++] = '<img class=\'commonAnnouncementProfile\' src=\'';
				textToInsert[i++] = localStorage.userProfile_pic+'\' />';
				textToInsert[i++] = '<p class=\'commonContent\'>' +  myArticles[a]['content']+'</p></div>';
				textToInsert[i++] = '<div id=\'nav\'><ul id=\'indicator\'>';
				
				// 아이 사진으로 인디케이터를 표시
				for(var j=0;j<myArticles[a]['individual_announcement'].length;j++){
					var receiverPic;
						for (var k in myPartners) {						
							if ( myPartners[k]['email'] == myArticles[a]['individual_announcement'][j]['receiver_email'])
							{
								receiverPic = myPartners[k]['childprofile_pic'];
								break;
							}								
						}
						textToInsert[i++] = '<li ';
						if(j==0)
							textToInsert[i++] = 'class=\'active\' ';
						textToInsert[i++] = 'onclick=\'myScroll.scrollToPage(';
						textToInsert[i++] = j;
						textToInsert[i++] = ', 0);\'><img style=\'width:100%;\' src=\'';
						textToInsert[i++] = receiverPic;
						textToInsert[i++] = '\'></li>';
				}
				textToInsert[i++] = '</ul></div>';



				
				textToInsert[i++] ='<div id=\'wrapper\'><div id=\'scroller\'><ul id=\'thelist\'>';
				
				for(var j=0;j<myArticles[a]['individual_announcement'].length;j++){
					
//						alert(JSON.stringify(myArticles[a]['individual_announcement'][j]));
						textToInsert[i++] = '<li>';
						// 현재 내 파트너 중 이 메시지 수신자와 이메일이 일치하는 사람의 프로필 사진을 표시
						var myPartners = JSON.parse(localStorage.myPartners);
						var receiverInfo;
						var publisherInfo = {"profile_pic":localStorage.userProfile_pic,'username':localStorage.userName};						
						
						for (var k in myPartners) {
							if ( myPartners[k]['email'] == myArticles[a]['individual_announcement'][j]['receiver_email'])
							{
								receiverInfo = myPartners[k];
								break;
							}
						}
			
						// 개별공지 영역 생성
						textToInsert[i++] = '<div class=\'individualAnnouncementContainer\'>';
						if((myArticles[a]['individual_announcement'][j]['content'].length>1)) {
							textToInsert[i++] = '<img class=\'commonAnnouncementProfile\' src=\'';
							textToInsert[i++] = publisherInfo['profile_pic']+'\' />';
							textToInsert[i++] = '<p class=\'individualContent\'><strong>'+publisherInfo['username']+' 선생님 : '+'</strong>';
							textToInsert[i++] =  myArticles[a]['individual_announcement'][j].content+'<br/>';
							textToInsert[i++] = '<span class=\'individualAnnouncementDate\'>'+when(makeOurTimeStampStandard(myArticles[a]['published_date']))+'</span></p>';
						}
						
						// 입력하는거 만들지 말고 자신이 붙인 메시지 보여주기
						if ((myArticles[a]['individual_announcement'][j]['response_message_date']!=null)&&(myArticles[a]['individual_announcement'][j]['response_message']!=null)) {
							textToInsert[i++] = '<img class=\'commonAnnouncementProfile\' src=\'';
							textToInsert[i++] = receiverInfo['profile_pic'] + '\' />';
							textToInsert[i++] = '<p class=\'individualContent\'><strong>'+receiverInfo['username']+' 학부모님 : '+'</strong>';
							textToInsert[i++] = myArticles[a]['individual_announcement'][j]['response_message'];
							textToInsert[i++] = '<span class=\'individualAnnouncementDate\'><br/>'+when(makeOurTimeStampStandard(myArticles[a]['individual_announcement'][j]['response_message_date']))+'</span>'
							textToInsert[i++] = '</p>';					
						}
						textToInsert[i++] = '</div>';		
							
						// 확인 버튼 만들기
						if(myArticles[a]['individual_announcement'][j]['confirmed_date']==null) {
							textToInsert[i++] = '<div class=\"confirmationButton\">';
							textToInsert[i++] = '<img src=\'static/img/check_false.png\' />';
							textToInsert[i++] = '<p>확인 아직 안하셨음</p>';
							textToInsert[i++] = '</div>';

						} else {
							textToInsert[i++] = '<div class=\'confirmationButton\'>';
							textToInsert[i++] = '<img src=\'static/img/check_true.png\' />';

							textToInsert[i++] = '<p>'+when(makeOurTimeStampStandard(myArticles[a]['individual_announcement'][j]['confirmed_date']))+' 읽으심</p>';
							textToInsert[i++] = '</div>';	

						}
						
						textToInsert[i++] = '</li>';


				}
				textToInsert[i++] = '</ul></div></div></div></div>'
				$('#announcementNoteDetailPage div[data-role=\'header\'] h1').html(dateExpresstion(myArticles[a]['published_date']));
				$('#announcementNoteDetailPage div[data-role=\'content\']').html(textToInsert.join(''));
				$('#respondTextInput').textinput();

				
				var numOfList = $("ul#thelist>li").length;
				var width_scroller = numOfList*100;
				var width_item = 100.00 / numOfList;
			
				$("#scroller").css("width",width_scroller+"%");
				$("div#scroller>ul>li").css("width",width_item+"%");
				
				
				setTimeout(function () {
				    myScroll = new iScroll('wrapper0',{	
				    	hScrollbar: false,
					});

					myScroll = new iScroll('wrapper', {
						snap: true,
						momentum: true,
						hScrollbar: false,
						onScrollEnd: function () {
							document.querySelector('#indicator > li.active').className = '';
							document.querySelector('#indicator > li:nth-child(' + (this.currPageX+1) + ')').className = 'active';
						}
					});
				}, 100);
			}
		}
	} else if (localStorage.userRole=='parent') {
		for(var a=0;a<numOfMyArticles;a+=1) {
			for(var j=0;j<myArticles[a]['individual_announcement'].length;j++){
				if((myArticles[a]['id']==common_announcement_id)&&(myArticles[a]['individual_announcement'][j]['receiver_email']==localStorage.userEmail))
				{

					// 현재 내 파트너 중 이 메시지 송신자와 이메일이 일치하는 사람의 프로필 사진을 표시
					var myPartners = JSON.parse(localStorage.myPartners);
					var publisherInfo;
					var receiverInfo;
					for (var i in myPartners) {
						if ( myPartners[i]['email'] == myArticles[a]['publisher_email'])
						{
							publisherInfo = myPartners[i];
							break;
						}
					}
					
					$.ajax({
						type: "POST", // or POST
						url: "/getUserProfilePic",
						dataType: "json",
						data: {"email":myArticles[a]['individual_announcement'][j]['receiver_email'],"a":a,"j":j},
						success: function(msg){	
							receiverInfo = msg;						
							a = msg['a'];
							j = msg['j'];

							// 공통공지 영역 생성
							textToInsert[i++] = '<div class=\'commonAnnouncementContainer\'>';
							textToInsert[i++] = '<img class=\'commonAnnouncementProfile\' src=\'';
							textToInsert[i++] = publisherInfo['profile_pic']+'\' />';
							textToInsert[i++] = '<p class=\'commonContent\'>' +  myArticles[a]['content']+'</p></div>';
		
							// 개별공지 영역 생성
							textToInsert[i++] = '<div class=\'individualAnnouncementContainer\'>';
							if((myArticles[a]['individual_announcement'][j]['content'].length>1)) {
								textToInsert[i++] = '<img class=\'commonAnnouncementProfile\' src=\'';
								textToInsert[i++] = publisherInfo['profile_pic']+'\' />';
								textToInsert[i++] = '<p class=\'individualContent\'><strong>'+publisherInfo['username']+' 선생님 : '+'</strong>';
								textToInsert[i++] =  myArticles[a]['individual_announcement'][j].content+'<br/>';
								textToInsert[i++] = '<span class=\'individualAnnouncementDate\'>'+when(makeOurTimeStampStandard(myArticles[a]['published_date']))+'</span></p>';
								

							
	
							}
								// 숨겨진 응답메시지 등록 창 
								textToInsert[i++] = '<div class=\"responseMessageEntry\" style=\'display:none;\' >';
								textToInsert[i++] = '<textarea id=\'respondTextInput\' placeholder=\"응답메시지 보내기\"></textarea>';
								textToInsert[i++] = '<div class=\"responseMessageSubmit\" onclick=\"respondToAnnouncementNote(\'reply\')\" ><span>전송<span></div>';										
								textToInsert[i++] = '</div>';
							if ((myArticles[a]['individual_announcement'][j]['response_message_date']!=null)&&(myArticles[a]['individual_announcement'][j]['response_message']!=null)) {
								// 입력하는거 만들지 말고 자신이 붙인 메시지 보여주기
								textToInsert[i++] = '<img class=\'commonAnnouncementProfile\' src=\'';
								textToInsert[i++] = receiverInfo['profile_pic'] + '\' />';
								textToInsert[i++] = '<p class=\'individualContent\'><strong>'+receiverInfo['username']+' 학부모님 : '+'</strong>';
								textToInsert[i++] = myArticles[a]['individual_announcement'][j]['response_message'];
								textToInsert[i++] = '<span class=\'individualAnnouncementDate\'><br/>'+when(makeOurTimeStampStandard(myArticles[a]['individual_announcement'][j]['response_message_date']))+'</span>'
								textToInsert[i++] = '<a href=\"#responseMSGModifyPopup\" data-rel=\"popup\" data-transition=\"slideup\" data-position-to=\"window\" ><img style=\'position:absolute;right:20px;width:25px;\' src=\'static/img/eraser.png\' /></a></p>';					
							}
							textToInsert[i++] = '</div>';		


							// 메시지 버튼 만들기
							if ((myArticles[a]['individual_announcement'][j]['response_message_date']==null)||(myArticles[a]['individual_announcement'][j]['response_message']==null)){
								textToInsert[i++] = '<div class=\"responseMessageButton\" onclick=\"$(\'.responseMessageEntry:first\').toggle(300);\">';
								textToInsert[i++] = '<img src=\'static/img/comment.png\' />';
								textToInsert[i++] = '<p>답글 남기기</p>';
								textToInsert[i++] = '</div>';
//								textToInsert[i++]='<input type=\"text\" id=\'respondTextInput\' placeholder=\"응답메시지 보내기\"/>';
//								textToInsert[i++]='<input type=\"button\" value=\"전송\" id=\'respondSendButton\'  onclick=\"respondToAnnouncementNote(\'reply\')\" />';
							} 	
								
							// 확인 버튼 만들기
							if(myArticles[a]['individual_announcement'][j]['confirmed_date']==null) {
								textToInsert[i++] = '<div class=\"confirmationButton\" onclick=\"respondToAnnouncementNote(\'confirm\')\">';
								textToInsert[i++] = '<img src=\'static/img/check_false.png\' />';
								textToInsert[i++] = '<p>확인 체크하기</p>';
								textToInsert[i++] = '</div>';
								//textToInsert[i++] = '<input type=\"button\" id=\'confirmButton\' value=\"네 잘 알았습니다.\" onclick=\"respondToAnnouncementNote(\'confirm\')\" />';
							} else {
								textToInsert[i++] = '<div class=\'confirmationButton\'>';
								textToInsert[i++] = '<img src=\'static/img/check_true.png\' />';

								textToInsert[i++] = '<p>'+when(makeOurTimeStampStandard(myArticles[a]['individual_announcement'][j]['confirmed_date']))+' 읽음</p>';
								textToInsert[i++] = '</div>';
							}
							
			
							$('#announcementNoteDetailPage div[data-role=\'header\'] h1').html(dateExpresstion(myArticles[a]['published_date']));
							$('#announcementNoteDetailPage div[data-role=\'content\']').html(textToInsert.join(''));
							$('#confirmButton').button();
							$('#respondSendButton').button();
							$('#respondTextInput').textinput();
	
	
						}
					});		
							


				}
			}
		}			
	}

}

//////////////////// 여기부터 WIKI /////////////////////////
function showChildWiki() {
	var myPartners= JSON.parse(localStorage.myPartners);
	var child_id = localStorage.wiki_child_id;
	var numOfMyPartner = myPartners.length;
	var i=0;
	var textToInsert = [];
	for(var a=0;a<numOfMyPartner;a+=1) {
		if(myPartners[a]['child_id'] == child_id ) {
			var numOfMySection = myPartners[a]['childDescription'].length;
			textToInsert[i++] = '<h1>' + myPartners[a]['childname'] + '</h1>';
			for(var b=0;b<numOfMySection;b+=1) {
				textToInsert[i++] = '<h1>' + myPartners[a]['childDescription'][b]['title'] + '</h1>';
				textToInsert[i++] = '<p>'+ myPartners[a]['childDescription'][b]['content'] + '<p>';
				textToInsert[i++] = '<a href=\'#childWikiWritePage\' onclick=\'localStorage.wiki_section_id='+myPartners[a]['childDescription'][b]['id']+';\'>';
				textToInsert[i++] = '<img src=\'static/img/content_edit.png\' /></a>';
			}
			textToInsert[i++] = '<a href=\'#childWikiCreateNewPage\' data-type=\'button\'>새 항목 생성하기</a>';

		}
	}
	$('#childWikiViewPage div[data-role=\'content\']').html(textToInsert.join(''));
	
	$('#childWikiViewPage div[data-role=\'content\'] a[data-type=\'button\']').button();

}  

function showChildWikiWritePage() {
	var myPartners= JSON.parse(localStorage.myPartners);
	var child_id = localStorage.wiki_child_id;
	var numOfMyPartner = myPartners.length;
	var i=0;
	var textToInsert = [];
	for(var a=0;a<numOfMyPartner;a+=1) {
		if(myPartners[a]['child_id'] == child_id ) {
			var numOfMySection = myPartners[a]['childDescription'].length;
			textToInsert[i++] = '<h1>' + myPartners[a]['childname'] + '</h1>';
			for(var b=0;b<numOfMySection;b+=1) {
				if(myPartners[a]['childDescription'][b]['id'] == localStorage.wiki_section_id) {
					textToInsert[i++] = '<input id=\'sectionTitleEntry\' value=\''+myPartners[a]['childDescription'][b]['title']+'\'>';
					textToInsert[i++] = '<textarea id=\'wiki_section_write\' >'+ myPartners[a]['childDescription'][b]['content'] + '</textarea>';
					textToInsert[i++] = '<input type=\'button\' value=\'UPTATE\' onclick=\"submitWikiContent(\'publish\');\"/>';
					textToInsert[i++] = '<input type=\'button\' value=\'DELETE\' onclick=\"submitWikiContent(\'delete\');\"/>';

					textToInsert[i++] = '<input id=\'wikiSectionParentEmail\' type=\'hidden\' value=\''+ myPartners[a]['email']+'\'/>';
				}
			}
		}
	}
	
	$('#childWikiWritePage div[data-role=\'content\']').html(textToInsert.join(''));
	$('#childWikiWritePage div[data-role=\'content\'] textarea').textinput();
	$('#childWikiWritePage div[data-role=\'content\'] input#sectionTitleEntry').textinput();
	$('#childWikiWritePage div[data-role=\'content\'] input[type=\'button\']').button();
	
}

function submitWikiContent(method) {
	var wiki_section_id = localStorage.wiki_section_id;
	var child_id = localStorage.wiki_child_id;
	var parent_email;
	var title ;
	var content;
	
	if(method == 'add') {
		parent_email = $('#newWikiSectionParentEmail').val();
		title = $('#newSectionTitleEntry').val();
		content = $('#newWiki_section_write').val();		
	} else {
		parent_email = $('#wikiSectionParentEmail').val();
		title = $('#sectionTitleEntry').val();
		content = $('#wiki_section_write').val();
	}
	
	$.ajax({
		type: "POST", // or POST
		url: "/submitWikiSectionContent",
		dataType: "json",
		data: {"method":method,"parent_email":parent_email, "child_id":child_id,"id":wiki_section_id,"title":title,"content":content},
		success: function(msg){	
			if(msg[0]=='publish') {
				alert('아이위키 항목을 업데이트 하였습니다.');
			} else if(msg[0]=='delete') {
				alert('아이위키 항목을 삭제 하였습니다.');
			}else if(msg[0]=='add') {
				alert('아이위키 항목을 추가 하였습니다.');
			}
			$.mobile.changePage("#childWikiViewPage");
		}
	});
}










