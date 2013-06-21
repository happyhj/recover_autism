# -*- coding:utf-8 -*-
import sqlite3
import json

import time
from userRelationship import getMyFriendsQueryByRole,getMyPartners
from announceNotes import getAnnouncementNotes, getNoteConfirmationCheck
from common import query_db

import os
from werkzeug import secure_filename
from contextlib import closing
from flask import Flask,url_for, session, escape, request, redirect ,render_template ,jsonify, g, send_from_directory

UPLOAD_FOLDER = './static/uploads/'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

##### 데이터베이스 구현 부분 - 시작
DATABASE = 'database.db'
def connect_db():
    return sqlite3.connect(DATABASE)

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.close()

##### 데이터베이스 구현 부분 - 끝

########## 리소스 제공 - 시작 ##########
@app.route('/')
def index():
    return render_template('main.html')
    
@app.route('/js/container')
def container_script():
    return render_template('container.js')

@app.route('/js/cookie')
def cookie_script():
    return render_template('cookie.js')

@app.route('/js/initPages')
def initPages_script():
    return render_template('initPages.js')

@app.route('/js/announcementNotes')
def announcementNotes_script():
    return render_template('announcementNotes.js')
   
    
#@app.route('/img/<path:filename>')
#def send_image(filename):
#	return send_from_directory(app.config['/root/flaskProject/img/'], filename, as_attachment=False)    
########## 리소스 제공 - 끝 ##########


### 이메일과 암호를 POST로 전달받아, 세션을 이용해서 로그인 한다.
### 이메일과 암호가 매치하면 서버의 session 딕셔너리 변수에 이메일, 유저네임, 역할, 암호를 저장한다. 
@app.route('/sessionLogin', methods=['POST','GET'])
def sessionLogin():
	if request.method  == "POST":  
		email    = request.form['email']
		password  = request.form['password']

		user = query_db('select * from users where email=\"'+email+'\"', one=True)
		if user is None:
		    return 'No such email'
		else:
			if user['password'] == password:
				print user['username'],user['role'],' passed login authentication.'
				session['email'] = user['email']
				session['username'] = user['username']
				session['role'] = user['role']
				session['password'] = user['password']
				session['profile_pic'] = user['profile_pic']

				######!!!!!! 아이 테이블에서 사진 정보를 가져와 세션정보에 굽고 JSON리턴에 더해주기	
				if session['role'] == 'parent':
					childInfo = query_db('select * from children where parent_email=\"'+email+'\"', one=True)
					if childInfo is None:
					    return 'No such child'
					else:			
						session['child_pic'] = childInfo['profile_pic']
						session['child_name'] = childInfo['name']
					
					return jsonify(username=session['username'],email=session['email'],role=session['role'],password=session['password'],profile_pic=session['profile_pic'],childProfile_pic=session['child_pic'],child_name=session['child_name'])
				else :
					return jsonify(username=session['username'],email=session['email'],role=session['role'],password=session['password'],profile_pic=session['profile_pic'])
				
			else: 
				return "Password is incorrect."
	  
### 아무인자도 전달받지 않고 현재 세션을 통해 로그인 되어있는 사람이 누구인지 돌려준다.  
@app.route('/whoami', methods=['POST','GET'])
def whoami():
	if request.method  == "GET":  
		if not session:
			return "unknown"		
		elif session['email']:
			return jsonify(username=session['username'],email=session['email'],role=session['role'],password=session['password'])


########### 크림소스파이썬 - 박세훈 2013년 6월 1일 ##########
# 현재 로그인한 사람의 친구들의 정보를 제공한다.
@app.route('/getMyPartners', methods=['POST','GET'])
def ajax_getMyPartners():
	if request.method == "GET": 
		if not session: # 서버가 요청한 사람이 누군지 모르겠을때. session 딕셔너리변수에 사용자정보가 없음
			return json.dumps(["로그인이 안되어서 응답을 못하겠습니다."]) 

		elif session['email']: # session 딕셔너리변수에 사용자의 이메일 정보가 있을 경우.

			role = session['role']
			email = session['email']
			print "아잉"
			return getMyPartners(role, email)					


