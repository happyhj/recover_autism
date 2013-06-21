# -*- coding:utf-8 -*-

# 이경민
from flask import Flask,url_for, session, escape, request, redirect ,render_template ,jsonify, g, send_from_directory
import json
from userRelationship import getMyPartners
from common import query_db

def getAnnouncementNotes(role, userEmail):
	dResult = {}
	publisherEmail = userEmail
	## 총 공통공지 개수를 저장하는 변수
	total_common_announcement = 0
	if role == 'parent':
		dMyPartners = json.loads(getMyPartners(role,userEmail))
		currentClassTeacherEmail = ""
		for teacher in dMyPartners:
			if teacher['currentFriend']:
				publisherEmail = teacher['email']
				break
				
	# for문을 통해 total_common_announcement의 개수를 세서 입력
	for common_announcement in query_db('select * from common_announcement \
			where publisher_email='+'\''+publisherEmail+'\''):
		total_common_announcement = total_common_announcement + 1

	# dResult에 다음의 key들을 추가합니다.
	dResult['total_common_announcement'] = total_common_announcement
	dResult['num_of_article_per_request'] = 5

	# dResult['page']를 구하기 위한 연산과정. request당 한 페이지, 한 페이지 당 5개
	if (total_common_announcement % dResult['num_of_article_per_request']) != 0 :
		dResult['page'] = total_common_announcement / dResult['num_of_article_per_request'] + 1
	else :
		dResult['page'] = total_common_announcement / dResult['num_of_article_per_request']
		
	dResult['articles'] = []

	# dResult['articles'] 에 쓸 내용 담기위해 dArticles 딕셔너리를 만들었어욧.
	dArticles = {}
	dArticles['individual_announcement'] = []

	# cur_id 의 초기값을 -1로 합니다.
	cur_id = -1

	# 현재 로그인 id가 session['email']이면 query_db의내용을 하나하나 불러옵니다
	for common_announcement in query_db('select * from common_announcement where publisher_email='+'\''+publisherEmail+'\''):

		# 현재 individual_announcement의 id가 common_announcement의 id와 같으면
		# individual_announcement를 append 합니다.
		indivisual_announcement_query = 'select * from individual_announcement where common_announcement_id='+str(common_announcement['id'])

		if role == 'parent':
			indivisual_announcement_query = indivisual_announcement_query + ' AND receiver_email=\''+session['email']+'\''

		for individual_announcement in query_db(indivisual_announcement_query):
			dArticles['individual_announcement'].append(individual_announcement)

		# cur_id가 common_announcement['id']와 다르다면
		# 즉 common_announcement의 loop가 충분히 돌아 다른 날짜의 글로 넘어갔다면
		# 다음 내용들을 실행합니다.
		if cur_id != common_announcement['id']:
			dArticles['published_date'] = common_announcement['published_date']
			dArticles['publisher_email'] = common_announcement['publisher_email']
			dArticles['content'] = common_announcement['content']
			dArticles['id'] = common_announcement['id']
			dArticles['attached_file'] = common_announcement['attached_file']

			# 앞의 내용들이 다 저장되었으면 최종적으로 dResult에 append 합니다
			dResult['articles'].append(dArticles)

			# append 이후 dArticles 를 초기화합니다.
			dArticles = {}
			dArticles['individual_announcement'] = []

			cur_id = common_announcement['id']

	## json.dumps() 함수안에 인자로 리스트나 딕셔너리를 넣어주면
	## JSON 스트링으로 바꿔준다. 
	return json.dumps(dResult)	
	
	
# 이건희
# 내가 발행한(선생님) 모든 알림장의 확인 여부정보를 가져오는 함수 (선생님만 사용하는 기능)
def getNoteConfirmationCheck(email):
	#common_announcement 에서 published_date를 내림차순으로 정렬한 상태로 받아와 finder 리스트로 만든다
	finder=query_db('SELECT published_date FROM common_announcement WHERE publisher_email=\''+email+'\' ORDER BY published_date desc')
	keyDate=finder[0]['published_date']
	#내림차순으로 정렬했으므로 finder[0]이 가장 최근 날짜임. 날짜 값만 keyDate로 받는다.		
	dResult={} 
	#DB에 쿼리요청을 보내서 레코드를 받아온다.
	for mailData in query_db('select id from common_announcement where published_date=\'' + keyDate +'\' and publisher_email=\''+email+'\''):
		receiver = []
		dResult["published_date"]=keyDate
		for receiverData in query_db('select email, username, confirmed_date, response_message_date from users, individual_announcement where users.email=individual_announcement.receiver_email and individual_announcement.common_announcement_id=' + str(mailData['id']))	:				
			parents={}
			parents["email"]=receiverData['email']
			parents["username"]=receiverData['username']
			parents["confirmed_date"]=receiverData['confirmed_date']
			parents["response_message_date"]=receiverData['response_message_date']
			receiver.append(parents)
		dResult["receiver"]=receiver
	return json.dumps(dResult)
			
		