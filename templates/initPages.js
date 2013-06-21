// JQM에서는 문서를 로드 시 모든 페이지를 초기화 하는 패턴을 사용한다. 
// 전체문서를 로드할때 최초 한번만 실행할 것과
// 페이지가 나타날때마다 실행할 초기화작업을 정의 한다.
(function($) {
	var methods = { 
		initTimelinePage : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}
			var $page = $("#timelinePage");
			if(localStorage.userEmail != null) { 
				setTimeout(function () {
					fetchMyAnnouncementNotes();
				}, 100);
				updateCoverSection();
			}
			$page.bind("pagebeforeshow", function(event, ui) {				
				if(localStorage.userEmail != null) { 
					fetchMyAnnouncementNotes();	
					updateCoverSection();
				}
			});	
			$page.bind("pageshow", function(event, ui) {				
				setTimeout(function () {
//				    myScroll_timeline = new iScroll('wrapper_timeline');
				}, 100);
			});	
			$page.bind("pagehide", function(event, ui) {

			}); 
		},
		initNotificationPage : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}
			
			var $page = $("#notificationPage");
			$page.bind("pageshow", function(event, ui) {

			});	
			$page.bind("pagehide", function(event, ui) {

			}); 
		},		
		initDeliveryCheckPage : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}
			
			var $page = $("#deliveryCheckPage");
			$page.bind("pageshow", function(event, ui) {

			});	
			$page.bind("pagehide", function(event, ui) {

			}); 
		},		
		initKidsListPage : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}
			
			var $page = $("#kidsListPage");

			$page.bind("pagebeforeshow", function(event, ui) {
				var myPartners;
				$.ajax({
					type: "GET", // or POST
					url: "/getMyPartners",
					dataType: "json",
					success: function(msg){
						myPartners = msg;
						
						var textToInsert = [];
						var i=0;
						var numOfMyPartner = myPartners.length;
						var imgsrc=  'http://goo.gl/n3yQr';
						
						if (localStorage.userRole=='classTeacher') {
							for(var a=0;a<numOfMyPartner;a+=1) {
								textToInsert[i++] = '<div class=\'kidListItemContainer\'>';
								// 현재 친구일 경우 특별한 표시를 해 줌
								if(myPartners[a]['currentFriend']==true){
									textToInsert[i++] = '';
								}
								textToInsert[i++] = '<a href=\'#childWikiViewPage\'';
								textToInsert[i++] = ' onclick=\'localStorage.wiki_child_id ='+ myPartners[a]['child_id']+'\'><img src=\'';
								textToInsert[i++] = myPartners[a]['childprofile_pic'];
								textToInsert[i++] = '\' /><h2>';
								textToInsert[i++] = myPartners[a]['childname'];
								textToInsert[i++] = '</h2><p>';
								textToInsert[i++] = dateExpresstion(myPartners[a]['startDate'],'monthDate')+"~"+dateExpresstion(myPartners[a]['endDate'],'monthDate');

								textToInsert[i++] = '<p></a></div>';
							}
						} else if (localStorage.userRole=='parent') {
							for(var a=0;a<numOfMyPartner;a+=1) {
								textToInsert[i++] = '<div class=\'kidListItemContainer\'>';
								if(myPartners[a]['currentFriend']==true){
									textToInsert[i++] = '';
								}
								textToInsert[i++] = '<a href=\'#\'>';
								textToInsert[i++] = '<img src=\'';
								textToInsert[i++] = myPartners[a]['profile_pic'];
								textToInsert[i++] = '\' /><h2>';
								textToInsert[i++] = myPartners[a]['username'];
								textToInsert[i++] = '</h2><p>';
								textToInsert[i++] = dateExpresstion(myPartners[a]['startDate'],'monthDate')+"~"+dateExpresstion(myPartners[a]['endDate'],'monthDate');

								textToInsert[i++] = '<p></a></div>';

							}							
						}
						
						$('#partnerContainer').html(textToInsert.join(''));

						//console.log($('#partnerContainer').html());
						// 위젯 활성화
					 	//$.mobile.activePage.find('#partnerContainer ul').listview();
					} 
				});
			});	
			$page.bind("pagehide", function(event, ui) {

			}); 
		},		
		initLoginPage : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}
			
			var $page = $("#loginPage");
			$page.bind("pageshow", function(event, ui) {

			});	
			$page.bind("pagehide", function(event, ui) {

			}); 
		},					
		initWriteCommonAnnouncementNotePage : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}
			
			var $page = $("#writeCommonAnnouncementNotePage");
			$page.bind("pagebeforeshow", function(event, ui) {
				$(".todayDate").html("20"+dateExpresstion(makeStandardTimeStampOurs(getTimeStamp())));
			});	
			$page.bind("pageshow", function(event, ui) {
				$('[data-role="page"]').on( "swipeleft swiperight", function( e ) {

			    });
			});	
			$page.bind("pagehide", function(event, ui) {


			}); 
		},
		initWriteindividualAnnouncementNotePage : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}
			
			var $page = $("#writeindividualAnnouncementNotePage");
			$page.bind("pageshow", function(event, ui) {

			});	
			$page.bind("pagehide", function(event, ui) {

			}); 
		},
		initAnnouncementNoteDetailPage : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}
			console.log("123");

			var $page = $("#announcementNoteDetailPage");
			$page.bind("pagebeforeshow", function(event, ui) {

				if(myScroll) {
					myScroll.destroy();
					myScroll = null;
				}
				showAnnouncementNoteDetail();


			});	
			$page.bind("pagehide", function(event, ui) {
				if(myScroll) {
					myScroll.destroy();
					myScroll = null;
				}
			}); 
		},
		initChildWikiViewPage : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}

			var $page = $("#childWikiViewPage");
			$page.bind("pagebeforeshow", function(event, ui) {
				getMyPartners_silent();
			});	
			$page.bind("pageshow", function(event, ui) {
				showChildWiki();
			});	
			$page.bind("pagehide", function(event, ui) {

			}); 
		},
		initChildWikiWritePage : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}

			var $page = $("#childWikiWritePage");
			$page.bind("pagebeforeshow", function(event, ui) {
				showChildWikiWritePage();
			});	
			$page.bind("pagehide", function(event, ui) {

			}); 
		},
		initChildWikiCreateNewPage : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}

			var $page = $("#childWikiCreateNewPage");
			$page.bind("pagebeforeshow", function(event, ui) {
				var myPartners= JSON.parse(localStorage.myPartners);
				var child_id = localStorage.wiki_child_id;
				var numOfMyPartner = myPartners.length;
				var i=0;
				var textToInsert = [];
				for(var a=0;a<numOfMyPartner;a+=1) {
					if(myPartners[a]['child_id'] == child_id ) {
						var numOfMySection = myPartners[a]['childDescription'].length;
						textToInsert[i++] = '<h1>' + myPartners[a]['childname'] + '</h1><p>의 새로운 위키항목 작성하기</p>';
						textToInsert[i++] = '<input id=\'newSectionTitleEntry\'  placeholder=\'제목\' />';
						textToInsert[i++] = '<textarea id=\'newWiki_section_write\' placeholder=\'내용\'></textarea>';
						textToInsert[i++] = '<input type=\'button\' value=\'항목 추가하기\' onclick=\"submitWikiContent(\'add\');\"/>';
	
						textToInsert[i++] = '<input id=\'newWikiSectionParentEmail\' type=\'hidden\' value=\''+ myPartners[a]['email']+'\'/>';
							
					}
				}		
				$('#childWikiCreateNewPage div[data-role=\'content\']').html(textToInsert.join(''));
				$('#childWikiCreateNewPage div[data-role=\'content\'] textarea').textinput();
				$('#childWikiCreateNewPage div[data-role=\'content\'] input#newSectionTitleEntry').textinput();
				$('#childWikiCreateNewPage div[data-role=\'content\'] input[type=\'button\']').button();
			});	
			$page.bind("pagehide", function(event, ui) {

			}); 
		},
		initAll : function(options) {
			var settings = {
				callback: function() {}
			};
			if ( options ) {
				$.extend( settings, options );
			}
			$().initApp("initTimelinePage");
			$().initApp("initNotificationPage");
			$().initApp("initDeliveryCheckPage");	
			$().initApp("initKidsListPage");
			$().initApp("initLoginPage");
			$().initApp("initWriteCommonAnnouncementNotePage");
			$().initApp("initWriteindividualAnnouncementNotePage");
			$().initApp("initAnnouncementNoteDetailPage");
			$().initApp("initChildWikiViewPage");
			$().initApp("initChildWikiWritePage");
			$().initApp("initChildWikiCreateNewPage");

		}
	};
 
		
	$.fn.initApp = function(method) {
		if ( methods[method] ) {
		  	return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
		  	return methods.initAll.apply( this, arguments );
		} else {
		  	$.error( 'Method ' +  method + ' does not exist' );
		} 
	}
})(jQuery);

// 여기가 스크립트 실행의 시작이다 문서가 준비되면 여기부터 수행한다.
$(document).ready(function() {
	$().initApp();
/*
	$("[data-role=header]").fixedtoolbar({ tapToggle: false });
	$("[data-role=footer]").fixedtoolbar({ tapToggle: false });
	$("[data-role=header]").fixedtoolbar({ updatePagePadding: false });
	$("[data-role=footer]").fixedtoolbar({ updatePagePadding: false });
*/
});