########### 크림소스파이썬 - 이경민 2013년 6월 1일 ##########
## 사용자가 선생님일 때, 내가 보냈던 모든 공통 알림장과 개별알림장의 정보
## 사용자가 부모님일 때, 현재 선생님이 나에게 보냈던 알림장의 정보 ( ㅠㅠ 내가 받았던 모든 알림장정보를 받아오도록 업데이트가 필요합니다.)

@app.route('/getAnnouncementNotes', methods=['POST','GET'])
def ajax_getAnnouncementNotes():
	if request.method == "GET":
		## 서버가 요청한 사람이 누군지 모르겠을때.
		## session 딕셔너리변수에 사용자정보가 없음
		if not session:
			return json.dumps(["로그인이 안되어서 응답을 못하겠습니다."]) 
		## session 딕셔너리변수에 사용자의 이메일 정보가 있을 경우.
		## (그러면 나머지도 다 있는거임)
		elif session['email']: 
			###### 여기부터 return 까지의 부분을 채워 넣으시면 됩니다.
			## DB에 쿼리요청을 보내서 레코드를 받아온다.

			role = session['role']
			userEmail = session['email']

			return getAnnouncementNotes(role, userEmail)			

# 내가 발행한(선생님) 모든 알림장의 확인 여부정보를 가져오는 함수 (선생님만 사용하는 기능)
@app.route('/getNoteConfirmationCheck', methods=['POST','GET'])
def ajax_getNoteConfirmationCheck():
	if request.method == "GET": 
		if not session: # 서버가 요청한 사람이 누군지 모르겠을때. session 딕셔너리변수에 사용자정보가 없음
			return json.dumps(["로그인이 안되어서 응답을 못하겠습니다."]) 
		elif session['email'] and not session['role']=='parent': # session 딕셔너리변수에 사용자의 이메일 정보가 있을 경우.(그러면 나머지도 다 있는거임)
		
			email = session['email']

			return getNoteConfirmationCheck(email)
		else:
			return json.dumps(["선생님만 사용 가능한 기능입니다."]) 



#######################################################
##       Publish & Delete Announcement Module        ##
##            [ By  CREAM SOURCE PYTHON ]            ##
##       2 0 1 3 .  0 6 .  0 5 .  0 2  :  1 5        ##
#######################################################

@app.route('/publishAnnouncementNote', methods = ['POST', 'GET'])
def ajax_publishAnnouncementNote() :
	if (request.method == 'POST') :	
		# 'method' : 'publish' 또는 'delete'
		method = request.form['method']	
		if ( method== 'publish') :
			### id 는 자동적으로 입력해줌

			publisher_email = request.form['publisher_email']

			published_date = request.form['published_date']
			content = request.form['content']
			
			numOfReceivers = (len(request.form)-5) / 2
			
			# 우선 공통공지사항들을 보냅니다
			sQuery = 'INSERT INTO common_announcement (publisher_email,published_date,content) '
			sQuery = sQuery + 'VALUES (\'' + publisher_email+ '\',\'' + published_date + '\',\'' + content+'\')'
			
			g.db.execute(sQuery)
			g.db.commit()
			
			sQuery = 'SELECT id FROM common_announcement where publisher_email = \''
			sQuery = sQuery + publisher_email + '\' AND published_date = \'' + published_date+'\''
			common_announcement_id = query_db(sQuery)
				
			# 각각의 개인 공지는 individual_announcement KEY 안의 딕셔너리들!
			# 따라서 individual_announcement를 하나하나 업데이트 해줍니다.
			# 업데이트 사항은 content와 publisher_email, common_announcement_id
			sQuery = ""
			for i in range(numOfReceivers):
				sQuery = 'INSERT INTO individual_announcement '
				sQuery = sQuery + '(content,receiver_email,common_announcement_id) VALUES (\''
				sQuery = sQuery + request.form['individual_announcement['+str(i)+'][content]'] + '\',\''
				sQuery = sQuery + request.form['individual_announcement['+str(i)+'][receiver_email]'] + '\',' 
				sQuery = sQuery + str(common_announcement_id[0]['id'])+')'
				g.db.execute(sQuery)
				g.db.commit()
			
			return json.dumps(["알림장 발행 완료"])
		# 해당 아디를 갖는 모든 공통공지 개별공지 지워뿌림.
		elif (method == 'delete') :
			# 지울놈 아이디 기억해 둡니다
			target_id = request.form['id']

			# 우선 individual_announcement 테이블에서
			# common_announcement_id == target_id 인 놈들을 지워요
			sQuery = 'DELETE FROM individual_announcement WHERE common_announcement_id = ' + target_id
			g.db.execute(sQuery)
			g.db.commit()

			# 그 뒤에 common_annoucement 테이블에서
			# id = target_id 인 놈들을 지워요
			sQuery = 'DELETE FROM common_announcement WHERE id =' + target_id
			g.db.execute(sQuery)
			g.db.commit()
			
			return json.dumps(["알림장 삭제 완료"])



