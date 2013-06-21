//// solving flickering - start
$(document).one("mobileinit", function () {
    // Setting #container div as a jqm pageContainer
    $.mobile.pageContainer = $('#container');
    // Setting default page transition to slide
    $.mobile.defaultPageTransition = 'none';
});
//// solving flickering - end

//// html문서가 다 로딩되고 JQUERY MOBILE의 전처리 까지 완료되었을 때 실행
$(document).ready(function(){
	initializeCurrentStatus();

});

//// 쿠키를 읽어와서 currentStatus 딕셔너리 초기화하고 초기상태 세팅하기
function initializeCurrentStatus() {
	// 브라우저에 직전 로그인 정보가 있는지 확인
	if(localStorage.userEmail){ 
		if(localStorage.userEmail != "") {
			// 켜져있다면 
			// userInfo의 내용을 읽어와서 login() 요청하기 -> 세션키 획
			userAuthentication(localStorage.userEmail,localStorage.userPassword);
			// login 응답값으로 currentStatus userInfo 업데이트
			// [option] footer 내용 업데이트 (whoami())
		}
	} else { 
		whoami();
	}
}

function changePageToLastUsedPage() {
	// [쿠키] 의 	currentPageId 확인
	// 그곳으로 이동 (해당페이지로의 링크를 클릭한다)	
	if(localStorage.currentPageId == "timelinePage") {
		$("#loginPageLinkHidden").click();		
		$("#timelinePageLinkHidden").click();
	} else if(localStorage.currentPageId == "notificationPage") {
		$("#notificationPageLinkHidden").click();	
	} /*else if(localStorage.currentPageId == "deliveryCheckPage") {
		$("#deliveryCheckPageLinkHidden").click();
	}*/ else if(localStorage.currentPageId == "kidsListPage") {
		$("#kidsListPageLinkHidden").click();	
	} else if(localStorage.currentPageId == "loginPage") {
		$("#loginPageLinkHidden").click();		
	}	
}

