# -*- coding:utf-8 -*-
########### 크림소스파이썬 - 박세훈 2013년 6월 1일 ##########
########### 여기부터 제가 만든 부분입니다 ##########
import time
from common import query_db, get10numberTimestamp
from flask import json

# 선생/부모 역할에 따른 질의문을 리턴하는 함수
# 질의를 통해 가져오게 될 정보 : 친구의 email, 친구의 username, 친구관계 startDate, 친구관계 endDate
def getMyFriendsQueryByRole(role, userEmail):
	now = time.localtime()
	curTime = int(str(now.tm_year-2000) + str(now.tm_mon) + str(now.tm_mday) + str(now.tm_hour) + str(now.tm_min))
	otherRole = ''
	if role == 'parent' :
		otherRole = 'classTeacher'
	elif role == 'classTeacher':
		otherRole = 'parent'

	sQuery = 'select users.profile_pic, users.email, users.username, parent_classTeacher.startDate, parent_classTeacher.endDate from users, '
	sQuery = sQuery + 'parent_classTeacher where parent_classTeacher.' +role+ '_email = \'' +userEmail+ '\' '
	sQuery = sQuery + 'AND parent_classTeacher.' +otherRole+ '_email = users.email '
	sQuery = sQuery + 'AND parent_classTeacher.classTeacher_approval=\'true\' '
	sQuery = sQuery + 'AND parent_classTeacher.parent_approval=\'true\''
	
	print sQuery
	return sQuery
	

# 날짜를 통해 현재 친구관계를 유지하고 있는지 확인해주는 함수
def isCurrentPartner(startDate, endDate, curTime):
	if not endDate:
		return True
	else:
		if (int(startDate) <= curTime) & (int(endDate) > curTime):
			return True
		elif int(endDate) <= curTime:
			return False

			
########### @@@@@@@@@@@@@@@@@@@@@@@@ ##########
########### 여기까지가 제가 만든 부분입니다 ##########


def getMyPartners(role, email):
	lResult = [] # 친구들의 정보를 담아 return할 결과 배열
	friendInfo = {} # 친구 한 명, 한 명의 정보를 담을 친구정보 딕셔너리

	#DB에 쿼리요청을 보내서 레코드를 받아온다.

	for friendInfo in query_db(getMyFriendsQueryByRole(role,email)):

		# DB 요청에서 받아온 레코드를 하나씩(user) 순회하면서 JSON을 만들기 위한 작업을 수행한다.
		# 친구정보 딕셔너리에 현재 친구인지 여부도 기록
		friendInfo["currentFriend"] = isCurrentPartner(friendInfo["startDate"], friendInfo["endDate"], get10numberTimestamp())
		if role == 'classTeacher' :
			# 상대가 엄마인 경우 아이의 이름과 아이ID, 프로필 사진주소 를 가져온다. 
			childInfo = query_db('select name,child_id,profile_pic from children where parent_email=\''+friendInfo['email']+'\'')
			if childInfo is None:
			    print 'No child'
			else: #부모 당 아이수가 1명일 경우를 가정하여서 이렇게 만들었는데 아니라면? 고쳐야 한다 ㅠ
			    friendInfo["childname"] = childInfo[0]['name']		
			    friendInfo["child_id"] = childInfo[0]['child_id']		
			    friendInfo["childprofile_pic"] = childInfo[0]['profile_pic']		
		
			#  아이의 위키정보도 가져온다 
			childWiki = query_db('select id,title,content from child_description where child_id='+str(friendInfo["child_id"]))
			if childWiki is None:
			    print 'No such child profile'
			else:
				friendInfo["childDescription"] = []
				for singleWikiSection in childWiki:
				    friendInfo["childDescription"].append(singleWikiSection)
		elif role == 'parent':
			#  내 아이의 위키정보도 가져온다 
			child_id_list = query_db('select * from children where parent_email=\''+email+'\'')
			
			childWiki = query_db('select id,title,content from child_description where child_id='+str(child_id_list[0]['child_id']))
			friendInfo["child_id"]=child_id_list[0]['child_id']
			friendInfo["childprofile_pic"]=child_id_list[0]['profile_pic']
			friendInfo["childname"]=child_id_list[0]['name']
			
			if childWiki is None:
				friendInfo["childDescription"] = []
				print 'No such child profile'
			else:
				friendInfo["childDescription"] = []
				for singleWikiSection in childWiki:
				    friendInfo["childDescription"].append(singleWikiSection)
	
			

		# 친구정보를 하나씩 리스트에 삽입하기
		lResult.append(friendInfo)

	return json.dumps(lResult)
				