# 부모가 알림장을 확인했거나 댓글을 달았을 때
# 확인 시각, 댓글 단 시각, 댓글 내용을 리턴하는 함수/ 세훈

@app.route('/respondToAnnouncementNote', methods = ['POST', 'GET'])
def ajax_respondToAnnouncementNote():
	# 메소드가 POST인 경우에만 동작한다.
	if request.method == 'POST' :

		# 각 변수에 값을 할당
		parent_email = request.form["parent_email"]
		common_announcement_id = request.form["common_announcement_id"]
		method = request.form["method"]
		date = request.form["date"]
		sQuery = ""
	

		# 부모가 알림장 확인을 한 경우
		if method == 'confirm':		
			# <확인 날짜>만 업데이트
			sQuery = 'UPDATE individual_announcement '
			sQuery = sQuery + 'SET confirmed_date =\'' +date+ '\'' 
			sQuery = sQuery + 'WHERE receiver_email = \'' +parent_email+ '\''
			sQuery = sQuery + 'AND common_announcement_id = ' +common_announcement_id
			g.db.execute(sQuery)
			g.db.commit()
			
			return  json.dumps(["gooood"])

		# 부모가 알림장에 댓글을 단 경우
		elif method == 'reply':
			response_message = request.form["response_message"]

			# 댓글을 달기 전에 확인버튼을 눌렀는지 알아내기 위해 확인 날짜를 체크
			sQuery = 'SELECT confirmed_date FROM individual_announcement '
			sQuery = sQuery + 'WHERE common_announcement_id ='  +common_announcement_id
			sQuery = sQuery + ' AND receiver_email = \'' +parent_email+ '\''
			check_confirmed_date = query_db(sQuery)
			
			# 댓글을 달기 전에 확인버튼을 눌렀으면 <댓글 내용과 댓글 날짜>만 업데이트
			if (check_confirmed_date[0]['confirmed_date']) :
				sQuery = 'UPDATE individual_announcement '
				sQuery = sQuery + 'SET response_message_date = \'' +date+ '\', '
				sQuery = sQuery + 'response_message = \'' +response_message+ '\' '
				sQuery = sQuery + 'WHERE receiver_email = \'' +parent_email+ '\' '
				sQuery = sQuery + 'AND common_announcement_id =' +common_announcement_id
			
			# 댓글을 달기 전에 확인버튼을 누르지 않았으면 <댓글 내용, 댓글 날짜, 확인 날짜>까지 업데이트
			else :
				sQuery = 'UPDATE individual_announcement '
				sQuery = sQuery + 'set confirmed_date =\'' +date+ '\', response_message_date = \'' +date+ '\', '
				sQuery = sQuery + 'response_message = \'' +response_message+ '\' '
				sQuery = sQuery + 'where receiver_email = \'' +parent_email+ '\' '
				sQuery = sQuery + 'AND common_announcement_id = ' +common_announcement_id
					
			g.db.execute(sQuery)
			g.db.commit()

			return  json.dumps(["gooood"])

		# 부모가 알림장에 단 댓글을 지우고 싶을 때
		elif method == 'delete':
			sQuery = 'UPDATE individual_announcement '
			sQuery = sQuery + 'SET response_message_date = null, '
			sQuery = sQuery + 'response_message = null '
			sQuery = sQuery + 'WHERE common_announcement_id ='  +common_announcement_id
			sQuery = sQuery + ' AND receiver_email = \'' +parent_email+ '\''
			g.db.execute(sQuery)
			g.db.commit()

			return  json.dumps(["gooood"])