//// 페이지가 보여질 때 마다 패널메뉴 엘리먼트 생성 및 활성화. 
// HTML이 다 로딩되고 전처리 과정에서 수행, 페이지 이동시 새로운 페이지 로딩전에도 매번 수행
$(document).on('pagebeforeshow', ':not(.modal)[data-role="page"]', function(){  

	$('[data-role="panel"]').remove();

	// 패널 DIV 생성 및 붙이기
    $('<div>').attr({'id':'sidePanel','data-role':'panel','data-theme':'a', 'data-display':'overlay'}).appendTo($(this));
	// 링크 메뉴들 생성
	
	var aTimelinePage = $('<a>').attr({'id':'timelinePageLink','class':'panelPageLink','href':'#'}).html("<img id=\'panel_profile_pic\' src=\'\'/><h1 id=\'panel_username\'></h1>");
	var liTimelinePage = $('<li>');
	if(localStorage.currentPageId == "timelinePage"){
		liTimelinePage.attr({'data-theme':'b'});
	}
	aTimelinePage.appendTo(liTimelinePage);

	var aNotificationPage = $('<a>').attr({'id':'notificationPageLink','class':'panelPageLink ui-disabled','href':'#'}).html("개발도구");
	var linotificationPage = $('<li>');
	if(localStorage.currentPageId  == "notificationPage"){
		linotificationPage.attr({'data-theme':'b'});
	}
	aNotificationPage.appendTo(linotificationPage);
/*
	var aDeliveryCheckPage = $('<a>').attr({'id':'deliveryCheckPageLink','class':'panelPageLink','href':'#'}).html("Delivery Check");
	var liDeliveryCheckPage = $('<li>');
	if(localStorage.currentPageId  == "deliveryCheckPage"){
		liDeliveryCheckPage.attr({'data-theme':'b'});
	}
	aDeliveryCheckPage.appendTo(liDeliveryCheckPage);
*/
	var aKidsListPage = $('<a>').attr({'id':'kidsListPageLink','class':'panelPageLink','href':'#'}).html("친구목록");
	var liKidsListPage = $('<li>');
	if(localStorage.currentPageId  == "kidsListPage"){
		liKidsListPage.attr({'data-theme':'b'});
	}
	aKidsListPage.appendTo(liKidsListPage);

	var aLoginPage = $('<a>').attr({'id':'loginPageLink','class':'panelPageLink','href':'#'}).html("로그인");
	var liLoginPage = $('<li>');
	if(localStorage.currentPageId  == "loginPage"){
		liLoginPage.attr({'data-theme':'b'});
	}
	aLoginPage.appendTo(liLoginPage);
	
	// 링크 메뉴 리스트뷰 생성	
	var ulPanelContents = $('<ul>').attr({'data-role':'listview','id':'ulSideItems'});
	liTimelinePage.appendTo(ulPanelContents);
	linotificationPage.appendTo(ulPanelContents);
//	liDeliveryCheckPage.appendTo(ulPanelContents);
	liKidsListPage.appendTo(ulPanelContents);
	liLoginPage.appendTo(ulPanelContents);

    $.mobile.activePage.find('#sidePanel').panel();

	// 리스트뷰 메뉴 붙이기
	ulPanelContents.appendTo($('[data-role="panel"]'));
	
	// 위젯 활성화
 	$.mobile.activePage.find('#ulSideItems').listview();
 	
 	/////////////// 숨겨진 링크 생성
	var aTimelinePage_h = $('<a>').attr({'id':'timelinePageLinkHidden','href':'#timelinePage','data-transition':'none'}).html("timelinePage");
	var aNnotificationPage_h = $('<a>').attr({'id':'notificationPageLinkHidden','href':'#notificationPage','data-transition':'none'}).html("notificationPage");
//	var aDeliveryCheckPage_h = $('<a>').attr({'id':'deliveryCheckPageLinkHidden','href':'#deliveryCheckPage','data-transition':'none'}).html("deliveryCheckPage");
	var aKidsListPage_h = $('<a>').attr({'id':'kidsListPageLinkHidden','href':'#kidsListPage','data-transition':'none'}).html("kidsListPage");
	var aLoginPage_h = $('<a>').attr({'id':'loginPageLinkHidden','href':'#loginPage','data-transition':'none'}).html("loginPage");
	
	// 숨겨진 링크를 안보이는 컨테이너에 붙이기
	var spanHiddenLinkContainer = $('<span>').attr({'style':'display:none;'});
	aTimelinePage_h.appendTo(spanHiddenLinkContainer); 	
 	aNnotificationPage_h.appendTo(spanHiddenLinkContainer); 	
//	aDeliveryCheckPage_h.appendTo(spanHiddenLinkContainer); 	
	aKidsListPage_h.appendTo(spanHiddenLinkContainer); 	
	aLoginPage_h.appendTo(spanHiddenLinkContainer); 	
	
	// 리스트뷰 메뉴 붙이기
	spanHiddenLinkContainer.appendTo($('[data-role="panel"]'));	
	
    panelClickEventBinding();
    
	// 패널 초기화!!  option : panel footer에 현재 로그인 된 회원정보 적기 
	$(".loggedinUsername").html(localStorage.userEmail+"</br>"+ localStorage.userName+"</br>"+localStorage.userPassword+"</br>"+localStorage.userRole+"</br>"+localStorage.currentPageId);

	updatePanelProfile();

});

function updatePanelProfile() {
	var main_profile_pic = "";
	var main_username = "";
	if(localStorage.userRole == 'parent') {
		main_profile_pic = localStorage.childProfile_pic;
		main_username = localStorage.childName;
	} else if (localStorage.userRole == 'classTeacher') {
		main_profile_pic = localStorage.userProfile_pic;
		main_username = localStorage.userName;
	} else if (localStorage.userEmail == '') {
		main_profile_pic = '/static/img/unknownUser.jpg';
		main_username = '로그인 안됨';
	}
	$("#panel_profile_pic").attr('src',main_profile_pic);
	$("#panel_username").html(main_username);	
}

//// 패널 메뉴의 List Item을 클릭 할 때 [누른 패널의 ID를 기록 -> 패널 닫힘 -> 해당 페이지로 이동]
// 차례로 수행하도록 이벤트를 바인딩하였다.
function panelClickEventBinding()
{
	var currentPageId;
	var clickOk = true;
	
	$( ".open_panel" ).on( "vclick", function( event, ui ) {
		if (clickOk === true) {
	        clickOk = false;
	        setTimeout(function () {
	            clickOk = true;
	        }, 350);
			$('[data-role="panel"]').panel("open");	
		}
		return false;
	});

	// 패널 내 배너가 클릭되면 해당 패널의 가고자 하는 페이지의 아이디를 전역변수 currentPageId 에 저장하고 패널 닫기
	$( "#sidePanel .panelPageLink" ).on( "vclick", function( event, ui ) {
		if (clickOk === true) {
	        clickOk = false;
	        setTimeout(function () {
	            clickOk = true;
	        }, 350);
			currentPageId = $(this).attr('id');
			currentPageId = currentPageId.substr(0,currentPageId.length-4);
			localStorage.currentPageId = currentPageId;
			$('[data-role="panel"]').panel("close");	
		}
		return false;
	});

	// 패널이 닫히고 나면 해당 페이지로 이동
	$('[data-role="panel"]').on( "panelclose", function( event, ui ) {
		if(localStorage.currentPageId == "timelinePage") {
			$("#timelinePageLinkHidden").click();
		} else if(localStorage.currentPageId == "notificationPage") {
			$("#notificationPageLinkHidden").click();	
		} 
		/*else if(localStorage.currentPageId == "deliveryCheckPage") {
			$("#deliveryCheckPageLinkHidden").click();
		} */
		  else if(localStorage.currentPageId == "kidsListPage") {
			$("#kidsListPageLinkHidden").click();	
		} else if(localStorage.currentPageId == "loginPage") {
			$("#loginPageLinkHidden").click();		
		}
	} );	
	
	// 우측으로 스와이프하면 패널 열기
	$('[data-role="page"]').on( "swipeleft swiperight", function( e ) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
            if ( e.type === "swipeleft"  ) {
                //$( "#right-panel" ).panel( "open" );
            } else if ( e.type === "swiperight" ) {
                $( "[data-role='panel']" ).panel( "open" );
            }
        }
    });
}    

//// 현재 로그인 된 사람을 알아오고 ( 쿠키에 저장된 세션키를 이용하여 ), localStorage 변수에 유저정보 채워넣기
function whoami()
{
	console.log("whoami()");
	$.ajax({
		type: "GET",
		url: "/whoami",
		success: function(msg){
			if (msg=='unknown') {	
				updatePanelProfile();
				disableOrEnableLoginEntry("null","null");		
			} else {
				updateLocalUserInformation(msg);
				updatePanelProfile();
				disableOrEnableLoginEntry(localStorage.userEmail,localStorage.userPassword);

			}
		}
	});
}

//// 로그인 버튼 누르면 수행
function login() 
{
	var sEmail = $("#emailInput").val();
	var sPassword = $("#passwordInput").val();
	if(sEmail=="")
	{
		alert("이메일을 입력해 주세요");
	} else if(sPassword=="")
	{
		alert("비밀번호를 입력해 주세요");
	} else {
		userAuthentication(sEmail,sPassword);
	}
}