# 입력받은 이메일(부모or선생님) 에 해당하는 프로필 사진과 유저네임을 반환
# 리턴 JSON 구조 {"email":"","username":"","profile_pic":"","role":""}
@app.route('/getUserProfilePic', methods = ['POST', 'GET'])
def ajax_getUserProfilePic():
	if request.method == 'POST' :
		email = request.form["email"]
		sQuery = 'SELECT email,username,profile_pic,role FROM users '
		sQuery = sQuery + 'WHERE email =\''  +email+'\''
		userInfo = query_db(sQuery)	
		userInfo[0]['a'] = request.form["a"]
		userInfo[0]['j'] = request.form["j"]
		if(userInfo):
			return json.dumps(userInfo[0])
		else :
			return json.dumps(["there is no person"])




# 파일업로드 테스트
def allowed_file(filename):
	return '.' in filename and \
		filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS
		
@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
	if request.method == 'POST':
		file = request.files['file']
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			print "파일네임:::" + filename
			file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

			return redirect('/static/uploads/'+filename)

	return redirect('/')
	
	
	
	
# 아이위키의 항목내용을 추가하거나 삭제하거나 수정
@app.route('/submitWikiSectionContent', methods = ['POST', 'GET'])
def ajax_submitWikiSectionContent() :
	if (request.method == 'POST') :	
		# 'method' : 'publish' 또는 'delete'
		method = request.form['method']	
		if ( method== 'publish') :
			### id 는 자동적으로 입력해줌

#			parent_email = request.form['parent_email']
			content = request.form['content']
			child_id = request.form['child_id']
			title = request.form['title']
			section_id = request.form['id']
			
			sQuery = 'UPDATE child_description '
			sQuery = sQuery + 'SET title =\'' +title+ '\',content=\''+content+'\' WHERE' 
#			sQuery = sQuery + ' parent_email = \'' +parent_email+ '\' AND'
			sQuery = sQuery + ' id = ' +section_id
			sQuery = sQuery + ' AND child_id = ' +child_id

			g.db.execute(sQuery)
			g.db.commit()			

			return json.dumps(["publish"])
		# 해당 아디를 갖는 모든 공통공지 개별공지 지워뿌림.
		elif (method == 'delete') :
#			parent_email = request.form['parent_email']
			child_id = request.form['child_id']
			section_id = request.form['id']
			
			sQuery = 'DELETE FROM child_description WHERE'
#			sQuery = sQuery + ' parent_email = \'' +parent_email+ '\' AND'
			sQuery = sQuery + ' id = ' +section_id
			sQuery = sQuery + ' AND child_id = ' +child_id

			g.db.execute(sQuery)
			g.db.commit()		
			
			return json.dumps(["delete"])
		elif (method == 'add') :
			parent_email = request.form['parent_email']
			child_id = request.form['child_id']
			content = request.form['content']
			title = request.form['title']


			sQuery = 'INSERT INTO child_description (child_id,title,parent_email,content) '
			sQuery = sQuery + 'VALUES (\'' + child_id+ '\',\'' + title + '\',\'' + parent_email+'\',\'' + content+'\')'

			g.db.execute(sQuery)
			g.db.commit()		
			
			return json.dumps(["add"])	
			
if __name__=='__main__':
    app.debug = True
    app.secret_key = '\xc2C\xd3}kY,\xd7\xe7\xc9\xd6\x82\x8d\xf5\xe3,\xf6\x83\x88\xc0\x93\xa2D{'
    app.run(host='1.234.79.105')









###### 여기부터는 실제로 사용하지는 않지만 SQL  INSERT, SELECT 사용 예제로 유용한 코드입니다. ######
@app.route('/addParent', methods=['POST','GET'])
def addParent():
	if request.method  == "POST":  
		sEmail = request.form['email']
		sPassword = request.form['password']
		sName = request.form['name']

		sQuery = 'INSERT INTO parent (email,password,name) VALUES '
		sQuery = sQuery + '(\''+sEmail+'\',\''+sPassword+'\',\''+sName+'\')'

		g.db.execute(sQuery)
    	g.db.commit()

    	return sQuery



@app.route('/getParent')
def getParent():
	sResult = ""
	for parent in query_db('select * from parent'):
		sResult += parent['name']+ ' '+ parent['email'] + '\n'
	return sResult
###### 여기까지는 실제로 사용하지는 않지만 SQL  INSERT, SELECT 사용 예제로 유용한 코드입니다. ######