//// 브라우저쿠키와 currentStatus 객체의 내용을 현재 상태에 맞춰 동기화 시킨다.
function updateLocalUserInformation(msg) 
{
	if(msg.email) {
		localStorage.userEmail=msg.email;
	}
	if(msg.password) {
		localStorage.userPassword=msg.password;
	}
	if(msg.profile_pic) {
		localStorage.userProfile_pic=msg.profile_pic;
	}
	if(msg.childProfile_pic) {
		localStorage.childProfile_pic=msg.childProfile_pic;
	}
	if(msg.username) {
		localStorage.userName=msg.username;
	}	
	if(msg.child_name) {
		localStorage.childName=msg.child_name;
	}
	if(msg.role) {
		localStorage.userRole=msg.role;
	}	
	getMyPartners();
	

	// 위키 페이지 백버튼 방향을 동적으로 변경
	if(localStorage.userRole == "parent") {
		$("#childWikiViewBackButton").attr("href","#timelinePage");
		$("#childWikiViewBackButton").html("알림노트");
	} else if(localStorage.userRole == "classTeacher") {
		$("#childWikiViewBackButton").attr("href","#kidsListPage");
		$("#childWikiViewBackButton").html("친구목록");
	}
	// 알림장 작성버튼 을 유저의 직업에 따라 생성 
	if(localStorage.userRole == 'classTeacher') 
		$("#action_button_container").html('<a href=\'#writeCommonAnnouncementNotePage\' data-transition=\'slideup\'><img class=\'actionButton\' src=\'static/img/action_button.png\' /></a>');
	else
		$("#action_button_container").html('');
	//$("#action_button_container").button('refresh');	
 		
	
}

//// 아이디와 비번을 받아 세션로그인 인증을 수행하고 
// currentStatus와 쿠키 업데이트, 로그인 페이지 UI업데이트를 수행한다.
function userAuthentication(email,password)
{
	if((email.length>=1)&&(password.length>=1)) {
		$.ajax({
			type: "POST",
			url: "/sessionLogin",
			data:  { email: email, password: password},
			success: function(msg){
				if(msg=="Password is incorrect."){
					alert("Password is incorrect");	
				} else if (msg=="No such email") {
					alert("No such email");
				} else {
					updateLocalUserInformation(msg);
					updatePanelProfile();
					disableOrEnableLoginEntry(localStorage.userEmail,localStorage.userPassword);
				}
			}	
		});	
	}
}

//// 로그인 페이지를 현재 인증상태에 따라 업데이트시킨다.
function disableOrEnableLoginEntry(email,password)
{
	$("#emailInput").textinput();
	$("#passwordInput").textinput();
	$('#loginButton').button();			
	$('#logoutButton').button();	

	if((email=="null")||(password=="null")||(email+password==0)) // 로그아웃 된 경우
	{
		// 이메일과 암호 텍스트인풋을 비우고 enable
		$("#emailInput").attr('value',"");
		$("#passwordInput").attr('value',"");
		$('#emailInput').textinput('enable');			
		$('#passwordInput').textinput('enable');			

		// 로그인버튼 enable , 로그아웃버튼 disable
		$('#loginButton').button('enable');			
		$('#logoutButton').button('disable');			
		
	} else // 로그인 된 경우
	{
		// 이메일과 암호 텍스트인풋에  현재 이메일과 암호 적힌 채로 두 인풋과 로그인 버튼을 disable 시키고
		$("#emailInput").attr('value',email);
		$("#passwordInput").attr('value',password);
		$('#emailInput').textinput('disable');			
		$('#passwordInput').textinput('disable');	
		// 로그아웃 버튼을 enable 시킨다.
		$('#loginButton').button('disable');			
		$('#logoutButton').button('enable');				
	} 
}

//// 쿠키와 객체를 지우고 로그아웃한다. 
function logout()
{	
	localStorage.userEmail='';
	localStorage.userPassword='';
	localStorage.userRole='';
	localStorage.userName='';
	localStorage.userProfile_pic='';

/*	localStorage.removeItem('userPassword');
	localStorage.removeItem('userRole');
	localStorage.removeItem('userName');
	localStorage.removeItem('userProfile_pic');
	localStorage.removeItem('childProfile_pic');
*/
	eraseCookie('session');
	whoami();
	disableOrEnableLoginEntry(localStorage.userEmail,localStorage.userPassword);
	updatePanelProfile();

}
